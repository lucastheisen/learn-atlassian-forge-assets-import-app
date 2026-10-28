import { DataAccessError } from "./errors";
import { nextPage } from "./kv-common";
import {
  commitInventoryPage,
  deleteReferenceValues,
  inventoryKey,
  pendingKey,
  pendingPartitionPrefix,
  readReferenceValue,
  readWorkItems,
  savePending,
  saveReferenceValue,
  saveRun,
  workKey,
} from "./kv-reference";
import {
  assetFields,
  assetValues,
  discoverAssets,
  fetchAsset,
  updateReference,
} from "./reference-assets";
import {
  ContinueLater,
  type InventoryPage,
  type PendingReference,
  type ProcessingBudget,
  ProductRequestError,
  type ReferenceRun,
  type UserLookup,
  type WorkItem,
} from "./reference-types";

export async function discoverWork(
  run: ReferenceRun,
  budget: ProcessingBudget,
): Promise<void> {
  let retryCursor: string | undefined;
  let partition = -1;
  while (run.discovery !== "sealed") {
    budget.check();
    let page = await readReferenceValue<InventoryPage>(
      inventoryKey(run, run.inventoryPages),
    );
    if (!page) {
      if (run.discovery === "aql") {
        const result = await discoverAssets(run, budget);
        page = {
          assetIds: result.assetIds,
          nextAqlStart: result.nextStart,
          nextDiscovery: result.last ? "retries" : "aql",
          sealed: false,
        };
      } else {
        if (partition !== (run.retryPartition ?? 0)) {
          partition = run.retryPartition ?? 0;
          retryCursor = undefined;
        }
        const result = await nextPage<PendingReference>(
          pendingPartitionPrefix(run, partition),
          retryCursor,
        );
        retryCursor = result.nextCursor;
        page = {
          assetIds: [
            ...new Set(result.results.map(({ value }) => value.assetId)),
          ],
          nextAqlStart: run.aqlStart,
          nextDiscovery:
            result.nextCursor === undefined && partition === 255
              ? "sealed"
              : "retries",
          nextRetryPartition:
            result.nextCursor === undefined ? partition + 1 : partition,
          sealed: false,
        };
      }
      if (!page.assetIds.length) {
        run.aqlStart = page.nextAqlStart;
        run.discovery = page.nextDiscovery;
        run.retryPartition = page.nextRetryPartition ?? run.retryPartition;
        await saveRun(run);
        continue;
      }
    } else {
      // A staged page survives invocations; query cursors deliberately do not.
      retryCursor = undefined;
      partition = -1;
    }
    await commitInventoryPage(run, page, budget);
  }
  run.phase = "processing";
  await saveRun(run);
}

async function finishItem(run: ReferenceRun, item: WorkItem): Promise<void> {
  if (item.outcome === "unresolved") {
    await savePending(run, item);
    console.warn("User association unresolved", {
      assetId: item.assetId,
      assetKey: item.assetKey,
      executionId: run.executionId,
      httpStatus: item.httpStatus,
      reason: item.reason,
    });
  } else {
    item.pendingCleanup = true;
    await saveReferenceValue(workKey(run, item.assetId), item);
    await deleteReferenceValues([pendingKey(run, item.assetId)]);
    item.pendingCleanup = false;
  }
  await saveReferenceValue(workKey(run, item.assetId), item);
}

