import { AtlassianJSMInsightImportsSchemaAndMappingDefinition } from "./assets-schema-and-mapping";

export type FieldMapping = {
  selector: string,
  mapping: Map<string, string>,
};

export const mapSchema = (
  current: AtlassianJSMInsightImportsSchemaAndMappingDefinition,
  mapping: FieldMapping,
): AtlassianJSMInsightImportsSchemaAndMappingDefinition => {
  for (entry in mapping) {
  }

  return current;
}
