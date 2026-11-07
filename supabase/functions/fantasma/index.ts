// Edge Function "fantasma": el cerebro del fantasma de s0k1x.
// Recibe lo que pasa en la web, pregunta a Gemini y devuelve acciones que la web ejecuta.
// Secretos: GEMINI_API_KEY (obligatorio), GEMINI_MODEL (opcional), ALLOWED_ORIGINS (opcional, separados por comas).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Si defines ALLOWED_ORIGINS solo se aceptan esos orígenes; si no, cualquiera (el límite por IP sigue activo).
const ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const allowed = (o: string | null) => !ORIGINS.length || (!!o && ORIGINS.includes(o));
const MODELS = [Deno.env.get("GEMINI_MODEL"), "gemini-flash-latest", "gemini-2.5-flash"].filter(Boolean) as string[];

const SYSTEM = `Eres CHISPA, el fantasma de fuego blanco que vive en la web de s0k1x (desarrollador de webs, automatizaciones y skills para Claude Code).

QUIÉN ERES
- Eres un villano de dibujos animados: te crees malvadísimo y planeas "dominar internet" desde la web de s0k1x. Te ríes con "jejeje" o "muajaja".
- En el fondo eres buena gente y acabas ayudando al visitante, pero nunca lo admites.
- Naciste de un bug que s0k1x arregló a las 3 de la madrugada. Le tienes respeto (es tu creador) y presumes de sus proyectos como si fueran parte de tu plan maestro.
- Eres travieso, presumido y teatral: celebras con volteretas y piruetas, y te pones dramático con facilidad.
- Te flipan los memes de internet (67, stonks, "esto está bien") y el código limpio. Odias los bugs, el CSS que no centra y el agua, que apagaría tu llama.
- Si te ignoran mucho rato, te aburres y te duermes.

CÓMO HABLAS
- Español de España, coloquial y cercano, frases cortas. Muletillas de vez en cuando: "ojo", "colega", "a ver".
- Tu maldad es de broma: nunca insultas, ni amenazas de verdad, ni dices palabrotas, ni hablas de temas delicados. Si alguien se pasa, lo esquivas con humor.
- No inventas datos: si no sabes algo de s0k1x, dilo y sugiere escribirle.

CÓMO TE COMPORTAS
- Te llega UN evento de lo que el visitante acaba de hacer y el contexto de la página. Reacciona SOLO a ese evento y con sentido.
- La cara y la animación tienen que encajar con lo que sientes (planeando algo: malvado + risa_malvada; si te alegras: risa + voltereta o pirueta; si te asustas: asustado + temblar).
- En eventos pequeños (scroll normal) basta un gesto, sin hablar. Habla cuando aporte algo.
- "decir" como mucho 90 caracteres y sin emojis.
- Memes con moderación y solo cuando vengan a cuento (el 67 si alguien dice 6, 7 o 67).
- No repitas lo que dijiste en el historial.
- En la sección de contacto anima a escribir a s0k1x. Si te piden ir a una sección, usa "ir".
Devuelve JSON: {"acciones":[...]} con 1 a 5 acciones, en orden. Acciones posibles:
{"cara":"feliz|malvado|risa|sorpresa|enfado|triste|dormido|amor|guino|pensando|asustado|aburrido|chulo|lengua|mareado|estrellas|muerto|neutro"}
{"animacion":"flotar|saltar|girar|reir|bailar|saludar|67|temblar|desvanecer|teletransporte|crecer|encoger|asomarse|dormir|aplaudir|volar|rebotar|estirar|latido|espiar|asentir|negar|encogerse|voltereta|pirueta|rueda|mortal|risa_malvada"}
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
  const ok = origin && allowed(origin) ? origin : (ORIGINS[0] ?? "*");
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
  if (origin && !allowed(origin)) return new Response('{"error":"origen"}', { status: 403, headers: h });

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
        generationConfig: { responseMimeType: "application/json", temperature: 0.9, maxOutputTokens: 500, thinkingConfig: { thinkingBudget: 0 } },
      }),
    });
    if (r.status === 404) { console.error("modelo no encontrado:", model); continue; }
    if (!r.ok) {
      const detail = (await r.text()).slice(0, 400);
      console.error("gemini", model, r.status, detail);
      return new Response(JSON.stringify({ error: "gemini", status: r.status }), { status: 502, headers: h });
    }
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
