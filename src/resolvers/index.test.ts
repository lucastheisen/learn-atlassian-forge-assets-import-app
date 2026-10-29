import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AtlassianJSMInsightImportsSchemaAndMappingDefinition } from "../lib/assets-schema-and-mapping";
import { ConfigSchema, defaultConfig } from "../lib/config";
import {
  getSchemaAndMapping,
  setSchemaAndMapping,
} from "../lib/schema-mapping";
import { handler } from "./index";

vi.mock("../lib/import-lifecycle", () => ({
  cancelImports: vi.fn(),
  requestImport: vi.fn(),
}));

vi.mock("../lib/kv-data", () => ({ getLatestManifest: vi.fn() }));

vi.mock("../lib/schema-mapping", async (original) => ({
  ...(await original<typeof import("../lib/schema-mapping")>()),
  getSchemaAndMapping: vi.fn(),
  setSchemaAndMapping: vi.fn(),
}));

const context = {
  extension: { importId: "source", workspaceId: "workspace" },
};

const schema: AtlassianJSMInsightImportsSchemaAndMappingDefinition = {
  mapping: { objectTypeMappings: [] },
  schema: {
    objectSchema: {
      description: "User imports",
      name: "Users",
      objectTypes: [
        {
          attributes: [],
          description: "Imported user",
          externalId: "user-type",
          name: "User",
        },
      ],
    },
  },
};

beforeEach(() => {
  vi.mocked(getSchemaAndMapping).mockReset().mockResolvedValue(schema);
  vi.mocked(setSchemaAndMapping).mockReset().mockResolvedValue(undefined);
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getConfig", () => {
  it("returns the current native mapping with shared tuning defaults", async () => {
    const config = ConfigSchema.parse(
      await handler({ call: { functionKey: "getConfig" }, context }),
    );
    expect(JSON.parse(config.mapping)).toEqual([
      { attributeMap: {}, objectTypeName: "User", selector: null },
    ]);
    expect(config.tuning).toEqual(defaultConfig.tuning);
    expect(getSchemaAndMapping).toHaveBeenCalledWith("workspace", "source");
  });
});

describe("setConfig", () => {
  it("continues saving mapping-only requests", async () => {
    await expect(
      handler({
        call: { functionKey: "setConfig", payload: { mapping: "[]" } },
        context,
      }),
    ).resolves.toEqual({ ok: true });
    expect(setSchemaAndMapping).toHaveBeenCalledWith(
      "workspace",
      "source",
      schema,
    );
  });

  it("keeps tuning out of the native mapping update", async () => {
    await handler({
      call: {
        functionKey: "setConfig",
        payload: {
          mapping: "[]",
          tuning: { ...defaultConfig.tuning, referenceItems: 1000 },
        },
      },
      context,
    });
    expect(setSchemaAndMapping).toHaveBeenCalledWith(
      "workspace",
      "source",
      schema,
    );
    const config = ConfigSchema.parse(
      await handler({ call: { functionKey: "getConfig" }, context }),
    );
    expect(config.tuning).toEqual(defaultConfig.tuning);
  });
});
