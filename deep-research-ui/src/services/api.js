const BASE_URL = "http://localhost:5000";

let THREAD_CREATED = false;
let THREAD_ID = null;

// ===============================
// ✅ POLLING FUNCTION
// ===============================
const pollResult = async (threadId, runId) => {
  while (true) {
    const res = await fetch(`${BASE_URL}/api/run/${threadId}/${runId}`);
    const data = await res.json();

    console.log("🔄 Polling:", data);

    if (data.status === "success") {
      return data.output; // ✅ STOP polling
    }

    if (data.status === "error") {
      throw new Error("Run failed");
    }

    await new Promise((r) => setTimeout(r, 2000));
  }
};

// ===============================
// ✅ MAIN FUNCTION
// ===============================
export const sendQuery = async (query) => {
  try {
    // 1. Create thread once
    if (!THREAD_CREATED) {
      const threadRes = await fetch(`${BASE_URL}/api/thread`, {
        method: "POST",
      });

      const threadData = await threadRes.json();

      if (!threadRes.ok) {
        throw new Error(threadData.error);
      }

      THREAD_CREATED = true;
      THREAD_ID = threadData.thread_id;
    }

    // 2. Run query
    const runRes = await fetch(`${BASE_URL}/api/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const runData = await runRes.json();

    if (!runRes.ok) {
      throw new Error(runData.error);
    }

    // 3. Poll result
    const result = await pollResult(THREAD_ID, runData.run_id);

    return result;

  } catch (err) {
    console.error("❌ API ERROR:", err);
    throw err;
  }
};