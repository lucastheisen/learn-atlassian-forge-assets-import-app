export interface paths {
    "/aql/objects": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * @deprecated
         * @description This endpoint is deprecated and will be removed on <b>18th of September 2024</b>. Please use POST `/object/aql` instead. Find objects based on Assets Query Language (AQL)
         */
        get: operations["AQL - Find objects"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/icon/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        /** @description Load a single icon by id */
        get: operations["Icon - Find"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/icon/{id}/icon.png": {
        parameters: {
            query?: {
                size?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        /** @description Load a single icon PNG by id */
        get: operations["Icon - Load Image"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/icon/global": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Return all global icons i.e. icons not associated with a particular object schema */
        get: operations["Icon - Find global icons"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/import/start/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The id of the import configuration that should be started */
                id: string;
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Start configured imports. To see an ongoing import see the Progress resource */
        post: operations["Import - Start"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/importsource/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The unique identifier of the import source */
                id: string;
            };
            cookie?: never;
        };
        /**
         * Get import source by ID
         * @description Retrieves a specific import source configuration by its ID. If scheduled imports are enabled, the response includes scheduling information.
         */
        get: operations["getImportSource"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/importsource/{importSourceId}/mapping": {
        parameters: {
            query?: {
                /** @description Execute the operation asynchronously */
                async?: boolean;
            };
            header?: never;
            path: {
                /** @description The uuid of the import source configuration for the external import */
                importSourceId: string;
            };
            cookie?: never;
        };
        get?: never;
        /** @description Provide object schema and mapping configuration for the external import */
        put: operations["Submit schema and mapping configuration"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** @description Update object schema and mapping configuration for the external import */
        patch: operations["Update schema and mapping configuration"];
        trace?: never;
    };
    "/importsource/{importSourceId}/mapping/progress/{resourceId}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The importSourceId of the import source configuration for the external import */
                importSourceId: string;
                /** @description The resourceId references the running schema and mapping operation */
                resourceId: string;
            };
            cookie?: never;
        };
        /** @description Get the progress of an asynchronous schema and mapping operation */
        get: operations["Get the progress of an asynchronous schema and mapping operation"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/importsource/{importSourceId}/configstatus": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The importSourceId of the import source configuration for the external import */
                importSourceId: string;
            };
            cookie?: never;
        };
        /** @description Get the current status of the import configuration */
        get: operations["Status of Import configuration"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/importsource/{importSourceId}/schema-and-mapping": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The importSourceId of the import source configuration. For use with external imports only */
                importSourceId: string;
            };
            cookie?: never;
        };
        /** @description Get the current schema and mapping of the import configuration */
        get: operations["Get schema and mapping of Import configuration"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/importsource/{importSourceId}/executions": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The importSourceId of the import source configuration for the external import */
                importSourceId: string;
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Move to the data ingestion steps of external imports */
        post: operations["Start data ingestion"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/importsource/{importSourceId}/executions/{importExecutionId}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The importExecutionId of the import */
                importExecutionId: string;
                /** @description The importSourceId of the import source configuration for the external import */
                importSourceId: string;
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** @description Cancel current on-going import */
        delete: operations["Cancel Import"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/importsource/{importSourceId}/executions/{importExecutionId}/progress": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The importExecutionId of the import */
                importExecutionId: string;
                /** @description The importSourceId of the import source configuration for the external import */
                importSourceId: string;
            };
            cookie?: never;
        };
        get?: never;
        /** @description Submit progress of ingesting data */
        put: operations["Submit progress"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/importsource/{importSourceId}/executions/{importExecutionId}/data": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The importExecutionId of the import */
                importExecutionId: string;
                /** @description The importSourceId of the import source configuration for the external import */
                importSourceId: string;
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Providing data to be ingested */
        post: operations["Submit data for ingestion"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/importsource/{importSourceId}/executions/{importExecutionId}/status": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The importExecutionId of the import */
                importExecutionId: string;
                /** @description The importSourceId of the import source configuration for the external import */
                importSourceId: string;
            };
            cookie?: never;
        };
        /** @description Get the status of the import */
        get: operations["Status of Import Execution"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/importsource/{importSourceId}/executions/status": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The importSourceId of the import source configuration for the external import */
                importSourceId: string;
            };
            cookie?: never;
        };
        /** @description Get the status of the most recently created import execution */
        get: operations["Status of most recently created Import Execution"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/importsource/{importSourceId}/executions/{executionId}/history/failed": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The importSourceId of the import source configuration for the external import */
                importSourceId: string;
                /** @description The executionId of the import execution */
                executionId: string;
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Creates a failed import history record for the specified import source and execution with the given failure reason */
        post: operations["Create failed import history"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/importsource/{importSourceId}/token": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Generate a Bearer token which can be used to authenticate against Assets `/importsource/` APIs, to take actions against the specified import source. */
        post: operations["Generate Bearer token"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/importsource/{importSourceId}/schedule": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The importSourceId of the import source configuration for the external import */
                importSourceId: string;
            };
            cookie?: never;
        };
        /** @description Retrieve links for import schedule operations (create, get, update, delete). Returns a createSchedule link to POST a new schedule, and if a schedule already exists, returns a schedule link that can be used with GET, PUT, or DELETE operations. */
        get: operations["Get import schedule links"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/iql/objects": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * @deprecated
         * @description This endpoint is deprecated and will be removed on <b>18th of September 2024</b>. Please use POST `/object/aql` instead.
         */
        get: operations["IQL - Find objects"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/object/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The object id to operate on */
                id: string;
            };
            cookie?: never;
        };
        /** @description Load one object */
        get: operations["Object - Find"];
        /** @description Update an existing object in Assets */
        put: operations["Object - Update"];
        post?: never;
        /** @description Delete the referenced object */
        delete: operations["Object - Delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/object/{id}/attributes": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The object id to operate on */
                id: string;
            };
            cookie?: never;
        };
        /** @description List all attributes for the given object */
        get: operations["Object - Find attributes"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/object/{id}/history": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The object id to operate on */
                id: string;
            };
            cookie?: never;
        };
        /** @description Retrieve the history entries for this object */
        get: operations["Object - Find history entries"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/object/{id}/referenceinfo": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The object id to operate on */
                id: string;
            };
            cookie?: never;
        };
        /** @description Find all references for an object */
        get: operations["Object - Find references"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/object/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Create a new object in Assets */
        post: operations["Object - Create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/object/navlist/aql": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * @deprecated
         * @description Retrieve a list of objects based on an AQL. Deprecated from <b>30 September 2024</b>. Please use POST /object/aql instead. For more information please see https://developer.atlassian.com/changelog/#CHANGE-1661.
         */
        post: operations["Object - Navigator list"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/object/navlist/iql": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * @deprecated
         * @description Deprecated. Use `/object/navlist/aql` instead.
         */
        post: operations["Object - Navigator list (deprecated)"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/object/aql": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Fetch Objects by AQL */
        post: operations["Objects by AQL"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/object/aql/totalcount": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description This API provides the total count of objects that match a specified AQL query. Please note that this operation may incur performance latency. */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    /**
                     * @example {
                     *       "qlQuery": "objectType = Office AND Name LIKE SYD"
                     *     }
                     */
                    "application/json": components["schemas"]["ObjectAQLTotalCountParams"];
                };
            };
            responses: {
                /** @description An integer representing the total count for a given AQL */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "totalCount": 5
                         *     }
                         */
                        "application/json": components["schemas"]["ObjectAQLTotalCountResult"];
                    };
                };
                400: components["responses"]["trait_badRequest_400"];
                403: components["responses"]["trait_requirePermission_403"];
                429: components["responses"]["trait_rateLimit500PerMinute_429"];
                500: components["responses"]["trait_internalServerError_500"];
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/objectconnectedtickets/{objectId}/tickets": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The id of the object to get connected tickets for */
                objectId: string;
            };
            cookie?: never;
        };
        /** @description Relation between Jira issues and Assets objects */
        get: operations["Object - Connected Tickets"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/objectschema/list": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Resource to find object schemas in Assets */
        get: operations["Schema - List"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/objectschema/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Create a new object schema */
        post: operations["Schema - Create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/objectschema/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The object schema id */
                id: string;
            };
            cookie?: never;
        };
        /** @description Find a schema by id */
        get: operations["Schema - Find"];
        /** @description Update an object schema */
        put: operations["Schema - Update"];
        post?: never;
        /** @description Delete a schema */
        delete: operations["Schema - Delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/objectschema/{id}/attributes": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The object schema id */
                id: string;
            };
            cookie?: never;
        };
        /** @description Find all object type attributes for this object schema */
        get: operations["Schema - Find all attributes"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/objectschema/{id}/objecttypes": {
        parameters: {
            query?: {
                /** @description If true, filters out Abstract Object Types from the results */
                excludeAbstract?: boolean;
            };
            header?: never;
            path: {
                /** @description The object schema id */
                id: string;
            };
            cookie?: never;
        };
        /** @description Find all object types for this object schema */
        get: operations["Schema - Find all object types"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/objectschema/{id}/objecttypes/flat": {
        parameters: {
            query?: {
                /** @description Object Type Names to search for */
                query?: boolean;
                /** @description Exclude objects with this name */
                exclude?: string;
                /** @description If true, the objectCount attribute is populated for each object type */
                includeObjectCounts?: boolean;
            };
            header?: never;
            path: {
                /** @description The object schema id */
                id: string;
            };
            cookie?: never;
        };
        /** @description Find all object types for this object schema */
        get: operations["Schema - Find all object types - flat"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/objecttype/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        /** @description Find an object type by id */
        get: operations["Object Type - Find"];
        /** @description Update an existing object type */
        put: operations["Object Type - Update"];
        post?: never;
        /** @description Delete an object type */
        delete: operations["Object Type - Delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/objecttype/{id}/attributes": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        /** @description Find all attributes for this object type */
        get: operations["Object Type - Find all attributes"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/objecttype/{id}/position": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Change position of this object type */
        post: operations["Object Type - Change position"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/objecttype/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Create a new object type */
        post: operations["Object Type - Create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/objecttypeattribute/{objectTypeId}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The object type id that has this object type attribute associated with it */
                objectTypeId: string;
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Create a new attribute on the given object type */
        post: operations["Object Type Attribute - Create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/objecttypeattribute/{objectTypeId}/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The object type attribute to manipulate */
                id: string;
                /** @description The object type id that has this object type attribute associated with it */
                objectTypeId: string;
            };
            cookie?: never;
        };
        get?: never;
        /** @description Update an existing object type attribute */
        put: operations["Object Type Attribute - Update"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/objecttypeattribute/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The object type attribute id to be manipulated */
                id: string;
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** @description Delete an existing object type attribute */
        delete: operations["Object Type Attribute - Delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/progress/category/imports/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The id of the import source configuration that the progress should be fetched for */
                id: string;
            };
            cookie?: never;
        };
        /** @description Show ongoing import process */
        get: operations["Progress - Import"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/config/statustype": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Find all status */
        get: operations["Status - List"];
        put?: never;
        /** @description Create a new status */
        post: operations["Status - Create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/config/statustype/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Status type id */
                id: string;
            };
            cookie?: never;
        };
        /** @description Find a status by id */
        get: operations["Status - Find"];
        /** @description Update an existing status */
        put: operations["Status - Update"];
        post?: never;
        /** @description Delete an existing status */
        delete: operations["Status - Delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/config/referencetype": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Get reference type */
        get: operations["ReferenceType - List"];
        put?: never;
        /** @description Update a reference type */
        post: operations["ReferenceType - Create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/global/config": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Retrieve general configuration */
        get: operations["General Configuration - Get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/global/config/objectschema/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The object schema id to retrieve configuration for */
                id: string;
            };
            cookie?: never;
        };
        /** @description Retrieve general configuration for object schema */
        get: operations["General Configuration - Get for object schema"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/global/config/objectschema/{id}/property": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Update general configuration for object schema */
        post: operations["General Configuration - Update"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/importsource/{importSourceId}/importschedule": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create import schedule
         * @description Creates a new scheduled import configuration for the specified import source. Scheduled imports allow you to automate data imports on a recurring basis (daily, weekly, monthly) or run them once at a specific time.
         */
        post: operations["createImportSchedule"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/importsource/{importSourceId}/importschedule/{importScheduleId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get import schedule
         * @description Retrieves a specific scheduled import configuration by ID
         */
        get: operations["getImportSchedule"];
        /**
         * Update import schedule
         * @description Updates an existing scheduled import configuration. You can modify the start time, run interval, or callback URL.
         */
        put: operations["updateImportSchedule"];
        post?: never;
        /**
         * Delete import schedule
         * @description Deletes a scheduled import configuration. The import source will remain, but will no longer execute on a schedule.
         */
        delete: operations["deleteImportSchedule"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/usage": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get tenant usage information
         * @description Retrieves comprehensive usage statistics for the current tenant including total object counts and a per-schema breakdown for billing and analytics.
         */
        get: operations["getTenantUsageInfo"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /**
         * Avatar
         * @description The object avatar is a custom image that represents an object. If the object has no avatar the icon for the object type will be used
         */
        Avatar: {
            workspaceId: string;
            globalId: string;
            id?: string;
            avatarUUID?: string;
            url16: string;
            url48: string;
            url72: string;
            url144: string;
            url288: string;
            /** @description A reference to the object that this avatar is associated with */
            objectId: string;
        };
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
        DefaultType: {
            id: number;
            name: string;
        };
        /** Errors */
        Errors: {
            errorMessages: string[];
            errors: Record<string, never>;
        };
        /**
         * GlobalConfiguration
         * @description General configuration
         */
        GlobalConfiguration: {
            allowOtherObjectSchema?: boolean;
            validateQuickCreate?: boolean;
            quickCreateObjects?: boolean;
        };
        /** GlobalConfigurationIn */
        GlobalConfigurationIn: {
            allowOtherObjectSchema?: boolean;
            validateQuickCreate?: boolean;
            quickCreateObjects?: boolean;
        };
        /**
         * Group
         * @description The Assets Group type
         */
        Group: {
            avatarUrl: string;
            name: string;
        };
        /**
         * Icon
         * @description A visual representation of something, usually associated as the icon of an object type
         */
        Icon: {
            id: string;
            name: string;
            /** @description A url to the icon to display with small resolution */
            url16: string;
            /** @description A url to the icon to display with large resolution */
            url48: string;
        };
        /**
         * Object
         * @description An Assets object
         */
        Object: {
            workspaceId: string;
            globalId: string;
            id: string;
            /** @description The name of the object. This value is fetched from the attribute that is currently marked as label for the object type of this object */
            label: string;
            /** @description The external identifier for this object */
            objectKey: string;
            avatar: components["schemas"]["Avatar"];
            objectType: components["schemas"]["ObjectType"];
            /** Format: date-time */
            created: string;
            /** Format: date-time */
            updated: string;
            hasAvatar: boolean;
            timestamp: number;
            attributes?: components["schemas"]["ObjectAttribute"][];
            _links: {
                self: string;
            };
        };
        /**
         * ObjectAttribute
         * @description An object attribute as associated with an object
         */
        ObjectAttribute: {
            workspaceId: string;
            /** @deprecated */
            globalId: string;
            /** @deprecated */
            id: string;
            objectTypeAttribute?: components["schemas"]["ObjectTypeAttribute"];
            objectTypeAttributeId: string;
            /** @description The actual values of the object attribute. The size of the values array is determined by the cardinality constraints on the object type attribute as well as how many values are associated with the object attribute */
            objectAttributeValues: components["schemas"]["ObjectAttributeValue"][];
        };
        /**
         * ObjectAttributeIn
         * @description Object attribute used for creating and updating
         */
        ObjectAttributeIn: {
            /** @description The type of the attribute. The type decides how this value should be interpreted */
            objectTypeAttributeId: string;
            /** @description The value(s) */
            objectAttributeValues: components["schemas"]["ObjectAttributeValueIn"][];
        };
        /**
         * ObjectAttributeValue
         * @description The actual value of an object attribute. The object attribute value body will have different properties populated based on the type of the object type attribute. The value will always be present.
         */
        ObjectAttributeValue: {
            value?: string;
            /** @description The value as displayable text e.g. for a date time attribute this value will be formatted to the user settings */
            displayValue: string;
            /** @description A value to use when searching for the specific object */
            searchValue?: string;
            /** @description The same response body as an Assets object */
            referencedObject?: Record<string, never>;
            user?: components["schemas"]["User"];
            group?: components["schemas"]["Group"];
            status?: components["schemas"]["Status"];
            additionalValue?: string;
        };
        /**
         * ObjectAttributeValueIn
         * @description The input attribute values
         */
        ObjectAttributeValueIn: {
            /**
             * @description | Type (of the object type attribute)        | Description |
             *     | ------------------------------------------ | ----------- |
             *     | Default     | The value must be of a valid format based on the additional type of the object type attribute, like Text, Integer, URL, Email etc. for date and datetime the value should be in ISO8601 format|
             *     | Object      | The value is the Object Key to set |
             *     | User        | The value is the Jira User key to set |
             *     | Group       | The value is the Jira Group key to set |
             *     | Status      | The value is the Status ID in Assets |
             */
            value: string;
        };
        /**
         * ObjectAQLParams
         * @description An object that is used to find a paginated result set based on an AQL query
         */
        ObjectAQLParams: {
            /** @description The AQL that will fetch the objects. */
            qlQuery: string;
        };
        /**
         * ObjectAQLTotalCountParams
         * @description An object that is used to find the total count of objects returned for a given AQL query
         */
        ObjectAQLTotalCountParams: {
            /** @description The AQL that will filter the objects. */
            qlQuery: string;
        };
        /**
         * ObjectAQLTotalCountResult
         * @description An object that is used to represent the total count of objects returned for a given AQL query
         */
        ObjectAQLTotalCountResult: {
            /** @description The total number of objects which match the provided query. */
            totalCount?: number;
        };
        /**
         * ObjectFilterParams
         * @description A filter object that is used to find a paginated result set based on an object type and an AQL query
         */
        ObjectFilterParams: {
            /** @description The AQL that will fetch the objects. The object type parameter will be appended implicitly to this AQL */
            qlQuery: string;
            /**
             * @deprecated
             * @description **Required if `qlQuery` is not set.** Deprecated. Use `qlQuery` instead.
             */
            iql?: string;
            objectTypeId: string;
            /** @description The requested page to be loaded for a paginated result. The default value is page = 1 */
            page?: number;
            /** @description How many objects should be returned in the request. It is used with page attribute for pagination. */
            resultsPerPage: number;
            /** @description Which attribute should be used to order by. The preferred way is to use an order by in `qlQuery` and not pass this argument. */
            orderByTypeAttrId?: number;
            /** @description Sort objects in ascending order or descending order based on the attribute identified by orderByTypeAttrId. 1 means ascending all other values mean descending. The preferred way is to not supply the asc parameter and use an order by in `qlQuery` instead. */
            asc?: number;
            /** @description Identifies an object that should be included in the result. The page will be calculated accordingly to include the object specified in the result set */
            objectId?: string;
            objectSchemaId: string;
            /** @description Should attribute values be included in the response. */
            includeAttributes?: boolean;
            /** @description Identifies the attributes which values should be included in the response. Note that the includeAttributes must be specified to true in order for this parameter to be used. */
            attributesToDisplay?: components["schemas"]["ObjectTypeAttributesToDisplay"];
        };
        /**
         * ObjectHistory
         * @description Representing a history event
         */
        ObjectHistory: {
            /** @description Who performed the operation */
            actor: components["schemas"]["User"];
            id: string;
            /** @description The name of the affected attribute */
            affectedAttribute?: string;
            oldValue?: string;
            newValue?: string;
            type: number;
            /** Format: date-time */
            created: string;
            objectId: string;
        };
        /**
         * ObjectIn
         * @description Representing an object to be created or updated
         */
        ObjectIn: {
            /** @description The object type determines where the object should be stored and which attributes are available */
            objectTypeId: string;
            attributes: components["schemas"]["ObjectAttributeIn"][];
            hasAvatar?: boolean;
            /** @description The UUID as retrieved by uploading an avatar. */
            avatarUUID?: string;
        };
        /**
         * ObjectListInclTypeAttributesEntryResult
         * @description A result list containing objects and object type attributes
         */
        ObjectListInclTypeAttributesEntryResult: {
            startAt: number;
            maxResults: number;
            /**
             * @deprecated
             * @description Deprecated from <b>30 September 2024</b> please use POST /object/totalcount instead.
             */
            total: number;
            /** @description The objects */
            values: components["schemas"]["Object"][];
            /** @description The object type attributes */
            objectTypeAttributes: components["schemas"]["ObjectTypeAttribute"][];
            /** @default false */
            last: boolean;
            /** @default false */
            isLast: boolean;
        };
        /**
         * ObjectListResult
         * @description A result list containing objects
         */
        ObjectListResult: {
            /** @description The actual objects */
            objectEntries: components["schemas"]["Object"][];
            /** @description The object type attributes that are present in the object entries */
            objectTypeAttributes?: components["schemas"]["ObjectTypeAttribute"][];
            /** @description Deprecated field that shows which object type id the result is for. Not applicable when using AQL */
            objectTypeId?: string;
            /** @description Deprecated field should not be used. */
            objectTypeIsInherited?: boolean;
            /** @description Deprecated field should not be used. */
            abstractObjectType?: boolean;
            /**
             * @deprecated
             * @description Deprecated from <b>30 September 2024</b> please use POST /object/totalcount instead. The total amount of objects that was matched in the search query. This number may be greater than the amount of objects currently shown
             */
            totalFilterCount?: number;
            /** @description The offset of the first object in the search query that is present in the result, used for pagination */
            startIndex: number;
            /** @description The index of the last object present in the result of the search query */
            toIndex: number;
            /** @description The amount of objects currently returned per page in the result set */
            pageObjectSize: number;
            /** @description The current page of objects in the result set pagination */
            pageNumber: number;
            /** @description Deprecated field - The object type attribute id used for sorting */
            orderByTypeAttrId?: number;
            /** @description Deprecated field - The sort order, used in conjunction with the orderByTypeAttrId */
            orderWay?: string;
            /** @description Deprecated field - The field is used for basic search */
            filters?: Record<string, never>;
            /** @description The AQL that was used to find the object result set */
            qlQuery: string;
            /** @description Determines if the query was based on an AQL or by basic search */
            qlQuerySearchResult?: boolean;
            /**
             * @deprecated
             * @description Deprecated, use `qlQuery` instead
             */
            iql: string;
            /**
             * @deprecated
             * @description Deprecated, use `qlQuerySearchResult` instead
             */
            iqlSearchResult?: boolean;
            /** @description Is it possible to transform this AQL to basic search or vice versa */
            conversionPossible?: boolean;
            /** @description Deprecated field should not be used */
            matchedFilterValues?: Record<string, never>;
            /** @description Deprecated field should not be used */
            inheritanceTree?: Record<string, never>;
        };
        /**
         * ObjectReferenceTypeInfo
         * @description Reference information for one object
         */
        ObjectReferenceTypeInfo: {
            referenceTypes?: components["schemas"]["ReferenceType"][];
            objectType?: components["schemas"]["ObjectType"];
            numberOfReferencedObjects: number;
            openIssuesExists: boolean;
        };
        /** ObjectSchema */
        ObjectSchema: {
            workspaceId: string;
            globalId: string;
            id: string;
            name: string;
            objectSchemaKey: string;
            description?: string;
            /** @description Always 'Ok' */
            status?: string;
            /** Format: date-time */
            created: string;
            /** Format: date-time */
            updated: string;
            objectCount: number;
            objectTypeCount: number;
            canManage?: boolean;
        };
        /**
         * ObjectSchemaIn
         * @description Used to create object schema
         */
        ObjectSchemaIn: {
            name: string;
            objectSchemaKey: string;
            description?: string;
        };
        /**
         * ObjectSchemaUpdate
         * @description Used to update object schema
         */
        ObjectSchemaUpdate: {
            name?: string;
            objectSchemaKey?: string;
            description?: string;
        };
        /** ObjectSchemaList */
        ObjectSchemaList: {
            startAt: number;
            maxResults: number;
            total: number;
            values: components["schemas"]["ObjectSchema"][];
            /** @default false */
            last: boolean;
            /** @default false */
            isLast: boolean;
        };
        /**
         * ObjectType
         * @description The Assets object type
         */
        ObjectType: {
            workspaceId: string;
            globalId: string;
            id: string;
            name: string;
            description?: string;
            icon: components["schemas"]["Icon"];
            position: number;
            /** Format: date-time */
            created: string;
            /** Format: date-time */
            updated: string;
            objectCount: number;
            /** @description The id of the parent object type */
            parentObjectTypeId?: number;
            /** @description The type of the attribute */
            type?: number;
            objectSchemaId: string;
            /** @description Describes if this object type is configured for inheritance i.e. it's children inherits the attributes of this object type */
            inherited: boolean;
            abstractObjectType: boolean;
            /** @description Describes if this object types parent is inherited i.e. this object type has attributes that are inherited from one or more parents */
            parentObjectTypeInherited: boolean;
        };
        /**
         * ObjectTypeAttribute
         * @description The definition of the attribute that is associated with an object type
         */
        ObjectTypeAttribute: {
            workspaceId: string;
            globalId: string;
            id: string;
            objectType?: components["schemas"]["ObjectType"];
            name?: string;
            label: boolean;
            /**
             * @description | Value | Description|
             *     | ----- | ----------- |
             *     | 0 | Default|
             *     | 1 | Object reference|
             *     | 2 | User|
             *     | 4 | Group |
             *     | 7 | Status |
             */
            type?: number;
            description?: string;
            defaultType?: components["schemas"]["DefaultType"];
            typeValue?: string;
            typeValueMulti?: string[];
            additionalValue?: string;
            referenceType?: components["schemas"]["ReferenceType"];
            referenceObjectTypeId?: string;
            referenceObjectType?: components["schemas"]["ObjectType"];
            editable?: boolean;
            system?: boolean;
            /** @description Describes if this object type attribute is indexed. For an indexed attribute the AQL search will be faster, but this will affect memory consumption. */
            indexed: boolean;
            sortable?: boolean;
            summable?: boolean;
            minimumCardinality?: number;
            maximumCardinality?: number;
            suffix?: string;
            removable?: boolean;
            /** @deprecated */
            objectAttributeExists?: boolean;
            hidden?: boolean;
            includeChildObjectTypes?: boolean;
            uniqueAttribute?: boolean;
            regexValidation?: string;
            /**
             * @deprecated
             * @description Deprecated. Use `qlQuery` instead.
             */
            iql?: string;
            qlQuery?: string;
            options?: string;
            position: number;
        };
        /**
         * ObjectTypeAttributeCreate
         * @description Input entity to create an object type attribute
         */
        ObjectTypeAttributeCreate: {
            name: string;
            label?: boolean;
            description?: string;
            /**
             * @description | Value | Description|
             *     | ----- | ----------- |
             *     | 0 | Default|
             *     | 1 | Object reference|
             *     | 2 | User|
             *     | 4 | Group |
             *     | 7 | Status |
             */
            type: number;
            /**
             * @description | Id | Description (mandatory if type = Default) |
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
            defaultTypeId?: number;
            /** @description It is mandatory for Type = Object reference and should point to the referenced object type id */
            typeValue?: string;
            /** @description Valid for Type User. The Jira groups to restrict selection to */
            typeValueMulti?: string[];
            /** @description Valid for Type Url, User, Object and Confluence. For Url (DISABLED, ENABLED), for Object (ReferenceTypeId), for User (SHOW_PROFILE, HIDE_PROFILE), for Confluence (Confluence Space Id). It is mandatory for Type = Object reference */
            additionalValue?: string;
            /**
             * @description Valid for Type Email, Select, Object, User, Group, Version and Project
             * @default 0
             */
            minimumCardinality: number;
            /**
             * @description Valid for Type Email, Select, Object, User, Group, Version and Project
             * @default 1
             */
            maximumCardinality: number;
            /** @description Valid for Integer and Double object type attributes */
            suffix?: string;
            /** @description Valid for Type = Object reference and describes if children object types should be included in the selectable objects as well */
            includeChildObjectTypes?: boolean;
            /** @description Hide the object type attributes for Assets Users */
            hidden?: boolean;
            /** @description Should the values be unique for object attributes associated with this object type attribute */
            uniqueAttribute?: boolean;
            /** @description Valid for Type Integer and Double. Should a sum be included in the view */
            summable?: boolean;
            /** @description Valid for Type Text and Email */
            regexValidation?: string;
            /** @description Valid for Type object reference. Allows specifying an AQL query to restrict which objects are selectable. */
            qlQuery?: string;
            /**
             * @deprecated
             * @description Deprecated. Use `qlQuery` instead. Valid for Type object reference.
             */
            iql?: string;
            /** @description Valid for Type Select. A comma separated list of all chosable options */
            options?: string;
        };
        /**
         * ObjectTypeAttributesToDisplay
         * @description Identifies attributes to be displayed
         */
        ObjectTypeAttributesToDisplay: {
            /** @description The identifier of the object type attributes to be displayed */
            attributesToDisplayIds: string[];
        };
        /**
         * ObjectTypeAttributeUpdate
         * @description Input entity to update an object type attribute
         */
        ObjectTypeAttributeUpdate: {
            name?: string;
            label?: boolean;
            description?: string;
            /**
             * @description | Value | Description|
             *     | ----- | ----------- |
             *     | 0 | Default|
             *     | 1 | Object reference|
             *     | 2 | User|
             *     | 4 | Group |
             *     | 7 | Status |
             */
            type?: number;
            /**
             * @description | Id | Description (mandatory if type = Default) |
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
            defaultTypeId?: number;
            /** @description It is mandatory for Type = Object reference and should point to the referenced object type id */
            typeValue?: string;
            /** @description Valid for Type User. The Jira groups to restrict selection to */
            typeValueMulti?: string[];
            /** @description Valid for Type Url, User, Object and Confluence. For Url (DISABLED, ENABLED), for Object (ReferenceTypeId), for User (SHOW_PROFILE, HIDE_PROFILE), for Confluence (Confluence Space Id). It is mandatory for Type = Object reference */
            additionalValue?: string;
            /**
             * @description Valid for Type Email, Select, Object, User, Group, Version and Project
             * @default 0
             */
            minimumCardinality: number;
            /**
             * @description Valid for Type Email, Select, Object, User, Group, Version and Project
             * @default 1
             */
            maximumCardinality: number;
            /** @description Valid for Integer and Double object type attributes */
            suffix?: string;
            /** @description Valid for Type = Object reference and describes if children object types should be included in the selectable objects as well */
            includeChildObjectTypes?: boolean;
            /** @description Hide the object type attributes for Assets Users */
            hidden?: boolean;
            /** @description Should the values be unique for object attributes associated with this object type attribute */
            uniqueAttribute?: boolean;
            /** @description Valid for Type Integer and Double. Should a sum be included in the view */
            summable?: boolean;
            /** @description Valid for Type Text and Email */
            regexValidation?: string;
            /** @description Valid for Type object reference. Allows specifying an AQL query to restrict which objects are selectable. */
            qlQuery?: string;
            /**
             * @deprecated
             * @description Deprecated. Use `qlQuery` instead. Valid for Type object reference.
             */
            iql?: string;
            /** @description Valid for Type Select. A comma separated list of all chosable options */
            options?: string;
        };
        /**
         * ObjectTypeIn
         * @description The Assets object type input used for creating object types
         */
        ObjectTypeIn: {
            name: string;
            description?: string;
            iconId: string;
            objectSchemaId: string;
            /** @description The id of the parent object type */
            parentObjectTypeId?: string;
            /** @description Describes if this object type is configured for inheritance i.e. it's children inherits the attributes of this object type */
            inherited?: boolean;
            abstractObjectType?: boolean;
        };
        /**
         * ObjectTypeUpdate
         * @description The Assets object type input used for updating object types
         */
        ObjectTypeUpdate: {
            name?: string;
            description?: string;
            iconId?: string;
            /** @description Describes if this object type is configured for inheritance i.e. it's children inherits the attributes of this object type */
            inherited?: boolean;
            abstractObjectType?: boolean;
        };
        /** ObjectTypePosition */
        ObjectTypePosition: {
            /** @description The desired new parent of the object type */
            toObjectTypeId?: string;
            /** @description The preffered position */
            position: number;
        };
        /**
         * Progress
         * @description Used for long running processes in Assets
         */
        Progress: {
            progressInPercent?: number;
            resourceId?: string;
            category?: string;
            status?: string;
            stepDescription?: string;
            currentStep?: number;
            numberOfSteps?: number;
            currentWorkUnits?: number;
            currentWorkDescription?: string;
            currentStepTotalWorkUnits?: number;
            totalWorkUnits?: number;
            result?: string;
            /** @description The result data is different depending on the type of process the category specifies */
            resultData?: Record<string, never>;
            resultMessage?: string;
            /** @description The user key of the user that is running the process */
            actor?: string;
            /** Format: date-time */
            startDate?: string;
            /** Format: date-time */
            finishedDate?: string;
            /**
             * Format: date-time
             * @description If it is possible to estimate the comletion of the task this field will be populated
             */
            estimatedFinishDate?: string;
            /** @description Unique identifier of the execution */
            executionUUID?: string;
        };
        /** ReferenceType */
        ReferenceType: {
            workspaceId: string;
            globalId: string;
            id?: string;
            name: string;
            description?: string;
            color?: string;
            url16?: string;
            /** @deprecated */
            removable?: boolean;
            objectSchemaId?: string;
            cdmData?: components["schemas"]["ReferenceTypeCdmData"];
        };
        /** ReferenceTypeCdmData */
        ReferenceTypeCdmData: {
            types?: components["schemas"]["ReferenceTypeCdmType"][];
        };
        /** ReferenceTypeCdmType */
        ReferenceTypeCdmType: {
            key?: string;
            version?: number;
            opinionated?: boolean;
        };
        /**
         * Status
         * @description An Assets status type that can be associated with objects
         */
        Status: {
            id: string;
            name: string;
            description?: string;
            /**
             * @description | Name | Value | Color |
             *     | ---- | ----- | ----- |
             *     | ACTIVE | 1 | Green |
             *     | INACTIVE | 0 | Red |
             *     | PENDING | 2 | Yellow |
             */
            category: number;
            objectSchemaId?: string;
        };
        /** ReferenceTypeIn */
        ReferenceTypeIn: {
            name: string;
            description?: string;
            color?: string;
            objectSchemaId?: string;
        };
        /** StatusIn */
        StatusIn: {
            name: string;
            description?: string;
            /**
             * @description | Name | Value | Color |
             *     | ---- | ----- | ----- |
             *     | ACTIVE | 1 | Green |
             *     | INACTIVE | 0 | Red |
             *     | PENDING | 2 | Yellow |
             */
            category: number;
            objectSchemaId?: string;
        };
        /** Ticket */
        Ticket: {
            workspaceId: string;
            globalId: string;
            key?: string;
            id: string;
            reporter: string;
            /** Format: date-time */
            created: string;
            /** Format: date-time */
            updated: string;
            title?: string;
            status?: components["schemas"]["TicketStatus"];
            type: components["schemas"]["TicketType"];
            priority: components["schemas"]["TicketPriority"];
        };
        /** TicketPriority */
        TicketPriority: {
            name?: string;
            iconUrl?: string;
        };
        /** TicketStatus */
        TicketStatus: {
            name?: string;
            description?: string;
            colorName?: string;
        };
        /** TicketType */
        TicketType: {
            name?: string;
            description?: string;
            iconUrl?: string;
        };
        /**
         * Tickets
         * @description A list of connected issues
         */
        Tickets: {
            tickets?: components["schemas"]["Ticket"][];
            /** @description A query to find all the connected issues */
            allTicketsQuery: string;
        };
        /**
         * User
         * @description The Assets user type
         */
        User: {
            avatarUrl?: string;
            displayName?: string;
            name?: string;
            key?: string;
            emailAddress?: string;
            html?: string;
            renderedLink?: string;
            isDeleted?: boolean;
            lastSeenVersion?: string;
            self?: string;
        };
        /**
         * @example {
         *       "startTime": "2024-01-15T02:00:00Z",
         *       "runInterval": "DAILY",
         *       "callbackUrl": "https://example.com/webhook/import-complete"
         *     }
         */
        ImportScheduleRequest: {
            /**
             * Format: date-time
             * @description The date and time when the first import should execute, in ISO 8601 format (e.g., '2024-01-15T02:00:00Z'). Must be in the future.
             * @example 2024-01-15T02:00:00Z
             */
            startTime: string;
            /**
             * @description The frequency of the scheduled import. ONCE: runs only at startTime. DAILY: runs every day at the specified time. WEEKLY: runs every 7 days. MONTHLY: runs on the same day of each month.
             * @example DAILY
             * @enum {string}
             */
            runInterval: "ONCE" | "DAILY" | "WEEKLY" | "MONTHLY";
            /**
             * Format: uri
             * @description Optional webhook URL to call after each scheduled import execution. The URL will receive a POST request with execution status.
             * @example https://example.com/webhook/import-complete
             */
            callbackUrl?: string | null;
        };
        /**
         * @example {
         *       "id": "b9f5f167-a7e1-4b3a-9e4f-2c3d4e5f6a7c",
         *       "collectionId": "c7d8e9f0-1234-5678-9abc-def012345678",
         *       "name": "Daily Server Import",
         *       "created": "2024-01-10T10:30:00Z",
         *       "updated": "2024-01-12T14:45:00Z",
         *       "description": "Automated import of server data",
         *       "objectSchemaId": "c7d8e9f0-1234-5678-9abc-def012345678",
         *       "importSourceModuleKey": "rlabs-import-type-csv",
         *       "defaultConcatenator": ",",
         *       "defaultHandleEmptyValues": "IGNORE",
         *       "defaultHandleUnknownValues": "IGNORE",
         *       "dateFormat": "yyyy-MM-dd",
         *       "dateTimeFormat": "yyyy-MM-dd'T'HH:mm:ss'Z'",
         *       "importSpecificConfiguration": "{}",
         *       "tokenGenerated": true,
         *       "isImportSourceSchedulingEnabled": true,
         *       "scheduledImportDetails": {
         *         "importScheduleId": "a8f5f167-a7e1-4b3a-9e4f-2c3d4e5f6a7b",
         *         "startTime": "2024-01-15T02:00:00Z",
         *         "runFrequency": "DAILY",
         *         "nextScheduledTime": "2024-01-16T02:00:00Z",
         *         "createdAt": "2024-01-10T10:30:00Z"
         *       }
         *     }
         */
        ImportSourceResponse: {
            /**
             * Format: uuid
             * @description Import source ID
             * @example b9f5f167-a7e1-4b3a-9e4f-2c3d4e5f6a7c
             */
            id?: string;
            /**
             * Format: uuid
             * @description Collection (object schema) ID
             * @example c7d8e9f0-1234-5678-9abc-def012345678
             */
            collectionId?: string;
            /**
             * @description Import source name
             * @example Daily Server Import
             */
            name?: string;
            /**
             * Format: date-time
             * @description Timestamp when the import source was created
             * @example 2024-01-10T10:30:00Z
             */
            created?: string;
            /**
             * Format: date-time
             * @description Timestamp when the import source was last updated
             * @example 2024-01-12T14:45:00Z
             */
            updated?: string;
            /**
             * @description Import source description
             * @example Automated import of server data
             */
            description?: string | null;
            /**
             * Format: uuid
             * @description Object schema ID
             * @example c7d8e9f0-1234-5678-9abc-def012345678
             */
            objectSchemaId?: string;
            /**
             * @description Import module type. CSV: rlabs-import-type-csv, JSON: rlabs-import-type-json, External: rlabs-import-type-external, Discovery: insight-discovery-import, DataManager: rlabs-import-type-dm-csv
             * @example rlabs-import-type-csv
             * @enum {string}
             */
            importSourceModuleKey?: "rlabs-import-type-csv" | "rlabs-import-type-json" | "rlabs-import-type-external" | "insight-discovery-import" | "rlabs-import-type-dm-csv";
            /**
             * @description Default concatenator for multi-value attributes
             * @example ,
             */
            defaultConcatenator?: string;
            /**
             * @description How to handle empty values
             * @example IGNORE
             */
            defaultHandleEmptyValues?: string;
            /**
             * @description How to handle unknown values
             * @example IGNORE
             */
            defaultHandleUnknownValues?: string;
            /**
             * @description Date format pattern
             * @example yyyy-MM-dd
             */
            dateFormat?: string;
            /**
             * @description Date-time format pattern
             * @example yyyy-MM-dd'T'HH:mm:ss'Z'
             */
            dateTimeFormat?: string;
            /** @description Import status information */
            importStatus?: {
                /**
                 * @description Configuration status type - whether the import source is enabled or disabled
                 * @enum {string|null}
                 */
                configurationStatusType?: "DISABLED" | "ENABLED" | null;
                /**
                 * @description Validation status type - system-evaluated status (not user-changeable)
                 * @enum {string|null}
                 */
                validationStatusType?: "VALID" | "INVALID_CONFIGURATION" | "MODULE_UNINSTALLED" | null;
                /** @description Map of reasons for invalidity */
                reasonForInvalidity?: {
                    [key: string]: string;
                } | null;
                /** @description Status name (computed from configurationStatusType) */
                readonly name?: string;
                /** @description Validation status name (computed) */
                readonly validation?: string;
                /** @description AUI lozenge CSS class for configuration status */
                readonly configurationAuiLozenge?: string;
                /** @description AUI lozenge CSS class for validation status */
                readonly validationAuiLozenge?: string;
            } | null;
            /**
             * @description Import-specific configuration as JSON string
             * @example {}
             */
            importSpecificConfiguration?: string;
            /** @description List of object type mappings for this import source */
            importSourceOTEntries?: {
                /** @description Import source object type ID */
                id?: string;
                /** @description Parent import source object type ID */
                parentImportSourceOTId?: string | null;
                /** @description Associated import source ID */
                importSourceId?: string | null;
                /**
                 * Format: date-time
                 * @description Creation timestamp
                 */
                created?: string | null;
                /**
                 * Format: date-time
                 * @description Last update timestamp
                 */
                updated?: string | null;
                /** @description Description */
                description?: string | null;
                /** @description Target object type configuration */
                objectType?: {
                    /** @description Object type ID */
                    id?: string;
                    /** @description Object type name */
                    name?: string;
                } | null;
                /** @description Selector QL query */
                selectorQlQuery?: string | null;
                /** @description Selector IQL query */
                selectorIQL?: string | null;
                /** @description The selector used in JSON imports to find the objects */
                selector?: string | null;
                /** @description How to handle empty values */
                emptyValues?: string | null;
                /** @description How to handle unknown values */
                unknownValues?: string | null;
                /** @description Import status for this object type */
                importStatus?: {
                    /**
                     * @description Configuration status type
                     * @enum {string}
                     */
                    configurationStatusType?: "DISABLED" | "ENABLED";
                    /**
                     * @description Validation status type
                     * @enum {string}
                     */
                    validationStatusType?: "VALID" | "INVALID_CONFIGURATION" | "MODULE_UNINSTALLED";
                    /** @description Reasons for invalidity */
                    reasonForInvalidity?: {
                        [key: string]: string;
                    };
                } | null;
                /** @description List of object type attribute mappings */
                importSourceOTAttrEntries?: {
                    /** @description Attribute mapping ID */
                    id?: string;
                }[] | null;
                /** @description Whether to ignore case when matching identifiers */
                matchIdentifierIgnoreCase?: boolean | null;
            }[] | null;
            /**
             * @description Whether a token has been generated for this import source
             * @example true
             */
            tokenGenerated?: boolean | null;
            /**
             * Format: uri
             * @description Import source URL (if applicable)
             */
            url?: string | null;
            /** @description Integrated import type ID */
            integratedImportTypeId?: number | null;
            /** @description Integrated import type extension ID */
            integratedImportTypeExtensionId?: string | null;
            /** @description How to handle computed issue values (DataManager config) */
            defaultHandleComputeIssueValues?: string | null;
            /** @description How to handle null values (DataManager config) */
            defaultHandleNullValues?: string | null;
            /** @description How to handle not mapped values (DataManager config) */
            defaultHandleNotMappedValues?: string | null;
            /**
             * @description Whether scheduled import is enabled for this source
             * @example true
             */
            isImportSourceSchedulingEnabled?: boolean | null;
            /** @description Type of import execution */
            importExecutionType?: string | null;
            /** @description Scheduled import configuration (populated when enableScheduledImports feature flag is enabled) */
            scheduledImportDetails?: components["schemas"]["ScheduledImportDetails"] | null;
        };
        /**
         * @example {
         *       "importScheduleId": "a8f5f167-a7e1-4b3a-9e4f-2c3d4e5f6a7b",
         *       "startTime": "2024-01-15T02:00:00Z",
         *       "runFrequency": "DAILY",
         *       "nextScheduledTime": "2024-01-16T02:00:00Z",
         *       "createdAt": "2024-01-10T10:30:00Z"
         *     }
         */
        ScheduledImportDetails: {
            /**
             * Format: uuid
             * @description Schedule ID
             * @example a8f5f167-a7e1-4b3a-9e4f-2c3d4e5f6a7b
             */
            importScheduleId?: string;
            /**
             * Format: date-time
             * @description When the schedule starts
             * @example 2024-01-15T02:00:00Z
             */
            startTime?: string;
            /**
             * @description The frequency of the scheduled import. ONCE: runs only at startTime. DAILY: runs every day at the specified time. WEEKLY: runs every 7 days. MONTHLY: runs on the same day of each month.
             * @example DAILY
             * @enum {string}
             */
            runFrequency?: "ONCE" | "DAILY" | "WEEKLY" | "MONTHLY";
            /**
             * Format: date-time
             * @description Next scheduled execution time
             * @example 2024-01-16T02:00:00Z
             */
            nextScheduledTime?: string;
            /**
             * Format: date-time
             * @description When the schedule was created
             * @example 2024-01-10T10:30:00Z
             */
            createdAt?: string;
        };
        /**
         * @example {
         *       "id": "a8f5f167-a7e1-4b3a-9e4f-2c3d4e5f6a7b",
         *       "importSourceId": "b9f5f167-a7e1-4b3a-9e4f-2c3d4e5f6a7c",
         *       "startTime": "2024-01-15T02:00:00Z",
         *       "runInterval": "DAILY",
         *       "created": "2024-01-10T10:30:00Z",
         *       "updated": "2024-01-12T14:45:00Z",
         *       "collectionId": "c7d8e9f0-1234-5678-9abc-def012345678"
         *     }
         */
        ImportScheduleResponse: {
            /**
             * @description The unique identifier of the import schedule
             * @example a8f5f167-a7e1-4b3a-9e4f-2c3d4e5f6a7b
             */
            id?: string;
            /**
             * @description The ID of the associated import source
             * @example b9f5f167-a7e1-4b3a-9e4f-2c3d4e5f6a7c
             */
            importSourceId?: string;
            /**
             * Format: date-time
             * @description The start time of the schedule in ISO 8601 format
             * @example 2024-01-15T02:00:00Z
             */
            startTime?: string;
            /**
             * @description The frequency of the scheduled import
             * @example DAILY
             * @enum {string}
             */
            runInterval?: "ONCE" | "DAILY" | "WEEKLY" | "MONTHLY";
            /**
             * Format: date-time
             * @description Timestamp when the schedule was created
             * @example 2024-01-10T10:30:00Z
             */
            created?: string;
            /**
             * Format: date-time
             * @description Timestamp when the schedule was last updated
             * @example 2024-01-12T14:45:00Z
             */
            updated?: string;
            /**
             * @description The collection (object schema) ID associated with this import
             * @example c7d8e9f0-1234-5678-9abc-def012345678
             */
            collectionId?: string;
        };
        /**
         * TenantUsageResponse
         * @description Comprehensive usage statistics for a tenant.
         * @example {
         *       "totalObjectsCount": 1234,
         *       "perSchemaUsageInfo": [
         *         {
         *           "schemaId": 1,
         *           "schemaName": "My Schema",
         *           "schemaCreatedAt": "2025-01-15T10:30:00Z",
         *           "objectCount": 567
         *         }
         *       ]
         *     }
         */
        TenantUsageResponse: {
            /**
             * Format: int64
             * @description Total number of objects across all schemas in the tenant.
             * @example 1234
             */
            totalObjectsCount: number;
            /** @description Per-schema breakdown of usage information. */
            perSchemaUsageInfo: components["schemas"]["SchemaUsageInfo"][];
        };
        /**
         * SchemaUsageInfo
         * @description Usage statistics for a single object schema within the tenant.
         */
        SchemaUsageInfo: {
            /**
             * Format: int64
             * @description The unique identifier of the schema.
             * @example 1
             */
            schemaId: number;
            /**
             * @description The display name of the schema.
             * @example My Schema
             */
            schemaName: string;
            /**
             * Format: date-time
             * @description The timestamp when the schema was created (ISO 8601).
             * @example 2025-01-15T10:30:00Z
             */
            schemaCreatedAt: string;
            /**
             * Format: int32
             * @description The number of objects in this schema.
             * @example 567
             */
            objectCount: number;
        };
        StartInfo: {
            links: {
                submitProgress: string;
                submitResults: string;
                getExecutionStatus: string;
                cancel: string;
            };
            result: string;
        };
        /**
         * @description Import execution status values returned by the Assets REST API getExecutionStatus endpoint.
         * @enum {string}
         */
        ImportExecutionStatus: "INGESTING" | "PROCESSING" | "DONE" | "CANCELLED";
        /** ImportExecutionStatusResponse */
        ImportExecutionStatusResponse: {
            executionId: string;
            status: components["schemas"]["ImportExecutionStatus"];
        };
    };
    responses: {
        /** @description The system cannot fulfill the request due to validation errors. See the response body for more details. */
        trait_badRequest_400: {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        /** @description Client must be authenticated to access this resource. */
        trait_requireAuthentication_401: {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        /** @description Authenticated user is missing permission to fulfill the request */
        trait_requirePermission_403: {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        /** @description Representation of the target resource do not exist */
        trait_notFound_404: {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        /** @description The server is unable to produce a response matching the requested content type. */
        trait_notAcceptable_406: {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        /** @description The request has been rate limited by the system. Every API key is allowed to perform 500 requests per minute to this endpoint. */
        trait_rateLimit500PerMinute_429: {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        /** @description The request has been rate limited by the system. Every API key is allowed to perform 1000 requests per minute to this endpoint. */
        trait_rateLimit1000PerMinute_429: {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        /** @description The request has been rate limited by the system. Every API key is allowed to perform 2000 requests per minute to this endpoint. */
        trait_rateLimit2000PerMinute_429: {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        /** @description Something went wrong. Please try again later. If the error persists, contact our support team. */
        trait_internalServerError_500: {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
    };
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    "AQL - Find objects": {
        parameters: {
            query?: {
                /** @description The query to determine which objects that should be fetched. E.g. objectType = "Computer". The empty AQL means all objects */
                qlQuery?: string;
                /** @description Which page to fetch when paginating through the response */
                page?: number;
                /** @description The amount of objects returned per page */
                resultPerPage?: number;
                /** @description Should the objects attributes be included in the response. If this parameter is false only the information on the object will be returned and the object attributes will not be present */
                includeAttributes?: boolean;
                /** @description How many levels of attributes should be included. E.g. consider an object A that has a reference to object B that has a reference to object C. If object A is included in the response and includeAttributesDeep=1 object A's reference to object B will be included in the attributes of object A but object B's reference to object C will not be included. However if the includeAttributesDeep=2 then object B's reference to object C will be included in object B's attributes */
                includeAttributesDeep?: number;
                /** @description Should the response include the object type attribute definition for each attribute that is returned with the objects */
                includeTypeAttributes?: boolean;
                /** @description Include information about open Jira issues. Should each object have information if open tickets are connected to the object? */
                includeExtendedInfo?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description A object result set that can be used to paginate through the result list of objects */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "results": {
                     *         "objectEntries": [
                     *           {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:88",
                     *             "id": "88",
                     *             "label": "SYD-1",
                     *             "objectKey": "ITSM-88",
                     *             "avatar": {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=16",
                     *               "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=48",
                     *               "url72": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=72",
                     *               "url144": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=144",
                     *               "url288": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=288",
                     *               "objectId": "88",
                     *               "mediaClientConfig": {
                     *                 "clientId": "1a2s3d4f-dc47-44b0-9t0r-1h2h3yd68e9q",
                     *                 "mediaBaseUrl": "https://api.media.atlassian.com",
                     *                 "mediaJwtToken": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIxYTJzM2Q0Zi1kYzQ3LTQ0YjAtOXQwci0xaDJoM3lkNjhlOXEiLCJhY2Nlc3MiOnsidXJuOmZpbGVzdG9yZTpmaWxlOjg0MTIzZXJ0LTEyM2MtNGIxMi0xMmM1LTBiODZkYzgxMjNmZiI6WyJyZWFkIl19LCJleHAiOjE2MjYxNTY1NjcsIm5iZiI6MTYyNjE1NTkwN30.YjicbagPLbzapp3eEZbCQ7Z9V8Uc0WeBledyTw-Qu0s",
                     *                 "fileId": "84123ert-123c-4b12-12c5-0b86dc8123ff"
                     *               }
                     *             },
                     *             "objectType": {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:23",
                     *               "id": "23",
                     *               "name": "Office",
                     *               "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ex.",
                     *               "icon": {
                     *                 "id": "13",
                     *                 "name": "Building",
                     *                 "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=16",
                     *                 "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=48"
                     *               },
                     *               "position": 2,
                     *               "created": "2021-02-16T19:36:51.951Z",
                     *               "updated": "2021-04-16T15:17:03.384Z",
                     *               "objectCount": 0,
                     *               "objectSchemaId": "6",
                     *               "inherited": false,
                     *               "abstractObjectType": false,
                     *               "parentObjectTypeInherited": false
                     *             },
                     *             "created": "2021-02-16T20:04:41.527Z",
                     *             "updated": "2021-02-16T20:04:41.527Z",
                     *             "hasAvatar": false,
                     *             "timestamp": 1613505881527,
                     *             "attributes": [
                     *               {
                     *                 "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                 "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:637",
                     *                 "id": "637",
                     *                 "objectTypeAttributeId": "134",
                     *                 "objectAttributeValues": [
                     *                   {
                     *                     "value": "ITSM-88",
                     *                     "displayValue": "ITSM-88",
                     *                     "searchValue": "ITSM-88",
                     *                     "referencedType": false
                     *                   }
                     *                 ],
                     *                 "objectId": "88"
                     *               },
                     *               {
                     *                 "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                 "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:640",
                     *                 "id": "640",
                     *                 "objectTypeAttributeId": "135",
                     *                 "objectAttributeValues": [
                     *                   {
                     *                     "value": "SYD-1",
                     *                     "displayValue": "SYD-1",
                     *                     "searchValue": "SYD-1",
                     *                     "referencedType": false
                     *                   }
                     *                 ],
                     *                 "objectId": "88"
                     *               },
                     *               {
                     *                 "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                 "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:638",
                     *                 "id": "638",
                     *                 "objectTypeAttributeId": "136",
                     *                 "objectAttributeValues": [
                     *                   {
                     *                     "value": "2021-02-16T20:04:41.527Z",
                     *                     "displayValue": "16/Feb/21 8:04 PM",
                     *                     "searchValue": "2021-02-16T20:04:41.527Z",
                     *                     "referencedType": false
                     *                   }
                     *                 ],
                     *                 "objectId": "88"
                     *               },
                     *               {
                     *                 "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                 "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:639",
                     *                 "id": "639",
                     *                 "objectTypeAttributeId": "137",
                     *                 "objectAttributeValues": [
                     *                   {
                     *                     "value": "2021-02-16T20:04:41.527Z",
                     *                     "displayValue": "16/Feb/21 8:04 PM",
                     *                     "searchValue": "2021-02-16T20:04:41.527Z",
                     *                     "referencedType": false
                     *                   }
                     *                 ],
                     *                 "objectId": "88"
                     *               },
                     *               {
                     *                 "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                 "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:641",
                     *                 "id": "641",
                     *                 "objectTypeAttributeId": "144",
                     *                 "objectAttributeValues": [
                     *                   {
                     *                     "referencedObject": {
                     *                       "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                       "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:87",
                     *                       "id": "87",
                     *                       "label": "Sydney",
                     *                       "objectKey": "ITSM-87",
                     *                       "avatar": {
                     *                         "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                         "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=16",
                     *                         "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=48",
                     *                         "url72": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=72",
                     *                         "url144": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=144",
                     *                         "url288": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=288",
                     *                         "objectId": "87",
                     *                         "mediaClientConfig": {
                     *                           "clientId": "1a2s3d4f-dc47-44b0-9t0r-1h2h3yd68e9q",
                     *                           "mediaBaseUrl": "https://api.media.atlassian.com",
                     *                           "mediaJwtToken": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIxYTJzM2Q0Zi1kYzQ3LTQ0YjAtOXQwci0xaDJoM3lkNjhlOXEiLCJhY2Nlc3MiOnsidXJuOmZpbGVzdG9yZTpmaWxlOjg0MTIzZXJ0LTEyM2MtNGIxMi0xMmM1LTBiODZkYzgxMjNmZiI6WyJyZWFkIl19LCJleHAiOjE2MjYxNTY1NjcsIm5iZiI6MTYyNjE1NTkwN30.YjicbagPLbzapp3eEZbCQ7Z9V8Uc0WeBledyTw-Qu0s",
                     *                           "fileId": "84123ert-123c-4b12-12c5-0b86dc8123ff"
                     *                         }
                     *                       },
                     *                       "objectType": {
                     *                         "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                         "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:24",
                     *                         "id": "24",
                     *                         "name": "City",
                     *                         "icon": {
                     *                           "id": "28",
                     *                           "name": "Cottage",
                     *                           "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=16",
                     *                           "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=48"
                     *                         },
                     *                         "position": 3,
                     *                         "created": "2021-02-16T19:58:45.698Z",
                     *                         "updated": "2021-04-16T15:17:03.393Z",
                     *                         "objectCount": 0,
                     *                         "objectSchemaId": "6",
                     *                         "inherited": false,
                     *                         "abstractObjectType": false,
                     *                         "parentObjectTypeInherited": false
                     *                       },
                     *                       "created": "2021-02-16T20:04:26.445Z",
                     *                       "updated": "2021-02-16T20:04:26.445Z",
                     *                       "hasAvatar": false,
                     *                       "timestamp": 1613505866445,
                     *                       "_links": {
                     *                         "self": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/object/87"
                     *                       },
                     *                       "name": "Sydney"
                     *                     },
                     *                     "displayValue": "Sydney",
                     *                     "searchValue": "ITSM-87",
                     *                     "referencedType": true
                     *                   }
                     *                 ],
                     *                 "objectId": "88"
                     *               }
                     *             ],
                     *             "_links": {
                     *               "self": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/object/88"
                     *             },
                     *             "name": "SYD-1"
                     *           }
                     *         ],
                     *         "objectTypeAttributes": [
                     *           {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:134",
                     *             "id": "134",
                     *             "name": "Key",
                     *             "label": false,
                     *             "defaultType": {
                     *               "id": 0,
                     *               "name": "Text"
                     *             },
                     *             "editable": false,
                     *             "system": true,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 1,
                     *             "maximumCardinality": 1,
                     *             "removable": false,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": false,
                     *             "options": "",
                     *             "position": 0
                     *           },
                     *           {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:135",
                     *             "id": "135",
                     *             "name": "Name",
                     *             "label": true,
                     *             "description": "The name of the object",
                     *             "defaultType": {
                     *               "id": 0,
                     *               "name": "Text"
                     *             },
                     *             "editable": true,
                     *             "system": false,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 1,
                     *             "maximumCardinality": 1,
                     *             "suffix": "",
                     *             "removable": false,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": true,
                     *             "regexValidation": "",
                     *             "options": "",
                     *             "position": 1
                     *           },
                     *           {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:136",
                     *             "id": "136",
                     *             "name": "Created",
                     *             "label": false,
                     *             "defaultType": {
                     *               "id": 6,
                     *               "name": "DateTime"
                     *             },
                     *             "editable": false,
                     *             "system": true,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 1,
                     *             "maximumCardinality": 1,
                     *             "removable": false,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": false,
                     *             "options": "",
                     *             "position": 2
                     *           },
                     *           {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:137",
                     *             "id": "137",
                     *             "name": "Updated",
                     *             "label": false,
                     *             "defaultType": {
                     *               "id": 6,
                     *               "name": "DateTime"
                     *             },
                     *             "editable": false,
                     *             "system": true,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 1,
                     *             "maximumCardinality": 1,
                     *             "removable": false,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": false,
                     *             "options": "",
                     *             "position": 3
                     *           },
                     *           {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:144",
                     *             "id": "144",
                     *             "name": "City",
                     *             "label": false,
                     *             "referenceType": {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:4",
                     *               "id": "4",
                     *               "name": "Reference",
                     *               "description": "Reference",
                     *               "color": "49a6ed",
                     *               "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/config/referencetype/4/image.png?size=16"
                     *             },
                     *             "referenceObjectTypeId": "24",
                     *             "referenceObjectType": {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:24",
                     *               "id": "24",
                     *               "name": "City",
                     *               "icon": {
                     *                 "id": "28",
                     *                 "name": "Cottage",
                     *                 "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=16",
                     *                 "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=48"
                     *               },
                     *               "position": 3,
                     *               "created": "2021-02-16T19:58:45.698Z",
                     *               "updated": "2021-04-16T15:17:03.393Z",
                     *               "objectCount": 0,
                     *               "objectSchemaId": "6",
                     *               "inherited": false,
                     *               "abstractObjectType": false,
                     *               "parentObjectTypeInherited": false
                     *             },
                     *             "editable": true,
                     *             "system": false,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 0,
                     *             "maximumCardinality": 1,
                     *             "removable": true,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": false,
                     *             "options": "",
                     *             "position": 4
                     *           },
                     *           {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:265",
                     *             "id": "265",
                     *             "name": "Placeholder",
                     *             "label": false,
                     *             "defaultType": {
                     *               "id": 0,
                     *               "name": "Text"
                     *             },
                     *             "editable": true,
                     *             "system": false,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 0,
                     *             "maximumCardinality": 1,
                     *             "removable": true,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": false,
                     *             "options": "",
                     *             "position": 5
                     *           }
                     *         ],
                     *         "objectTypeIsInherited": false,
                     *         "abstractObjectType": false,
                     *         "totalFilterCount": 1,
                     *         "startIndex": 1,
                     *         "toIndex": 1,
                     *         "pageObjectSize": 25,
                     *         "pageNumber": 1,
                     *         "orderWay": "ascending",
                     *         "qlQuery": "objectType = Office AND Name LIKE SYD",
                     *         "qlQuerySearchResult": true,
                     *         "conversionPossible": false,
                     *         "pageSize": 1
                     *       },
                     *       "attributes parameter to false": {
                     *         "objectEntries": [
                     *           {
                     *             "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *             "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:88",
                     *             "id": "88",
                     *             "label": "SYD-1",
                     *             "objectKey": "ITSM-88",
                     *             "avatar": {
                     *               "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *               "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=16",
                     *               "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=48",
                     *               "url72": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=72",
                     *               "url144": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=144",
                     *               "url288": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=288",
                     *               "objectId": "88",
                     *               "mediaClientConfig": {
                     *                 "clientId": "1a2s3d4f-dc47-44b0-9t0r-1h2h3yd68e9q",
                     *                 "mediaBaseUrl": "https://api.media.atlassian.com",
                     *                 "mediaJwtToken": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIxYTJzM2Q0Zi1kYzQ3LTQ0YjAtOXQwci0xaDJoM3lkNjhlOXEiLCJhY2Nlc3MiOnsidXJuOmZpbGVzdG9yZTpmaWxlOjg0MTIzZXJ0LTEyM2MtNGIxMi0xMmM1LTBiODZkYzgxMjNmZiI6WyJyZWFkIl19LCJleHAiOjE2MjYxNTY1NjcsIm5iZiI6MTYyNjE1NTkwN30.YjicbagPLbzapp3eEZbCQ7Z9V8Uc0WeBledyTw-Qu0s",
                     *                 "fileId": "84123ert-123c-4b12-12c5-0b86dc8123ff"
                     *               }
                     *             },
                     *             "objectType": {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:23",
                     *               "id": "23",
                     *               "name": "Office",
                     *               "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ex.",
                     *               "icon": {
                     *                 "id": "13",
                     *                 "name": "Building",
                     *                 "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=16",
                     *                 "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=48"
                     *               },
                     *               "position": 2,
                     *               "created": "2021-02-16T19:36:51.951Z",
                     *               "updated": "2021-04-16T15:17:03.384Z",
                     *               "objectCount": 0,
                     *               "objectSchemaId": "6",
                     *               "inherited": false,
                     *               "abstractObjectType": false,
                     *               "parentObjectTypeInherited": false
                     *             },
                     *             "created": "2021-02-16T20:04:41.527Z",
                     *             "updated": "2021-02-16T20:04:41.527Z",
                     *             "hasAvatar": false,
                     *             "timestamp": 1613505881527,
                     *             "_links": {
                     *               "self": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/object/88"
                     *             },
                     *             "name": "SYD-1"
                     *           }
                     *         ],
                     *         "objectTypeAttributes": [
                     *           {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:134",
                     *             "id": "134",
                     *             "name": "Key",
                     *             "label": false,
                     *             "defaultType": {
                     *               "id": 0,
                     *               "name": "Text"
                     *             },
                     *             "editable": false,
                     *             "system": true,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 1,
                     *             "maximumCardinality": 1,
                     *             "removable": false,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": false,
                     *             "options": "",
                     *             "position": 0
                     *           },
                     *           {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:135",
                     *             "id": "135",
                     *             "name": "Name",
                     *             "label": true,
                     *             "description": "The name of the object",
                     *             "defaultType": {
                     *               "id": 0,
                     *               "name": "Text"
                     *             },
                     *             "editable": true,
                     *             "system": false,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 1,
                     *             "maximumCardinality": 1,
                     *             "suffix": "",
                     *             "removable": false,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": true,
                     *             "regexValidation": "",
                     *             "options": "",
                     *             "position": 1
                     *           },
                     *           {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:136",
                     *             "id": "136",
                     *             "name": "Created",
                     *             "label": false,
                     *             "defaultType": {
                     *               "id": 6,
                     *               "name": "DateTime"
                     *             },
                     *             "editable": false,
                     *             "system": true,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 1,
                     *             "maximumCardinality": 1,
                     *             "removable": false,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": false,
                     *             "options": "",
                     *             "position": 2
                     *           },
                     *           {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:137",
                     *             "id": "137",
                     *             "name": "Updated",
                     *             "label": false,
                     *             "defaultType": {
                     *               "id": 6,
                     *               "name": "DateTime"
                     *             },
                     *             "editable": false,
                     *             "system": true,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 1,
                     *             "maximumCardinality": 1,
                     *             "removable": false,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": false,
                     *             "options": "",
                     *             "position": 3
                     *           },
                     *           {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:144",
                     *             "id": "144",
                     *             "name": "City",
                     *             "label": false,
                     *             "referenceType": {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:4",
                     *               "id": "4",
                     *               "name": "Reference",
                     *               "description": "Reference",
                     *               "color": "49a6ed",
                     *               "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/config/referencetype/4/image.png?size=16"
                     *             },
                     *             "referenceObjectTypeId": "24",
                     *             "referenceObjectType": {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:24",
                     *               "id": "24",
                     *               "name": "City",
                     *               "icon": {
                     *                 "id": "28",
                     *                 "name": "Cottage",
                     *                 "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=16",
                     *                 "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=48"
                     *               },
                     *               "position": 3,
                     *               "created": "2021-02-16T19:58:45.698Z",
                     *               "updated": "2021-04-16T15:17:03.393Z",
                     *               "objectCount": 0,
                     *               "objectSchemaId": "6",
                     *               "inherited": false,
                     *               "abstractObjectType": false,
                     *               "parentObjectTypeInherited": false
                     *             },
                     *             "editable": true,
                     *             "system": false,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 0,
                     *             "maximumCardinality": 1,
                     *             "removable": true,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": false,
                     *             "options": "",
                     *             "position": 4
                     *           },
                     *           {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:265",
                     *             "id": "265",
                     *             "name": "Placeholder",
                     *             "label": false,
                     *             "defaultType": {
                     *               "id": 0,
                     *               "name": "Text"
                     *             },
                     *             "editable": true,
                     *             "system": false,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 0,
                     *             "maximumCardinality": 1,
                     *             "removable": true,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": false,
                     *             "options": "",
                     *             "position": 5
                     *           }
                     *         ],
                     *         "objectTypeIsInherited": false,
                     *         "abstractObjectType": false,
                     *         "totalFilterCount": 1,
                     *         "startIndex": 1,
                     *         "toIndex": 1,
                     *         "pageObjectSize": 25,
                     *         "pageNumber": 1,
                     *         "orderWay": "ascending",
                     *         "qlQuery": "objectType = Office AND Name LIKE SYD",
                     *         "qlQuerySearchResult": true,
                     *         "conversionPossible": false,
                     *         "pageSize": 1
                     *       },
                     *       "no results": {
                     *         "objectEntries": [],
                     *         "objectTypeAttributes": [],
                     *         "objectTypeIsInherited": false,
                     *         "abstractObjectType": false,
                     *         "totalFilterCount": 0,
                     *         "startIndex": 1,
                     *         "toIndex": 0,
                     *         "pageObjectSize": 25,
                     *         "pageNumber": 1,
                     *         "orderWay": "ascending",
                     *         "qlQuery": "objectType = Office AND Name LIKE NY",
                     *         "qlQuerySearchResult": true,
                     *         "conversionPossible": false,
                     *         "pageSize": 0
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["ObjectListResult"];
                };
            };
            400: components["responses"]["trait_badRequest_400"];
            401: components["responses"]["trait_requireAuthentication_401"];
            429: components["responses"]["trait_rateLimit500PerMinute_429"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Icon - Find": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description An icon */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": "68",
                     *       "name": "Mac OS",
                     *       "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/icon/68/icon.png?size=16",
                     *       "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/icon/68/icon.png?size=48"
                     *     }
                     */
                    "application/json": components["schemas"]["Icon"];
                };
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            404: components["responses"]["trait_notFound_404"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Icon - Load Image": {
        parameters: {
            query?: {
                size?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The PNG image of the icon specified by id */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "image/png": string;
                };
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            404: components["responses"]["trait_notFound_404"];
            406: components["responses"]["trait_notAcceptable_406"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Icon - Find global icons": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description All existing global icons */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Icon"][];
                };
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Import - Start": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The id of the import configuration that should be started */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "progressInPercent": 0,
                     *       "resourceId": "9fa74b56-d540-4494-b9b2-f27a9bad9e6a",
                     *       "category": "imports",
                     *       "status": "IN_PROGRESS",
                     *       "stepDescription": "Placeholder",
                     *       "currentStep": 1,
                     *       "numberOfSteps": 6,
                     *       "currentWorkUnits": 0,
                     *       "currentWorkDescription": "rlabs-import-type-csvimport started...",
                     *       "currentStepTotalWorkUnits": 0,
                     *       "totalWorkUnits": 0,
                     *       "actor": "6g2c42d1f6fgd2112cgc66dc",
                     *       "startDate": "2021-04-20T13:57:52.404Z",
                     *       "executionUUID": "b36ebb89-4a75-4df3-9101-f40d2771db32"
                     *     }
                     */
                    "application/json": components["schemas"]["Progress"];
                };
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    getImportSource: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The unique identifier of the import source */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Import source found */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": "b9f5f167-a7e1-4b3a-9e4f-2c3d4e5f6a7c",
                     *       "collectionId": "c7d8e9f0-1234-5678-9abc-def012345678",
                     *       "name": "Daily Server Import",
                     *       "created": "2024-01-10T10:30:00Z",
                     *       "updated": "2024-01-12T14:45:00Z",
                     *       "description": "Automated import of server data",
                     *       "objectSchemaId": "c7d8e9f0-1234-5678-9abc-def012345678",
                     *       "importSourceModuleKey": "rlabs-import-type-csv",
                     *       "defaultConcatenator": ",",
                     *       "defaultHandleEmptyValues": "IGNORE",
                     *       "defaultHandleUnknownValues": "IGNORE",
                     *       "dateFormat": "yyyy-MM-dd",
                     *       "dateTimeFormat": "yyyy-MM-dd'T'HH:mm:ss'Z'",
                     *       "importSpecificConfiguration": "{}",
                     *       "tokenGenerated": true,
                     *       "isImportSourceSchedulingEnabled": true,
                     *       "scheduledImportDetails": {
                     *         "importScheduleId": "a8f5f167-a7e1-4b3a-9e4f-2c3d4e5f6a7b",
                     *         "startTime": "2024-01-15T02:00:00Z",
                     *         "runFrequency": "DAILY",
                     *         "nextScheduledTime": "2024-01-16T02:00:00Z",
                     *         "createdAt": "2024-01-10T10:30:00Z"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["ImportSourceResponse"];
                };
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            403: components["responses"]["trait_requirePermission_403"];
            404: components["responses"]["trait_notFound_404"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Submit schema and mapping configuration": {
        parameters: {
            query?: {
                /** @description Execute the operation asynchronously */
                async?: boolean;
            };
            header?: never;
            path: {
                /** @description The uuid of the import source configuration for the external import */
                importSourceId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "schema": {
                 *         "objectSchema": {
                 *           "name": "Disk Analysis Tool",
                 *           "description": "Data imported from The Disk Analysis Tool",
                 *           "objectTypes": [
                 *             {
                 *               "externalId": "object-type/hard-drive",
                 *               "name": "Hard Drive",
                 *               "description": "A hard drive found during scanning",
                 *               "attributes": [
                 *                 {
                 *                   "externalId": "object-type-attribute/duid",
                 *                   "name": "DUID",
                 *                   "description": "Device Unique Identifier",
                 *                   "type": "text",
                 *                   "label": true,
                 *                   "minimumCardinality": 1,
                 *                   "maximumCardinality": 1,
                 *                   "unique": false
                 *                 },
                 *                 {
                 *                   "externalId": "object-type-attribute/disk-label",
                 *                   "name": "Disk Label",
                 *                   "description": "Hard drive label",
                 *                   "type": "text",
                 *                   "minimumCardinality": 1,
                 *                   "maximumCardinality": 1,
                 *                   "unique": false
                 *                 },
                 *                 {
                 *                   "externalId": "object-type-attribute/status",
                 *                   "name": "HardDriveStatus",
                 *                   "description": "The hard drive status",
                 *                   "type": "status",
                 *                   "typeValues": [
                 *                     "Schema Scope Status",
                 *                     "Global Scope Status",
                 *                     "New Status"
                 *                   ]
                 *                 }
                 *               ],
                 *               "children": [
                 *                 {
                 *                   "externalId": "object-type/file",
                 *                   "name": "File",
                 *                   "description": "A file present in a hard drive",
                 *                   "attributes": [
                 *                     {
                 *                       "externalId": "object-type-attribute/path",
                 *                       "name": "Path",
                 *                       "description": "Path of the file",
                 *                       "type": "text",
                 *                       "label": true,
                 *                       "minimumCardinality": 1,
                 *                       "maximumCardinality": 1,
                 *                       "unique": false
                 *                     },
                 *                     {
                 *                       "externalId": "object-type-attribute/size",
                 *                       "name": "Size",
                 *                       "description": "Size of the file",
                 *                       "type": "integer",
                 *                       "minimumCardinality": 1,
                 *                       "maximumCardinality": 1,
                 *                       "unique": false
                 *                     }
                 *                   ]
                 *                 }
                 *               ]
                 *             }
                 *           ]
                 *         },
                 *         "statusSchema": {
                 *           "statuses": [
                 *             {
                 *               "name": "New Status",
                 *               "description": "",
                 *               "category": "active"
                 *             }
                 *           ]
                 *         }
                 *       },
                 *       "mapping": {
                 *         "objectTypeMappings": [
                 *           {
                 *             "objectTypeExternalId": "object-type/hard-drive",
                 *             "objectTypeName": "Hard Drive",
                 *             "selector": "hardDrives",
                 *             "description": "Mapping for Hard Drives",
                 *             "attributesMapping": [
                 *               {
                 *                 "attributeExternalId": "object-type-attribute/duid",
                 *                 "attributeName": "DUID",
                 *                 "attributeLocators": [
                 *                   "id"
                 *                 ],
                 *                 "externalIdPart": true
                 *               },
                 *               {
                 *                 "attributeExternalId": "object-type-attribute/disk-label",
                 *                 "attributeName": "Disk Label",
                 *                 "attributeLocators": [
                 *                   "label"
                 *                 ]
                 *               },
                 *               {
                 *                 "attributeExternalId": "object-type-attribute/status",
                 *                 "attributeName": "HardDriveStatus",
                 *                 "attributeLocators": [
                 *                   "status"
                 *                 ]
                 *               }
                 *             ]
                 *           },
                 *           {
                 *             "objectTypeExternalId": "object-type/file",
                 *             "objectTypeName": "File",
                 *             "selector": "hardDrives.files",
                 *             "description": "Maps files found in hard drives",
                 *             "attributesMapping": [
                 *               {
                 *                 "attributeExternalId": "object-type-attribute/path",
                 *                 "attributeName": "Path",
                 *                 "attributeLocators": [
                 *                   "path"
                 *                 ],
                 *                 "externalIdPart": true
                 *               },
                 *               {
                 *                 "attributeExternalId": "object-type-attribute/size",
                 *                 "attributeName": "Size",
                 *                 "attributeLocators": [
                 *                   "size"
                 *                 ]
                 *               }
                 *             ]
                 *           }
                 *         ]
                 *       }
                 *     }
                 */
                "application/json": unknown;
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            /** @description A mapping already exists for this import */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Update schema and mapping configuration": {
        parameters: {
            query?: {
                /** @description Execute the operation asynchronously */
                async?: boolean;
            };
            header?: never;
            path: {
                /** @description The uuid of the import source configuration for the external import */
                importSourceId: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                /**
                 * @example {
                 *       "$schema": "https://api.stg.atlassian.com/jsm/assets/imports/external/schema/versions/2021_09_15",
                 *       "schema": {
                 *         "objectSchema": {
                 *           "name": "Disk Analysis Tool",
                 *           "description": "Data imported from The Disk Analysis Tool",
                 *           "objectTypes": [
                 *             {
                 *               "externalId": "object-type/hard-drive",
                 *               "name": "Hard Drive",
                 *               "description": "A hard drive found during scanning",
                 *               "attributes": [
                 *                 {
                 *                   "externalId": "object-type-attribute/manufacturer",
                 *                   "name": "Manufacturer",
                 *                   "description": "Manufacturer name",
                 *                   "type": "text"
                 *                 }
                 *               ],
                 *               "children": [
                 *                 {
                 *                   "externalId": "object-type/folder",
                 *                   "name": "Folder",
                 *                   "description": "A folder present in a hard drive",
                 *                   "attributes": [
                 *                     {
                 *                       "externalId": "object-type-attribute/folder-name",
                 *                       "name": "Name",
                 *                       "description": "Folder name",
                 *                       "type": "text",
                 *                       "label": true
                 *                     }
                 *                   ]
                 *                 },
                 *                 {
                 *                   "externalId": "object-type/file",
                 *                   "name": "File",
                 *                   "description": "A file present in a hard drive",
                 *                   "attributes": [
                 *                     {
                 *                       "externalId": "object-type-attribute/path",
                 *                       "name": "Path",
                 *                       "description": "Updated description for the path attribute",
                 *                       "type": "text",
                 *                       "label": true
                 *                     }
                 *                   ]
                 *                 }
                 *               ]
                 *             }
                 *           ]
                 *         }
                 *       },
                 *       "mapping": {
                 *         "objectTypeMappings": [
                 *           {
                 *             "objectTypeExternalId": "object-type/hard-drive",
                 *             "objectTypeName": "Hard Drive",
                 *             "selector": "hardDrives",
                 *             "description": "Mapping for Hard Drives",
                 *             "attributesMapping": [
                 *               {
                 *                 "attributeExternalId": "object-type-attribute/duid",
                 *                 "attributeName": "DUID",
                 *                 "attributeLocators": [
                 *                   "id"
                 *                 ],
                 *                 "externalIdPart": true
                 *               },
                 *               {
                 *                 "attributeExternalId": "object-type-attribute/disk-label",
                 *                 "attributeName": "Disk Label",
                 *                 "attributeLocators": [
                 *                   "label"
                 *                 ]
                 *               },
                 *               {
                 *                 "attributeExternalId": "object-type-attribute/manufacturer",
                 *                 "attributeName": "Manufacturer",
                 *                 "attributeLocators": [
                 *                   "manufacturer"
                 *                 ]
                 *               }
                 *             ]
                 *           },
                 *           {
                 *             "objectTypeExternalId": "object-type/folder",
                 *             "objectTypeName": "Folder",
                 *             "selector": "hardDrives.folders",
                 *             "description": "Mapping for Folder",
                 *             "attributesMapping": [
                 *               {
                 *                 "attributeExternalId": "object-type-attribute/folder-name",
                 *                 "attributeName": "Name",
                 *                 "attributeLocators": [
                 *                   "name"
                 *                 ],
                 *                 "externalIdPart": true
                 *               }
                 *             ]
                 *           }
                 *         ]
                 *       }
                 *     }
                 */
                "application/json": unknown;
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description A 303 response will be returned when the operation is executed asynchronously. A Location header will point to an endpoint to be polled for progress updates */
            303: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Get the progress of an asynchronous schema and mapping operation": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The importSourceId of the import source configuration for the external import */
                importSourceId: string;
                /** @description The resourceId references the running schema and mapping operation */
                resourceId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The progress of an asynchronous schema and mapping operation */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "progressStatus": "FINISHED",
                     *       "result": "OK",
                     *       "resultMessage": "Schema and mapping successfully created"
                     *     }
                     */
                    "application/json": unknown;
                };
            };
            /** @description Bad request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Status of Import configuration": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The importSourceId of the import source configuration for the external import */
                importSourceId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Returns the status of the import configuration, can be one of: IDLE, DISABLED, MISSING_MAPPING, RUNNING */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "status": "IDLE"
                     *     }
                     */
                    "application/json": unknown;
                };
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Get schema and mapping of Import configuration": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The importSourceId of the import source configuration. For use with external imports only */
                importSourceId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "schema": {
                     *         "objectSchema": {
                     *           "name": "docs",
                     *           "description": "",
                     *           "objectTypes": [
                     *             {
                     *               "externalId": "object-type/hard-drive",
                     *               "name": "Hard Drive",
                     *               "description": "A hard drive found during scanning",
                     *               "attributes": [
                     *                 {
                     *                   "name": "Key",
                     *                   "description": "",
                     *                   "type": "text",
                     *                   "label": false,
                     *                   "minimumCardinality": 1,
                     *                   "maximumCardinality": 1,
                     *                   "unique": false
                     *                 },
                     *                 {
                     *                   "externalId": "object-type-attribute/duid",
                     *                   "name": "DUID",
                     *                   "description": "Device Unique Identifier",
                     *                   "type": "text",
                     *                   "label": true,
                     *                   "minimumCardinality": 1,
                     *                   "maximumCardinality": 1,
                     *                   "unique": false
                     *                 },
                     *                 {
                     *                   "externalId": "object-type-attribute/disk-label",
                     *                   "name": "Disk Label",
                     *                   "description": "Hard drive label",
                     *                   "type": "text",
                     *                   "label": false,
                     *                   "minimumCardinality": 0,
                     *                   "maximumCardinality": 1,
                     *                   "unique": false
                     *                 }
                     *               ],
                     *               "children": [
                     *                 {
                     *                   "externalId": "object-type/file",
                     *                   "name": "File",
                     *                   "description": "A file present in a hard drive",
                     *                   "attributes": [
                     *                     {
                     *                       "name": "Key",
                     *                       "description": "",
                     *                       "type": "text",
                     *                       "label": false,
                     *                       "minimumCardinality": 1,
                     *                       "maximumCardinality": 1,
                     *                       "unique": false
                     *                     },
                     *                     {
                     *                       "externalId": "object-type-attribute/size",
                     *                       "name": "Size",
                     *                       "description": "Size of the file",
                     *                       "type": "integer",
                     *                       "label": false,
                     *                       "minimumCardinality": 0,
                     *                       "maximumCardinality": 1,
                     *                       "unique": false
                     *                     },
                     *                     {
                     *                       "externalId": "object-type-attribute/path",
                     *                       "name": "Path",
                     *                       "description": "Path of the file",
                     *                       "type": "text",
                     *                       "label": true,
                     *                       "minimumCardinality": 1,
                     *                       "maximumCardinality": 1,
                     *                       "unique": false
                     *                     }
                     *                   ]
                     *                 }
                     *               ]
                     *             }
                     *           ]
                     *         }
                     *       },
                     *       "mapping": {
                     *         "objectTypeMappings": [
                     *           {
                     *             "objectTypeExternalId": "object-type/hard-drive",
                     *             "objectTypeName": "Hard Drive",
                     *             "selector": "hardDrives",
                     *             "description": "Mapping for Hard Drives",
                     *             "attributesMapping": [
                     *               {
                     *                 "attributeExternalId": "object-type-attribute/duid",
                     *                 "attributeName": "DUID",
                     *                 "attributeLocators": [
                     *                   "id"
                     *                 ],
                     *                 "externalIdPart": true
                     *               },
                     *               {
                     *                 "attributeExternalId": "object-type-attribute/disk-label",
                     *                 "attributeName": "Disk Label",
                     *                 "attributeLocators": [
                     *                   "label"
                     *                 ],
                     *                 "externalIdPart": false
                     *               }
                     *             ]
                     *           },
                     *           {
                     *             "objectTypeExternalId": "object-type/file",
                     *             "objectTypeName": "File",
                     *             "selector": "hardDrives.files",
                     *             "description": "Maps files found in hard drives",
                     *             "attributesMapping": [
                     *               {
                     *                 "attributeExternalId": "object-type-attribute/path",
                     *                 "attributeName": "Path",
                     *                 "attributeLocators": [
                     *                   "path"
                     *                 ],
                     *                 "externalIdPart": true
                     *               },
                     *               {
                     *                 "attributeExternalId": "object-type-attribute/size",
                     *                 "attributeName": "Size",
                     *                 "attributeLocators": [
                     *                   "size"
                     *                 ],
                     *                 "externalIdPart": false
                     *               }
                     *             ]
                     *           }
                     *         ]
                     *       }
                     *     }
                     */
                    "application/json": unknown;
                };
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Start data ingestion": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The importSourceId of the import source configuration for the external import */
                importSourceId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StartInfo"];
                };
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            /** @description Action conflicts with status of import for one of the MISSING_MAPPING, DISABLED, INVALID_IMPORT_MODULE_KEY or IN_PROGRESS reasons */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "result": "error",
                     *       "errorCode": "MISSING_MAPPING"
                     *     }
                     */
                    "application/json": unknown;
                };
            };
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Cancel Import": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The importExecutionId of the import */
                importExecutionId: string;
                /** @description The importSourceId of the import source configuration for the external import */
                importSourceId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Submit progress": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The importExecutionId of the import */
                importExecutionId: string;
                /** @description The importSourceId of the import source configuration for the external import */
                importSourceId: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                /**
                 * @example {
                 *       "steps": {
                 *         "total": 3,
                 *         "current": 2,
                 *         "description": "Gathering data"
                 *       },
                 *       "objects": {
                 *         "total": 500,
                 *         "processed": 125
                 *       }
                 *     }
                 */
                "application/json": unknown;
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Submit data for ingestion": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The importExecutionId of the import */
                importExecutionId: string;
                /** @description The importSourceId of the import source configuration for the external import */
                importSourceId: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                /**
                 * @example {
                 *       "data": {
                 *         "hardDrives": [
                 *           {
                 *             "id": "Hard drive ID",
                 *             "label": "Hard drive label",
                 *             "files": [
                 *               {
                 *                 "path": "/file/path",
                 *                 "size": 123456
                 *               }
                 *             ]
                 *           }
                 *         ]
                 *       },
                 *       "clientGeneratedId": "a-unique-id",
                 *       "completed": true
                 *     }
                 */
                "application/json": unknown;
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Status of Import Execution": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The importExecutionId of the import */
                importExecutionId: string;
                /** @description The importSourceId of the import source configuration for the external import */
                importSourceId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "status": "DONE",
                     *       "progressResult": {
                     *         "type": "IMPORT",
                     *         "id": 438,
                     *         "started": "2023-06-15T12:13:03.952+00:00",
                     *         "ended": "2023-06-15T12:13:05.124+00:00",
                     *         "objectSchemaId": 266,
                     *         "result": "OK",
                     *         "status": "FINISHED",
                     *         "infoMessage": "No data to import",
                     *         "jobId": "241d9437-eb25-4008-a346-8daafbb91026",
                     *         "importSourceId": "3e9f17a6-61db-4bdd-a313-6dd38c81bfca",
                     *         "populatedObjectTypes": [
                     *           "Operating System",
                     *           "Hard Drive"
                     *         ],
                     *         "onlyExecutedForObjectTypes": [],
                     *         "objectTypeResultMap": {
                     *           "2547": {
                     *             "id": null,
                     *             "objectTypeName": "Hard Drive",
                     *             "objectTypeId": 2547,
                     *             "objectsUpdated": 0,
                     *             "objectsCreated": 1,
                     *             "objectsIdentical": 0,
                     *             "objectsMissingUpdated": 0,
                     *             "objectsMissingDeleted": 0,
                     *             "entriesInSource": 1,
                     *             "duplicateEnries": 0,
                     *             "emptyLabelEntries": 0,
                     *             "emptyExternalIdEntries": 0,
                     *             "objectsFilteredWithQlQuery": 0,
                     *             "errorMessages": null,
                     *             "readExternalDataTimeInMs": 221,
                     *             "mapExternalDataTimeInMs": 0,
                     *             "qlQueryFilteringTimeInMs": 0,
                     *             "decidingActionsTimeInMs": 0,
                     *             "writeInsightDataTimeInMs": 154,
                     *             "postFunctionTimeInMs": 0,
                     *             "executionTimeInMs": 375,
                     *             "objectsWithUpdatedReferences": 1
                     *           },
                     *           "2548": {
                     *             "id": null,
                     *             "objectTypeName": "Operating System",
                     *             "objectTypeId": 2548,
                     *             "objectsUpdated": 0,
                     *             "objectsCreated": 2,
                     *             "objectsIdentical": 0,
                     *             "objectsMissingUpdated": 0,
                     *             "objectsMissingDeleted": 0,
                     *             "entriesInSource": 2,
                     *             "duplicateEnries": 0,
                     *             "emptyLabelEntries": 0,
                     *             "emptyExternalIdEntries": 0,
                     *             "objectsFilteredWithQlQuery": 0,
                     *             "errorMessages": null,
                     *             "readExternalDataTimeInMs": 220,
                     *             "mapExternalDataTimeInMs": 0,
                     *             "qlQueryFilteringTimeInMs": 0,
                     *             "decidingActionsTimeInMs": 0,
                     *             "writeInsightDataTimeInMs": 266,
                     *             "postFunctionTimeInMs": 0,
                     *             "executionTimeInMs": 486,
                     *             "objectsWithUpdatedReferences": 0
                     *           }
                     *         },
                     *         "errorMessages": null,
                     *         "totalNumberEntriesInImport": 3
                     *       }
                     *     }
                     */
                    "application/json": unknown;
                };
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Status of most recently created Import Execution": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The importSourceId of the import source configuration for the external import */
                importSourceId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "executionId": "07a58b26-e93a-49c6-9381-1fe235943018",
                     *       "status": "DONE"
                     *     }
                     */
                    "application/json": components["schemas"]["ImportExecutionStatusResponse"];
                };
            };
            /** @description Bad request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Create failed import history": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The importSourceId of the import source configuration for the external import */
                importSourceId: string;
                /** @description The executionId of the import execution */
                executionId: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                /**
                 * @example {
                 *       "failureReason": "Connection timeout while fetching data from external source"
                 *     }
                 */
                "application/json": unknown;
            };
        };
        responses: {
            /** @description Failed import history created successfully */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["trait_badRequest_400"];
            401: components["responses"]["trait_requireAuthentication_401"];
            404: components["responses"]["trait_notFound_404"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Generate Bearer token": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Returns a Bearer token which can be used to authenticate against Assets `/importsource/` APIs, to take actions against the specified import source. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "token": "ATCTT3xFfGN...XYZ"
                     *     }
                     */
                    "application/json": unknown;
                };
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Get import schedule links": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The importSourceId of the import source configuration for the external import */
                importSourceId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Schedule links retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "links": {
                     *         "createSchedule": "https://api.atlassian.com/jsm/insight/workspace/fd8d86e0-3401-40bd-adb4-bb50b8e39288/v1/importsource/4d4095c3-cb7c-4d59-9b75-a381ea4b1975/importschedule",
                     *         "schedule": "https://api.atlassian.com/jsm/insight/workspace/fd8d86e0-3401-40bd-adb4-bb50b8e39288/v1/importsource/4d4095c3-cb7c-4d59-9b75-a381ea4b1975/importschedule/a1b2c3d4-e5f6-7890-abcd-ef1234567890"
                     *       },
                     *       "result": "success"
                     *     }
                     */
                    "application/json": {
                        links?: {
                            /** @description URL to POST to create a new schedule */
                            createSchedule: string;
                            /** @description URL to GET/PUT/DELETE an existing schedule. Only present if a schedule exists for this import source. */
                            schedule?: string;
                        };
                        result?: string;
                    };
                };
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            /** @description Import source not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "IQL - Find objects": {
        parameters: {
            query?: {
                /** @description The query to determine which objects that should be fetched. E.g. objectType = "Computer". The empty AQL means all objects */
                iql?: string;
                /** @description Which page to fetch when paginating through the response */
                page?: number;
                /** @description The amount of objects returned per page */
                resultPerPage?: number;
                /** @description Should the objects attributes be included in the response. If this parameter is false only the information on the object will be returned and the object attributes will not be present */
                includeAttributes?: boolean;
                /** @description How many levels of attributes should be included. E.g. consider an object A that has a reference to object B that has a reference to object C. If object A is included in the response and includeAttributesDeep=1 object A's reference to object B will be included in the attributes of object A but object B's reference to object C will not be included. However if the includeAttributesDeep=2 then object B's reference to object C will be included in object B's attributes */
                includeAttributesDeep?: number;
                /** @description Should the response include the object type attribute definition for each attribute that is returned with the objects */
                includeTypeAttributes?: boolean;
                /** @description Include information about open Jira issues. Should each object have information if open tickets are connected to the object? */
                includeExtendedInfo?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description A object result set that can be used to paginate through the result list of objects */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "results": {
                     *         "objectEntries": [
                     *           {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:88",
                     *             "id": "88",
                     *             "label": "SYD-1",
                     *             "objectKey": "ITSM-88",
                     *             "avatar": {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=16",
                     *               "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=48",
                     *               "url72": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=72",
                     *               "url144": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=144",
                     *               "url288": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=288",
                     *               "objectId": "88",
                     *               "mediaClientConfig": {
                     *                 "clientId": "1a2s3d4f-dc47-44b0-9t0r-1h2h3yd68e9q",
                     *                 "mediaBaseUrl": "https://api.media.atlassian.com",
                     *                 "mediaJwtToken": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIxYTJzM2Q0Zi1kYzQ3LTQ0YjAtOXQwci0xaDJoM3lkNjhlOXEiLCJhY2Nlc3MiOnsidXJuOmZpbGVzdG9yZTpmaWxlOjg0MTIzZXJ0LTEyM2MtNGIxMi0xMmM1LTBiODZkYzgxMjNmZiI6WyJyZWFkIl19LCJleHAiOjE2MjYxNTY1NjcsIm5iZiI6MTYyNjE1NTkwN30.YjicbagPLbzapp3eEZbCQ7Z9V8Uc0WeBledyTw-Qu0s",
                     *                 "fileId": "84123ert-123c-4b12-12c5-0b86dc8123ff"
                     *               }
                     *             },
                     *             "objectType": {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:23",
                     *               "id": "23",
                     *               "name": "Office",
                     *               "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ex.",
                     *               "icon": {
                     *                 "id": "13",
                     *                 "name": "Building",
                     *                 "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=16",
                     *                 "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=48"
                     *               },
                     *               "position": 2,
                     *               "created": "2021-02-16T19:36:51.951Z",
                     *               "updated": "2021-04-16T15:17:03.384Z",
                     *               "objectCount": 0,
                     *               "objectSchemaId": "6",
                     *               "inherited": false,
                     *               "abstractObjectType": false,
                     *               "parentObjectTypeInherited": false
                     *             },
                     *             "created": "2021-02-16T20:04:41.527Z",
                     *             "updated": "2021-02-16T20:04:41.527Z",
                     *             "hasAvatar": false,
                     *             "timestamp": 1613505881527,
                     *             "attributes": [
                     *               {
                     *                 "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                 "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:637",
                     *                 "id": "637",
                     *                 "objectTypeAttributeId": "134",
                     *                 "objectAttributeValues": [
                     *                   {
                     *                     "value": "ITSM-88",
                     *                     "displayValue": "ITSM-88",
                     *                     "searchValue": "ITSM-88",
                     *                     "referencedType": false
                     *                   }
                     *                 ],
                     *                 "objectId": "88"
                     *               },
                     *               {
                     *                 "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                 "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:640",
                     *                 "id": "640",
                     *                 "objectTypeAttributeId": "135",
                     *                 "objectAttributeValues": [
                     *                   {
                     *                     "value": "SYD-1",
                     *                     "displayValue": "SYD-1",
                     *                     "searchValue": "SYD-1",
                     *                     "referencedType": false
                     *                   }
                     *                 ],
                     *                 "objectId": "88"
                     *               },
                     *               {
                     *                 "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                 "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:638",
                     *                 "id": "638",
                     *                 "objectTypeAttributeId": "136",
                     *                 "objectAttributeValues": [
                     *                   {
                     *                     "value": "2021-02-16T20:04:41.527Z",
                     *                     "displayValue": "16/Feb/21 8:04 PM",
                     *                     "searchValue": "2021-02-16T20:04:41.527Z",
                     *                     "referencedType": false
                     *                   }
                     *                 ],
                     *                 "objectId": "88"
                     *               },
                     *               {
                     *                 "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                 "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:639",
                     *                 "id": "639",
                     *                 "objectTypeAttributeId": "137",
                     *                 "objectAttributeValues": [
                     *                   {
                     *                     "value": "2021-02-16T20:04:41.527Z",
                     *                     "displayValue": "16/Feb/21 8:04 PM",
                     *                     "searchValue": "2021-02-16T20:04:41.527Z",
                     *                     "referencedType": false
                     *                   }
                     *                 ],
                     *                 "objectId": "88"
                     *               },
                     *               {
                     *                 "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                 "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:641",
                     *                 "id": "641",
                     *                 "objectTypeAttributeId": "144",
                     *                 "objectAttributeValues": [
                     *                   {
                     *                     "referencedObject": {
                     *                       "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                       "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:87",
                     *                       "id": "87",
                     *                       "label": "Sydney",
                     *                       "objectKey": "ITSM-87",
                     *                       "avatar": {
                     *                         "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                         "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=16",
                     *                         "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=48",
                     *                         "url72": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=72",
                     *                         "url144": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=144",
                     *                         "url288": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=288",
                     *                         "objectId": "87",
                     *                         "mediaClientConfig": {
                     *                           "clientId": "1a2s3d4f-dc47-44b0-9t0r-1h2h3yd68e9q",
                     *                           "mediaBaseUrl": "https://api.media.atlassian.com",
                     *                           "mediaJwtToken": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIxYTJzM2Q0Zi1kYzQ3LTQ0YjAtOXQwci0xaDJoM3lkNjhlOXEiLCJhY2Nlc3MiOnsidXJuOmZpbGVzdG9yZTpmaWxlOjg0MTIzZXJ0LTEyM2MtNGIxMi0xMmM1LTBiODZkYzgxMjNmZiI6WyJyZWFkIl19LCJleHAiOjE2MjYxNTY1NjcsIm5iZiI6MTYyNjE1NTkwN30.YjicbagPLbzapp3eEZbCQ7Z9V8Uc0WeBledyTw-Qu0s",
                     *                           "fileId": "84123ert-123c-4b12-12c5-0b86dc8123ff"
                     *                         }
                     *                       },
                     *                       "objectType": {
                     *                         "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                         "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:24",
                     *                         "id": "24",
                     *                         "name": "City",
                     *                         "icon": {
                     *                           "id": "28",
                     *                           "name": "Cottage",
                     *                           "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=16",
                     *                           "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=48"
                     *                         },
                     *                         "position": 3,
                     *                         "created": "2021-02-16T19:58:45.698Z",
                     *                         "updated": "2021-04-16T15:17:03.393Z",
                     *                         "objectCount": 0,
                     *                         "objectSchemaId": "6",
                     *                         "inherited": false,
                     *                         "abstractObjectType": false,
                     *                         "parentObjectTypeInherited": false
                     *                       },
                     *                       "created": "2021-02-16T20:04:26.445Z",
                     *                       "updated": "2021-02-16T20:04:26.445Z",
                     *                       "hasAvatar": false,
                     *                       "timestamp": 1613505866445,
                     *                       "_links": {
                     *                         "self": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/object/87"
                     *                       },
                     *                       "name": "Sydney"
                     *                     },
                     *                     "displayValue": "Sydney",
                     *                     "searchValue": "ITSM-87",
                     *                     "referencedType": true
                     *                   }
                     *                 ],
                     *                 "objectId": "88"
                     *               }
                     *             ],
                     *             "_links": {
                     *               "self": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/object/88"
                     *             },
                     *             "name": "SYD-1"
                     *           }
                     *         ],
                     *         "objectTypeAttributes": [
                     *           {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:134",
                     *             "id": "134",
                     *             "name": "Key",
                     *             "label": false,
                     *             "defaultType": {
                     *               "id": 0,
                     *               "name": "Text"
                     *             },
                     *             "editable": false,
                     *             "system": true,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 1,
                     *             "maximumCardinality": 1,
                     *             "removable": false,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": false,
                     *             "options": "",
                     *             "position": 0
                     *           },
                     *           {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:135",
                     *             "id": "135",
                     *             "name": "Name",
                     *             "label": true,
                     *             "description": "The name of the object",
                     *             "defaultType": {
                     *               "id": 0,
                     *               "name": "Text"
                     *             },
                     *             "editable": true,
                     *             "system": false,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 1,
                     *             "maximumCardinality": 1,
                     *             "suffix": "",
                     *             "removable": false,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": true,
                     *             "regexValidation": "",
                     *             "options": "",
                     *             "position": 1
                     *           },
                     *           {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:136",
                     *             "id": "136",
                     *             "name": "Created",
                     *             "label": false,
                     *             "defaultType": {
                     *               "id": 6,
                     *               "name": "DateTime"
                     *             },
                     *             "editable": false,
                     *             "system": true,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 1,
                     *             "maximumCardinality": 1,
                     *             "removable": false,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": false,
                     *             "options": "",
                     *             "position": 2
                     *           },
                     *           {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:137",
                     *             "id": "137",
                     *             "name": "Updated",
                     *             "label": false,
                     *             "defaultType": {
                     *               "id": 6,
                     *               "name": "DateTime"
                     *             },
                     *             "editable": false,
                     *             "system": true,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 1,
                     *             "maximumCardinality": 1,
                     *             "removable": false,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": false,
                     *             "options": "",
                     *             "position": 3
                     *           },
                     *           {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:144",
                     *             "id": "144",
                     *             "name": "City",
                     *             "label": false,
                     *             "referenceType": {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:4",
                     *               "id": "4",
                     *               "name": "Reference",
                     *               "description": "Reference",
                     *               "color": "49a6ed",
                     *               "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/config/referencetype/4/image.png?size=16",
                     *               "removable": false
                     *             },
                     *             "referenceObjectTypeId": "24",
                     *             "referenceObjectType": {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:24",
                     *               "id": "24",
                     *               "name": "City",
                     *               "icon": {
                     *                 "id": "28",
                     *                 "name": "Cottage",
                     *                 "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=16",
                     *                 "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=48"
                     *               },
                     *               "position": 3,
                     *               "created": "2021-02-16T19:58:45.698Z",
                     *               "updated": "2021-04-16T15:17:03.393Z",
                     *               "objectCount": 0,
                     *               "objectSchemaId": "6",
                     *               "inherited": false,
                     *               "abstractObjectType": false,
                     *               "parentObjectTypeInherited": false
                     *             },
                     *             "editable": true,
                     *             "system": false,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 0,
                     *             "maximumCardinality": 1,
                     *             "removable": true,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": false,
                     *             "options": "",
                     *             "position": 4
                     *           },
                     *           {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:265",
                     *             "id": "265",
                     *             "name": "Placeholder",
                     *             "label": false,
                     *             "defaultType": {
                     *               "id": 0,
                     *               "name": "Text"
                     *             },
                     *             "editable": true,
                     *             "system": false,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 0,
                     *             "maximumCardinality": 1,
                     *             "removable": true,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": false,
                     *             "options": "",
                     *             "position": 5
                     *           }
                     *         ],
                     *         "objectTypeIsInherited": false,
                     *         "abstractObjectType": false,
                     *         "totalFilterCount": 1,
                     *         "startIndex": 1,
                     *         "toIndex": 1,
                     *         "pageObjectSize": 25,
                     *         "pageNumber": 1,
                     *         "orderWay": "ascending",
                     *         "iql": "objectType = Office AND Name LIKE SYD",
                     *         "iqlSearchResult": true,
                     *         "conversionPossible": false,
                     *         "pageSize": 1
                     *       },
                     *       "attributes parameter to false": {
                     *         "objectEntries": [
                     *           {
                     *             "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *             "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:88",
                     *             "id": "88",
                     *             "label": "SYD-1",
                     *             "objectKey": "ITSM-88",
                     *             "avatar": {
                     *               "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *               "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=16",
                     *               "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=48",
                     *               "url72": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=72",
                     *               "url144": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=144",
                     *               "url288": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=288",
                     *               "objectId": "88",
                     *               "mediaClientConfig": {
                     *                 "clientId": "1a2s3d4f-dc47-44b0-9t0r-1h2h3yd68e9q",
                     *                 "mediaBaseUrl": "https://api.media.atlassian.com",
                     *                 "mediaJwtToken": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIxYTJzM2Q0Zi1kYzQ3LTQ0YjAtOXQwci0xaDJoM3lkNjhlOXEiLCJhY2Nlc3MiOnsidXJuOmZpbGVzdG9yZTpmaWxlOjg0MTIzZXJ0LTEyM2MtNGIxMi0xMmM1LTBiODZkYzgxMjNmZiI6WyJyZWFkIl19LCJleHAiOjE2MjYxNTY1NjcsIm5iZiI6MTYyNjE1NTkwN30.YjicbagPLbzapp3eEZbCQ7Z9V8Uc0WeBledyTw-Qu0s",
                     *                 "fileId": "84123ert-123c-4b12-12c5-0b86dc8123ff"
                     *               }
                     *             },
                     *             "objectType": {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:23",
                     *               "id": "23",
                     *               "name": "Office",
                     *               "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ex.",
                     *               "icon": {
                     *                 "id": "13",
                     *                 "name": "Building",
                     *                 "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=16",
                     *                 "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=48"
                     *               },
                     *               "position": 2,
                     *               "created": "2021-02-16T19:36:51.951Z",
                     *               "updated": "2021-04-16T15:17:03.384Z",
                     *               "objectCount": 0,
                     *               "objectSchemaId": "6",
                     *               "inherited": false,
                     *               "abstractObjectType": false,
                     *               "parentObjectTypeInherited": false
                     *             },
                     *             "created": "2021-02-16T20:04:41.527Z",
                     *             "updated": "2021-02-16T20:04:41.527Z",
                     *             "hasAvatar": false,
                     *             "timestamp": 1613505881527,
                     *             "_links": {
                     *               "self": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/object/88"
                     *             },
                     *             "name": "SYD-1"
                     *           }
                     *         ],
                     *         "objectTypeAttributes": [
                     *           {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:134",
                     *             "id": "134",
                     *             "name": "Key",
                     *             "label": false,
                     *             "defaultType": {
                     *               "id": 0,
                     *               "name": "Text"
                     *             },
                     *             "editable": false,
                     *             "system": true,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 1,
                     *             "maximumCardinality": 1,
                     *             "removable": false,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": false,
                     *             "options": "",
                     *             "position": 0
                     *           },
                     *           {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:135",
                     *             "id": "135",
                     *             "name": "Name",
                     *             "label": true,
                     *             "description": "The name of the object",
                     *             "defaultType": {
                     *               "id": 0,
                     *               "name": "Text"
                     *             },
                     *             "editable": true,
                     *             "system": false,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 1,
                     *             "maximumCardinality": 1,
                     *             "suffix": "",
                     *             "removable": false,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": true,
                     *             "regexValidation": "",
                     *             "options": "",
                     *             "position": 1
                     *           },
                     *           {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:136",
                     *             "id": "136",
                     *             "name": "Created",
                     *             "label": false,
                     *             "defaultType": {
                     *               "id": 6,
                     *               "name": "DateTime"
                     *             },
                     *             "editable": false,
                     *             "system": true,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 1,
                     *             "maximumCardinality": 1,
                     *             "removable": false,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": false,
                     *             "options": "",
                     *             "position": 2
                     *           },
                     *           {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:137",
                     *             "id": "137",
                     *             "name": "Updated",
                     *             "label": false,
                     *             "defaultType": {
                     *               "id": 6,
                     *               "name": "DateTime"
                     *             },
                     *             "editable": false,
                     *             "system": true,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 1,
                     *             "maximumCardinality": 1,
                     *             "removable": false,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": false,
                     *             "options": "",
                     *             "position": 3
                     *           },
                     *           {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:144",
                     *             "id": "144",
                     *             "name": "City",
                     *             "label": false,
                     *             "referenceType": {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:4",
                     *               "id": "4",
                     *               "name": "Reference",
                     *               "description": "Reference",
                     *               "color": "49a6ed",
                     *               "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/config/referencetype/4/image.png?size=16"
                     *             },
                     *             "referenceObjectTypeId": "24",
                     *             "referenceObjectType": {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:24",
                     *               "id": "24",
                     *               "name": "City",
                     *               "icon": {
                     *                 "id": "28",
                     *                 "name": "Cottage",
                     *                 "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=16",
                     *                 "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=48"
                     *               },
                     *               "position": 3,
                     *               "created": "2021-02-16T19:58:45.698Z",
                     *               "updated": "2021-04-16T15:17:03.393Z",
                     *               "objectCount": 0,
                     *               "objectSchemaId": "6",
                     *               "inherited": false,
                     *               "abstractObjectType": false,
                     *               "parentObjectTypeInherited": false
                     *             },
                     *             "editable": true,
                     *             "system": false,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 0,
                     *             "maximumCardinality": 1,
                     *             "removable": true,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": false,
                     *             "options": "",
                     *             "position": 4
                     *           },
                     *           {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:265",
                     *             "id": "265",
                     *             "name": "Placeholder",
                     *             "label": false,
                     *             "defaultType": {
                     *               "id": 0,
                     *               "name": "Text"
                     *             },
                     *             "editable": true,
                     *             "system": false,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 0,
                     *             "maximumCardinality": 1,
                     *             "removable": true,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": false,
                     *             "options": "",
                     *             "position": 5
                     *           }
                     *         ],
                     *         "objectTypeIsInherited": false,
                     *         "abstractObjectType": false,
                     *         "totalFilterCount": 1,
                     *         "startIndex": 1,
                     *         "toIndex": 1,
                     *         "pageObjectSize": 25,
                     *         "pageNumber": 1,
                     *         "orderWay": "ascending",
                     *         "iql": "objectType = Office AND Name LIKE SYD",
                     *         "iqlSearchResult": true,
                     *         "conversionPossible": false,
                     *         "pageSize": 1
                     *       },
                     *       "no results": {
                     *         "objectEntries": [],
                     *         "objectTypeAttributes": [],
                     *         "objectTypeIsInherited": false,
                     *         "abstractObjectType": false,
                     *         "totalFilterCount": 0,
                     *         "startIndex": 1,
                     *         "toIndex": 0,
                     *         "pageObjectSize": 25,
                     *         "pageNumber": 1,
                     *         "orderWay": "ascending",
                     *         "iql": "objectType = Office AND Name LIKE NY",
                     *         "iqlSearchResult": true,
                     *         "conversionPossible": false,
                     *         "pageSize": 0
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["ObjectListResult"];
                };
            };
            400: components["responses"]["trait_badRequest_400"];
            401: components["responses"]["trait_requireAuthentication_401"];
            429: components["responses"]["trait_rateLimit500PerMinute_429"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Object - Find": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The object id to operate on */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *       "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:88",
                     *       "id": "88",
                     *       "label": "SYD-1",
                     *       "objectKey": "ITSM-88",
                     *       "avatar": {
                     *         "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *         "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=16",
                     *         "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=48",
                     *         "url72": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=72",
                     *         "url144": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=144",
                     *         "url288": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=288",
                     *         "objectId": "88",
                     *         "mediaClientConfig": {
                     *           "clientId": "1a2s3d4f-dc47-44b0-9t0r-1h2h3yd68e9q",
                     *           "mediaBaseUrl": "https://api.media.atlassian.com",
                     *           "mediaJwtToken": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIxYTJzM2Q0Zi1kYzQ3LTQ0YjAtOXQwci0xaDJoM3lkNjhlOXEiLCJhY2Nlc3MiOnsidXJuOmZpbGVzdG9yZTpmaWxlOjg0MTIzZXJ0LTEyM2MtNGIxMi0xMmM1LTBiODZkYzgxMjNmZiI6WyJyZWFkIl19LCJleHAiOjE2MjYxNTY1NjcsIm5iZiI6MTYyNjE1NTkwN30.YjicbagPLbzapp3eEZbCQ7Z9V8Uc0WeBledyTw-Qu0s",
                     *           "fileId": "84123ert-123c-4b12-12c5-0b86dc8123ff"
                     *         }
                     *       },
                     *       "objectType": {
                     *         "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *         "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:23",
                     *         "id": "23",
                     *         "name": "Office",
                     *         "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ex.",
                     *         "icon": {
                     *           "id": "13",
                     *           "name": "Building",
                     *           "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=16",
                     *           "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=48"
                     *         },
                     *         "position": 2,
                     *         "created": "2021-02-16T19:36:51.951Z",
                     *         "updated": "2021-04-16T15:17:03.384Z",
                     *         "objectCount": 0,
                     *         "objectSchemaId": "6",
                     *         "inherited": false,
                     *         "abstractObjectType": false,
                     *         "parentObjectTypeInherited": false
                     *       },
                     *       "created": "2021-02-16T20:04:41.527Z",
                     *       "updated": "2021-02-16T20:04:41.527Z",
                     *       "hasAvatar": false,
                     *       "timestamp": 1613505881527,
                     *       "attributes": [
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:637",
                     *           "id": "637",
                     *           "objectTypeAttribute": {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:134",
                     *             "id": "134",
                     *             "name": "Key",
                     *             "label": false,
                     *             "defaultType": {
                     *               "id": 0,
                     *               "name": "Text"
                     *             },
                     *             "editable": false,
                     *             "system": true,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 1,
                     *             "maximumCardinality": 1,
                     *             "removable": false,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": false,
                     *             "options": "",
                     *             "position": 0
                     *           },
                     *           "objectTypeAttributeId": "134",
                     *           "objectAttributeValues": [
                     *             {
                     *               "value": "ITSM-88",
                     *               "displayValue": "ITSM-88",
                     *               "searchValue": "ITSM-88",
                     *               "referencedType": false
                     *             }
                     *           ],
                     *           "objectId": "88"
                     *         },
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:640",
                     *           "id": "640",
                     *           "objectTypeAttribute": {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:135",
                     *             "id": "135",
                     *             "name": "Name",
                     *             "label": true,
                     *             "description": "The name of the object",
                     *             "defaultType": {
                     *               "id": 0,
                     *               "name": "Text"
                     *             },
                     *             "editable": true,
                     *             "system": false,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 1,
                     *             "maximumCardinality": 1,
                     *             "suffix": "",
                     *             "removable": false,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": true,
                     *             "regexValidation": "",
                     *             "options": "",
                     *             "position": 1
                     *           },
                     *           "objectTypeAttributeId": "135",
                     *           "objectAttributeValues": [
                     *             {
                     *               "value": "SYD-1",
                     *               "displayValue": "SYD-1",
                     *               "searchValue": "SYD-1",
                     *               "referencedType": false
                     *             }
                     *           ],
                     *           "objectId": "88"
                     *         },
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:638",
                     *           "id": "638",
                     *           "objectTypeAttribute": {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:136",
                     *             "id": "136",
                     *             "name": "Created",
                     *             "label": false,
                     *             "defaultType": {
                     *               "id": 6,
                     *               "name": "DateTime"
                     *             },
                     *             "editable": false,
                     *             "system": true,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 1,
                     *             "maximumCardinality": 1,
                     *             "removable": false,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": false,
                     *             "options": "",
                     *             "position": 2
                     *           },
                     *           "objectTypeAttributeId": "136",
                     *           "objectAttributeValues": [
                     *             {
                     *               "value": "2021-02-16T20:04:41.527Z",
                     *               "displayValue": "16/Feb/21 8:04 PM",
                     *               "searchValue": "2021-02-16T20:04:41.527Z",
                     *               "referencedType": false
                     *             }
                     *           ],
                     *           "objectId": "88"
                     *         },
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:639",
                     *           "id": "639",
                     *           "objectTypeAttribute": {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:137",
                     *             "id": "137",
                     *             "name": "Updated",
                     *             "label": false,
                     *             "defaultType": {
                     *               "id": 6,
                     *               "name": "DateTime"
                     *             },
                     *             "editable": false,
                     *             "system": true,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 1,
                     *             "maximumCardinality": 1,
                     *             "removable": false,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": false,
                     *             "options": "",
                     *             "position": 3
                     *           },
                     *           "objectTypeAttributeId": "137",
                     *           "objectAttributeValues": [
                     *             {
                     *               "value": "2021-02-16T20:04:41.527Z",
                     *               "displayValue": "16/Feb/21 8:04 PM",
                     *               "searchValue": "2021-02-16T20:04:41.527Z",
                     *               "referencedType": false
                     *             }
                     *           ],
                     *           "objectId": "88"
                     *         },
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:641",
                     *           "id": "641",
                     *           "objectTypeAttribute": {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:144",
                     *             "id": "144",
                     *             "name": "City",
                     *             "label": false,
                     *             "referenceType": {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:4",
                     *               "id": "4",
                     *               "name": "Reference",
                     *               "description": "Reference",
                     *               "color": "49a6ed",
                     *               "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/config/referencetype/4/image.png?size=16"
                     *             },
                     *             "referenceObjectTypeId": "24",
                     *             "referenceObjectType": {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:24",
                     *               "id": "24",
                     *               "name": "City",
                     *               "icon": {
                     *                 "id": "28",
                     *                 "name": "Cottage",
                     *                 "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=16",
                     *                 "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=48"
                     *               },
                     *               "position": 3,
                     *               "created": "2021-02-16T19:58:45.698Z",
                     *               "updated": "2021-04-16T15:17:03.393Z",
                     *               "objectCount": 0,
                     *               "objectSchemaId": "6",
                     *               "inherited": false,
                     *               "abstractObjectType": false,
                     *               "parentObjectTypeInherited": false
                     *             },
                     *             "editable": true,
                     *             "system": false,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 0,
                     *             "maximumCardinality": 1,
                     *             "removable": true,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": false,
                     *             "options": "",
                     *             "position": 4
                     *           },
                     *           "objectTypeAttributeId": "144",
                     *           "objectAttributeValues": [
                     *             {
                     *               "referencedObject": {
                     *                 "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                 "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:87",
                     *                 "id": "87",
                     *                 "label": "Sydney",
                     *                 "objectKey": "ITSM-87",
                     *                 "avatar": {
                     *                   "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                   "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=16",
                     *                   "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=48",
                     *                   "url72": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=72",
                     *                   "url144": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=144",
                     *                   "url288": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=288",
                     *                   "objectId": "87",
                     *                   "mediaClientConfig": {
                     *                     "clientId": "1a2s3d4f-dc47-44b0-9t0r-1h2h3yd68e9q",
                     *                     "mediaBaseUrl": "https://api.media.atlassian.com",
                     *                     "mediaJwtToken": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIxYTJzM2Q0Zi1kYzQ3LTQ0YjAtOXQwci0xaDJoM3lkNjhlOXEiLCJhY2Nlc3MiOnsidXJuOmZpbGVzdG9yZTpmaWxlOjg0MTIzZXJ0LTEyM2MtNGIxMi0xMmM1LTBiODZkYzgxMjNmZiI6WyJyZWFkIl19LCJleHAiOjE2MjYxNTY1NjcsIm5iZiI6MTYyNjE1NTkwN30.YjicbagPLbzapp3eEZbCQ7Z9V8Uc0WeBledyTw-Qu0s",
                     *                     "fileId": "84123ert-123c-4b12-12c5-0b86dc8123ff"
                     *                   }
                     *                 },
                     *                 "objectType": {
                     *                   "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                   "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:24",
                     *                   "id": "24",
                     *                   "name": "City",
                     *                   "icon": {
                     *                     "id": "28",
                     *                     "name": "Cottage",
                     *                     "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=16",
                     *                     "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=48"
                     *                   },
                     *                   "position": 3,
                     *                   "created": "2021-02-16T19:58:45.698Z",
                     *                   "updated": "2021-04-16T15:17:03.393Z",
                     *                   "objectCount": 0,
                     *                   "objectSchemaId": "6",
                     *                   "inherited": false,
                     *                   "abstractObjectType": false,
                     *                   "parentObjectTypeInherited": false
                     *                 },
                     *                 "created": "2021-02-16T20:04:26.445Z",
                     *                 "updated": "2021-02-16T20:04:26.445Z",
                     *                 "hasAvatar": false,
                     *                 "timestamp": 1613505866445,
                     *                 "_links": {
                     *                   "self": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/object/87"
                     *                 },
                     *                 "name": "Sydney"
                     *               },
                     *               "displayValue": "Sydney",
                     *               "searchValue": "ITSM-87",
                     *               "referencedType": true
                     *             }
                     *           ],
                     *           "objectId": "88"
                     *         }
                     *       ],
                     *       "extendedInfo": {
                     *         "openIssuesExists": false,
                     *         "attachmentsExists": false
                     *       },
                     *       "_links": {
                     *         "self": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/object/88"
                     *       },
                     *       "name": "SYD-1"
                     *     }
                     */
                    "application/json": components["schemas"]["Object"];
                };
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            404: components["responses"]["trait_notFound_404"];
            429: components["responses"]["trait_rateLimit2000PerMinute_429"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Object - Update": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The object id to operate on */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "attributes": [
                 *         {
                 *           "objectTypeAttributeId": "265",
                 *           "objectAttributeValues": [
                 *             {
                 *               "value": "A placeholder value"
                 *             }
                 *           ]
                 *         }
                 *       ],
                 *       "objectTypeId": "23",
                 *       "avatarUUID": "",
                 *       "hasAvatar": false
                 *     }
                 */
                "application/json": components["schemas"]["ObjectIn"];
            };
        };
        responses: {
            /** @description The updated object */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *       "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:88",
                     *       "id": "88",
                     *       "label": "SYD-1",
                     *       "objectKey": "ITSM-88",
                     *       "avatar": {
                     *         "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *         "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=16",
                     *         "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=48",
                     *         "url72": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=72",
                     *         "url144": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=144",
                     *         "url288": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=288",
                     *         "objectId": "88",
                     *         "mediaClientConfig": {
                     *           "clientId": "1a2s3d4f-dc47-44b0-9t0r-1h2h3yd68e9q",
                     *           "mediaBaseUrl": "https://api.media.atlassian.com",
                     *           "mediaJwtToken": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIxYTJzM2Q0Zi1kYzQ3LTQ0YjAtOXQwci0xaDJoM3lkNjhlOXEiLCJhY2Nlc3MiOnsidXJuOmZpbGVzdG9yZTpmaWxlOjg0MTIzZXJ0LTEyM2MtNGIxMi0xMmM1LTBiODZkYzgxMjNmZiI6WyJyZWFkIl19LCJleHAiOjE2MjYxNTY1NjcsIm5iZiI6MTYyNjE1NTkwN30.YjicbagPLbzapp3eEZbCQ7Z9V8Uc0WeBledyTw-Qu0s",
                     *           "fileId": "84123ert-123c-4b12-12c5-0b86dc8123ff"
                     *         }
                     *       },
                     *       "objectType": {
                     *         "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *         "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:23",
                     *         "id": "23",
                     *         "name": "Office",
                     *         "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ex.",
                     *         "icon": {
                     *           "id": "13",
                     *           "name": "Building",
                     *           "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=16",
                     *           "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=48"
                     *         },
                     *         "position": 2,
                     *         "created": "2021-02-16T19:36:51.951Z",
                     *         "updated": "2021-04-16T15:17:03.384Z",
                     *         "objectCount": 0,
                     *         "objectSchemaId": "6",
                     *         "inherited": false,
                     *         "abstractObjectType": false,
                     *         "parentObjectTypeInherited": false
                     *       },
                     *       "created": "2021-02-16T20:04:41.527Z",
                     *       "updated": "2021-02-16T20:04:41.527Z",
                     *       "hasAvatar": false,
                     *       "timestamp": 1613505881527,
                     *       "attributes": [
                     *         {
                     *           "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *           "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:637",
                     *           "id": "637",
                     *           "objectTypeAttribute": {
                     *             "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *             "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:134",
                     *             "id": "134",
                     *             "name": "Key",
                     *             "label": false,
                     *             "defaultType": {
                     *               "id": 0,
                     *               "name": "Text"
                     *             },
                     *             "editable": false,
                     *             "system": true,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 1,
                     *             "maximumCardinality": 1,
                     *             "removable": false,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": false,
                     *             "options": "",
                     *             "position": 0
                     *           },
                     *           "objectTypeAttributeId": "134",
                     *           "objectAttributeValues": [
                     *             {
                     *               "value": "ITSM-88",
                     *               "displayValue": "ITSM-88",
                     *               "searchValue": "ITSM-88",
                     *               "referencedType": false
                     *             }
                     *           ],
                     *           "objectId": "88"
                     *         },
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:640",
                     *           "id": "640",
                     *           "objectTypeAttribute": {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:135",
                     *             "id": "135",
                     *             "name": "Name",
                     *             "label": true,
                     *             "description": "The name of the object",
                     *             "defaultType": {
                     *               "id": 0,
                     *               "name": "Text"
                     *             },
                     *             "editable": true,
                     *             "system": false,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 1,
                     *             "maximumCardinality": 1,
                     *             "suffix": "",
                     *             "removable": false,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": true,
                     *             "regexValidation": "",
                     *             "options": "",
                     *             "position": 1
                     *           },
                     *           "objectTypeAttributeId": "135",
                     *           "objectAttributeValues": [
                     *             {
                     *               "value": "SYD-1",
                     *               "displayValue": "SYD-1",
                     *               "searchValue": "SYD-1",
                     *               "referencedType": false
                     *             }
                     *           ],
                     *           "objectId": "88"
                     *         },
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:638",
                     *           "id": "638",
                     *           "objectTypeAttribute": {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:136",
                     *             "id": "136",
                     *             "name": "Created",
                     *             "label": false,
                     *             "defaultType": {
                     *               "id": 6,
                     *               "name": "DateTime"
                     *             },
                     *             "editable": false,
                     *             "system": true,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 1,
                     *             "maximumCardinality": 1,
                     *             "removable": false,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": false,
                     *             "options": "",
                     *             "position": 2
                     *           },
                     *           "objectTypeAttributeId": "136",
                     *           "objectAttributeValues": [
                     *             {
                     *               "value": "2021-02-16T20:04:41.527Z",
                     *               "displayValue": "16/Feb/21 8:04 PM",
                     *               "searchValue": "2021-02-16T20:04:41.527Z",
                     *               "referencedType": false
                     *             }
                     *           ],
                     *           "objectId": "88"
                     *         },
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:639",
                     *           "id": "639",
                     *           "objectTypeAttribute": {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:137",
                     *             "id": "137",
                     *             "name": "Updated",
                     *             "label": false,
                     *             "defaultType": {
                     *               "id": 6,
                     *               "name": "DateTime"
                     *             },
                     *             "editable": false,
                     *             "system": true,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 1,
                     *             "maximumCardinality": 1,
                     *             "removable": false,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": false,
                     *             "options": "",
                     *             "position": 3
                     *           },
                     *           "objectTypeAttributeId": "137",
                     *           "objectAttributeValues": [
                     *             {
                     *               "value": "2021-04-20T14:55:02.816Z",
                     *               "displayValue": "20/Apr/21 2:55 PM",
                     *               "searchValue": "2021-04-20T14:55:02.816Z",
                     *               "referencedType": false
                     *             }
                     *           ],
                     *           "objectId": "88"
                     *         },
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:641",
                     *           "id": "641",
                     *           "objectTypeAttribute": {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:144",
                     *             "id": "144",
                     *             "name": "City",
                     *             "label": false,
                     *             "referenceType": {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:4",
                     *               "id": "4",
                     *               "name": "Reference",
                     *               "description": "Reference",
                     *               "color": "49a6ed",
                     *               "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/config/referencetype/4/image.png?size=16"
                     *             },
                     *             "referenceObjectTypeId": "24",
                     *             "referenceObjectType": {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:24",
                     *               "id": "24",
                     *               "name": "City",
                     *               "icon": {
                     *                 "id": "28",
                     *                 "name": "Cottage",
                     *                 "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=16",
                     *                 "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=48"
                     *               },
                     *               "position": 3,
                     *               "created": "2021-02-16T19:58:45.698Z",
                     *               "updated": "2021-04-16T15:17:03.393Z",
                     *               "objectCount": 0,
                     *               "objectSchemaId": "6",
                     *               "inherited": false,
                     *               "abstractObjectType": false,
                     *               "parentObjectTypeInherited": false
                     *             },
                     *             "editable": true,
                     *             "system": false,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 0,
                     *             "maximumCardinality": 1,
                     *             "removable": true,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": false,
                     *             "options": "",
                     *             "position": 4
                     *           },
                     *           "objectTypeAttributeId": "144",
                     *           "objectAttributeValues": [
                     *             {
                     *               "referencedObject": {
                     *                 "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                 "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:87",
                     *                 "id": "87",
                     *                 "label": "Sydney",
                     *                 "objectKey": "ITSM-87",
                     *                 "avatar": {
                     *                   "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                   "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=16",
                     *                   "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=48",
                     *                   "url72": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=72",
                     *                   "url144": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=144",
                     *                   "url288": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=288",
                     *                   "objectId": "87",
                     *                   "mediaClientConfig": {
                     *                     "clientId": "1a2s3d4f-dc47-44b0-9t0r-1h2h3yd68e9q",
                     *                     "mediaBaseUrl": "https://api.media.atlassian.com",
                     *                     "mediaJwtToken": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIxYTJzM2Q0Zi1kYzQ3LTQ0YjAtOXQwci0xaDJoM3lkNjhlOXEiLCJhY2Nlc3MiOnsidXJuOmZpbGVzdG9yZTpmaWxlOjg0MTIzZXJ0LTEyM2MtNGIxMi0xMmM1LTBiODZkYzgxMjNmZiI6WyJyZWFkIl19LCJleHAiOjE2MjYxNTY1NjcsIm5iZiI6MTYyNjE1NTkwN30.YjicbagPLbzapp3eEZbCQ7Z9V8Uc0WeBledyTw-Qu0s",
                     *                     "fileId": "84123ert-123c-4b12-12c5-0b86dc8123ff"
                     *                   }
                     *                 },
                     *                 "objectType": {
                     *                   "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                   "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:24",
                     *                   "id": "24",
                     *                   "name": "City",
                     *                   "icon": {
                     *                     "id": "28",
                     *                     "name": "Cottage",
                     *                     "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=16",
                     *                     "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=48"
                     *                   },
                     *                   "position": 3,
                     *                   "created": "2021-02-16T19:58:45.698Z",
                     *                   "updated": "2021-04-16T15:17:03.393Z",
                     *                   "objectCount": 0,
                     *                   "objectSchemaId": "6",
                     *                   "inherited": false,
                     *                   "abstractObjectType": false,
                     *                   "parentObjectTypeInherited": false
                     *                 },
                     *                 "created": "2021-02-16T20:04:26.445Z",
                     *                 "updated": "2021-02-16T20:04:26.445Z",
                     *                 "hasAvatar": false,
                     *                 "timestamp": 1613505866445,
                     *                 "_links": {
                     *                   "self": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/object/87"
                     *                 },
                     *                 "name": "Sydney"
                     *               },
                     *               "displayValue": "Sydney",
                     *               "searchValue": "ITSM-87",
                     *               "referencedType": true
                     *             }
                     *           ],
                     *           "objectId": "88"
                     *         },
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:44662",
                     *           "id": "44662",
                     *           "objectTypeAttribute": {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:265",
                     *             "id": "265",
                     *             "name": "Placeholder",
                     *             "label": false,
                     *             "defaultType": {
                     *               "id": 0,
                     *               "name": "Text"
                     *             },
                     *             "editable": true,
                     *             "system": false,
                     *             "sortable": true,
                     *             "summable": false,
                     *             "indexed": true,
                     *             "minimumCardinality": 0,
                     *             "maximumCardinality": 1,
                     *             "removable": true,
                     *             "hidden": false,
                     *             "includeChildObjectTypes": false,
                     *             "uniqueAttribute": false,
                     *             "options": "",
                     *             "position": 5
                     *           },
                     *           "objectTypeAttributeId": "265",
                     *           "objectAttributeValues": [
                     *             {
                     *               "value": "A placeholder value",
                     *               "displayValue": "A placeholder value",
                     *               "searchValue": "A placeholder value",
                     *               "referencedType": false
                     *             }
                     *           ],
                     *           "objectId": "88"
                     *         }
                     *       ],
                     *       "_links": {
                     *         "self": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/object/88"
                     *       },
                     *       "name": "SYD-1"
                     *     }
                     */
                    "application/json": components["schemas"]["Object"];
                };
            };
            400: components["responses"]["trait_badRequest_400"];
            401: components["responses"]["trait_requireAuthentication_401"];
            404: components["responses"]["trait_notFound_404"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Object - Delete": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The object id to operate on */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            400: components["responses"]["trait_badRequest_400"];
            401: components["responses"]["trait_requireAuthentication_401"];
            404: components["responses"]["trait_notFound_404"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Object - Find attributes": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The object id to operate on */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ObjectAttribute"][];
                };
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            404: components["responses"]["trait_notFound_404"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Object - Find history entries": {
        parameters: {
            query?: {
                /** @description Should the history be retrieved in ascending order */
                asc?: boolean;
            };
            header?: never;
            path: {
                /** @description The object id to operate on */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ObjectHistory"][];
                };
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            404: components["responses"]["trait_notFound_404"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Object - Find references": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The object id to operate on */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ObjectReferenceTypeInfo"][];
                };
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            404: components["responses"]["trait_notFound_404"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Object - Create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "objectTypeId": "23",
                 *       "attributes": [
                 *         {
                 *           "objectTypeAttributeId": "135",
                 *           "objectAttributeValues": [
                 *             {
                 *               "value": "NY-1"
                 *             }
                 *           ]
                 *         },
                 *         {
                 *           "objectTypeAttributeId": "144",
                 *           "objectAttributeValues": [
                 *             {
                 *               "value": "99"
                 *             }
                 *           ]
                 *         }
                 *       ]
                 *     }
                 */
                "application/json": components["schemas"]["ObjectIn"];
            };
        };
        responses: {
            /** @description The created object witout attributes */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *       "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:5186",
                     *       "id": "5186",
                     *       "label": "NY-1",
                     *       "objectKey": "ITSM-5186",
                     *       "avatar": {
                     *         "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *         "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=16",
                     *         "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=48",
                     *         "url72": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=72",
                     *         "url144": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=144",
                     *         "url288": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=288",
                     *         "objectId": "5186",
                     *         "mediaClientConfig": {
                     *           "clientId": "1a2s3d4f-dc47-44b0-9t0r-1h2h3yd68e9q",
                     *           "mediaBaseUrl": "https://api.media.atlassian.com",
                     *           "mediaJwtToken": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIxYTJzM2Q0Zi1kYzQ3LTQ0YjAtOXQwci0xaDJoM3lkNjhlOXEiLCJhY2Nlc3MiOnsidXJuOmZpbGVzdG9yZTpmaWxlOjg0MTIzZXJ0LTEyM2MtNGIxMi0xMmM1LTBiODZkYzgxMjNmZiI6WyJyZWFkIl19LCJleHAiOjE2MjYxNTY1NjcsIm5iZiI6MTYyNjE1NTkwN30.YjicbagPLbzapp3eEZbCQ7Z9V8Uc0WeBledyTw-Qu0s",
                     *           "fileId": "84123ert-123c-4b12-12c5-0b86dc8123ff"
                     *         }
                     *       },
                     *       "objectType": {
                     *         "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *         "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:23",
                     *         "id": "23",
                     *         "name": "Office",
                     *         "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ex.",
                     *         "icon": {
                     *           "id": "13",
                     *           "name": "Building",
                     *           "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=16",
                     *           "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=48"
                     *         },
                     *         "position": 2,
                     *         "created": "2021-02-16T19:36:51.951Z",
                     *         "updated": "2021-04-16T15:17:03.384Z",
                     *         "objectCount": 0,
                     *         "objectSchemaId": "6",
                     *         "inherited": false,
                     *         "abstractObjectType": false,
                     *         "parentObjectTypeInherited": false
                     *       },
                     *       "created": "2021-04-20T15:25:39.777Z",
                     *       "updated": "2021-04-20T15:25:39.777Z",
                     *       "hasAvatar": false,
                     *       "timestamp": 1618932339777,
                     *       "_links": {
                     *         "self": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/object/5186"
                     *       },
                     *       "name": "NY-1"
                     *     }
                     */
                    "application/json": components["schemas"]["Object"];
                };
            };
            400: components["responses"]["trait_badRequest_400"];
            401: components["responses"]["trait_requireAuthentication_401"];
            429: components["responses"]["trait_rateLimit2000PerMinute_429"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Object - Navigator list": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "objectTypeId": "23",
                 *       "attributesToDisplay": {
                 *         "attributesToDisplayIds": [
                 *           "135",
                 *           "144"
                 *         ]
                 *       },
                 *       "page": 1,
                 *       "asc": 1,
                 *       "resultsPerPage": 25,
                 *       "includeAttributes": false,
                 *       "objectSchemaId": "6",
                 *       "qlQuery": "objectType = Office AND Name LIKE SYD"
                 *     }
                 */
                "application/json": components["schemas"]["ObjectFilterParams"];
            };
        };
        responses: {
            /** @description The navlist response and the objects matching the query */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "objectEntries": [
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:88",
                     *           "id": "88",
                     *           "label": "SYD-1",
                     *           "objectKey": "ITSM-88",
                     *           "avatar": {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=16",
                     *             "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=48",
                     *             "url72": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=72",
                     *             "url144": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=144",
                     *             "url288": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=288",
                     *             "objectId": "88",
                     *             "mediaClientConfig": {
                     *               "clientId": "1a2s3d4f-dc47-44b0-9t0r-1h2h3yd68e9q",
                     *               "mediaBaseUrl": "https://api.media.atlassian.com",
                     *               "mediaJwtToken": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIxYTJzM2Q0Zi1kYzQ3LTQ0YjAtOXQwci0xaDJoM3lkNjhlOXEiLCJhY2Nlc3MiOnsidXJuOmZpbGVzdG9yZTpmaWxlOjg0MTIzZXJ0LTEyM2MtNGIxMi0xMmM1LTBiODZkYzgxMjNmZiI6WyJyZWFkIl19LCJleHAiOjE2MjYxNTY1NjcsIm5iZiI6MTYyNjE1NTkwN30.YjicbagPLbzapp3eEZbCQ7Z9V8Uc0WeBledyTw-Qu0s",
                     *               "fileId": "84123ert-123c-4b12-12c5-0b86dc8123ff"
                     *             }
                     *           },
                     *           "objectType": {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:23",
                     *             "id": "23",
                     *             "name": "Office",
                     *             "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ex.",
                     *             "icon": {
                     *               "id": "13",
                     *               "name": "Building",
                     *               "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=16",
                     *               "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=48"
                     *             },
                     *             "position": 2,
                     *             "created": "2021-02-16T19:36:51.951Z",
                     *             "updated": "2021-04-16T15:17:03.384Z",
                     *             "objectCount": 0,
                     *             "objectSchemaId": "6",
                     *             "inherited": false,
                     *             "abstractObjectType": false,
                     *             "parentObjectTypeInherited": false
                     *           },
                     *           "created": "2021-02-16T20:04:41.527Z",
                     *           "updated": "2021-02-16T20:04:41.527Z",
                     *           "hasAvatar": false,
                     *           "timestamp": 1613505881527,
                     *           "attributes": [
                     *             {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:637",
                     *               "id": "637",
                     *               "objectTypeAttributeId": "134",
                     *               "objectAttributeValues": [
                     *                 {
                     *                   "value": "ITSM-88",
                     *                   "displayValue": "ITSM-88",
                     *                   "searchValue": "ITSM-88",
                     *                   "referencedType": false
                     *                 }
                     *               ],
                     *               "objectId": "88"
                     *             },
                     *             {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:640",
                     *               "id": "640",
                     *               "objectTypeAttributeId": "135",
                     *               "objectAttributeValues": [
                     *                 {
                     *                   "value": "SYD-1",
                     *                   "displayValue": "SYD-1",
                     *                   "searchValue": "SYD-1",
                     *                   "referencedType": false
                     *                 }
                     *               ],
                     *               "objectId": "88"
                     *             },
                     *             {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:638",
                     *               "id": "638",
                     *               "objectTypeAttributeId": "136",
                     *               "objectAttributeValues": [
                     *                 {
                     *                   "value": "2021-02-16T20:04:41.527Z",
                     *                   "displayValue": "16/Feb/21 8:04 PM",
                     *                   "searchValue": "2021-02-16T20:04:41.527Z",
                     *                   "referencedType": false
                     *                 }
                     *               ],
                     *               "objectId": "88"
                     *             },
                     *             {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:639",
                     *               "id": "639",
                     *               "objectTypeAttributeId": "137",
                     *               "objectAttributeValues": [
                     *                 {
                     *                   "value": "2021-02-16T20:04:41.527Z",
                     *                   "displayValue": "16/Feb/21 8:04 PM",
                     *                   "searchValue": "2021-02-16T20:04:41.527Z",
                     *                   "referencedType": false
                     *                 }
                     *               ],
                     *               "objectId": "88"
                     *             },
                     *             {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:641",
                     *               "id": "641",
                     *               "objectTypeAttributeId": "144",
                     *               "objectAttributeValues": [
                     *                 {
                     *                   "referencedObject": {
                     *                     "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                     "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:87",
                     *                     "id": "87",
                     *                     "label": "Sydney",
                     *                     "objectKey": "ITSM-87",
                     *                     "avatar": {
                     *                       "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                       "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=16",
                     *                       "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=48",
                     *                       "url72": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=72",
                     *                       "url144": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=144",
                     *                       "url288": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=288",
                     *                       "objectId": "87",
                     *                       "mediaClientConfig": {
                     *                         "clientId": "1a2s3d4f-dc47-44b0-9t0r-1h2h3yd68e9q",
                     *                         "mediaBaseUrl": "https://api.media.atlassian.com",
                     *                         "mediaJwtToken": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIxYTJzM2Q0Zi1kYzQ3LTQ0YjAtOXQwci0xaDJoM3lkNjhlOXEiLCJhY2Nlc3MiOnsidXJuOmZpbGVzdG9yZTpmaWxlOjg0MTIzZXJ0LTEyM2MtNGIxMi0xMmM1LTBiODZkYzgxMjNmZiI6WyJyZWFkIl19LCJleHAiOjE2MjYxNTY1NjcsIm5iZiI6MTYyNjE1NTkwN30.YjicbagPLbzapp3eEZbCQ7Z9V8Uc0WeBledyTw-Qu0s",
                     *                         "fileId": "84123ert-123c-4b12-12c5-0b86dc8123ff"
                     *                       }
                     *                     },
                     *                     "objectType": {
                     *                       "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                       "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:24",
                     *                       "id": "24",
                     *                       "name": "City",
                     *                       "icon": {
                     *                         "id": "28",
                     *                         "name": "Cottage",
                     *                         "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=16",
                     *                         "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=48"
                     *                       },
                     *                       "position": 3,
                     *                       "created": "2021-02-16T19:58:45.698Z",
                     *                       "updated": "2021-04-16T15:17:03.393Z",
                     *                       "objectCount": 0,
                     *                       "objectSchemaId": "6",
                     *                       "inherited": false,
                     *                       "abstractObjectType": false,
                     *                       "parentObjectTypeInherited": false
                     *                     },
                     *                     "created": "2021-02-16T20:04:26.445Z",
                     *                     "updated": "2021-02-16T20:04:26.445Z",
                     *                     "hasAvatar": false,
                     *                     "timestamp": 1613505866445,
                     *                     "_links": {
                     *                       "self": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/object/87"
                     *                     },
                     *                     "name": "Sydney"
                     *                   },
                     *                   "displayValue": "Sydney",
                     *                   "searchValue": "ITSM-87",
                     *                   "referencedType": true
                     *                 }
                     *               ],
                     *               "objectId": "88"
                     *             }
                     *           ],
                     *           "_links": {
                     *             "self": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/object/88"
                     *           },
                     *           "name": "SYD-1"
                     *         }
                     *       ],
                     *       "objectTypeAttributes": [
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:134",
                     *           "id": "134",
                     *           "name": "Key",
                     *           "label": false,
                     *           "defaultType": {
                     *             "id": 0,
                     *             "name": "Text"
                     *           },
                     *           "editable": false,
                     *           "system": true,
                     *           "sortable": true,
                     *           "summable": false,
                     *           "indexed": true,
                     *           "minimumCardinality": 1,
                     *           "maximumCardinality": 1,
                     *           "removable": false,
                     *           "hidden": false,
                     *           "includeChildObjectTypes": false,
                     *           "uniqueAttribute": false,
                     *           "options": "",
                     *           "position": 0
                     *         },
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:135",
                     *           "id": "135",
                     *           "name": "Name",
                     *           "label": true,
                     *           "description": "The name of the object",
                     *           "defaultType": {
                     *             "id": 0,
                     *             "name": "Text"
                     *           },
                     *           "editable": true,
                     *           "system": false,
                     *           "sortable": true,
                     *           "summable": false,
                     *           "indexed": true,
                     *           "minimumCardinality": 1,
                     *           "maximumCardinality": 1,
                     *           "suffix": "",
                     *           "removable": false,
                     *           "hidden": false,
                     *           "includeChildObjectTypes": false,
                     *           "uniqueAttribute": true,
                     *           "regexValidation": "",
                     *           "options": "",
                     *           "position": 1
                     *         },
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:136",
                     *           "id": "136",
                     *           "name": "Created",
                     *           "label": false,
                     *           "defaultType": {
                     *             "id": 6,
                     *             "name": "DateTime"
                     *           },
                     *           "editable": false,
                     *           "system": true,
                     *           "sortable": true,
                     *           "summable": false,
                     *           "indexed": true,
                     *           "minimumCardinality": 1,
                     *           "maximumCardinality": 1,
                     *           "removable": false,
                     *           "hidden": false,
                     *           "includeChildObjectTypes": false,
                     *           "uniqueAttribute": false,
                     *           "options": "",
                     *           "position": 2
                     *         },
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:137",
                     *           "id": "137",
                     *           "name": "Updated",
                     *           "label": false,
                     *           "defaultType": {
                     *             "id": 6,
                     *             "name": "DateTime"
                     *           },
                     *           "editable": false,
                     *           "system": true,
                     *           "sortable": true,
                     *           "summable": false,
                     *           "indexed": true,
                     *           "minimumCardinality": 1,
                     *           "maximumCardinality": 1,
                     *           "removable": false,
                     *           "hidden": false,
                     *           "includeChildObjectTypes": false,
                     *           "uniqueAttribute": false,
                     *           "options": "",
                     *           "position": 3
                     *         },
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:144",
                     *           "id": "144",
                     *           "name": "City",
                     *           "label": false,
                     *           "referenceType": {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:4",
                     *             "id": "4",
                     *             "name": "Reference",
                     *             "description": "Reference",
                     *             "color": "49a6ed",
                     *             "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/config/referencetype/4/image.png?size=16"
                     *           },
                     *           "referenceObjectTypeId": "24",
                     *           "referenceObjectType": {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:24",
                     *             "id": "24",
                     *             "name": "City",
                     *             "icon": {
                     *               "id": "28",
                     *               "name": "Cottage",
                     *               "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=16",
                     *               "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=48"
                     *             },
                     *             "position": 3,
                     *             "created": "2021-02-16T19:58:45.698Z",
                     *             "updated": "2021-04-16T15:17:03.393Z",
                     *             "objectCount": 0,
                     *             "objectSchemaId": "6",
                     *             "inherited": false,
                     *             "abstractObjectType": false,
                     *             "parentObjectTypeInherited": false
                     *           },
                     *           "editable": true,
                     *           "system": false,
                     *           "sortable": true,
                     *           "summable": false,
                     *           "indexed": true,
                     *           "minimumCardinality": 0,
                     *           "maximumCardinality": 1,
                     *           "removable": true,
                     *           "hidden": false,
                     *           "includeChildObjectTypes": false,
                     *           "uniqueAttribute": false,
                     *           "options": "",
                     *           "position": 4
                     *         },
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:265",
                     *           "id": "265",
                     *           "name": "Placeholder",
                     *           "label": false,
                     *           "defaultType": {
                     *             "id": 0,
                     *             "name": "Text"
                     *           },
                     *           "editable": true,
                     *           "system": false,
                     *           "sortable": true,
                     *           "summable": false,
                     *           "indexed": true,
                     *           "minimumCardinality": 0,
                     *           "maximumCardinality": 1,
                     *           "removable": true,
                     *           "hidden": false,
                     *           "includeChildObjectTypes": false,
                     *           "uniqueAttribute": false,
                     *           "options": "",
                     *           "position": 5
                     *         }
                     *       ],
                     *       "objectTypeIsInherited": false,
                     *       "abstractObjectType": false,
                     *       "totalFilterCount": 1,
                     *       "startIndex": 1,
                     *       "toIndex": 1,
                     *       "pageObjectSize": 25,
                     *       "pageNumber": 1,
                     *       "orderWay": "ascending",
                     *       "qlQuery": "objectType = Office AND Name LIKE SYD",
                     *       "qlQuerySearchResult": true,
                     *       "conversionPossible": false,
                     *       "pageSize": 1
                     *     }
                     */
                    "application/json": components["schemas"]["ObjectListResult"];
                };
            };
            400: components["responses"]["trait_badRequest_400"];
            401: components["responses"]["trait_requireAuthentication_401"];
            429: components["responses"]["trait_rateLimit500PerMinute_429"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Object - Navigator list (deprecated)": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "objectTypeId": "23",
                 *       "attributesToDisplay": {
                 *         "attributesToDisplayIds": [
                 *           135,
                 *           144
                 *         ]
                 *       },
                 *       "page": 1,
                 *       "asc": 1,
                 *       "resultsPerPage": 25,
                 *       "includeAttributes": false,
                 *       "objectSchemaId": "6",
                 *       "iql": "objectType = Office AND Name LIKE SYD"
                 *     }
                 */
                "application/json": components["schemas"]["ObjectFilterParams"];
            };
        };
        responses: {
            /** @description The navlist response and the objects matching the query */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "objectEntries": [
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:88",
                     *           "id": "88",
                     *           "label": "SYD-1",
                     *           "objectKey": "ITSM-88",
                     *           "avatar": {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=16",
                     *             "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=48",
                     *             "url72": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=72",
                     *             "url144": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=144",
                     *             "url288": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=288",
                     *             "objectId": "88",
                     *             "mediaClientConfig": {
                     *               "clientId": "1a2s3d4f-dc47-44b0-9t0r-1h2h3yd68e9q",
                     *               "mediaBaseUrl": "https://api.media.atlassian.com",
                     *               "mediaJwtToken": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIxYTJzM2Q0Zi1kYzQ3LTQ0YjAtOXQwci0xaDJoM3lkNjhlOXEiLCJhY2Nlc3MiOnsidXJuOmZpbGVzdG9yZTpmaWxlOjg0MTIzZXJ0LTEyM2MtNGIxMi0xMmM1LTBiODZkYzgxMjNmZiI6WyJyZWFkIl19LCJleHAiOjE2MjYxNTY1NjcsIm5iZiI6MTYyNjE1NTkwN30.YjicbagPLbzapp3eEZbCQ7Z9V8Uc0WeBledyTw-Qu0s",
                     *               "fileId": "84123ert-123c-4b12-12c5-0b86dc8123ff"
                     *             }
                     *           },
                     *           "objectType": {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:23",
                     *             "id": "23",
                     *             "name": "Office",
                     *             "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ex.",
                     *             "icon": {
                     *               "id": "13",
                     *               "name": "Building",
                     *               "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=16",
                     *               "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=48"
                     *             },
                     *             "position": 2,
                     *             "created": "2021-02-16T19:36:51.951Z",
                     *             "updated": "2021-04-16T15:17:03.384Z",
                     *             "objectCount": 0,
                     *             "objectSchemaId": "6",
                     *             "inherited": false,
                     *             "abstractObjectType": false,
                     *             "parentObjectTypeInherited": false
                     *           },
                     *           "created": "2021-02-16T20:04:41.527Z",
                     *           "updated": "2021-02-16T20:04:41.527Z",
                     *           "hasAvatar": false,
                     *           "timestamp": 1613505881527,
                     *           "attributes": [
                     *             {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:637",
                     *               "id": "637",
                     *               "objectTypeAttributeId": "134",
                     *               "objectAttributeValues": [
                     *                 {
                     *                   "value": "ITSM-88",
                     *                   "displayValue": "ITSM-88",
                     *                   "searchValue": "ITSM-88",
                     *                   "referencedType": false
                     *                 }
                     *               ],
                     *               "objectId": "88"
                     *             },
                     *             {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:640",
                     *               "id": "640",
                     *               "objectTypeAttributeId": "135",
                     *               "objectAttributeValues": [
                     *                 {
                     *                   "value": "SYD-1",
                     *                   "displayValue": "SYD-1",
                     *                   "searchValue": "SYD-1",
                     *                   "referencedType": false
                     *                 }
                     *               ],
                     *               "objectId": "88"
                     *             },
                     *             {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:638",
                     *               "id": "638",
                     *               "objectTypeAttributeId": "136",
                     *               "objectAttributeValues": [
                     *                 {
                     *                   "value": "2021-02-16T20:04:41.527Z",
                     *                   "displayValue": "16/Feb/21 8:04 PM",
                     *                   "searchValue": "2021-02-16T20:04:41.527Z",
                     *                   "referencedType": false
                     *                 }
                     *               ],
                     *               "objectId": "88"
                     *             },
                     *             {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:639",
                     *               "id": "639",
                     *               "objectTypeAttributeId": "137",
                     *               "objectAttributeValues": [
                     *                 {
                     *                   "value": "2021-02-16T20:04:41.527Z",
                     *                   "displayValue": "16/Feb/21 8:04 PM",
                     *                   "searchValue": "2021-02-16T20:04:41.527Z",
                     *                   "referencedType": false
                     *                 }
                     *               ],
                     *               "objectId": "88"
                     *             },
                     *             {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:641",
                     *               "id": "641",
                     *               "objectTypeAttributeId": "144",
                     *               "objectAttributeValues": [
                     *                 {
                     *                   "referencedObject": {
                     *                     "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                     "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:87",
                     *                     "id": "87",
                     *                     "label": "Sydney",
                     *                     "objectKey": "ITSM-87",
                     *                     "avatar": {
                     *                       "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                       "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=16",
                     *                       "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=48",
                     *                       "url72": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=72",
                     *                       "url144": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=144",
                     *                       "url288": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=288",
                     *                       "objectId": "87",
                     *                       "mediaClientConfig": {
                     *                         "clientId": "1a2s3d4f-dc47-44b0-9t0r-1h2h3yd68e9q",
                     *                         "mediaBaseUrl": "https://api.media.atlassian.com",
                     *                         "mediaJwtToken": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIxYTJzM2Q0Zi1kYzQ3LTQ0YjAtOXQwci0xaDJoM3lkNjhlOXEiLCJhY2Nlc3MiOnsidXJuOmZpbGVzdG9yZTpmaWxlOjg0MTIzZXJ0LTEyM2MtNGIxMi0xMmM1LTBiODZkYzgxMjNmZiI6WyJyZWFkIl19LCJleHAiOjE2MjYxNTY1NjcsIm5iZiI6MTYyNjE1NTkwN30.YjicbagPLbzapp3eEZbCQ7Z9V8Uc0WeBledyTw-Qu0s",
                     *                         "fileId": "84123ert-123c-4b12-12c5-0b86dc8123ff"
                     *                       }
                     *                     },
                     *                     "objectType": {
                     *                       "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                       "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:24",
                     *                       "id": "24",
                     *                       "name": "City",
                     *                       "icon": {
                     *                         "id": "28",
                     *                         "name": "Cottage",
                     *                         "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=16",
                     *                         "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=48"
                     *                       },
                     *                       "position": 3,
                     *                       "created": "2021-02-16T19:58:45.698Z",
                     *                       "updated": "2021-04-16T15:17:03.393Z",
                     *                       "objectCount": 0,
                     *                       "objectSchemaId": "6",
                     *                       "inherited": false,
                     *                       "abstractObjectType": false,
                     *                       "parentObjectTypeInherited": false
                     *                     },
                     *                     "created": "2021-02-16T20:04:26.445Z",
                     *                     "updated": "2021-02-16T20:04:26.445Z",
                     *                     "hasAvatar": false,
                     *                     "timestamp": 1613505866445,
                     *                     "_links": {
                     *                       "self": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/object/87"
                     *                     },
                     *                     "name": "Sydney"
                     *                   },
                     *                   "displayValue": "Sydney",
                     *                   "searchValue": "ITSM-87",
                     *                   "referencedType": true
                     *                 }
                     *               ],
                     *               "objectId": "88"
                     *             }
                     *           ],
                     *           "_links": {
                     *             "self": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/object/88"
                     *           },
                     *           "name": "SYD-1"
                     *         }
                     *       ],
                     *       "objectTypeAttributes": [
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:134",
                     *           "id": "134",
                     *           "name": "Key",
                     *           "label": false,
                     *           "defaultType": {
                     *             "id": 0,
                     *             "name": "Text"
                     *           },
                     *           "editable": false,
                     *           "system": true,
                     *           "sortable": true,
                     *           "summable": false,
                     *           "indexed": true,
                     *           "minimumCardinality": 1,
                     *           "maximumCardinality": 1,
                     *           "removable": false,
                     *           "hidden": false,
                     *           "includeChildObjectTypes": false,
                     *           "uniqueAttribute": false,
                     *           "options": "",
                     *           "position": 0
                     *         },
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:135",
                     *           "id": "135",
                     *           "name": "Name",
                     *           "label": true,
                     *           "description": "The name of the object",
                     *           "defaultType": {
                     *             "id": 0,
                     *             "name": "Text"
                     *           },
                     *           "editable": true,
                     *           "system": false,
                     *           "sortable": true,
                     *           "summable": false,
                     *           "indexed": true,
                     *           "minimumCardinality": 1,
                     *           "maximumCardinality": 1,
                     *           "suffix": "",
                     *           "removable": false,
                     *           "hidden": false,
                     *           "includeChildObjectTypes": false,
                     *           "uniqueAttribute": true,
                     *           "regexValidation": "",
                     *           "options": "",
                     *           "position": 1
                     *         },
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:136",
                     *           "id": "136",
                     *           "name": "Created",
                     *           "label": false,
                     *           "defaultType": {
                     *             "id": 6,
                     *             "name": "DateTime"
                     *           },
                     *           "editable": false,
                     *           "system": true,
                     *           "sortable": true,
                     *           "summable": false,
                     *           "indexed": true,
                     *           "minimumCardinality": 1,
                     *           "maximumCardinality": 1,
                     *           "removable": false,
                     *           "hidden": false,
                     *           "includeChildObjectTypes": false,
                     *           "uniqueAttribute": false,
                     *           "options": "",
                     *           "position": 2
                     *         },
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:137",
                     *           "id": "137",
                     *           "name": "Updated",
                     *           "label": false,
                     *           "defaultType": {
                     *             "id": 6,
                     *             "name": "DateTime"
                     *           },
                     *           "editable": false,
                     *           "system": true,
                     *           "sortable": true,
                     *           "summable": false,
                     *           "indexed": true,
                     *           "minimumCardinality": 1,
                     *           "maximumCardinality": 1,
                     *           "removable": false,
                     *           "hidden": false,
                     *           "includeChildObjectTypes": false,
                     *           "uniqueAttribute": false,
                     *           "options": "",
                     *           "position": 3
                     *         },
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:144",
                     *           "id": "144",
                     *           "name": "City",
                     *           "label": false,
                     *           "referenceType": {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:4",
                     *             "id": "4",
                     *             "name": "Reference",
                     *             "description": "Reference",
                     *             "color": "49a6ed",
                     *             "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/config/referencetype/4/image.png?size=16"
                     *           },
                     *           "referenceObjectTypeId": "24",
                     *           "referenceObjectType": {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:24",
                     *             "id": "24",
                     *             "name": "City",
                     *             "icon": {
                     *               "id": "28",
                     *               "name": "Cottage",
                     *               "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=16",
                     *               "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=48"
                     *             },
                     *             "position": 3,
                     *             "created": "2021-02-16T19:58:45.698Z",
                     *             "updated": "2021-04-16T15:17:03.393Z",
                     *             "objectCount": 0,
                     *             "objectSchemaId": "6",
                     *             "inherited": false,
                     *             "abstractObjectType": false,
                     *             "parentObjectTypeInherited": false
                     *           },
                     *           "editable": true,
                     *           "system": false,
                     *           "sortable": true,
                     *           "summable": false,
                     *           "indexed": true,
                     *           "minimumCardinality": 0,
                     *           "maximumCardinality": 1,
                     *           "removable": true,
                     *           "hidden": false,
                     *           "includeChildObjectTypes": false,
                     *           "uniqueAttribute": false,
                     *           "options": "",
                     *           "position": 4
                     *         },
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:265",
                     *           "id": "265",
                     *           "name": "Placeholder",
                     *           "label": false,
                     *           "defaultType": {
                     *             "id": 0,
                     *             "name": "Text"
                     *           },
                     *           "editable": true,
                     *           "system": false,
                     *           "sortable": true,
                     *           "summable": false,
                     *           "indexed": true,
                     *           "minimumCardinality": 0,
                     *           "maximumCardinality": 1,
                     *           "removable": true,
                     *           "hidden": false,
                     *           "includeChildObjectTypes": false,
                     *           "uniqueAttribute": false,
                     *           "options": "",
                     *           "position": 5
                     *         }
                     *       ],
                     *       "objectTypeIsInherited": false,
                     *       "abstractObjectType": false,
                     *       "totalFilterCount": 1,
                     *       "startIndex": 1,
                     *       "toIndex": 1,
                     *       "pageObjectSize": 25,
                     *       "pageNumber": 1,
                     *       "orderWay": "ascending",
                     *       "iql": "objectType = Office AND Name LIKE SYD",
                     *       "iqlSearchResult": true,
                     *       "conversionPossible": false,
                     *       "pageSize": 1
                     *     }
                     */
                    "application/json": components["schemas"]["ObjectListResult"];
                };
            };
            400: components["responses"]["trait_badRequest_400"];
            401: components["responses"]["trait_requireAuthentication_401"];
            429: components["responses"]["trait_rateLimit500PerMinute_429"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Objects by AQL": {
        parameters: {
            query?: {
                /** @description The starting index for the next page of results */
                startAt?: number;
                /** @description The maximum number of objects to return in this page of results. Actual number of results may be less, for example, if the last page of results is returned. */
                maxResults?: number;
                /** @description Should the objects attributes be included in the response. If this parameter is false only the information on the object will be returned and the object attributes will not be present */
                includeAttributes?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "qlQuery": "objectType = Office AND Name LIKE SYD"
                 *     }
                 */
                "application/json": components["schemas"]["ObjectAQLParams"];
            };
        };
        responses: {
            /** @description A object result set that can be used to paginate through the result list of objects */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "startAt": 0,
                     *       "maxResults": 25,
                     *       "total": 5,
                     *       "isLast": "false",
                     *       "values": [
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:88",
                     *           "id": "88",
                     *           "label": "SYD-1",
                     *           "objectKey": "ITSM-88",
                     *           "avatar": {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=16",
                     *             "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=48",
                     *             "url72": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=72",
                     *             "url144": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=144",
                     *             "url288": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=288",
                     *             "objectId": "88",
                     *             "mediaClientConfig": {
                     *               "clientId": "1a2s3d4f-dc47-44b0-9t0r-1h2h3yd68e9q",
                     *               "mediaBaseUrl": "https://api.media.atlassian.com",
                     *               "mediaJwtToken": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIxYTJzM2Q0Zi1kYzQ3LTQ0YjAtOXQwci0xaDJoM3lkNjhlOXEiLCJhY2Nlc3MiOnsidXJuOmZpbGVzdG9yZTpmaWxlOjg0MTIzZXJ0LTEyM2MtNGIxMi0xMmM1LTBiODZkYzgxMjNmZiI6WyJyZWFkIl19LCJleHAiOjE2MjYxNTY1NjcsIm5iZiI6MTYyNjE1NTkwN30.YjicbagPLbzapp3eEZbCQ7Z9V8Uc0WeBledyTw-Qu0s",
                     *               "fileId": "84123ert-123c-4b12-12c5-0b86dc8123ff"
                     *             }
                     *           },
                     *           "objectType": {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:23",
                     *             "id": "23",
                     *             "name": "Office",
                     *             "type": 0,
                     *             "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ex.",
                     *             "icon": {
                     *               "id": "13",
                     *               "name": "Building",
                     *               "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=16",
                     *               "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=48"
                     *             },
                     *             "position": 2,
                     *             "created": "2021-02-16T19:36:51.951Z",
                     *             "updated": "2021-04-16T15:17:03.384Z",
                     *             "objectCount": 0,
                     *             "objectSchemaId": "6",
                     *             "inherited": false,
                     *             "abstractObjectType": false,
                     *             "parentObjectTypeInherited": false
                     *           },
                     *           "created": "2021-02-16T20:04:41.527Z",
                     *           "updated": "2021-02-16T20:04:41.527Z",
                     *           "hasAvatar": false,
                     *           "timestamp": 1613505881527,
                     *           "attributes": [
                     *             {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:637",
                     *               "id": "637",
                     *               "objectTypeAttributeId": "134",
                     *               "objectAttributeValues": [
                     *                 {
                     *                   "value": "ITSM-88",
                     *                   "displayValue": "ITSM-88",
                     *                   "searchValue": "ITSM-88",
                     *                   "referencedType": false
                     *                 }
                     *               ],
                     *               "objectId": "88"
                     *             },
                     *             {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:640",
                     *               "id": "640",
                     *               "objectTypeAttributeId": "135",
                     *               "objectAttributeValues": [
                     *                 {
                     *                   "value": "SYD-1",
                     *                   "displayValue": "SYD-1",
                     *                   "searchValue": "SYD-1",
                     *                   "referencedType": false
                     *                 }
                     *               ],
                     *               "objectId": "88"
                     *             },
                     *             {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:638",
                     *               "id": "638",
                     *               "objectTypeAttributeId": "136",
                     *               "objectAttributeValues": [
                     *                 {
                     *                   "value": "2021-02-16T20:04:41.527Z",
                     *                   "displayValue": "16/Feb/21 8:04 PM",
                     *                   "searchValue": "2021-02-16T20:04:41.527Z",
                     *                   "referencedType": false
                     *                 }
                     *               ],
                     *               "objectId": "88"
                     *             },
                     *             {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:639",
                     *               "id": "639",
                     *               "objectTypeAttributeId": "137",
                     *               "objectAttributeValues": [
                     *                 {
                     *                   "value": "2021-02-16T20:04:41.527Z",
                     *                   "displayValue": "16/Feb/21 8:04 PM",
                     *                   "searchValue": "2021-02-16T20:04:41.527Z",
                     *                   "referencedType": false
                     *                 }
                     *               ],
                     *               "objectId": "88"
                     *             },
                     *             {
                     *               "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *               "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:641",
                     *               "id": "641",
                     *               "objectTypeAttributeId": "144",
                     *               "objectAttributeValues": [
                     *                 {
                     *                   "referencedObject": {
                     *                     "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                     "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:87",
                     *                     "id": "87",
                     *                     "label": "Sydney",
                     *                     "objectKey": "ITSM-87",
                     *                     "avatar": {
                     *                       "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                       "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=16",
                     *                       "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=48",
                     *                       "url72": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=72",
                     *                       "url144": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=144",
                     *                       "url288": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=288",
                     *                       "objectId": "87",
                     *                       "mediaClientConfig": {
                     *                         "clientId": "1a2s3d4f-dc47-44b0-9t0r-1h2h3yd68e9q",
                     *                         "mediaBaseUrl": "https://api.media.atlassian.com",
                     *                         "mediaJwtToken": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIxYTJzM2Q0Zi1kYzQ3LTQ0YjAtOXQwci0xaDJoM3lkNjhlOXEiLCJhY2Nlc3MiOnsidXJuOmZpbGVzdG9yZTpmaWxlOjg0MTIzZXJ0LTEyM2MtNGIxMi0xMmM1LTBiODZkYzgxMjNmZiI6WyJyZWFkIl19LCJleHAiOjE2MjYxNTY1NjcsIm5iZiI6MTYyNjE1NTkwN30.YjicbagPLbzapp3eEZbCQ7Z9V8Uc0WeBledyTw-Qu0s",
                     *                         "fileId": "84123ert-123c-4b12-12c5-0b86dc8123ff"
                     *                       }
                     *                     },
                     *                     "objectType": {
                     *                       "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *                       "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:24",
                     *                       "id": "24",
                     *                       "name": "City",
                     *                       "icon": {
                     *                         "id": "28",
                     *                         "name": "Cottage",
                     *                         "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=16",
                     *                         "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=48"
                     *                       },
                     *                       "position": 3,
                     *                       "created": "2021-02-16T19:58:45.698Z",
                     *                       "updated": "2021-04-16T15:17:03.393Z",
                     *                       "objectCount": 0,
                     *                       "objectSchemaId": "6",
                     *                       "inherited": false,
                     *                       "abstractObjectType": false,
                     *                       "parentObjectTypeInherited": false
                     *                     },
                     *                     "created": "2021-02-16T20:04:26.445Z",
                     *                     "updated": "2021-02-16T20:04:26.445Z",
                     *                     "hasAvatar": false,
                     *                     "timestamp": 1613505866445,
                     *                     "_links": {
                     *                       "self": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/object/87"
                     *                     },
                     *                     "name": "Sydney"
                     *                   },
                     *                   "displayValue": "Sydney",
                     *                   "searchValue": "ITSM-87",
                     *                   "referencedType": true
                     *                 }
                     *               ],
                     *               "objectId": "88"
                     *             }
                     *           ],
                     *           "_links": {
                     *             "self": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/object/88"
                     *           },
                     *           "name": "SYD-1"
                     *         }
                     *       ],
                     *       "objectTypeAttributes": [
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:134",
                     *           "id": "134",
                     *           "objectType": {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:23",
                     *             "id": "23",
                     *             "name": "Office",
                     *             "type": 0,
                     *             "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ex.",
                     *             "icon": {
                     *               "id": "13",
                     *               "name": "Building",
                     *               "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=16",
                     *               "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=48"
                     *             },
                     *             "position": 2,
                     *             "created": "2021-02-16T19:36:51.951Z",
                     *             "updated": "2021-04-16T15:17:03.384Z",
                     *             "objectCount": 0,
                     *             "objectSchemaId": "6",
                     *             "inherited": false,
                     *             "abstractObjectType": false,
                     *             "parentObjectTypeInherited": false
                     *           },
                     *           "name": "Key",
                     *           "label": false,
                     *           "defaultType": {
                     *             "id": 0,
                     *             "name": "Text"
                     *           },
                     *           "editable": false,
                     *           "system": true,
                     *           "sortable": true,
                     *           "summable": false,
                     *           "indexed": true,
                     *           "minimumCardinality": 1,
                     *           "maximumCardinality": 1,
                     *           "removable": false,
                     *           "hidden": false,
                     *           "includeChildObjectTypes": false,
                     *           "uniqueAttribute": false,
                     *           "options": "",
                     *           "position": 0
                     *         },
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:135",
                     *           "id": "135",
                     *           "objectType": {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:23",
                     *             "id": "23",
                     *             "name": "Office",
                     *             "type": 0,
                     *             "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ex.",
                     *             "icon": {
                     *               "id": "13",
                     *               "name": "Building",
                     *               "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=16",
                     *               "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=48"
                     *             },
                     *             "position": 2,
                     *             "created": "2021-02-16T19:36:51.951Z",
                     *             "updated": "2021-04-16T15:17:03.384Z",
                     *             "objectCount": 0,
                     *             "objectSchemaId": "6",
                     *             "inherited": false,
                     *             "abstractObjectType": false,
                     *             "parentObjectTypeInherited": false
                     *           },
                     *           "name": "Name",
                     *           "label": true,
                     *           "description": "The name of the object",
                     *           "defaultType": {
                     *             "id": 0,
                     *             "name": "Text"
                     *           },
                     *           "editable": true,
                     *           "system": false,
                     *           "sortable": true,
                     *           "summable": false,
                     *           "indexed": true,
                     *           "minimumCardinality": 1,
                     *           "maximumCardinality": 1,
                     *           "suffix": "",
                     *           "removable": false,
                     *           "hidden": false,
                     *           "includeChildObjectTypes": false,
                     *           "uniqueAttribute": true,
                     *           "regexValidation": "",
                     *           "options": "",
                     *           "position": 1
                     *         },
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:136",
                     *           "id": "136",
                     *           "objectType": {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:23",
                     *             "id": "23",
                     *             "name": "Office",
                     *             "type": 0,
                     *             "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ex.",
                     *             "icon": {
                     *               "id": "13",
                     *               "name": "Building",
                     *               "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=16",
                     *               "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=48"
                     *             },
                     *             "position": 2,
                     *             "created": "2021-02-16T19:36:51.951Z",
                     *             "updated": "2021-04-16T15:17:03.384Z",
                     *             "objectCount": 0,
                     *             "objectSchemaId": "6",
                     *             "inherited": false,
                     *             "abstractObjectType": false,
                     *             "parentObjectTypeInherited": false
                     *           },
                     *           "name": "Created",
                     *           "label": false,
                     *           "defaultType": {
                     *             "id": 6,
                     *             "name": "DateTime"
                     *           },
                     *           "editable": false,
                     *           "system": true,
                     *           "sortable": true,
                     *           "summable": false,
                     *           "indexed": true,
                     *           "minimumCardinality": 1,
                     *           "maximumCardinality": 1,
                     *           "removable": false,
                     *           "hidden": false,
                     *           "includeChildObjectTypes": false,
                     *           "uniqueAttribute": false,
                     *           "options": "",
                     *           "position": 2
                     *         },
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:137",
                     *           "id": "137",
                     *           "objectType": {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:23",
                     *             "id": "23",
                     *             "name": "Office",
                     *             "type": 0,
                     *             "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ex.",
                     *             "icon": {
                     *               "id": "13",
                     *               "name": "Building",
                     *               "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=16",
                     *               "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=48"
                     *             },
                     *             "position": 2,
                     *             "created": "2021-02-16T19:36:51.951Z",
                     *             "updated": "2021-04-16T15:17:03.384Z",
                     *             "objectCount": 0,
                     *             "objectSchemaId": "6",
                     *             "inherited": false,
                     *             "abstractObjectType": false,
                     *             "parentObjectTypeInherited": false
                     *           },
                     *           "name": "Updated",
                     *           "label": false,
                     *           "defaultType": {
                     *             "id": 6,
                     *             "name": "DateTime"
                     *           },
                     *           "editable": false,
                     *           "system": true,
                     *           "sortable": true,
                     *           "summable": false,
                     *           "indexed": true,
                     *           "minimumCardinality": 1,
                     *           "maximumCardinality": 1,
                     *           "removable": false,
                     *           "hidden": false,
                     *           "includeChildObjectTypes": false,
                     *           "uniqueAttribute": false,
                     *           "options": "",
                     *           "position": 3
                     *         },
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:144",
                     *           "id": "144",
                     *           "objectType": {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:23",
                     *             "id": "23",
                     *             "name": "Office",
                     *             "type": 0,
                     *             "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ex.",
                     *             "icon": {
                     *               "id": "13",
                     *               "name": "Building",
                     *               "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=16",
                     *               "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=48"
                     *             },
                     *             "position": 2,
                     *             "created": "2021-02-16T19:36:51.951Z",
                     *             "updated": "2021-04-16T15:17:03.384Z",
                     *             "objectCount": 0,
                     *             "objectSchemaId": "6",
                     *             "inherited": false,
                     *             "abstractObjectType": false,
                     *             "parentObjectTypeInherited": false
                     *           },
                     *           "name": "City",
                     *           "label": false,
                     *           "referenceType": {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:4",
                     *             "id": "4",
                     *             "name": "Reference",
                     *             "description": "Reference",
                     *             "color": "49a6ed",
                     *             "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/config/referencetype/4/image.png?size=16"
                     *           },
                     *           "referenceObjectTypeId": "24",
                     *           "referenceObjectType": {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:24",
                     *             "id": "24",
                     *             "name": "City",
                     *             "icon": {
                     *               "id": "28",
                     *               "name": "Cottage",
                     *               "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=16",
                     *               "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=48"
                     *             },
                     *             "position": 3,
                     *             "created": "2021-02-16T19:58:45.698Z",
                     *             "updated": "2021-04-16T15:17:03.393Z",
                     *             "objectCount": 0,
                     *             "objectSchemaId": "6",
                     *             "inherited": false,
                     *             "abstractObjectType": false,
                     *             "parentObjectTypeInherited": false
                     *           },
                     *           "editable": true,
                     *           "system": false,
                     *           "sortable": true,
                     *           "summable": false,
                     *           "indexed": true,
                     *           "minimumCardinality": 0,
                     *           "maximumCardinality": 1,
                     *           "removable": true,
                     *           "hidden": false,
                     *           "includeChildObjectTypes": false,
                     *           "uniqueAttribute": false,
                     *           "options": "",
                     *           "position": 4
                     *         },
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:265",
                     *           "id": "265",
                     *           "objectType": {
                     *             "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *             "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:23",
                     *             "id": "23",
                     *             "name": "Office",
                     *             "type": 0,
                     *             "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ex.",
                     *             "icon": {
                     *               "id": "13",
                     *               "name": "Building",
                     *               "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=16",
                     *               "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/23/icon.png?size=48"
                     *             },
                     *             "position": 2,
                     *             "created": "2021-02-16T19:36:51.951Z",
                     *             "updated": "2021-04-16T15:17:03.384Z",
                     *             "objectCount": 0,
                     *             "objectSchemaId": "6",
                     *             "inherited": false,
                     *             "abstractObjectType": false,
                     *             "parentObjectTypeInherited": false
                     *           },
                     *           "name": "Placeholder",
                     *           "label": false,
                     *           "defaultType": {
                     *             "id": 0,
                     *             "name": "Text"
                     *           },
                     *           "editable": true,
                     *           "system": false,
                     *           "sortable": true,
                     *           "summable": false,
                     *           "indexed": true,
                     *           "minimumCardinality": 0,
                     *           "maximumCardinality": 1,
                     *           "removable": true,
                     *           "hidden": false,
                     *           "includeChildObjectTypes": false,
                     *           "uniqueAttribute": false,
                     *           "options": "",
                     *           "position": 5
                     *         }
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["ObjectListInclTypeAttributesEntryResult"];
                };
            };
            400: components["responses"]["trait_badRequest_400"];
            401: components["responses"]["trait_requireAuthentication_401"];
            429: components["responses"]["trait_rateLimit1000PerMinute_429"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Object - Connected Tickets": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The id of the object to get connected tickets for */
                objectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "tickets": [
                     *         {
                     *           "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *           "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:10968",
                     *           "key": "ITSM-12",
                     *           "id": "10968",
                     *           "reporter": "6g2c42d1f6fgd2112cgc66dc",
                     *           "created": "2021-02-17T18:31:56.953Z",
                     *           "updated": "2021-03-22T18:59:23.333Z",
                     *           "title": "Install a new whiteboard in the conference room SYD-1-Thor",
                     *           "status": {
                     *             "name": "In Progress",
                     *             "description": "This issue is being actively worked on at the moment by the assignee.",
                     *             "colorName": "yellow"
                     *           },
                     *           "type": {
                     *             "name": "Task",
                     *             "description": "A task that needs to be done.",
                     *             "iconUrl": "https://krispies.atlassian.net/secure/viewavatar?size=medium&avatarId=10517&avatarType=issuetype"
                     *           },
                     *           "priority": {
                     *             "name": "Medium",
                     *             "iconUrl": "https://krispies.atlassian.net/images/icons/priorities/medium.svg"
                     *           }
                     *         }
                     *       ],
                     *       "allTicketsQuery": "<JQL that retrieves Jira Issues connected to the object>"
                     *     }
                     */
                    "application/json": components["schemas"]["Tickets"];
                };
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            404: components["responses"]["trait_notFound_404"];
            429: components["responses"]["trait_rateLimit2000PerMinute_429"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Schema - List": {
        parameters: {
            query?: {
                /** @description The starting index for the next page of results */
                startAt?: number;
                /** @description The maximum number of objects to return in this page of results. Actual number of results may be less, for example, if the last page of results is returned. */
                maxResults?: number;
                /** @description Should the object and object type count for schema be included in the response. If this parameter is false, object and object type count will return 0. */
                includeCounts?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "startAt": 0,
                     *       "maxResults": 25,
                     *       "total": 5,
                     *       "values": [
                     *         {
                     *           "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *           "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:13",
                     *           "id": "13",
                     *           "name": "Discovery import",
                     *           "objectSchemaKey": "NS",
                     *           "status": "Ok",
                     *           "description": "",
                     *           "created": "2021-02-22T02:31:31.748Z",
                     *           "updated": "2021-03-26T12:12:46.132Z",
                     *           "objectCount": 231,
                     *           "objectTypeCount": 23,
                     *           "canManage": true
                     *         },
                     *         {
                     *           "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *           "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:6",
                     *           "id": "6",
                     *           "name": "ITSM",
                     *           "objectSchemaKey": "ITSM",
                     *           "status": "Ok",
                     *           "created": "2021-02-16T18:04:31.284Z",
                     *           "updated": "2021-02-16T18:04:31.288Z",
                     *           "objectCount": 95,
                     *           "objectTypeCount": 34,
                     *           "canManage": true
                     *         },
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:1",
                     *           "id": "1",
                     *           "name": "Human Resources",
                     *           "objectSchemaKey": "HR",
                     *           "status": "Ok",
                     *           "created": "2021-02-15T22:05:30.709Z",
                     *           "updated": "2021-03-18T13:49:57.909Z",
                     *           "objectCount": 1023,
                     *           "objectTypeCount": 14,
                     *           "canManage": true
                     *         },
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:27",
                     *           "id": "27",
                     *           "name": "Services",
                     *           "objectSchemaKey": "SVC",
                     *           "status": "Ok",
                     *           "description": "Contains the 'Service' object type and services your site uses across projects.",
                     *           "created": "2021-03-19T04:52:40.418Z",
                     *           "updated": "2021-03-19T04:52:40.428Z",
                     *           "objectCount": 37,
                     *           "objectTypeCount": 1,
                     *           "canManage": false
                     *         },
                     *         {
                     *           "workspaceId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a",
                     *           "globalId": "f1668d0c-828c-470c-b7d1-8c4f48cd345a:30",
                     *           "id": "30",
                     *           "name": "Word life",
                     *           "objectSchemaKey": "WL",
                     *           "status": "Ok",
                     *           "created": "2021-03-28T23:19:49.290Z",
                     *           "updated": "2021-03-28T23:19:49.299Z",
                     *           "objectCount": 0,
                     *           "objectTypeCount": 0,
                     *           "canManage": true
                     *         }
                     *       ],
                     *       "isLast": true,
                     *       "last": true
                     *     }
                     */
                    "application/json": components["schemas"]["ObjectSchemaList"];
                };
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Schema - Create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "name": "Computers",
                 *       "objectSchemaKey": "COMP",
                 *       "description": "The IT department schema"
                 *     }
                 */
                "application/json": components["schemas"]["ObjectSchemaIn"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *       "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:39",
                     *       "id": "39",
                     *       "name": "Computers",
                     *       "objectSchemaKey": "COMP",
                     *       "status": "Ok",
                     *       "description": "The IT department schema",
                     *       "created": "2021-04-20T16:21:18.908Z",
                     *       "updated": "2021-04-20T16:21:18.912Z",
                     *       "objectCount": 0,
                     *       "objectTypeCount": 0
                     *     }
                     */
                    "application/json": components["schemas"]["ObjectSchema"];
                };
            };
            400: components["responses"]["trait_badRequest_400"];
            401: components["responses"]["trait_requireAuthentication_401"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Schema - Find": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The object schema id */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *       "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:39",
                     *       "id": "39",
                     *       "name": "Computers",
                     *       "objectSchemaKey": "COMP",
                     *       "status": "Ok",
                     *       "description": "The IT department schema",
                     *       "created": "2021-04-20T16:21:18.908Z",
                     *       "updated": "2021-04-20T16:21:18.912Z",
                     *       "objectCount": 0,
                     *       "objectTypeCount": 0
                     *     }
                     */
                    "application/json": components["schemas"]["ObjectSchema"];
                };
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            404: components["responses"]["trait_notFound_404"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Schema - Update": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The object schema id */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "name": "Computers",
                 *       "objectSchemaKey": "COMP",
                 *       "description": "The IT department schema"
                 *     }
                 */
                "application/json": components["schemas"]["ObjectSchemaUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *       "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:39",
                     *       "id": "39",
                     *       "name": "Computers",
                     *       "objectSchemaKey": "COMP",
                     *       "status": "Ok",
                     *       "description": "The IT department schema",
                     *       "created": "2021-04-20T16:21:18.908Z",
                     *       "updated": "2021-04-20T16:21:18.912Z",
                     *       "objectCount": 0,
                     *       "objectTypeCount": 0
                     *     }
                     */
                    "application/json": components["schemas"]["ObjectSchema"];
                };
            };
            400: components["responses"]["trait_badRequest_400"];
            401: components["responses"]["trait_requireAuthentication_401"];
            404: components["responses"]["trait_notFound_404"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Schema - Delete": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The object schema id */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *       "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:39",
                     *       "id": "39",
                     *       "name": "Computers",
                     *       "objectSchemaKey": "COMP",
                     *       "status": "Ok",
                     *       "description": "The IT department schema",
                     *       "created": "2021-04-20T16:21:18.908Z",
                     *       "updated": "2021-04-20T16:21:18.912Z",
                     *       "objectCount": 0,
                     *       "objectTypeCount": 0
                     *     }
                     */
                    "application/json": components["schemas"]["ObjectSchema"];
                };
            };
            400: components["responses"]["trait_badRequest_400"];
            401: components["responses"]["trait_requireAuthentication_401"];
            404: components["responses"]["trait_notFound_404"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Schema - Find all attributes": {
        parameters: {
            query?: {
                /** @description Return only values that are associated with values that can be edited */
                onlyValueEditable?: boolean;
                /** @description Include the object type with each object type attribute */
                extended?: boolean;
                /** @description A query that will be used to filter object type attributes by their name */
                query?: string;
            };
            header?: never;
            path: {
                /** @description The object schema id */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ObjectTypeAttribute"][];
                };
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            404: components["responses"]["trait_notFound_404"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Schema - Find all object types": {
        parameters: {
            query?: {
                /** @description If true, filters out Abstract Object Types from the results */
                excludeAbstract?: boolean;
            };
            header?: never;
            path: {
                /** @description The object schema id */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example [
                     *       {
                     *         "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *         "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:19",
                     *         "id": "19",
                     *         "name": "Employee",
                     *         "icon": {
                     *           "id": "131",
                     *           "name": "Users",
                     *           "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/19/icon.png?size=16",
                     *           "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/19/icon.png?size=48"
                     *         },
                     *         "position": 0,
                     *         "created": "2021-02-16T18:32:38.173Z",
                     *         "updated": "2021-02-16T19:37:07.179Z",
                     *         "objectCount": 0,
                     *         "objectSchemaId": "6",
                     *         "inherited": false,
                     *         "abstractObjectType": false,
                     *         "parentObjectTypeInherited": false
                     *       },
                     *       {
                     *         "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *         "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:23",
                     *         "id": "23",
                     *         "name": "Office",
                     *         "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ex.",
                     *         "icon": {
                     *           "id": "13",
                     *           "name": "Building",
                     *           "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=16",
                     *           "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=48"
                     *         },
                     *         "position": 2,
                     *         "created": "2021-02-16T19:36:51.951Z",
                     *         "updated": "2021-04-16T15:17:03.384Z",
                     *         "objectCount": 0,
                     *         "objectSchemaId": "6",
                     *         "inherited": false,
                     *         "abstractObjectType": false,
                     *         "parentObjectTypeInherited": false
                     *       },
                     *       {
                     *         "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *         "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:24",
                     *         "id": "24",
                     *         "name": "City",
                     *         "icon": {
                     *           "id": "28",
                     *           "name": "Cottage",
                     *           "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/24/icon.png?size=16",
                     *           "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=48"
                     *         },
                     *         "position": 3,
                     *         "created": "2021-02-16T19:58:45.698Z",
                     *         "updated": "2021-04-16T15:17:03.393Z",
                     *         "objectCount": 0,
                     *         "objectSchemaId": "6",
                     *         "inherited": false,
                     *         "abstractObjectType": false,
                     *         "parentObjectTypeInherited": false
                     *       }
                     *     ]
                     */
                    "application/json": components["schemas"]["ObjectType"][];
                };
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            404: components["responses"]["trait_notFound_404"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Schema - Find all object types - flat": {
        parameters: {
            query?: {
                /** @description Object Type Names to search for */
                query?: boolean;
                /** @description Exclude objects with this name */
                exclude?: string;
                /** @description If true, the objectCount attribute is populated for each object type */
                includeObjectCounts?: boolean;
            };
            header?: never;
            path: {
                /** @description The object schema id */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example [
                     *       {
                     *         "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *         "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:19",
                     *         "id": "19",
                     *         "name": "Employee",
                     *         "icon": {
                     *           "id": "131",
                     *           "name": "Users",
                     *           "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/19/icon.png?size=16",
                     *           "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/19/icon.png?size=48"
                     *         },
                     *         "position": 0,
                     *         "created": "2021-02-16T18:32:38.173Z",
                     *         "updated": "2021-02-16T19:37:07.179Z",
                     *         "objectCount": 0,
                     *         "objectSchemaId": "6",
                     *         "inherited": false,
                     *         "abstractObjectType": false,
                     *         "parentObjectTypeInherited": false
                     *       },
                     *       {
                     *         "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *         "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:23",
                     *         "id": "23",
                     *         "name": "Office",
                     *         "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ex.",
                     *         "icon": {
                     *           "id": "13",
                     *           "name": "Building",
                     *           "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=16",
                     *           "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=48"
                     *         },
                     *         "position": 2,
                     *         "created": "2021-02-16T19:36:51.951Z",
                     *         "updated": "2021-04-16T15:17:03.384Z",
                     *         "objectCount": 0,
                     *         "objectSchemaId": "6",
                     *         "inherited": false,
                     *         "abstractObjectType": false,
                     *         "parentObjectTypeInherited": false
                     *       },
                     *       {
                     *         "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *         "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:24",
                     *         "id": "24",
                     *         "name": "City",
                     *         "icon": {
                     *           "id": "28",
                     *           "name": "Cottage",
                     *           "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/24/icon.png?size=16",
                     *           "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/objecttype/24/icon.png?size=48"
                     *         },
                     *         "position": 3,
                     *         "created": "2021-02-16T19:58:45.698Z",
                     *         "updated": "2021-04-16T15:17:03.393Z",
                     *         "objectCount": 0,
                     *         "objectSchemaId": "6",
                     *         "inherited": false,
                     *         "abstractObjectType": false,
                     *         "parentObjectTypeInherited": false
                     *       }
                     *     ]
                     */
                    "application/json": components["schemas"]["ObjectType"][];
                };
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            404: components["responses"]["trait_notFound_404"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Object Type - Find": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *       "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:23",
                     *       "id": "23",
                     *       "name": "Office",
                     *       "type": 0,
                     *       "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ex.",
                     *       "icon": {
                     *         "id": "13",
                     *         "name": "Building",
                     *         "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=16",
                     *         "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=48"
                     *       },
                     *       "position": 2,
                     *       "created": "2021-02-16T19:36:51.951Z",
                     *       "updated": "2021-04-16T15:17:03.384Z",
                     *       "objectCount": 4,
                     *       "objectSchemaId": "6",
                     *       "inherited": false,
                     *       "abstractObjectType": false,
                     *       "parentObjectTypeInherited": false
                     *     }
                     */
                    "application/json": components["schemas"]["ObjectType"];
                };
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            404: components["responses"]["trait_notFound_404"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Object Type - Update": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ObjectTypeUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *       "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:23",
                     *       "id": "23",
                     *       "name": "Office",
                     *       "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ex.",
                     *       "icon": {
                     *         "id": "13",
                     *         "name": "Building",
                     *         "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=16",
                     *         "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=48"
                     *       },
                     *       "position": 2,
                     *       "created": "2021-02-16T19:36:51.951Z",
                     *       "updated": "2021-04-16T15:17:03.384Z",
                     *       "objectCount": 4,
                     *       "objectSchemaId": "6",
                     *       "inherited": false,
                     *       "abstractObjectType": false,
                     *       "parentObjectTypeInherited": false
                     *     }
                     */
                    "application/json": components["schemas"]["ObjectType"];
                };
            };
            400: components["responses"]["trait_badRequest_400"];
            401: components["responses"]["trait_requireAuthentication_401"];
            404: components["responses"]["trait_notFound_404"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Object Type - Delete": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *       "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:23",
                     *       "id": "23",
                     *       "name": "Office",
                     *       "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ex.",
                     *       "icon": {
                     *         "id": "13",
                     *         "name": "Building",
                     *         "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=16",
                     *         "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=48"
                     *       },
                     *       "position": 2,
                     *       "created": "2021-02-16T19:36:51.951Z",
                     *       "updated": "2021-04-16T15:17:03.384Z",
                     *       "objectCount": 4,
                     *       "objectSchemaId": "6",
                     *       "inherited": false,
                     *       "abstractObjectType": false,
                     *       "parentObjectTypeInherited": false
                     *     }
                     */
                    "application/json": components["schemas"]["ObjectType"];
                };
            };
            400: components["responses"]["trait_badRequest_400"];
            401: components["responses"]["trait_requireAuthentication_401"];
            404: components["responses"]["trait_notFound_404"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Object Type - Find all attributes": {
        parameters: {
            query?: {
                onlyValueEditable?: boolean;
                orderByName?: boolean;
                query?: string;
                includeValuesExist?: boolean;
                excludeParentAttributes?: boolean;
                includeChildren?: boolean;
                orderByRequired?: boolean;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ObjectTypeAttribute"][];
                };
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            404: components["responses"]["trait_notFound_404"];
            429: components["responses"]["trait_rateLimit2000PerMinute_429"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Object Type - Change position": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "toObjectTypeId": "2",
                 *       "position": 0
                 *     }
                 */
                "application/json": components["schemas"]["ObjectTypePosition"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *       "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:23",
                     *       "id": "23",
                     *       "name": "Office",
                     *       "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ex.",
                     *       "icon": {
                     *         "id": "13",
                     *         "name": "Building",
                     *         "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=16",
                     *         "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=48"
                     *       },
                     *       "position": 2,
                     *       "created": "2021-02-16T19:36:51.951Z",
                     *       "updated": "2021-04-16T15:17:03.384Z",
                     *       "objectCount": 4,
                     *       "objectSchemaId": "6",
                     *       "inherited": false,
                     *       "abstractObjectType": false,
                     *       "parentObjectTypeInherited": false
                     *     }
                     */
                    "application/json": components["schemas"]["ObjectType"];
                };
            };
            400: components["responses"]["trait_badRequest_400"];
            401: components["responses"]["trait_requireAuthentication_401"];
            404: components["responses"]["trait_notFound_404"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Object Type - Create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "inherited": false,
                 *       "abstractObjectType": false,
                 *       "objectSchemaId": "6",
                 *       "iconId": "13",
                 *       "name": "Office",
                 *       "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ex."
                 *     }
                 */
                "application/json": components["schemas"]["ObjectTypeIn"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *       "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:23",
                     *       "id": "23",
                     *       "name": "Office",
                     *       "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ex.",
                     *       "icon": {
                     *         "id": "13",
                     *         "name": "Building",
                     *         "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=16",
                     *         "url48": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/g2778e1d-939d-581d-c8e2-9d5g59de456b/v1/objecttype/23/icon.png?size=48"
                     *       },
                     *       "position": 2,
                     *       "created": "2021-02-16T19:36:51.951Z",
                     *       "updated": "2021-04-16T15:17:03.384Z",
                     *       "objectCount": 4,
                     *       "objectSchemaId": "6",
                     *       "inherited": false,
                     *       "abstractObjectType": false,
                     *       "parentObjectTypeInherited": false
                     *     }
                     */
                    "application/json": components["schemas"]["ObjectType"];
                };
            };
            400: components["responses"]["trait_badRequest_400"];
            401: components["responses"]["trait_requireAuthentication_401"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Object Type Attribute - Create": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The object type id that has this object type attribute associated with it */
                objectTypeId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "name": "Geolocation",
                 *       "type": "0",
                 *       "defaultTypeId": "0"
                 *     }
                 */
                "application/json": components["schemas"]["ObjectTypeAttributeCreate"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *       "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:1330",
                     *       "id": "1330",
                     *       "name": "Geolocation",
                     *       "label": false,
                     *       "defaultType": {
                     *         "id": 0,
                     *         "name": "Text"
                     *       },
                     *       "editable": true,
                     *       "system": false,
                     *       "sortable": true,
                     *       "summable": false,
                     *       "indexed": true,
                     *       "minimumCardinality": 0,
                     *       "maximumCardinality": 1,
                     *       "removable": true,
                     *       "hidden": false,
                     *       "includeChildObjectTypes": false,
                     *       "uniqueAttribute": false,
                     *       "options": "",
                     *       "position": 6
                     *     }
                     */
                    "application/json": components["schemas"]["ObjectTypeAttribute"];
                };
            };
            400: components["responses"]["trait_badRequest_400"];
            401: components["responses"]["trait_requireAuthentication_401"];
            404: components["responses"]["trait_notFound_404"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Object Type Attribute - Update": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The object type attribute to manipulate */
                id: string;
                /** @description The object type id that has this object type attribute associated with it */
                objectTypeId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "description": "GPS coordinates of the office"
                 *     }
                 */
                "application/json": components["schemas"]["ObjectTypeAttributeUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *       "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:1330",
                     *       "id": "1330",
                     *       "name": "Geolocation",
                     *       "label": false,
                     *       "defaultType": {
                     *         "id": 0,
                     *         "name": "Text"
                     *       },
                     *       "editable": true,
                     *       "system": false,
                     *       "sortable": true,
                     *       "summable": false,
                     *       "indexed": true,
                     *       "minimumCardinality": 0,
                     *       "maximumCardinality": 1,
                     *       "removable": true,
                     *       "hidden": false,
                     *       "includeChildObjectTypes": false,
                     *       "uniqueAttribute": false,
                     *       "options": "",
                     *       "position": 6
                     *     }
                     */
                    "application/json": components["schemas"]["ObjectTypeAttribute"];
                };
            };
            400: components["responses"]["trait_badRequest_400"];
            401: components["responses"]["trait_requireAuthentication_401"];
            404: components["responses"]["trait_notFound_404"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Object Type Attribute - Delete": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The object type attribute id to be manipulated */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The object type attribute has been successfully deleted */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["trait_badRequest_400"];
            401: components["responses"]["trait_requireAuthentication_401"];
            404: components["responses"]["trait_notFound_404"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Progress - Import": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The id of the import source configuration that the progress should be fetched for */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "progressInPercent": 100,
                     *       "resourceId": "9fa74b56-d540-4494-b9b2-f27a9bad9e6a",
                     *       "category": "imports",
                     *       "status": "FINISHED",
                     *       "stepDescription": "Updating references on objects",
                     *       "currentStep": 6,
                     *       "numberOfSteps": 6,
                     *       "currentWorkUnits": 0,
                     *       "currentStepTotalWorkUnits": 0,
                     *       "totalWorkUnits": 0,
                     *       "result": "OK",
                     *       "resultData": {
                     *         "type": "IMPORT",
                     *         "started": "2021-04-20T13:57:52.415Z",
                     *         "ended": "2021-04-20T13:57:53.240Z",
                     *         "executedType": "MANUAL",
                     *         "executedAsUser": {
                     *           "avatarUrl": "https://avatar-management-url/6g2c42d1f6fgd2112cgc66dc/f0bfb5b7-7b3b-4ce6-98a6-bdb5825c19b4/48",
                     *           "displayName": "John Smith",
                     *           "name": "John Smith",
                     *           "key": "6g2c42d1f6fgd2112cgc66dc",
                     *           "emailAddress": "john.smith@atlassian.com",
                     *           "isDeleted": false
                     *         },
                     *         "objectSchemaId": "6",
                     *         "numberOfWorkers": 2,
                     *         "executionTimeInMs": "825",
                     *         "result": "OK",
                     *         "status": "FINISHED",
                     *         "importSourceId": "9fa74b56-d540-4494-b9b2-f27a9bad9e6a",
                     *         "populatedObjectTypes": [
                     *           "CSV Import"
                     *         ],
                     *         "moduleKey": "rlabs-import-type-csv",
                     *         "onlyExecutedForObjectTypes": [],
                     *         "objectTypeResultMap": {
                     *           "159": {
                     *             "objectTypeName": "CSV Import",
                     *             "objectTypeId": "159",
                     *             "objectsUpdated": 0,
                     *             "objectsCreated": 25,
                     *             "objectsCreatedQlQuery": "Key IN (\"ITSM-5172\",\"ITSM-5173\",\"ITSM-5174\",\"ITSM-5175\",\"ITSM-5170\",\"ITSM-5171\",\"ITSM-5169\",\"ITSM-5165\",\"ITSM-5166\",\"ITSM-5167\",\"ITSM-5168\",\"ITSM-5161\",\"ITSM-5183\",\"ITSM-5162\",\"ITSM-5184\",\"ITSM-5163\",\"ITSM-5185\",\"ITSM-5164\",\"ITSM-5180\",\"ITSM-5181\",\"ITSM-5182\",\"ITSM-5176\",\"ITSM-5177\",\"ITSM-5178\",\"ITSM-5179\")",
                     *             "objectsIdentical": 0,
                     *             "objectsMissingUpdated": 0,
                     *             "objectsMissingDeleted": 0,
                     *             "entriesInSource": 25,
                     *             "duplicateEnries": 0,
                     *             "emptyLabelEntries": 0,
                     *             "emptyExternalIdEntries": 0,
                     *             "objectsFilteredWithQlQuery": 0,
                     *             "readExternalDataTimeInMs": 1,
                     *             "writeInsightDataTimeInMs": 1561,
                     *             "postFunctionTimeInMs": 0,
                     *             "mapExternalDataTimeInMs": 0,
                     *             "qlQueryFilteringTimeInMs": 0,
                     *             "decidingActionsTimeInMs": 0,
                     *             "executionTimeInMs": 1562,
                     *             "objectsWithUpdatedReferences": 0,
                     *             "errorCount": 0
                     *           }
                     *         },
                     *         "updateReferencesTimeInMs": 1,
                     *         "errorCount": 0
                     *       },
                     *       "resultMessage": "Import finished ok.",
                     *       "actor": "6g2c42d1f6fgd2112cgc66dc",
                     *       "startDate": "2021-04-20T13:57:52.404Z",
                     *       "finishedDate": "2021-04-20T13:57:53.247Z",
                     *       "executionUUID": "b36ebb89-4a75-4df3-9101-f40d2771db32"
                     *     }
                     */
                    "application/json": components["schemas"]["Progress"];
                };
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Status - List": {
        parameters: {
            query?: {
                /** @description Include statuses for the object schema id. If supplied statuses for the object schema will be returned otherwise all global will be returned */
                objectSchemaId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Status"][];
                };
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Status - Create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "name": "Decommissioned",
                 *       "category": 0,
                 *       "objectSchemaId": "6"
                 *     }
                 */
                "application/json": components["schemas"]["StatusIn"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *       "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:58",
                     *       "id": "58",
                     *       "name": "Decommissioned",
                     *       "category": 0,
                     *       "objectSchemaId": "6"
                     *     }
                     */
                    "application/json": components["schemas"]["Status"];
                };
            };
            400: components["responses"]["trait_badRequest_400"];
            401: components["responses"]["trait_requireAuthentication_401"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Status - Find": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Status type id */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *       "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:58",
                     *       "id": "58",
                     *       "name": "Decommissioned",
                     *       "category": 0,
                     *       "objectSchemaId": "6"
                     *     }
                     */
                    "application/json": components["schemas"]["Status"];
                };
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            404: components["responses"]["trait_notFound_404"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Status - Update": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Status type id */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "name": "Decommissioned",
                 *       "category": 0,
                 *       "objectSchemaId": "6"
                 *     }
                 */
                "application/json": components["schemas"]["StatusIn"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "workspaceId": "g2778e1d-939d-581d-c8e2-9d5g59de456b",
                     *       "globalId": "g2778e1d-939d-581d-c8e2-9d5g59de456b:58",
                     *       "id": "58",
                     *       "name": "Decommissioned",
                     *       "category": 0,
                     *       "objectSchemaId": "6"
                     *     }
                     */
                    "application/json": components["schemas"]["Status"];
                };
            };
            400: components["responses"]["trait_badRequest_400"];
            401: components["responses"]["trait_requireAuthentication_401"];
            404: components["responses"]["trait_notFound_404"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "Status - Delete": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Status type id */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The status has been successfully deleted */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["trait_badRequest_400"];
            401: components["responses"]["trait_requireAuthentication_401"];
            404: components["responses"]["trait_notFound_404"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "ReferenceType - List": {
        parameters: {
            query?: {
                /** @description Include reference types for the object schema id. If supplied reference types for the object schema will be returned otherwise all global will be returned */
                objectSchemaId?: string;
                /** @description Include all reference types. Defaults to false */
                includeAll?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReferenceType"][];
                };
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "ReferenceType - Create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "name": "Depends on",
                 *       "description": "",
                 *       "color": "42526E",
                 *       "objectSchemaId": "27"
                 *     }
                 */
                "application/json": components["schemas"]["ReferenceTypeIn"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "id": "36",
                     *       "name": "Depends on",
                     *       "description": "",
                     *       "color": "42526E",
                     *       "url16": "https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/f1668d0c-828c-470c-b7d1-8c4f48cd345a/v1/config/referencetype/36/image.png?size=16",
                     *       "removable": true,
                     *       "objectSchemaId": "27"
                     *     }
                     */
                    "application/json": components["schemas"]["ReferenceType"];
                };
            };
            400: components["responses"]["trait_badRequest_400"];
            401: components["responses"]["trait_requireAuthentication_401"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "General Configuration - Get": {
        parameters: {
            query?: never;
            header?: {
                /** @description Indicates whether the tenant is HIPAA-enabled */
                "X-Hipaa-Status"?: boolean;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GlobalConfiguration"];
                };
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "General Configuration - Get for object schema": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The object schema id to retrieve configuration for */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GlobalConfiguration"];
                };
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            404: components["responses"]["trait_notFound_404"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    "General Configuration - Update": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Object schema id */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "allowOtherObjectSchema": true,
                 *       "validateQuickCreate": true,
                 *       "quickCreateObjects": true
                 *     }
                 */
                "application/json": components["schemas"]["GlobalConfigurationIn"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["trait_badRequest_400"];
            401: components["responses"]["trait_requireAuthentication_401"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    createImportSchedule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The ID of the import source to schedule */
                importSourceId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ImportScheduleRequest"];
            };
        };
        responses: {
            /** @description Import schedule created successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImportScheduleResponse"];
                };
            };
            /** @description Invalid schedule configuration (e.g., schedule already exists, invalid date format, unsupported import source type) */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            /** @description Forbidden - Insufficient permissions to create schedule */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Import source not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    getImportSchedule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The ID of the import source */
                importSourceId: string;
                /** @description The ID of the import schedule */
                importScheduleId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Import schedule retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImportScheduleResponse"];
                };
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            /** @description Import source or schedule not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    updateImportSchedule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The ID of the import source */
                importSourceId: string;
                /** @description The ID of the import schedule to update */
                importScheduleId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ImportScheduleRequest"];
            };
        };
        responses: {
            /** @description Import schedule updated successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImportScheduleResponse"];
                };
            };
            /** @description Invalid schedule configuration */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            /** @description Import source or schedule not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    deleteImportSchedule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The ID of the import source */
                importSourceId: string;
                /** @description The ID of the import schedule to delete */
                importScheduleId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Import schedule deleted successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            /** @description Import source or schedule not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
    getTenantUsageInfo: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Tenant usage data retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TenantUsageResponse"];
                };
            };
            401: components["responses"]["trait_requireAuthentication_401"];
            403: components["responses"]["trait_requirePermission_403"];
            500: components["responses"]["trait_internalServerError_500"];
        };
    };
}
