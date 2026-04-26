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
  attributeMap: Record<string, string[]>,
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
    throw new Error(`unable to lookup schema for ${schemaId}`, {cause: schemaResponse.error});
  }
  if (!schemaResponse.data) {
    throw new Error(`data empty in lookup schema for ${schemaId}: ${schemaResponse.error}`);
  }
  const schema = schemaResponse.data
  console.log(`got schema ${schemaId}: ${schema.name}`)

  const objectTypes = await client
    .GET("/objectschema/{id}/objecttypes", {params: {path: {id: schemaId}}})
  if (objectTypes.error) {
    throw new Error(`unable to lookup object types for ${schemaId}: ${objectTypes.error}`);
  }
  const entries = objectTypes?.data ?? []
  console.log(`got ${entries.length} object types for schema ${schemaId}`)

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
            (await client.GET("/objecttype/{id}/attributes", {workspaceId: "", params: {path: {id: t.id}}}))
              .data
              ?.map<ObjectAttribute>(a => {
                return {
                  description: a.description ?? `id: ${a.id}`,
                  externalId: `${t.objectSchemaId}:${t.id}:${a.id}`,
                  name: a.name ?? a.id,
                  type: attributeTypeFrom(a.type, a.defaultType?.id),
                };
              })
        };
      }));
  if (schemaObjectTypes.length === 0) {
    return undefined;
  }

  const result = {
    objectSchema: {
      description: schema.description ?? schema.name,
      name: schema.name,
      objectTypes: schemaObjectTypes as [ObjectType, ...ObjectType[]],
    }
  };
  console.log(`generated schema is: ${JSON.stringify(result)}`)
  return result
}

export const generateSchemaMapping = (
  schema: AtlassianJSMInsightImportsSchemaAndMappingDefinition["schema"],
  mapping: AtlassianJSMInsightImportsSchemaAndMappingDefinition["mapping"]
): AtlassianJSMInsightImportsSchemaAndMappingDefinition["mapping"] => {
  schema.objectSchema.objectTypes
    .map(
      (objectType) => {
        const mapped: ObjectTypeMapping = {
          description: objectType.description,
          objectTypeExternalId: objectType.externalId,
          objectTypeName: objectType.name,
          selector: "",
        }
        return mapped;
      })
  return mapping;
};

export const getSchemaAndMapping = async (
  workspaceId: string,
  importId: string,
  schemaId: string,
): Promise<AtlassianJSMInsightImportsSchemaAndMappingDefinition> => {
  const client = assetsClient(workspaceId);

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

  // const schema = await generateSchema(client, schemaId)
  // if (schema) {
  //   schemaAndMapping.schema = schema;
  // }

  return schemaAndMapping
};

const mapObjectAttributes = (
  mapping: Mapping
) => {
  return (objectAttribute: ObjectAttribute): AttributeMapping | undefined => {
    const locators = mapping.attributeMap[objectAttribute.name];
    if (!locators || locators.length < 1) {
      return undefined
    }

    return {
      attributeName: objectAttribute.name,
      attributeExternalId: objectAttribute.externalId,
      attributeLocators: locators as [string, ...string[]],
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
  console.log(`mappings: ${JSON.stringify(mappings)}`)
  return {
    mapping: {
      objectTypeMappings: current.schema.objectSchema.objectTypes
        .map(mapObjectType(mappings))
        ?.filter((m): m is ObjectTypeMapping => m !== undefined),
    },
    schema: structuredClone(current.schema),
  };
};

export const setSchemaAndMapping = async (
  workspaceId: string,
  importId: string,
  schemaAndMapping: AtlassianJSMInsightImportsSchemaAndMappingDefinition,
) => {
  const client = assetsClient(workspaceId);

  client.use({
    onRequest: ({request, options}): Request => {
      console.log('--- Outgoing Request ---');
      console.log('URL:', request.url);
      console.log('Method:', request.method);
      console.log('Headers:', Object.fromEntries(request.headers.entries()));
      
      // Log body if it exists (cloning to avoid consuming the stream)
      if (request.body) {
        request.clone().text().then(text => console.log('Body:', text));
      }

      return request;
    },
    onResponse: async ({ response }): Promise<Response | undefined> => {
      // 1. Clone the response so the stream remains available for the handler
      const clonedResponse = response.clone();

      // 2. Read the raw text from the clone
      const rawBody = await clonedResponse.text();

      // 3. Log or dump the full raw response
      console.log("Full Raw Response:", {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: rawBody,
      });

      // Return undefined to let the original response proceed to your handler
      return undefined;
    },
  });

  console.log(`schemaAndMappings: ${JSON.stringify(schemaAndMapping)}`)
  const { data, error } = await client
    .PUT(
      "/importsource/{importSourceId}/mapping",
      {
        headers: {
          "Accept": "application/json",
        },
        params: {
          path: {
            importSourceId: importId,
          }
        },
        body: schemaAndMapping,
      });
  if (error) {
    console.log(JSON.stringify(error))
    throw new Error(`unable to persist mapping : ${JSON.stringify(error)}`)
  }
  console.log(`persisted mapping with response: ${data}`)
}

const unmapObjectAttribute = (
  current: AttributeMapping[] | undefined,
) => {
  return (
    objectAttribute: ObjectAttribute
  ): [schemaName: string, mappingName: string[]] => {
    const currentAttribute = current?.find(v => v.attributeName === objectAttribute.name);
    return [objectAttribute.name, currentAttribute?.attributeLocators ?? []];
  };
};

const unmapObjectType = (
  current: ObjectTypeMapping[] | undefined,
) => {
  return (objectType: ObjectType): Mapping => {
    const currentMapping = current?.find(v => v.objectTypeName === objectType.name);
    const mappedAttributes = Object.fromEntries(
      objectType.attributes?.map(unmapObjectAttribute(currentMapping?.attributesMapping)) 
        ?? []);
    const mapping: Mapping = {
      attributeMap: mappedAttributes,
      objectTypeName: objectType.name,
      selector: currentMapping?.selector,
    };
    return mapping
  };
};

export const unmapSchema = (
  current: AtlassianJSMInsightImportsSchemaAndMappingDefinition,
): Mapping[] => {
  return current.schema.objectSchema.objectTypes
    .map(unmapObjectType(current.mapping.objectTypeMappings));
};