async function processItem(
  run: ReferenceRun,
  item: WorkItem,
  lookup: UserLookup,
  budget: ProcessingBudget,
): Promise<void> {
  if (item.outcome) {
    if (item.pendingCleanup) await finishItem(run, item);
    return;
  }
  if (!run.schema) throw new Error("Reference schema is missing");
  budget.check();
  await savePending(run, item);
  item.attempts++;
  await saveReferenceValue(workKey(run, item.assetId), item);
  let stage: "asset_fetch_failed" | "lookup_failed" | "update_failed" =
    "asset_fetch_failed";
  try {
    const asset = await fetchAsset(run, item.assetId, budget);
    item.assetKey = asset.objectKey;
    if (String(asset.objectType.id) !== run.schema.objectTypeId) {
      item.reason = "asset_type_changed";
      item.outcome = "unresolved";
    } else {
      const active: unknown[] = assetValues(
        asset,
        run.schema.activeAttributeId,
      ).map((value) => value.value);
      if (
        active.length === 1 &&
        (active[0] === false || active[0] === "false")
      ) {
        item.outcome = "inactive";
      } else if (
        active.length !== 1 ||
        !(active[0] === true || active[0] === "true")
      ) {
        item.outcome = "unresolved";
        item.reason = "unknown_activity";
      } else {
        stage = "lookup_failed";
        const result = await lookup(assetFields(asset, run.schema), budget);
        if (result.status === "unresolved") {
          item.outcome = "unresolved";
          item.reason = result.reason;
        } else {
          const values = assetValues(asset, run.schema.userAttributeId);
          if (
            values.length === 1 &&
            (values[0]?.user?.key ?? values[0]?.value) === result.accountId
          ) {
            item.outcome = "unchanged";
          } else {
            stage = "update_failed";
            await updateReference(run, item.assetId, result.accountId, budget);
            item.outcome = "updated";
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof ProductRequestError) item.httpStatus = error.status;
    if (error instanceof DataAccessError) throw error;
    if (
      error instanceof ProductRequestError &&
      error.status === 404 &&
      stage === "asset_fetch_failed"
    ) {
      item.outcome = "deleted";
    } else if (error instanceof ContinueLater && item.attempts < 3) {
      throw error;
    } else if (
      error instanceof ProductRequestError &&
      (error.status === 0 || error.status >= 500) &&
      item.attempts < 3
    ) {
      throw new ContinueLater(5);
    } else {
      item.outcome = "unresolved";
      item.reason = stage;
    }
  }
  await finishItem(run, item);
}

export async function processWork(
  run: ReferenceRun,
  lookup: UserLookup,
  budget: ProcessingBudget,
  itemCap = 100,
  concurrency = 4,
): Promise<void> {
  let processed = 0;
  while (run.processingPage < run.inventoryPages && processed < itemCap) {
    budget.check();
    const page = await readReferenceValue<InventoryPage>(
      inventoryKey(run, run.processingPage),
    );
    if (!page?.sealed) throw new Error("Sealed reference inventory is missing");
    while (run.processingOffset < page.assetIds.length && processed < itemCap) {
      budget.check();
      const ids = page.assetIds.slice(
        run.processingOffset,
        run.processingOffset + Math.min(concurrency, itemCap - processed),
      );
      const items = await readWorkItems(run, ids);
      const results = await Promise.allSettled(
        ids.map(async (id) => {
          const item = items.get(id);
          if (!item) throw new Error("Reference work item is missing");
          await processItem(run, item, lookup, budget);
        }),
      );
      const errors = results
        .filter((result) => result.status === "rejected")
        .map((result) => result.reason as unknown);
      const fatal = errors.find((error) => !(error instanceof ContinueLater));
      if (fatal) throw fatal;
      if (errors.length)
        throw new ContinueLater(
          Math.max(
            ...errors.map((error) => (error as ContinueLater).delaySeconds),
          ),
        );
      run.processingOffset += ids.length;
      processed += ids.length;
      await saveRun(run);
    }
    if (run.processingOffset === page.assetIds.length) {
      run.processingPage++;
      run.processingOffset = 0;
      await saveRun(run);
    }
  }
  if (run.processingPage === run.inventoryPages) {
    run.phase = "aggregation";
    await saveRun(run);
  }
}

export async function aggregateWork(
  run: ReferenceRun,
  budget: ProcessingBudget,
): Promise<void> {
  const aggregation = run.aggregation;
  while (aggregation.page < run.inventoryPages) {
    budget.check();
    const page = await readReferenceValue<InventoryPage>(
      inventoryKey(run, aggregation.page),
    );
    if (!page) {
      if (!run.failure)
        throw new Error("Reference inventory is missing during aggregation");
      aggregation.page++;
      aggregation.offset = 0;
      await saveRun(run);
      continue;
    }
    while (aggregation.offset < page.assetIds.length) {
      budget.check();
      const ids = page.assetIds.slice(
        aggregation.offset,
        aggregation.offset + 25,
      );
      const items = await readWorkItems(run, ids);
      if (
        !run.failure &&
        ids.some(
          (id) => !items.get(id)?.outcome || items.get(id)?.pendingCleanup,
        )
      )
        throw new Error("Reference results are incomplete");
      for (const id of ids) {
        const item = items.get(id);
        if (!item?.outcome || item.pendingCleanup) {
          if (!run.failure) throw new Error("Reference results are incomplete");
          continue;
        }
        aggregation.counts[item.outcome]++;
        aggregation.total++;
        if (item.reason)
          aggregation.reasons[item.reason] =
            (aggregation.reasons[item.reason] ?? 0) + 1;
      }
      aggregation.offset += ids.length;
      await saveRun(run);
    }
    aggregation.page++;
    aggregation.offset = 0;
    await saveRun(run);
  }
  if (!run.failure && aggregation.total !== run.selected)
    throw new Error(
      "Reference result count does not match the sealed inventory",
    );
  run.phase = "finalizing";
  await saveRun(run);
}
