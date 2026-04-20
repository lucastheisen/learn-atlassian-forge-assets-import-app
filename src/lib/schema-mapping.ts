import api, { route } from "@forge/api";
import {
  AtlassianJSMInsightImportsSchemaAndMappingDefinition,
  AttributeMapping,
  ObjectAttribute,
  ObjectType,
  ObjectTypeMapping,
} from "./assets-schema-and-mapping";

export type Mapping = {
  attributeMap: Map<string, [string, ...string[]] | undefined>,
  objectTypeName: string | undefined,
  selector: string | undefined,
};

export const getSchemaAndMapping = async (
  workspaceId: string,
  importId: string,
): Promise<AtlassianJSMInsightImportsSchemaAndMappingDefinition> => {
  const resp = await api
    .asApp()
    .requestJira(
      route`/jsm/assets/workspace/${workspaceId}/v1/importsource/${importId}/schema-and-mapping`,
      {
        headers: {
          Accept: "application/json",
        },
        method: "GET",
      }
    );
  const mapping = await resp.json() as AtlassianJSMInsightImportsSchemaAndMappingDefinition

  return mapping
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
