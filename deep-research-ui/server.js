/* eslint-env node */
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// 🔗 Backend URL
const BASE_URL = "https://deep-ai-research-agent.onrender.com";

// 🤖 Assistant ID
const ASSISTANT_ID = "e9a5370f-7a53-55a8-ada8-6ab9ef15bb5b";

// 🔐 API Key
const API_KEY = process.env.LANGSMITH_API_KEY;

if (!API_KEY) {
  console.error("❌ Missing LANGSMITH_API_KEY");
  throw new Error("Missing API Key");
}

let THREAD_ID = null;

// ✅ Health
app.get("/", (req, res) => {
  res.json({ status: "Proxy running 🚀" });
});

// ✅ Safe parser
const parseResponse = async (response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
};

// ===============================
// ✅ CREATE THREAD
// ===============================
app.post("/api/thread", async (req, res) => {
  try {
    console.log("🔄 Creating thread...");

    const response = await fetch(`${BASE_URL}/threads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({ input: {} }),
    });

    const data = await parseResponse(response);
    console.log("📩 THREAD RESPONSE:", data);

    if (!response.ok || !data.thread_id) {
      return res.status(500).json({ error: "Thread failed", data });
    }

    THREAD_ID = data.thread_id;

    res.json({ thread_id: THREAD_ID });

  } catch (err) {
    console.error("❌ THREAD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// ✅ RUN QUERY
// ===============================
app.post("/api/run", async (req, res) => {
  try {
    const { query } = req.body;

    console.log("🔍 Running query:", query);

    if (!THREAD_ID) {
      return res.status(400).json({ error: "Thread missing" });
    }

    const response = await fetch(
      `${BASE_URL}/threads/${THREAD_ID}/runs`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({
          assistant_id: ASSISTANT_ID,
          input: { query },
        }),
      }
    );

    const data = await parseResponse(response);
    console.log("📊 RUN RESPONSE:", data);

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);

  } catch (err) {
    console.error("❌ RUN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// ✅ GET RESULT (FINAL FIX)
// ===============================
app.get("/api/run/:threadId/:runId", async (req, res) => {
  try {
    const { threadId, runId } = req.params;

    const response = await fetch(
      `${BASE_URL}/threads/${threadId}/runs/${runId}`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "x-api-key": API_KEY,
        },
      }
    );

    const data = await parseResponse(response);
    console.log("📥 FETCH RESULT:", data);

    let finalOutput = null;

if (data.status === "success") {
  console.log("✅ Run completed");

  // 🔥 1. Try messages (if available)
  if (data.values?.messages?.length > 0) {
    finalOutput =
      data.values.messages[data.values.messages.length - 1].content;
  }

  // 🔥 2. Try final_report (YOUR CASE ✅)
  else if (data.values?.final_report) {
    finalOutput = data.values.final_report;
  }

  // 🔥 3. Try direct output
  else if (data.output) {
    finalOutput = data.output;
  }

  // 🔥 4. Fallback
  else {
    finalOutput = "⚠️ No readable output from agent";
  }

  console.log("📊 FINAL OUTPUT:", finalOutput);
}

    res.json({
      status: data.status,
      output: finalOutput,
    });

  } catch (err) {
    console.error("❌ FETCH ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});