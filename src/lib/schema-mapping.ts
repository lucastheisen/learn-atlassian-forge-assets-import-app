import api, { route } from "@forge/api";
import type { Client } from "openapi-fetch";
import type { components, paths } from "./assets-api";
import type {
  AtlassianJSMInsightImportsSchemaAndMappingDefinition,
  AttributeMapping,
  ObjectAttribute,
  ObjectType,
  ObjectTypeMapping,
} from "./assets-schema-and-mapping";
import { assetsClient } from "./forge-clients"

export type Mapping = {
  attributeMap: Map<string, [string, ...string[]] | undefined>,
  objectTypeName: string | undefined,
  selector: string | undefined,
};

const attributeTypeFrom = (
  /**
   * @description | Value | Description|
   *     | ----- | ----------- |
   *     | 0 | Default|
   *     | 1 | Object reference|
   *     | 2 | User|
   *     | 4 | Group |
   *     | 7 | Status |
   */
  objectAttributeType?: number,
  /**
   * DefaultType
   * @description | Id | Description |
   *     | -- | ----------- |
   *     | -1 | None |
   *     | 0 | Text |
   *     | 1 | Integer |
   *     | 2 | Boolean |
   *     | 3 | Double |
   *     | 4 | Date |
   *     | 5 | Time |
   *     | 6 | DateTime |
   *     | 7 | Url |
   *     | 8 | Email |
   *     | 9 | Textarea |
   *     | 10 | Select |
   *     | 11 | IP Address |
   */
  id?: components["schemas"]["DefaultType"]["id"],
): ObjectAttribute["type"] => {
  switch (objectAttributeType ?? 0) {
    case 0:
      switch (id ?? 0) {
        case 0: return "text";
        case 1: return "integer";
        case 2: return "boolean";
        case 3: return "double";
        case 4: return "date";
        case 5: return "time";
        case 6: return "date_time";
        case 7: return "url";
        case 8: return "email";
        case 9: return "textarea";
        case 10: return "select";
        case 11: return "ipaddress"
        default: return "text";
      }
    case 2:
      return "referenced_object";
    case 7:
      return "status";
    default: return "text";
  }
}

const generateSchema = async (
  client: Client<paths, `${string}/${string}`>,
  schemaId: string,
): Promise<AtlassianJSMInsightImportsSchemaAndMappingDefinition["schema"] | undefined> => {
  const schemaResponse = await client.GET("/objectschema/{id}", {params: {path: {id: schemaId}}});
  if (schemaResponse.error) {
    throw new Error(`unable to lookup schema for ${schemaId}: ${schemaResponse.error}`);
  }
  if (!schemaResponse.data) {
    throw new Error(`unable to lookup schema for ${schemaId}: ${schemaResponse.error}`);
  }
  const schema = schemaResponse.data

  const objectTypes = await client
    .GET("/objectschema/{id}/objecttypes", {params: {path: {id: schemaId}}})
  if (objectTypes.error) {
    throw new Error(`unable to lookup object types for ${schemaId}: ${objectTypes.error}`);
  }

  const entries = objectTypes?.data?.entries ?? []
  if (entries.length === 0) {
    return undefined;
  }

  const schemaObjectTypes = await Promise.all(
    entries.map(
      async (t): Promise<ObjectType> => {
        return {
          externalId: `${t.objectSchemaId}:${t.id}`,
          description: t.description ?? t.name,
          name: t.name,
          attributes:
            (await assetsClient("").GET("/objecttype/{id}/attributes", {workspaceId: "", params: {path: {id: t.id}}}))
              .data
              ?.map<ObjectAttribute>(a => {
                return {
                  description: a.description ?? `id: ${a.id}`,
                  name: a.name ?? a.id,
                  type: attributeTypeFrom(a.type, a.defaultType?.id),
                };
              })
        };
      }));
  if (schemaObjectTypes.length === 0) {
    return undefined;
  }

  return {
    objectSchema: {
      description: schema.description ?? schema.name,
      name: schema.name,
      objectTypes: schemaObjectTypes as [ObjectType, ...ObjectType[]],
    }
  };
}

