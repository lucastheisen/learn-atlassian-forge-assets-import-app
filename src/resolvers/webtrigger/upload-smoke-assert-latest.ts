import z from "zod";
import { getImportData, getLatestTestManifest } from "../../lib/kv-data";
import { Command, staticWebTriggerResponseSuccess } from "./common";
import { BadRequestError, InternalServerError } from "./errors";

export const UploadSmokeAssertLatest = z.object({
  type: z.literal("upload-smoke-assert-latest"),
  expectedKeys: z.number().int().nonnegative(),
  expectedRecords: z.number().int().nonnegative(),
  expectedTopLevelKey: z.string().min(1).optional(),
});

export const uploadSmokeAssertLatestCommand: Command<
  z.infer<typeof UploadSmokeAssertLatest>
> = async (action) => {
  const latest = await getLatestTestManifest();

  if (latest === undefined) {
    throw new BadRequestError("no completed test upload manifest found");
  }

  if (latest.totals.keys !== action.expectedKeys) {
    throw new BadRequestError(
      `expected ${action.expectedKeys} manifest keys but found ${latest.totals.keys}`,
    );
  }

  if (latest.totals.records !== action.expectedRecords) {
    throw new BadRequestError(
      `expected ${action.expectedRecords} manifest records but found ${latest.totals.records}`,
    );
  }

  if (action.expectedTopLevelKey !== undefined) {
    for (let index = 0; index < latest.data.length; index += 1) {
      const data = await getImportData(latest, index);

      if (data === undefined) {
        throw new InternalServerError(`manifest data at index ${index} could not be loaded`);
      }

      if (typeof data !== "object" || data === null || Array.isArray(data)) {
        throw new BadRequestError(`manifest data at index ${index} was not an object payload`);
      }

      const topLevelKeys = Object.keys(data);
      if (topLevelKeys.length !== 1 || topLevelKeys[0] !== action.expectedTopLevelKey) {
        throw new BadRequestError(
          `manifest data at index ${index} did not contain exactly the expected top-level key "${action.expectedTopLevelKey}"`,
        );
      }
    }
  }

  return staticWebTriggerResponseSuccess();
};
