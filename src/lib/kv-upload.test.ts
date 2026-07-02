import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { type GetOptions, kvs, type Result } from "@forge/kvs";
import { deleteAllValues, getAllValues } from "./kv-common";
import {
  writeUploadComplete,
  writeUploadData,
  writeUploadNew,
} from "./kv-upload";
import {
  ArgumentError,
  DataAccessError,
  InvalidOperationError,
} from "./errors";

interface UploadManifest {
  uploadId: string;
  timestamp: string;
  testing: boolean;
}

interface UploadDataManifest {
  index: number;
  key: string;
  count: number;
}

interface ImportManifest {
  uploadId: string;
  testing: boolean;
  timestamp: string;
  data: UploadDataManifest[];
  totals: {
    keys: number;
    records: number;
  };
}

vi.mock("@forge/kvs", () => ({
  kvs: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock("./kv-common", () => ({
  deleteAllValues: vi.fn(),
  getAllValues: vi.fn(),
}));

describe("kv-upload", () => {
  const getMock = vi.mocked(kvs.get) as unknown as Mock<
    (key: string, options?: GetOptions) => Promise<unknown>
  >;

  const getAllValuesMock = vi.mocked(getAllValues) as unknown as Mock<
    (prefix: string) => Promise<unknown[]>
  >;

  const setMock = vi.mocked(kvs.set);
  const deleteAllValuesMock = vi.mocked(deleteAllValues);

  const mockGetUploadManifestOnce = (value: UploadManifest | undefined) =>
    getMock.mockResolvedValueOnce(value);

  const mockGetImportManifestOnce = (value: ImportManifest | undefined) =>
    getMock.mockResolvedValueOnce(value);

  const mockGetAllUploadDataOnce = (value: Result<UploadDataManifest>[]) =>
    getAllValuesMock.mockResolvedValueOnce(value);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-08T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("writeUploadComplete", () => {
    it("fails if upload does not exist", async () => {
      mockGetUploadManifestOnce(undefined);

      const promise = writeUploadComplete("upload-123");

      await expect(promise).rejects.toBeInstanceOf(InvalidOperationError);
      await expect(promise).rejects.toMatchObject({
        code: "UPLOAD_NOT_FOUND",
      });

      expect(getAllValues).not.toHaveBeenCalled();
      expect(kvs.set).not.toHaveBeenCalled();
    });

    it("returns the existing import manifest if already completed", async () => {
      const existingManifest: ImportManifest = {
        uploadId: "upload-123",
        testing: false,
        timestamp: "2026-06-08T12:00:00.000Z",
        data: [
          { index: 1, key: "import:data:2026-06-08T12:00:00.000Z:000001", count: 2 },
        ],
        totals: {
          keys: 1,
          records: 2,
        },
      };

      mockGetUploadManifestOnce({
        uploadId: "upload-123",
        timestamp: "2026-06-08T12:00:00.000Z",
        testing: false,
      });
      mockGetImportManifestOnce(existingManifest);

      const result = await writeUploadComplete("upload-123");

      expect(result).toStrictEqual(existingManifest);
      expect(getAllValues).not.toHaveBeenCalled();
      expect(kvs.set).not.toHaveBeenCalled();
      expect(deleteAllValues).not.toHaveBeenCalled();
    });

    it("builds a manifest, sorts chunks, computes totals, and deletes temporary keys", async () => {
      mockGetUploadManifestOnce({
        uploadId: "upload-123",
        timestamp: "2026-06-08T12:00:00.000Z",
        testing: false,
      });
      mockGetImportManifestOnce(undefined);

      mockGetAllUploadDataOnce([
        {
          key: "import:upload:upload-123:data:000002",
          value: {
            index: 2,
            key: "import:data:2026-06-08T12:00:00.000Z:000002",
            count: 4,
          },
        },
        {
          key: "import:upload:upload-123:data:000001",
          value: {
            index: 1,
            key: "import:data:2026-06-08T12:00:00.000Z:000001",
            count: 2,
          },
        },
      ]);

      setMock.mockResolvedValue(undefined);
      deleteAllValuesMock.mockResolvedValue({
        successfulKeys: [],
        failedKeys: [],
      });

      const result = await writeUploadComplete("upload-123");

      expect(getAllValues).toHaveBeenCalledOnce();
      expect(getAllValues).toHaveBeenCalledWith("import:upload:upload-123:data:");

      expect(result).toStrictEqual({
        uploadId: "upload-123",
        testing: false,
        timestamp: "2026-06-08T12:00:00.000Z",
        data: [
          {
            index: 1,
            key: "import:data:2026-06-08T12:00:00.000Z:000001",
            count: 2,
          },
          {
            index: 2,
            key: "import:data:2026-06-08T12:00:00.000Z:000002",
            count: 4,
          },
        ],
        totals: {
          keys: 2,
          records: 6,
        },
      });

      expect(kvs.set).toHaveBeenCalledOnce();
      expect(kvs.set).toHaveBeenCalledWith(
        "import:manifest:2026-06-08T12:00:00.000Z:manifest",
        {
          uploadId: "upload-123",
          testing: false,
          timestamp: "2026-06-08T12:00:00.000Z",
          data: [
            {
              index: 1,
              key: "import:data:2026-06-08T12:00:00.000Z:000001",
              count: 2,
            },
            {
              index: 2,
              key: "import:data:2026-06-08T12:00:00.000Z:000002",
              count: 4,
            },
          ],
          totals: {
            keys: 2,
            records: 6,
          },
        },
        {
          keyPolicy: "FAIL_IF_EXISTS",
          ttl: {
            unit: "DAYS",
            value: 7,
          },
        },
      );

      expect(deleteAllValues).toHaveBeenCalledOnce();
      expect(deleteAllValues).toHaveBeenCalledWith([
        "import:upload:upload-123:data:000001",
        "import:upload:upload-123:data:000002",
        "import:upload:upload-123:manifest",
      ]);
    });

    it("routes testing uploads to the test-manifest keyspace", async () => {
      mockGetUploadManifestOnce({
        uploadId: "upload-123",
        timestamp: "2026-06-08T12:00:00.000Z",
        testing: true,
      });
      mockGetImportManifestOnce(undefined);

      mockGetAllUploadDataOnce([]);

      setMock.mockResolvedValue(undefined);
      deleteAllValuesMock.mockResolvedValue({
        successfulKeys: [],
        failedKeys: [],
      });

      await writeUploadComplete("upload-123");

      expect(kvs.set).toHaveBeenCalledOnce();
      expect(kvs.set).toHaveBeenCalledWith(
        "import:test-manifest:2026-06-08T12:00:00.000Z:manifest",
        expect.objectContaining({ testing: true }),
        expect.anything(),
      );
    });

    it("fails if cleanup after completion reports failed keys", async () => {
      mockGetUploadManifestOnce({
        uploadId: "upload-123",
        timestamp: "2026-06-08T12:00:00.000Z",
        testing: false,
      });
      mockGetImportManifestOnce(undefined);

      mockGetAllUploadDataOnce([
        {
          key: "import:upload:upload-123:data:000001",
          value: {
            index: 1,
            key: "import:data:2026-06-08T12:00:00.000Z:000001",
            count: 2,
          },
        },
      ]);

      setMock.mockResolvedValue(undefined);
      deleteAllValuesMock.mockResolvedValue({
        successfulKeys: [],
        failedKeys: [
          {
            key: "import:upload:upload-123:manifest",
            error: {
              code: "DELETE_FAILED",
              message: "nope",
            },
          },
        ],
      });

      const promise = writeUploadComplete("upload-123");

      await expect(promise).rejects.toBeInstanceOf(DataAccessError);
      await expect(promise).rejects.toMatchObject({
        code: "KVS_DELETE_FAILED",
      });
    });
  });

  describe("writeUploadData", () => {
    it("rejects payloads with more than one top-level key", async () => {
      const promise = writeUploadData("upload-123", 1, {
        users: [],
        groups: [],
      });

      await expect(promise).rejects.toBeInstanceOf(ArgumentError);
      await expect(promise).rejects.toMatchObject({
        code: "UPLOAD_DATA_INVALID_TOP_LEVEL_KEYS",
      });

      expect(kvs.get).not.toHaveBeenCalled();
      expect(kvs.set).not.toHaveBeenCalled();
    });

    it("rejects payloads whose top-level value is not an array", async () => {
      const promise = writeUploadData("upload-123", 1, {
        users: {},
      });

      await expect(promise).rejects.toBeInstanceOf(ArgumentError);
      await expect(promise).rejects.toMatchObject({
        code: "UPLOAD_DATA_TOP_LEVEL_VALUE_NOT_ARRAY",
      });

      expect(kvs.get).not.toHaveBeenCalled();
      expect(kvs.set).not.toHaveBeenCalled();
    });

    it("fails if upload does not exist", async () => {
      mockGetUploadManifestOnce(undefined);

      const promise = writeUploadData("upload-123", 1, {
        users: [{ id: 1 }],
      });

      await expect(promise).rejects.toBeInstanceOf(InvalidOperationError);
      await expect(promise).rejects.toMatchObject({
        code: "UPLOAD_NOT_FOUND",
      });

      expect(kvs.get).toHaveBeenCalledOnce();
      expect(kvs.get).toHaveBeenCalledWith("import:upload:upload-123:manifest");
      expect(kvs.set).not.toHaveBeenCalled();
    });

    it("fails if upload is already completed", async () => {
      mockGetUploadManifestOnce({
        uploadId: "upload-123",
        timestamp: "2026-06-08T12:00:00.000Z",
        testing: false,
      });

      mockGetImportManifestOnce({
        uploadId: "upload-123",
        testing: false,
        timestamp: "2026-06-08T12:00:00.000Z",
        data: [],
        totals: { keys: 0, records: 0 },
      });

      const promise = writeUploadData("upload-123", 1, {
        users: [{ id: 1 }],
      });

      await expect(promise).rejects.toBeInstanceOf(InvalidOperationError);
      await expect(promise).rejects.toMatchObject({
        code: "UPLOAD_ALREADY_COMPLETED",
      });

      expect(kvs.set).not.toHaveBeenCalled();
    });

    it("checks the test-manifest key for testing uploads", async () => {
      mockGetUploadManifestOnce({
        uploadId: "upload-123",
        timestamp: "2026-06-08T12:00:00.000Z",
        testing: true,
      });
      mockGetImportManifestOnce(undefined);

      setMock.mockResolvedValue(undefined);

      await writeUploadData("upload-123", 0, { users: [{ id: 1 }] });

      expect(kvs.get).toHaveBeenNthCalledWith(
        2,
        "import:test-manifest:2026-06-08T12:00:00.000Z:manifest",
      );
    });

    it("writes data and metadata for a valid upload chunk", async () => {
      mockGetUploadManifestOnce({
        uploadId: "upload-123",
        timestamp: "2026-06-08T12:00:00.000Z",
        testing: false,
      });
      mockGetImportManifestOnce(undefined);

      setMock.mockResolvedValue(undefined);

      const result = await writeUploadData("upload-123", 7, {
        users: [{ id: 1 }, { id: 2 }, { id: 3 }],
      });

      expect(result).toStrictEqual({
        index: 7,
        key: "import:data:2026-06-08T12:00:00.000Z:000007",
        count: 3,
      });

      expect(kvs.set).toHaveBeenCalledTimes(2);
      expect(kvs.set).toHaveBeenNthCalledWith(
        1,
        "import:data:2026-06-08T12:00:00.000Z:000007",
        {
          users: [{ id: 1 }, { id: 2 }, { id: 3 }],
        },
        {
          keyPolicy: "OVERRIDE",
          ttl: {
            unit: "DAYS",
            value: 7,
          },
        },
      );

      expect(kvs.set).toHaveBeenNthCalledWith(
        2,
        "import:upload:upload-123:data:000007",
        {
          index: 7,
          key: "import:data:2026-06-08T12:00:00.000Z:000007",
          count: 3,
        },
        {
          keyPolicy: "OVERRIDE",
          ttl: {
            unit: "HOURS",
            value: 4,
          },
        },
      );
    });
  });

  describe("writeUploadNew", () => {
    it("writes a new upload manifest with a timestamp", async () => {
      setMock.mockResolvedValue(undefined);

      const result = await writeUploadNew("upload-123");

      expect(result).toStrictEqual({
        uploadId: "upload-123",
        timestamp: "2026-06-08T12:00:00.000Z",
        testing: false,
      });

      expect(kvs.set).toHaveBeenCalledOnce();
      expect(kvs.set).toHaveBeenCalledWith(
        "import:upload:upload-123:manifest",
        {
          uploadId: "upload-123",
          timestamp: "2026-06-08T12:00:00.000Z",
          testing: false,
        },
        {
          keyPolicy: "FAIL_IF_EXISTS",
          ttl: {
            unit: "HOURS",
            value: 4,
          },
        },
      );
    });

    it("writes a testing upload manifest when testing is true", async () => {
      setMock.mockResolvedValue(undefined);

      const result = await writeUploadNew("upload-123", true);

      expect(result).toStrictEqual({
        uploadId: "upload-123",
        timestamp: "2026-06-08T12:00:00.000Z",
        testing: true,
      });

      expect(kvs.set).toHaveBeenCalledWith(
        "import:upload:upload-123:manifest",
        expect.objectContaining({ testing: true }),
        expect.anything(),
      );
    });

    it("maps kvs.set failures to DataAccessError", async () => {
      setMock.mockRejectedValueOnce(new Error("kvs down"));

      const promise = writeUploadNew("upload-123");

      await expect(promise).rejects.toBeInstanceOf(DataAccessError);
      await expect(promise).rejects.toMatchObject({
        code: "KVS_SET_FAILED",
      });
    });
  });
});