export const getSchemaAndMapping = async (
  workspaceId: string,
  importId: string,
  schemaId: string,
): Promise<AtlassianJSMInsightImportsSchemaAndMappingDefinition> => {
  const client = assetsClient(workspaceId);
  const schema = await generateSchema(client, schemaId)

  const {data, error} = await client.GET(
    "/importsource/{importSourceId}/schema-and-mapping",
    {
      params: {
        path: {
          importSourceId: importId,
        }
      }
    });
  if (error) {
    throw new Error(`unable to lookup schema-and-mapping: ${error}`)
  }
  if (!data) {
    throw new Error(`data empty schema-and-mapping`)
  }
  const schemaAndMapping = data as AtlassianJSMInsightImportsSchemaAndMappingDefinition

  const objectTypes = await client
    .GET("/objectschema/{id}/objecttypes", {params: {path: {id: schemaId}}})
  if (objectTypes.error) {
    throw new Error(`unable to lookup object types for ${schemaId}: ${objectTypes.error}`);
  }

  objectTypes.data?.entries
    ?.map(async (t): Promise<ObjectType> => {
      return {
        externalId: `${t.objectSchemaId}:${t.id}`,
        description: t.description ?? t.name,
        name: t.name,
        attributes:
          (await client.GET("/objecttype/{id}/attributes", {params: {path: {id: t.id}}}))
            .data
            ?.map<ObjectAttribute>(a => {
              return {
                description: a.description ?? `id: ${a.id}`,
                name: a.name ?? a.id,
                type: attributeTypeFrom(a.type, a.defaultType?.id),
              };
            })
      };
    });

  return schemaAndMapping
};

const mapObjectAttributes = (
  mapping: Mapping
) => {
  return (objectAttribute: ObjectAttribute): AttributeMapping | undefined => {
    const locators = mapping.attributeMap.get(objectAttribute.name);
    if (!locators || locators.length < 1) {
      return undefined
    }

    return {
      attributeName: objectAttribute.name,
      attributeExternalId: objectAttribute.externalId,
      attributeLocators: locators,
    };
  };
};

const mapObjectType = (
  mappings: Mapping[],
) => {
  return (objectType: ObjectType): ObjectTypeMapping | undefined => {
    const mapping = mappings.find(m => m.objectTypeName === objectType.name);
    if (!mapping?.selector) {
      return undefined
    }

    return {
      attributesMapping: objectType.attributes
        ?.map(mapObjectAttributes(mapping))
        ?.filter((m): m is AttributeMapping => m !== undefined),
      description: objectType.description,
      objectTypeExternalId: objectType.externalId,
      objectTypeName: objectType.name,
      selector: mapping.selector,
    };
  };
};

export const mapSchema = (
  current: AtlassianJSMInsightImportsSchemaAndMappingDefinition,
  mappings: Mapping[],
): AtlassianJSMInsightImportsSchemaAndMappingDefinition => {
  return {
    mapping: {
      objectTypeMappings: current.schema.objectSchema.objectTypes
        .map(mapObjectType(mappings))
        ?.filter((m): m is ObjectTypeMapping => m !== undefined),
    },
    schema: structuredClone(current.schema),
  };
};

const unmapObjectAttribute = (
  current: AttributeMapping[] | undefined,
) => {
  return (
    objectAttribute: ObjectAttribute
  ): [schemaName: string, mappingName: [string, ...string[]] | undefined] => {
    const currentAttribute = current?.find(v => v.attributeName === objectAttribute.name);
    return [objectAttribute.name, currentAttribute?.attributeLocators];
  };
};

const unmapObjectType = (
  current: ObjectTypeMapping[] | undefined,
) => {
  return (objectType: ObjectType): Mapping => {
    const currentMapping = current?.find(v => v.objectTypeName === objectType.name);
    return {
      attributeMap: new Map(
        objectType.attributes?.map(unmapObjectAttribute(currentMapping?.attributesMapping))),
      objectTypeName: objectType.name,
      selector: currentMapping?.selector,
    };
  };
};

export const unmapSchema = (
  current: AtlassianJSMInsightImportsSchemaAndMappingDefinition,
): Mapping[] => {
  return current.schema.objectSchema.objectTypes
    .map(unmapObjectType(current.mapping.objectTypeMappings));
};
