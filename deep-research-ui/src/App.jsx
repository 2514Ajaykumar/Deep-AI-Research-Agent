import { useState } from "react";
import { sendQuery } from "./services/api";

function App() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!query) return;

    setLoading(true);
    setResponse("🔍 Researching...");

    try {
      // ✅ NOW sendQuery already returns FINAL RESULT
      const result = await sendQuery(query);

      console.log("✅ FINAL RESULT:", result);

      setResponse(result);
    } catch (err) {
      console.error(err);
      setResponse("❌ Error occurred");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "auto" }}>
      <h1>🔍 Deep Research Agent</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask anything..."
        style={{ width: "100%", padding: "10px", marginTop: "20px" }}
      />

      <button onClick={handleSubmit} style={{ marginTop: "10px" }}>
        {loading ? "Thinking..." : "Search"}
      </button>

      <div style={{ marginTop: "30px" }}>
        <h2>Result:</h2>
        <pre>{response}</pre>
      </div>
    </div>
  );
}

export default App;