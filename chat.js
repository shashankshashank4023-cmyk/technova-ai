// Vercel serverless function: relays chat requests to the Anthropic API.
// The API key stays on the server (ANTHROPIC_API_KEY) and is never sent to the browser.

const SYSTEM = `You are TechNova AI, a helpful, knowledgeable assistant. Answer the user's question directly, like a normal assistant would. Optional reference passages from the user's uploaded documents are included. Use them only if they clearly help answer the question, and then mention the file name. If they are not relevant, ignore them completely. Never mention passages, sources or the knowledge base unless you actually used one, and never say that you found nothing. Be concise. Use short paragraphs or "- " bullets.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY" });
  }

  const { question, history = [], passages = [] } = req.body || {};
  if (typeof question !== "string" || !question.trim() || question.length > 4000) {
    return res.status(400).json({ error: "Invalid question" });
  }

  const hist = (Array.isArray(history) ? history : [])
    .slice(-6)
    .map((m) => `${m.role === "assistant" ? "Assistant" : "User"}: ${String(m.content).slice(0, 2000)}`)
    .join("\n");
  const ctx =
    (Array.isArray(passages) ? passages : [])
      .slice(0, 4)
      .map((p, i) => `[${i + 1}] ${String(p.name).slice(0, 100)}\n${String(p.text).slice(0, 1200)}`)
      .join("\n\n---\n\n") || "(none)";

  const content = `OPTIONAL REFERENCE PASSAGES:\n${ctx}\n\nRECENT CONVERSATION:\n${hist || "(none)"}\n\nUser: ${question}`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
        max_tokens: 1024,
        system: SYSTEM,
        messages: [{ role: "user", content }],
      }),
    });
    if (!r.ok) {
      return res.status(r.status === 429 ? 429 : 502).json({ error: "Upstream error" });
    }
    const data = await r.json();
    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(502).json({ error: "Request failed" });
  }
}
