import { route } from "@forge/api";
import z from "zod";
import { iterateAllValues } from "../../lib/kv-common";
import {
  manifestPrefix,
  readReferenceValue,
  referenceRoot,
  saveReferenceValue,
  summaryKey,
} from "../../lib/kv-reference";
import { referenceRequest } from "../../lib/reference-api";
import type { UserAsset } from "../../lib/reference-assets";
import {
  ProcessingBudget,
  type ReferenceRun,
  type ReferenceScope,
  type RunSummary,
} from "../../lib/reference-types";
import { BadRequestError } from "./errors";

export const SmokeReferenceCheck = z.object({
  baseline: z.enum(["remember", "verify"]).optional(),
  email: z.string().email().optional(),
  expectedUnresolved: z.number().int().nonnegative(),
  uploadId: z.string().min(1),
});

export const smokeBaselineKey = (scope: ReferenceScope, uploadId: string) =>
  `${referenceRoot(true)}smoke:${encodeURIComponent(scope.workspaceId)}:${encodeURIComponent(scope.importSourceId)}:${encodeURIComponent(uploadId)}`;

export async function latestSmokeRun(
  scope: ReferenceScope,
  uploadId: string,
): Promise<ReferenceRun | undefined> {
  let latest: ReferenceRun | undefined;
  for await (const { value } of iterateAllValues<ReferenceRun>(
    manifestPrefix(scope),
  )) {
    if (value.uploadId === uploadId && (!latest || value.id > latest.id))
      latest = value;
  }
  return latest;
}

export async function assertSmokeReferences(
  scope: ReferenceScope,
  executionId: string,
  check: z.infer<typeof SmokeReferenceCheck>,
): Promise<void> {
  const run = await latestSmokeRun(scope, check.uploadId);
  if (!run || run.phase !== "complete" || run.executionId !== executionId)
    throw new BadRequestError(
      "Reference processing has not completed for this smoke upload",
    );
  const summary = await readReferenceValue<RunSummary>(summaryKey(run));
  if (
    !summary ||
    summary.status === "failed" ||
    summary.unfinished ||
    summary.counts.unresolved !== check.expectedUnresolved
  ) {
    throw new BadRequestError(
      "Smoke reference processing did not produce the expected terminal result",
    );
  }
  if (!check.email) return;
  if (!run.schema)
    throw new BadRequestError("Smoke reference schema is missing");
  const budget = new ProcessingBudget(Date.now, 45_000);
  const result = await referenceRequest<{ values: UserAsset[] }>(
    route`/jsm/assets/workspace/${scope.workspaceId}/v1/object/aql?includeAttributes=${"true"}&maxResults=${2}`,
    budget,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        qlQuery: `objectTypeId = ${run.schema.objectTypeId} AND Email = ${JSON.stringify(check.email)} AND Title = ${JSON.stringify(check.uploadId)}`,
      }),
    },
  );
  const asset = result.values.length === 1 ? result.values[0] : undefined;
  const values = asset?.attributes?.find(
    (attribute) =>
      attribute.objectTypeAttributeId === run.schema?.userAttributeId,
  )?.objectAttributeValues;
  const accountId =
    values?.length === 1
      ? (values[0]?.user?.key ?? values[0]?.value)
      : undefined;
  if (!asset || !accountId)
    throw new BadRequestError(
      "Smoke asset does not have exactly one User reference",
    );
  const confirmed = await referenceRequest<{
    accountId: string;
    email: string;
  }>(route`/rest/api/3/user/email?accountId=${accountId}`, budget);
  if (
    confirmed.accountId !== accountId ||
    confirmed.email.trim().toLowerCase() !== check.email.trim().toLowerCase()
  ) {
    throw new BadRequestError(
      "Smoke asset references a different Atlassian user",
    );
  }
  const key = smokeBaselineKey(scope, check.uploadId);
  if (check.baseline === "remember")
    await saveReferenceValue(key, {
      assetId: asset.id,
      updated: asset.updated,
    });
  if (check.baseline === "verify") {
    const previous = await readReferenceValue<{
      assetId: string;
      updated: string;
    }>(key);
    if (
      !previous ||
      previous.assetId !== asset.id ||
      previous.updated !== asset.updated
    ) {
      throw new BadRequestError(
        "Identical smoke import changed the associated asset's Updated timestamp",
      );
    }
  }
}
