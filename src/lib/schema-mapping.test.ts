import { describe, expect, it } from 'vitest';
import type {
  AtlassianJSMInsightImportsSchemaAndMappingDefinition,
  ObjectTypeMapping,
} from './assets-schema-and-mapping';
import { type Mapping, mapSchema, unmapSchema } from './schema-mapping';

describe('Schema Mapping', () => {
  const mockSchema = (...mappings: ObjectTypeMapping[]): AtlassianJSMInsightImportsSchemaAndMappingDefinition => {
    return {
      schema: {
        objectSchema: {
          description: "A test schema",
          name: "TestSchema",
          objectTypes: [
            {
              objectTypeName: 'TestType',
              name: 'TestType',
              externalId: 'test-type-id',
              description: 'A test object type',
              attributes: [
                {
                  description: 'Field1 description',
                  externalId: 'field1-id',
                  name: 'Field1',
                  type: "text",
                },
                {
                  description: 'Field2 description',
                  externalId: 'field2-id',
                  name: 'Field2',
                  type: "text",
                },
                {
                  description: 'Field3 description',
                  externalId: 'field3-id',
                  name: 'Field3',
                  type: "text",
                },
              ],
            },
            {
              objectTypeName: 'TestType2',
              name: 'TestType2',
              externalId: 'test-type-id-2',
              description: 'A test object type 2',
              attributes: [
                {
                  description: 'T2Field1 description',
                  externalId: 't2-field1-id',
                  name: 'T2Field1',
                  type: "text",
                },
                {
                  description: 'T2Field2 description',
                  externalId: 't2-field2-id',
                  name: 'T2Field2',
                  type: "text",
                },
              ],
            },
          ],
        },
      },
      mapping: { objectTypeMappings: mappings },
    };
  };

  describe('mapSchema', () => {
    it('should map to same schema with no supplied mapping', () => {
      expect(mapSchema(mockSchema(), [])).toStrictEqual(mockSchema());
    });

    it('should map schema fields to object type correctly', () => {
      const mockMapping: Mapping = {
        attributeMap: {
          'Field1': ['dataField1'],
          'Field2': ['dataField2'],
        },
        objectTypeName: 'TestType',
        selector: 'test-selector',
      };
      expect(mapSchema(mockSchema(), [mockMapping]))
        .toStrictEqual(mockSchema({
          attributesMapping: [
            {
              attributeExternalId: 'field1-id',
              attributeLocators: ['dataField1'],
              attributeName: 'Field1',
            },
            {
              attributeExternalId: 'field2-id',
              attributeLocators: ['dataField2'],
              attributeName: 'Field2',
            },
          ],
          description: 'A test object type',
          objectTypeExternalId: 'test-type-id',
          objectTypeName: 'TestType',
          selector: 'test-selector',
        }));
    });
  });

  describe('unmapSchema', () => {
    it('should unmap object type to with empty mapping to undefined', () => {
      expect(unmapSchema(mockSchema())).toStrictEqual([
        {
          'attributeMap': new Map([
            ['Field1', undefined],
            ['Field2', undefined],
            ['Field3', undefined],
          ]),
          'objectTypeName': 'TestType',
          'selector': undefined,
        },
        {
          'attributeMap': new Map([
            ['T2Field1', undefined],
            ['T2Field2', undefined],
          ]),
          'objectTypeName': 'TestType2',
          'selector': undefined,
        },
      ]);
    });

    it('should unmap object type with complete one to one mapping', () => {
      const schema = mockSchema(
        {
          attributesMapping: [
            {
              attributeExternalId: 'field1-id',
              attributeLocators: ['field1'],
              attributeName: 'Field1',
            },
            {
              attributeExternalId: 'field2-id',
              attributeLocators: ['field2'],
              attributeName: 'Field2',
            },
            {
              attributeExternalId: 'field3-id',
              attributeLocators: ['field3'],
              attributeName: 'Field3',
            },
          ],
          objectTypeName: 'TestType',
          objectTypeExternalId: 'test-type-id',
          selector: 'users',
          description: 'A test object type',
        }
      );

      expect(unmapSchema(schema)).toStrictEqual([
        {
          'attributeMap': new Map([
            ['Field1', ['field1']],
            ['Field2', ['field2']],
            ['Field3', ['field3']],
          ]),
          'objectTypeName': 'TestType',
          'selector': 'users',
        },
        {
          'attributeMap': new Map([
            ['T2Field1', undefined],
            ['T2Field2', undefined],
          ]),
          'objectTypeName': 'TestType2',
          'selector': undefined,
        },
      ]);
    });

    it('should unmap object type with partial mapping', () => {
      const schema = mockSchema(
        {
          attributesMapping: [
            {
              attributeExternalId: 'field1-id',
              attributeLocators: ['field1'],
              attributeName: 'Field1',
            },
            {
              attributeExternalId: 'field2-id',
              attributeLocators: ['field2'],
              attributeName: 'Field2',
            },
          ],
          objectTypeName: 'TestType',
          objectTypeExternalId: 'test-type-id',
          selector: 'users',
          description: 'A test object type',
        }
      );

      expect(unmapSchema(schema)).toStrictEqual([
        {
          "attributeMap": new Map([
            ["Field1", ["field1"]],
            ["Field2", ["field2"]],
            ["Field3", undefined],
          ]),
          "objectTypeName": "TestType",
          "selector": "users",
        },
        {
          'attributeMap': new Map([
            ['T2Field1', undefined],
            ['T2Field2', undefined],
          ]),
          'objectTypeName': 'TestType2',
          'selector': undefined,
        },
      ]);
    });
  });
});