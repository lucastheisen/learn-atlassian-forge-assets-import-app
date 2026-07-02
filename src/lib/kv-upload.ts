import { kvs, PolicySetOptions } from "@forge/kvs";
import { deleteAllValues, getAllValues } from "./kv-common";
import { ArgumentError, DataAccessError, InvalidOperationError } from "./errors";
import { type ImportManifest, importManifestKey } from "./kv-data";

// CODE_REVIEW_CATCH_ME: need to add error handling for kvs calls, i think they throw
// ForgeKvsError or ForgeKvsAPIError (probably the later which allows discrimination)
interface UploadDataManifest {
  index: number;
  key: string;
  count: number;
}

interface UploadManifest {
  uploadId: string;
  timestamp: string;
  testing: boolean;
}

type UploadData = Record<string, unknown>;

const countRecords = (data: UploadData): number => {
  const entries = Object.entries(data);
  if (entries.length !== 1) {
    throw new ArgumentError(
      "UPLOAD_DATA_INVALID_TOP_LEVEL_KEYS",
      "Upload data must contain exactly one top-level key",
      {
        details: {
          topLevelKeys: entries.map(([key]) => key),
        },
      },
    );
  }

  const entry = entries[0];
  if (entry === undefined) {
    throw new ArgumentError(
      "UPLOAD_DATA_INVALID_TOP_LEVEL_KEYS",
      "Upload data must contain exactly one top-level key",
    );
  }

  const [, value] = entry;
  if (!Array.isArray(value)) {
    throw new ArgumentError(
      "UPLOAD_DATA_TOP_LEVEL_VALUE_NOT_ARRAY",
      "Upload data top-level value must be an array",
      {
        details: {
          topLevelKey: entry[0],
        },
      },
    );
  }

  return value.length;
};

const importDataKey = (timestamp: string, index: number) =>
  `import:data:${timestamp}:${padIndex(index)}`;

const padIndex = (index: number) => String(index).padStart(6, "0");

const uploadKeyPrefix = (uploadId: string) => `import:upload:${uploadId}:`;

const uploadDataManifestKeyPrefix = (uploadId: string) => `${uploadKeyPrefix(uploadId)}data:`;

const uploadDataManifestKey = (uploadId: string, index: number) =>
  `${uploadDataManifestKeyPrefix(uploadId)}${padIndex(index)}`;

const uploadManifestKey = (uploadId: string) => `import:upload:${uploadId}:manifest`;

async function getValue<T>(key: string, operation: string): Promise<T | undefined> {
  try {
    return await kvs.get<T>(key);
  } catch (err) {
    throw new DataAccessError(
      "KVS_GET_FAILED",
      `Failed to ${operation}`,
      {
        cause: err,
        details: { key },
      },
    );
  }
}

async function setValue<T>(
  key: string,
  value: T,
  options: PolicySetOptions,
  operation: string,
): Promise<void> {
  try {
    await kvs.set(key, value, options);
  } catch (err) {
    throw new DataAccessError(
      "KVS_SET_FAILED",
      `Failed to ${operation}`,
      {
        cause: err,
        details: { key },
      },
    );
  }
}

export const writeUploadComplete = async (
  uploadId: string,
): Promise<ImportManifest> => {
  const uploadKey = uploadManifestKey(uploadId);
  const upload = await getValue<UploadManifest>(uploadKey, "read upload manifest");

  if (!upload) {
    throw new InvalidOperationError(
      "UPLOAD_NOT_FOUND",
      `Upload not found: ${uploadId}`,
      {
        details: { uploadId },
      },
    );
  }

  const importKey = importManifestKey(upload.timestamp, upload.testing);

  const existing = await getValue<ImportManifest>(importKey, "read import manifest");
  if (existing) {
    return existing;
  }

  const uploadData = (await getAllValues<UploadDataManifest>(uploadDataManifestKeyPrefix(uploadId)))
    .sort((a, b) => a.value.index - b.value.index);

  const manifest: ImportManifest = {
    uploadId,
    testing: upload.testing,
    timestamp: upload.timestamp,
    data: uploadData.map((k) => k.value),
    totals: {
      keys: uploadData.length,
      records: uploadData.reduce((sum, item) => sum + item.value.count, 0),
    },
  };

  await setValue(
    importKey,
    manifest,
    {
      keyPolicy: "FAIL_IF_EXISTS",
      ttl: {
        unit: "DAYS",
        value: 7,
      },
    },
    "persist completed import manifest",
  );

  const deleteResult = await deleteAllValues([...uploadData.map(({ key }) => key), uploadKey]);
  if (deleteResult.failedKeys.length > 0) {
    throw new DataAccessError(
      "KVS_DELETE_FAILED",
      "Failed to clean up upload staging keys after completing upload",
      {
        details: {
          uploadId,
          failedKeys: deleteResult.failedKeys,
        },
      },
    );
  }

  return manifest;
};

export const writeUploadData = async (
  uploadId: string,
  index: number,
  data: UploadData,
): Promise<UploadDataManifest> => {
  // do count right away because it performs some validations.
  const count = countRecords(data);

  const upload = await getValue<UploadManifest>(
    uploadManifestKey(uploadId),
    "read upload manifest",
  );

  if (!upload) {
    throw new InvalidOperationError(
      "UPLOAD_NOT_FOUND",
      `Upload not found: ${uploadId}`,
      {
        details: { uploadId },
      },
    );
  }

  const importManifest = await getValue(
    importManifestKey(upload.timestamp, upload.testing),
    "read import manifest",
  );
  if (importManifest !== undefined) {
    throw new InvalidOperationError(
      "UPLOAD_ALREADY_COMPLETED",
      `Upload already completed: ${uploadId}`,
      {
        details: { uploadId, timestamp: upload.timestamp },
      },
    );
  }

  const dataKey = importDataKey(upload.timestamp, index);
  await setValue(
    dataKey,
    data,
    {
      keyPolicy: "OVERRIDE",
      ttl: {
        unit: "DAYS",
        value: 7,
      },
    },
    "persist upload data chunk",
  );

  const meta: UploadDataManifest = {
    index,
    key: dataKey,
    count: count,
  };

  const metaKey = uploadDataManifestKey(uploadId, index);
  await setValue(
    metaKey,
    meta,
    {
      keyPolicy: "OVERRIDE",
      ttl: {
        unit: "HOURS",
        value: 4,
      },
    },
    "persist upload data chunk metadata",
  );

  return meta;
};

export const writeUploadNew = async (
  uploadId: string,
  testing = false,
): Promise<UploadManifest> => {
  const manifest: UploadManifest = {
    uploadId,
    timestamp: new Date().toISOString(),
    testing,
  };

  await setValue(
    uploadManifestKey(uploadId),
    manifest,
    {
      keyPolicy: "FAIL_IF_EXISTS",
      ttl: {
        unit: "HOURS",
        value: 4,
      },
    },
    "create upload manifest",
  );

  return manifest;
};
