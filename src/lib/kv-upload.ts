import { kvs } from '@forge/kvs';
import { deleteAllValues, getAllValues } from './kv-common';
import { BadRequestError } from '../resolvers/webtrigger/errors';

// CODE_REVIEW_CATCH_ME: need to add error handling for kvs calls, i think they throw
// ForgeKvsError or ForgeKvsAPIError (probably the later which allows discrimination)
interface ImportManifest {
  uploadId: string;
  timestamp: string;
  data: UploadDataManifest[];
  totals: {
    keys: number;
    records: number;
  };
}

interface UploadDataManifest {
  index: number;
  key: string;
  count: number;
}

interface UploadManifest {
  uploadId: string;
  timestamp: string;
}

type UploadData = Record<string, unknown>;

const countRecords = (data: UploadData): number => {
  const entries = Object.entries(data);
  if (entries.length !== 1) {
    throw new BadRequestError('Upload data must contain exactly one top-level key');
  }

  const entry = entries[0];
  if (entry === undefined) {
    throw new BadRequestError('Upload data must contain exactly one top-level key');
  }

  const [, value] = entry;
  if (!Array.isArray(value)) {
    throw new BadRequestError('Upload data top-level value must be an array');
  }

  return value.length;
};

const importDataKey = (timestamp: string, index: number) =>
  `import:data:${timestamp}:${padIndex(index)}`;

const importManifestKey = (timestamp: string) => `import:manifest:${timestamp}:manifest`;

const padIndex = (index: number) => String(index).padStart(6, '0');

const uploadKeyPrefix = (uploadId: string) => `import:upload:${uploadId}:`;

const uploadDataManifestKeyPrefix = (uploadId: string) => `${uploadKeyPrefix(uploadId)}data:`;

const uploadDataManifestKey = (uploadId: string, index: number) =>
  `${uploadDataManifestKeyPrefix(uploadId)}${padIndex(index)}`;

const uploadManifestKey = (uploadId: string) => `import:upload:${uploadId}:manifest`;

export const writeUploadComplete = async (
  uploadId: string
): Promise<ImportManifest> => {
  const uploadKey = uploadManifestKey(uploadId);
  const upload = await kvs.get<UploadManifest>(uploadKey);

  if (!upload) {
    throw new BadRequestError(`Upload not found: ${uploadId}`);
  }

  const importKey = importManifestKey(upload.timestamp);

  const existing = await kvs.get<ImportManifest>(importKey);
  if (existing) {
    return existing;
  }

  const uploadData = (await getAllValues<UploadDataManifest>(uploadDataManifestKeyPrefix(uploadId)))
    .sort((a, b) => a.value.index - b.value.index);
  const manifest: ImportManifest = {
    uploadId,
    timestamp: upload.timestamp,
    data: uploadData.map((k) => k.value),
    totals: {
      keys: uploadData.length,
      records: uploadData.reduce((sum, item) => sum + item.value.count, 0),
    },
  };

  await kvs.set(
    importKey,
    manifest,
    {
      keyPolicy: 'FAIL_IF_EXISTS',
      ttl: {
        unit: 'DAYS',
        value: 7,
      },
    });

  await deleteAllValues([...uploadData.map(({key}) => key), uploadKey]);

  return manifest;
};

export const writeUploadData = async (
  uploadId: string,
  index: number,
  data: UploadData
): Promise<UploadDataManifest> => {
  // do count right away because it performs some validations.
  const count = countRecords(data);

  const upload = await kvs.get<UploadManifest>(uploadManifestKey(uploadId));

  if (!upload) {
    throw new BadRequestError(`Upload not found: ${uploadId}`);
  }

  const importManifest = await kvs.get(importManifestKey(upload.timestamp));
  if (importManifest !== undefined) {
    throw new BadRequestError(`Upload already completed: ${uploadId}`);
  }

  const dataKey = importDataKey(upload.timestamp, index);
  await kvs.set(
    dataKey,
    data,
    {
      keyPolicy: 'OVERRIDE',
      ttl: {
        unit: 'DAYS',
        value: 7,
      },
    });

  const meta: UploadDataManifest = {
    index,
    key: dataKey,
    count: count,
  };

  const metaKey = uploadDataManifestKey(uploadId, index);
  await kvs.set(
    metaKey,
    meta,
    {
      keyPolicy: 'OVERRIDE',
      ttl: {
        unit: 'HOURS',
        value: 4,
      },
    });

  return meta;
};

export const writeUploadNew = async (uploadId: string): Promise<UploadManifest> => {
  const manifest: UploadManifest = {
    uploadId,
    timestamp: new Date().toISOString(),
  };

  await kvs.set(
    uploadManifestKey(uploadId),
    manifest,
    {
      keyPolicy: 'FAIL_IF_EXISTS',
      ttl: {
        unit: 'HOURS',
        value: 4,
      },
    });

  return manifest;
};
