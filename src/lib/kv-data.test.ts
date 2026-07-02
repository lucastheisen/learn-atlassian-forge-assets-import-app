import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { type GetOptions, kvs } from "@forge/kvs";
import type { ImportManifest } from "./kv-data";
import { getData, getLatestManifest, getLatestTestManifest, prune } from "./kv-data";
import { deleteAllValues, getAllValues, iterateAllValues } from "./kv-common";
import { DataAccessError } from "./errors";

vi.mock("@forge/kvs", () => ({
  kvs: {
    get: vi.fn(),
  },
}));

vi.mock("./kv-common", () => ({
  deleteAllValues: vi.fn(),
  getAllValues: vi.fn(),
  iterateAllValues: vi.fn(),
}));

const asAsyncGenerator = async function* <T>(values: T[]): AsyncGenerator<T> {
  for (const value of values) {
    yield value;
  }
};

const manifest = (
  timestamp: string,
  data: { key: string }[] = [],
  totals = { keys: data.length, records: data.length * 10 },
  testing = false,
): ImportManifest => ({
  uploadId: "upload-id",
  testing,
  data,
  timestamp,
  totals,
});

describe("kv-data", () => {
  const getMock = vi.mocked(kvs.get) as unknown as Mock<
    (key: string, options?: GetOptions) => Promise<unknown>
  >;

  const getAllValuesMock = vi.mocked(getAllValues) as unknown as Mock<
    (prefix: string) => Promise<{ key: string; value: ImportManifest }[]>
  >;

  const deleteAllValuesMock = vi.mocked(deleteAllValues);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getData", () => {
    it("returns undefined when the manifest does not have data at the requested index", async () => {
      const result = await getData(
        {
          uploadId: "upload-id",
          testing: false,
          data: [],
          timestamp: "2024-01-01T00:00:00.000Z",
          totals: { keys: 0, records: 0 },
        },
        0,
      );

      expect(result).toBeUndefined();
      expect(kvs.get).not.toHaveBeenCalled();
    });

    it("loads data for the requested manifest index", async () => {
      getMock.mockResolvedValueOnce({
        users: [{ email: "smoke-user-001@example.invalid" }],
      });

      const result = await getData(
        {
          uploadId: "upload-id",
          testing: false,
          data: [{ key: "import:data:2024-01-01T00:00:00.000Z:000001" }],
          timestamp: "2024-01-01T00:00:00.000Z",
          totals: { keys: 1, records: 1 },
        },
        0,
      );

      expect(kvs.get).toHaveBeenCalledOnce();
      expect(kvs.get).toHaveBeenCalledWith("import:data:2024-01-01T00:00:00.000Z:000001");
      expect(result).toEqual({
        users: [{ email: "smoke-user-001@example.invalid" }],
      });
    });

    it("wraps kvs.get failures in getData as DataAccessError", async () => {
      getMock.mockRejectedValueOnce(new Error("boom"));

      const promise = getData(
        {
          uploadId: "upload-id",
          testing: false,
          data: [{ key: "import:data:2024-01-01T00:00:00.000Z:000001" }],
          timestamp: "2024-01-01T00:00:00.000Z",
          totals: { keys: 1, records: 10 },
        },
        0,
      );

      await expect(promise).rejects.toBeInstanceOf(DataAccessError);
      await expect(promise).rejects.toMatchObject({
        code: "KVS_GET_IMPORT_DATA_FAILED",
      });
    });
  });

  describe("getLatestManifest", () => {
    it("returns undefined when no manifests exist", async () => {
      vi.mocked(iterateAllValues).mockReturnValue(asAsyncGenerator([]));

      const result = await getLatestManifest();

      expect(result).toBeUndefined();
      expect(iterateAllValues).toHaveBeenCalledOnce();
      expect(iterateAllValues).toHaveBeenCalledWith("import:manifest:");
    });

    it("returns the most recent manifest", async () => {
      const older = manifest(
        "2024-01-01T00:00:00.000Z",
        [{ key: "old" }],
        { keys: 1, records: 10 },
      );

      const newer = manifest(
        "2024-02-01T00:00:00.000Z",
        [{ key: "new" }, { key: "new2" }],
        { keys: 2, records: 20 },
      );

      vi.mocked(iterateAllValues).mockReturnValue(
        asAsyncGenerator([
          { key: "import:manifest:2024-01-01T00:00:00.000Z:manifest", value: older },
          { key: "import:manifest:2024-02-01T00:00:00.000Z:manifest", value: newer },
        ]),
      );

      const result = await getLatestManifest();

      expect(result).toEqual(newer);
      expect(iterateAllValues).toHaveBeenCalledOnce();
      expect(iterateAllValues).toHaveBeenCalledWith("import:manifest:");
    });

    it("returns the newest manifest even when yielded out of order", async () => {
      const oldest = manifest(
        "2024-01-01T00:00:00.000Z",
        [{ key: "oldest" }],
        { keys: 1, records: 10 },
      );

      const middle = manifest(
        "2024-02-01T00:00:00.000Z",
        [{ key: "middle" }],
        { keys: 1, records: 20 },
      );

      const newest = manifest(
        "2024-03-01T00:00:00.000Z",
        [{ key: "newest" }, { key: "newest2" }],
        { keys: 2, records: 30 },
      );

      vi.mocked(iterateAllValues).mockReturnValue(
        asAsyncGenerator([
          { key: "import:manifest:2024-02-01T00:00:00.000Z:manifest", value: middle },
          { key: "import:manifest:2024-01-01T00:00:00.000Z:manifest", value: oldest },
          { key: "import:manifest:2024-03-01T00:00:00.000Z:manifest", value: newest },
        ]),
      );

      const result = await getLatestManifest();

      expect(result).toEqual(newest);
      expect(iterateAllValues).toHaveBeenCalledOnce();
      expect(iterateAllValues).toHaveBeenCalledWith("import:manifest:");
    });
  });

  describe("getLatestTestManifest", () => {
    it("scans the test-manifest prefix instead of the production prefix", async () => {
      const testManifest = manifest(
        "2024-01-01T00:00:00.000Z",
        [{ key: "smoke" }],
        { keys: 1, records: 1 },
        true,
      );

      vi.mocked(iterateAllValues).mockReturnValue(
        asAsyncGenerator([
          { key: "import:test-manifest:2024-01-01T00:00:00.000Z:manifest", value: testManifest },
        ]),
      );

      const result = await getLatestTestManifest();

      expect(result).toEqual(testManifest);
      expect(iterateAllValues).toHaveBeenCalledOnce();
      expect(iterateAllValues).toHaveBeenCalledWith("import:test-manifest:");
    });
  });

  describe("prune", () => {
    it("defaults to pruning the production manifest prefix", async () => {
      getAllValuesMock.mockResolvedValueOnce([]);

      await prune(0);

      expect(getAllValues).toHaveBeenCalledWith("import:manifest:");
      expect(deleteAllValues).not.toHaveBeenCalled();
    });

    it("prunes the test-manifest prefix when testing is true", async () => {
      const older = manifest(
        "2024-01-01T00:00:00.000Z",
        [{ key: "old-data" }],
        { keys: 1, records: 10 },
        true,
      );
      const newer = manifest(
        "2024-02-01T00:00:00.000Z",
        [{ key: "new-data" }],
        { keys: 1, records: 10 },
        true,
      );

      getAllValuesMock.mockResolvedValueOnce([
        { key: "import:test-manifest:2024-01-01T00:00:00.000Z:manifest", value: older },
        { key: "import:test-manifest:2024-02-01T00:00:00.000Z:manifest", value: newer },
      ]);
      deleteAllValuesMock.mockResolvedValue({ successfulKeys: [], failedKeys: [] });

      await prune(0, true);

      expect(getAllValues).toHaveBeenCalledWith("import:test-manifest:");
      expect(deleteAllValues).toHaveBeenCalledWith([
        "import:test-manifest:2024-02-01T00:00:00.000Z:manifest",
        "new-data",
        "import:test-manifest:2024-01-01T00:00:00.000Z:manifest",
        "old-data",
      ]);
    });
  });
});
