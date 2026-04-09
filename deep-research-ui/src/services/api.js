const BASE_URL = "http://localhost:5000";

let THREAD_CREATED = false;

export const sendQuery = async (query) => {
  try {
    // Step 1: create thread once
    if (!THREAD_CREATED) {
      const threadRes = await fetch(`${BASE_URL}/api/thread`, {
        method: "POST",
      });

      const threadData = await threadRes.json();
      console.log("THREAD CREATED:", threadData);

      if (!threadRes.ok) {
        throw new Error(threadData.error || "Thread creation failed");
      }

      THREAD_CREATED = true;
    }

    // Step 2: send query
    const response = await fetch(`${BASE_URL}/api/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    console.log("API RESPONSE:", data);

    if (!response.ok) {
      throw new Error(data.error || "Run failed");
    }

    return data;

  } catch (err) {
    console.error("API ERROR:", err);
    throw err;
  }
};