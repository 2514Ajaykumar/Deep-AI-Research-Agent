import { useState } from "react";
import { sendQuery } from "./services/api";

function App() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!query) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await sendQuery(query);

      console.log("FULL RESPONSE:", res);

      const output =
        res?.output?.final_answer ||
        res?.output ||
        JSON.stringify(res, null, 2);

      setResponse(
        typeof output === "string"
          ? output
          : JSON.stringify(output, null, 2)
      );

    } catch (err) {
      setResponse("Error occurred");
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