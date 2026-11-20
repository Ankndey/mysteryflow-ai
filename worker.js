const MODEL = "gemini-3.5-flash-lite";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=utf-8"
};
function json(data, status=200) {
  return new Response(JSON.stringify(data), { status, headers: cors });
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (url.pathname === "/" || url.pathname === "/health") {
      return json({ app: "MysteryFlow AI", status: "API is running", version: "0.3.1", model: MODEL });
    }
    if (url.pathname !== "/generate" || request.method !== "POST") {
      return json({ error: "Not found. Use POST /generate." }, 404);
    }
    if (!env.GEMINI_API_KEY) return json({ error: "GEMINI_API_KEY secret is missing in this Worker." }, 500);
    let data;
    try { data = await request.json(); } catch { return json({ error: "Invalid JSON request." }, 400); }
    const { title, format, type, tone, facts, factsBN } = data || {};
    if (!title || !facts || !factsBN) return json({ error: "Title, English facts and Bengali facts are required." }, 400);
    const total = [title, facts, factsBN].join("\n").length;
    if (total > 18000) return json({ error: "Input is too long. Please keep the story outline under 18,000 characters." }, 413);

    const prompt = `You are the bilingual scriptwriter for MysteryFlow AI, a YouTube channel about mystery and true crime.
Write in clear English and natural West Bengal Indian Bengali (বাংলা, পশ্চিমবঙ্গের স্বাভাবিক কথ্য রীতি; avoid Bangladesh-specific vocabulary).
Return ONLY valid JSON with exactly these six string keys:
"english_script", "bengali_script", "visual_en", "visual_bn", "seo_en", "seo_bn".
Video title: ${title}
Format: ${format}
Story type: ${type}
Narration style: ${tone}
English source facts/outline:
${facts}
Bengali source facts/outline:
${factsBN}

Requirements:
- If format is "short", write a 30–60 second Shorts script; if "long", write a 5–10 minute long-video script; if "both", include clearly separated Shorts and Long versions in BOTH language scripts.
- Make the English and Bengali scripts genuinely natural, complete, engaging and not literal awkward translations.
- Give a strong opening hook, clear story progression, suspenseful but responsible pacing, and a satisfying ending/question.
- Never invent facts, names, dates, locations, evidence, quotes, motives, suspects, police statements or outcomes. Use only supplied facts. If details are missing, mark [FACT CHECK NEEDED] / [তথ্য যাচাই প্রয়োজন].
- For true crime, distinguish confirmed facts, allegations and theories. Use neutral language, no defamatory claims, no graphic sensationalism, and do not identify private individuals beyond the source facts.
- Mark unresolved questions honestly. Do not claim the sources have been independently verified.
- visual_en and visual_bn: provide separate scene-by-scene visual directions for vertical 9:16 Shorts and horizontal 16:9 Long where requested. No fake evidence or misleading reenactments.
- seo_en and seo_bn: accurate title, description, and tags/hashtags. Do not call fiction a real case.
- Use escaped newlines inside JSON strings. Return JSON only.`;

    try {
      const api = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.65, responseMimeType: "application/json", maxOutputTokens: 8192 }
        })
      });
      const raw = await api.json();
      if (!api.ok) {
        const message = raw?.error?.message || "Gemini API request failed.";
        return json({ error: message, provider_status: api.status }, api.status === 429 ? 429 : 502);
      }
      const text = raw?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
      if (!text) return json({ error: "Gemini returned an empty response. Please try again." }, 502);
      let result;
      try { result = JSON.parse(text); }
      catch {
        const cleaned = text.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
        try { result = JSON.parse(cleaned); }
        catch { return json({ error: "AI response could not be parsed. Please try again.", sample: text.slice(0, 500) }, 502); }
      }
      const required = ["english_script","bengali_script","visual_en","visual_bn","seo_en","seo_bn"];
      for (const key of required) if (typeof result[key] !== "string") result[key] = "";
      return json({ success: true, model: MODEL, result });
    } catch (err) {
      return json({ error: "Could not reach Gemini API. Check Worker logs and try again." }, 502);
    }
  }
};