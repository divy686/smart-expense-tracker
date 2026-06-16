import { useState } from "react";
import API from "../api/client";
import { Sparkles } from "lucide-react";

export default function Insights() {
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");

  const generate = async () => {
    setLoading(true);
    setInsights("");
    try {
      const { data } = await API.post("/ai/insights", { question });
      setInsights(data.insights);
    } catch (err) {
      setInsights("Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-4xl font-bold flex items-center gap-3">
         <Sparkles className="text-cyan-500" />
         AI Financial Advisor
         </h2>
      <p className="text-muted mb-8">Powered by Groq AI (Llama 3.3 70B)</p>

      <div className="card mb-6">
        <input
          className="input mb-3"
          placeholder="Ask anything (optional) — e.g., How can I save on food?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
              onClick={generate}
              disabled={loading}
              className="bg-gradient-to-r from-green-700 to-cyan-500 text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition"
>
  {loading ? "Analyzing your spending..." : "Generate Insights"}
</button>
      </div>

      {insights && (
        <div
          className="card whitespace-pre-wrap leading-relaxed"
          style={{ borderColor: "#00B8D4", borderWidth: "1px" }}
        >
          {insights}
        </div>
      )}
    </div>
  );
}  