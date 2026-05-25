export type ObjectAttribute = {
  [k: string]: unknown;
} & {
  /**
   * Unique id that identifies the object type attribute
   */
  externalId?: string;
  /**
   * Attribute name
   */
  name: string;
  /**
   * Attribute description
   */
  description: string;
  /**
   * Attribute type
   */
  type:
    | "text"
    | "integer"
    | "boolean"
    | "double"
    | "date"
    | "time"
    | "date_time"
    | "url"
    | "email"
    | "textarea"
    | "select"
    | "ipaddress"
    | "referenced_object"
    | "status";
  /**
   * Optional status values to limit allowed status values if 'type' is set as 'status'
   */
  typeValues?: string[];
  /**
   * Marks an attribute as the object label
   */
  label?: boolean;
  /**
   * Which object type do the objects in referenced_object refer to
   */
  referenceObjectTypeName?: string;
  /**
   * Which object type do the objects in referenced_object refer to
   */
  referenceObjectTypeExternalId?: string;
  /**
   * Maximum Cardinality of attribute
   */
  maximumCardinality?: number;
  /**
   * Minimum Cardinality of attribute
   */
  minimumCardinality?: number;
  /**
   * Attribute values to be unique within object type
   */
  unique?: boolean;
  [k: string]: unknown;
};

/**
 * This JSON schema models the format external applications can use to define both Object Schema and Import Source Mapping Configurations relative to Atlassian JSM - Insight imports
 */
export interface AtlassianJSMInsightImportsSchemaAndMappingDefinition {
  /**
   * Schema configuration
   */
  schema: {
    /**
     * Object schema definition
     */
    objectSchema: {
      /**
       * Name for the object schema
       */
      name: string;
      /**
       * Description for the object schema
       */
      description: string;
      /**
       * List of the root object types in the schema
       *
       * @minItems 1
       */
      objectTypes: [ObjectType, ...ObjectType[]];
      [k: string]: unknown;
    };
    /**
     * Icon schema definition
     */
    iconSchema?: {
      /**
       * List of icons to be created or updated
       *
       * @minItems 1
       */
      icons: [Icon, ...Icon[]];
      [k: string]: unknown;
    };
    /**
     * Statuses schema definition
     */
    statusSchema?: {
      /**
       * List of statuses to be created or updated
       *
       * @minItems 1
       */
      statuses: [Status, ...Status[]];
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  /**
   * Data mapping configuration
   */
  mapping: {
    /**
     * Object type mappings
     */
    objectTypeMappings: ObjectTypeMapping[];
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
export interface ObjectType {
  /**
   * Unique id that identifies an object type
   */
  externalId?: string;
  /**
   * Object type name
   */
  name: string;
  /**
   * Object type description
   */
  description: string;
  /**
   * Key of the icon for the object type. An icon with this key must be defined in the icons section of the schema or, in the case of schema updates, be already present
   */
  iconKey?: string;
  /**
   * Object type attributes
   */
  attributes?: ObjectAttribute[];
  /**
   * Hierarchical children types
   */
  children?: ObjectType[];
  [k: string]: unknown;
}
export interface Icon {
  /**
   * Your own unique key of the icon
   */
  key: string;
  /**
   * User facing name of the icon
   */
  name: string;
  /**
   * Base64 encoded bytes of the icon image in PNG format. The image must be a 48x48 pixels in size.
   */
  png48: string;
  [k: string]: unknown;
}
export interface Status {
  /**
   * Name of the status
   */
  name: string;
  /**
   * Description for the status
   */
  description: string;
  /**
   * Status category
   */
  category: "active" | "inactive" | "pending";
  [k: string]: unknown;
}
export interface ObjectTypeMapping {
  /**
   * The external id of the Object Type to map to as defined in schema
   */
  objectTypeExternalId?: string;
  /**
   * The name of the Object Type to map to
   */
  objectTypeName: string;
  /**
   * The Insight JSON selector to find the entries
   */
  selector: string;
  /**
   * Description for the object type mapping
   */
  description: string;
  /**
   * Configuration of the attributes to map
   */
  attributesMapping?: AttributeMapping[];
  [k: string]: unknown;
}
export interface AttributeMapping {
  /**
   * The external id of the attribute to map to as defined in schema
   */
  attributeExternalId?: string;
  /**
   * Name of the attribute as defined in the schema
   */
  attributeName: string;
  /**
   * Marks this attribute as part of the unique identifier for this object type
   */
  externalIdPart?: boolean;
  /**
   * Data locators to use to obtain the attribute value
   *
   * @minItems 1
   */
  attributeLocators: [string, ...string[]];
  /**
   * IQL used in referenced objects as a way to refer to them
   */
  objectMappingIQL?: string;
  [k: string]: unknown;
}
