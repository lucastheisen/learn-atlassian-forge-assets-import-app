import { route } from "@forge/api";
import type { components } from "./assets-api";
import { referenceRequest } from "./reference-api";
import { type ExecutionStatus, NativeStatusSchema } from "./reference-schemas";
import {
  type AssetFields,
  type ProcessingBudget,
  ProductRequestError,
  type ReferenceRun,
  type ReferenceSchema,
  type ReferenceScope,
  SchemaError,
} from "./reference-types";

type Attribute = components["schemas"]["ObjectTypeAttribute"];

type ImportSource = components["schemas"]["ImportSourceResponse"];

export type UserAsset = components["schemas"]["Object"];

const noErrors = (value: unknown) =>
  value == null || (Array.isArray(value) && value.length === 0);

export const nativeSucceeded = (status: ExecutionStatus): boolean =>
  status.status === "DONE" &&
  status.progressResult?.result === "OK" &&
  status.progressResult.status === "FINISHED" &&
  noErrors(status.progressResult.errorMessages) &&
  Object.values(status.progressResult.objectTypeResultMap ?? {}).every(
    (value) => value && noErrors(value.errorMessages),
  );

export async function executionStatus(
  run: ReferenceRun,
  budget: ProcessingBudget,
): Promise<ExecutionStatus> {
  if (!run.executionId) throw new Error("Execution ID is missing");
  const result = await referenceRequest<ExecutionStatus>(
    route`/jsm/assets/workspace/${run.workspaceId}/v1/importsource/${run.importSourceId}/executions/${run.executionId}/status`,
    budget,
  );
  if (!NativeStatusSchema.safeParse(result.status).success) {
    throw new Error("Unknown Assets execution status");
  }
  return result;
}

export async function latestExecution(
  scope: ReferenceScope,
  budget: ProcessingBudget,
): Promise<{ executionId: string; status: string } | undefined> {
  try {
    return await referenceRequest(
      route`/jsm/assets/workspace/${scope.workspaceId}/v1/importsource/${scope.importSourceId}/executions/status`,
      budget,
    );
  } catch (error) {
    if (error instanceof ProductRequestError && error.status === 404)
      return undefined;
    throw error;
  }
}

export async function resolveReferenceSchema(
  scope: ReferenceScope,
  budget: ProcessingBudget,
): Promise<ReferenceSchema> {
  const source = await referenceRequest<ImportSource>(
    route`/jsm/assets/workspace/${scope.workspaceId}/v1/importsource/${scope.importSourceId}`,
    budget,
  );
  const mappings =
    source.importSourceOTEntries?.filter(
      (mapping) => mapping.selector === "users",
    ) ?? [];
  const mappedId =
    mappings.length === 1 ? mappings[0]?.objectType?.id : undefined;
  const objectTypeId = mappedId == null ? undefined : String(mappedId);
  if (!objectTypeId || !/^\d+$/.test(objectTypeId)) throw new SchemaError();
  const attributes = await referenceRequest<Attribute[]>(
    route`/jsm/assets/workspace/${scope.workspaceId}/v1/objecttype/${objectTypeId}/attributes`,
    budget,
  );
  const attribute = (name: string) => {
    const matches = attributes.filter((value) => value.name === name);
    if (matches.length !== 1 || !matches[0]) throw new SchemaError();
    return matches[0];
  };
  const active = attribute("Active");
  const email = attribute("Email");
  const user = attribute("Atlassian User");
  if (
    active.type !== 0 ||
    active.defaultType?.id !== 2 ||
    email.type !== 0 ||
    user.type !== 2 ||
    user.maximumCardinality !== 1 ||
    user.editable === false
  )
    throw new SchemaError();
  return {
    activeAttributeId: String(active.id),
    attributeNames: Object.fromEntries(
      attributes
        .filter((value) => value.name)
        .map((value) => [value.id, value.name as string]),
    ),
    emailAttributeId: String(email.id),
    objectTypeId,
    userAttributeId: String(user.id),
  };
}

export function candidateAql(objectTypeId: string, startedAt: string): string {
  if (!/^\d+$/.test(objectTypeId)) throw new SchemaError();
  const timestamp = new Date(startedAt);
  timestamp.setUTCSeconds(0, 0);
  return `objectTypeId = ${objectTypeId} AND (Updated >= "${timestamp.toISOString()}" OR "Atlassian User" IS EMPTY) ORDER BY Key ASC`;
}

export async function discoverAssets(
  run: ReferenceRun,
  budget: ProcessingBudget,
): Promise<{ assetIds: string[]; last: boolean; nextStart: number }> {
  if (!run.schema || !run.selectionStartedAt)
    throw new Error("Reference selection metadata is missing");
  const result = await referenceRequest<
    components["schemas"]["ObjectListInclTypeAttributesEntryResult"]
  >(
    route`/jsm/assets/workspace/${run.workspaceId}/v1/object/aql?startAt=${run.aqlStart}&maxResults=${100}&includeAttributes=${"false"}`,
    budget,
    {
      body: JSON.stringify({
        qlQuery: candidateAql(run.schema.objectTypeId, run.selectionStartedAt),
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
  );
  if (!Array.isArray(result.values) || result.startAt !== run.aqlStart)
    throw new Error("Invalid Assets AQL page");
  const isLast: unknown = result.isLast ?? result.last;
  const last = isLast === true || isLast === "true";
  if (!last && !result.values.length)
    throw new Error("Assets AQL pagination made no progress");
  return {
    assetIds: [...new Set(result.values.map(({ id }) => String(id)))],
    last,
    nextStart: run.aqlStart + result.values.length,
  };
}

export const fetchAsset = (
  run: ReferenceRun,
  assetId: string,
  budget: ProcessingBudget,
): Promise<UserAsset> =>
  referenceRequest(
    route`/jsm/assets/workspace/${run.workspaceId}/v1/object/${assetId}`,
    budget,
  );

export const assetValues = (asset: UserAsset, attributeId: string) =>
  asset.attributes?.find(
    (attribute) => String(attribute.objectTypeAttributeId) === attributeId,
  )?.objectAttributeValues ?? [];

export function assetFields(
  asset: UserAsset,
  schema: ReferenceSchema,
): AssetFields {
  const fields: AssetFields = {};
  for (const attribute of asset.attributes ?? []) {
    const name =
      attribute.objectTypeAttribute?.name ??
      schema.attributeNames?.[attribute.objectTypeAttributeId];
    if (name)
      fields[name] = attribute.objectAttributeValues.map(
        (value) => value.value,
      );
  }
  fields.Email = assetValues(asset, schema.emailAttributeId).map(
    (value) => value.value,
  );
  return fields;
}

export async function updateReference(
  run: ReferenceRun,
  assetId: string,
  accountId: string,
  budget: ProcessingBudget,
): Promise<void> {
  if (!run.schema) throw new Error("Reference schema is missing");
  await referenceRequest(
    route`/jsm/assets/workspace/${run.workspaceId}/v1/object/${assetId}`,
    budget,
    {
      body: JSON.stringify({
        attributes: [
          {
            objectAttributeValues: [{ value: accountId }],
            objectTypeAttributeId: run.schema.userAttributeId,
          },
        ],
        objectTypeId: run.schema.objectTypeId,
      }),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    },
  );
}
