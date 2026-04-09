/* eslint-env node */
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const BASE_URL = "https://deep-ai-research-agent.onrender.com";
const ASSISTANT_ID = "e9a5370f-7a53-55a8-ada8-6ab9ef15bb5b";

// ✅ Secure API Key (from .env)
const API_KEY = process.env.LANGSMITH_API_KEY;

// ❌ Stop server if key missing
if (!API_KEY) {
  console.error("❌ Missing LANGSMITH_API_KEY in .env");
  throw new Error("Missing LANGSMITH_API_KEY in .env");
}

let THREAD_ID = null;

// ✅ Health check route
app.get("/", (req, res) => {
  res.json({ status: "Proxy server running 🚀" });
});

// ✅ Safe response parser (handles JSON + text)
const parseResponse = async (response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
};

// ✅ Create thread
app.post("/api/thread", async (req, res) => {
  try {
    console.log("🔄 Creating thread...");

    const response = await fetch(`${BASE_URL}/threads`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "x-api-key": API_KEY,
      },
    });

    const data = await parseResponse(response);
    console.log("📩 THREAD RESPONSE:", data);

    if (!response.ok || !data.thread_id) {
      return res.status(500).json({
        error: "Failed to create thread",
        details: data,
      });
    }

    THREAD_ID = data.thread_id;

    res.json({ thread_id: THREAD_ID });

  } catch (err) {
    console.error("❌ THREAD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Run query
app.post("/api/run", async (req, res) => {
  try {
    const { query } = req.body;

    console.log("🔍 Running query:", query);

    if (!THREAD_ID) {
      return res.status(400).json({ error: "Thread not created" });
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

// ✅ Start server
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});