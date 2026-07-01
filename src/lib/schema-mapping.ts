import { assetsClient } from "./forge-clients"
import type {
  AtlassianJSMInsightImportsSchemaAndMappingDefinition,
  AttributeMapping,
  ObjectAttribute,
  ObjectType,
  ObjectTypeMapping,
} from "./assets-schema-and-mapping";

export type Mapping = {
  attributeMap: Record<string, string[]>,
  objectTypeName: string | undefined,
  selector: string | undefined,
};

export const getSchemaAndMapping = async (
  workspaceId: string,
  importId: string,
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

  return data as AtlassianJSMInsightImportsSchemaAndMappingDefinition
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

  // iconSchema is an optional field, but if supplied, it must have at least one
  // icon or it will fail but it is returned empty by the /schema-and-mapping
  // endpoint violating its own schema:
  //   https://community.developer.atlassian.com/t/utilizing-existing-schema-mappings-and-dynamic-mapping-generation-for-assets-imports/90736/3?u=lucastheisen
  // We remove iconSchema if it is not defining any icons to allow the update
  // to succeed.
  if (schemaAndMapping.schema.iconSchema?.icons.length === 0) {
    delete(schemaAndMapping.schema.iconSchema)
  }

  // add request/response debugging, wont want this in the final implementation
  client.use({
    onRequest: ({request, options}): Request => {
      console.log('--- Outgoing Request ---');
      console.log('URL:', request.url);
      console.log('Method:', request.method);
      console.log('Headers:', Object.fromEntries(request.headers.entries()));

      if (request.body) {
        request.clone().text().then(text => console.log('Body:', text));
      }

      return request;
    },
    onResponse: async ({ response }): Promise<Response | undefined> => {
      // clone the response so the stream remains available for the handler
      const clonedResponse = response.clone();
      const rawBody = await clonedResponse.text();
      console.log("Full Raw Response:", {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: rawBody,
      });

      // return undefined to let the original response proceed to your handler
      return undefined;
    },
  });

  console.log(`schemaAndMappings: ${JSON.stringify(schemaAndMapping)}`)
  const { data, error } = await client
    //.PUT(
    .PATCH(
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
