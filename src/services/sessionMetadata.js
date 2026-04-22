export function getSessionBatchIdentifier(sessionData = {}) {
  const metaData = sessionData?.meta_data;

  if (!metaData || typeof metaData !== "object") {
    return "";
  }

  const legacyBatch = metaData.batch || "";
  const batchId = metaData.batch_id || legacyBatch || "";
  const parentId = metaData.parent_id || legacyBatch || "";

  return sessionData?.platform === "quiz"
    ? parentId || batchId
    : batchId || parentId;
}
