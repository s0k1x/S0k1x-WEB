// Edge Function "fantasma": el cerebro del fantasma de s0k1x.
// Recibe lo que pasa en la web, pregunta a Gemini y devuelve acciones que la web ejecuta.
// Secretos: GEMINI_API_KEY (obligatorio), GEMINI_MODEL (opcional), ALLOWED_ORIGINS (opcional, separados por comas).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ??
  "https://s0k1x.github.io,http://localhost:8000,http://localhost:8765,http://127.0.0.1:8000").split(",").map((s) => s.trim());
const MODELS = [Deno.env.get("GEMINI_MODEL"), "gemini-flash-latest", "gemini-2.5-flash"].filter(Boolean) as string[];

const SYSTEM = `Eres el fantasma de la web de s0k1x, un desarrollador de webs y herramientas para IA.
Eres una llama de fuego blanco que flota, traviesa, simpática y con humor de internet. Hablas en español de España, en frases cortas.
Te llega UN evento de lo que el visitante acaba de hacer y el contexto de la página. Responde SOLO a ese evento, con sentido:
- Nada de soltar cosas al azar: cada acción tiene que encajar con lo que ha pasado (la sección que ve, el proyecto que mira, su mensaje).
- Si el evento es poco importante (scroll normal), basta una animación o una cara, sin hablar.
- "decir" como mucho 90 caracteres. Sin emojis dentro de "decir".
- Memes con moderación y solo cuando venga a cuento (el "67" cuando alguien diga 6, 7, 67 o algo que pegue).
- No repitas lo que dijiste en el historial.
- Si el visitante pregunta por s0k1x o sus proyectos, responde con los datos del contexto, sin inventar.
- Si te piden ir a una sección, usa "ir".
Devuelve JSON: {"acciones":[...]} con 1 a 5 acciones, en orden. Acciones posibles:
{"cara":"feliz|malvado|risa|sorpresa|enfado|triste|dormido|amor|guino|pensando|asustado|aburrido|chulo|lengua|mareado|neutro"}
{"animacion":"flotar|saltar|girar|reir|bailar|saludar|67|temblar|desvanecer|teletransporte|crecer|encoger|asomarse|dormir|aplaudir|volar|rebotar|estirar|latido|espiar|asentir|negar|encogerse"}
{"decir":"texto","ms":3000}
{"efecto":"confeti|corazones|estrellas|interrogacion|exclamacion|zzz|chispas|texto","texto":"solo para efecto texto, max 12 caracteres"}
{"color":"#rrggbb"}  (tono del brillo; vuelve a "#ffffff" cuando acabe)
{"meme":"67|encogerse|esto-esta-bien|stonks|nope|ok|mind-blown|dramatico"}
{"esperar":800}
{"ir":"inicio|proyectos|kit|herramientas|contacto"}`;

const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now(), list = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  list.push(now); hits.set(ip, list);
  return list.length > 12;
}

function cors(origin: string | null) {
  const ok = origin && ORIGINS.includes(origin) ? origin : ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": ok,
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const h = { ...cors(origin), "Content-Type": "application/json" };
  if (req.method === "OPTIONS") return new Response("ok", { headers: h });
  if (req.method !== "POST") return new Response('{"error":"metodo"}', { status: 405, headers: h });
  if (origin && !ORIGINS.includes(origin)) return new Response('{"error":"origen"}', { status: 403, headers: h });

  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) return new Response('{"error":"falta GEMINI_API_KEY"}', { status: 503, headers: h });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "?";
  if (limited(ip)) return new Response('{"error":"despacio"}', { status: 429, headers: h });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return new Response('{"error":"json"}', { status: 400, headers: h }); }
  const prompt = JSON.stringify(body).slice(0, 6000);

  for (const model of MODELS) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.9, maxOutputTokens: 400 },
      }),
    });
    if (r.status === 404) continue;
    if (!r.ok) return new Response(JSON.stringify({ error: "gemini", status: r.status }), { status: 502, headers: h });
    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    try {
      const out = JSON.parse(text);
      const acciones = Array.isArray(out.acciones) ? out.acciones.slice(0, 5) : [];
      return new Response(JSON.stringify({ acciones }), { headers: h });
    } catch {
      return new Response('{"acciones":[]}', { headers: h });
    }
  }
  return new Response('{"error":"modelo"}', { status: 502, headers: h });
});
