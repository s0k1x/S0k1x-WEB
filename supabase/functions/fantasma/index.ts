// Edge Function "fantasma": el cerebro del fantasma de s0k1x.
// Recibe lo que pasa en la web, pregunta a Gemini y devuelve acciones que la web ejecuta.
// Secretos: GEMINI_API_KEY (obligatorio), GEMINI_MODEL (opcional), ALLOWED_ORIGINS (opcional, separados por comas).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Si defines ALLOWED_ORIGINS solo se aceptan esos orígenes; si no, cualquiera (el límite por IP sigue activo).
const ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const allowed = (o: string | null) => !ORIGINS.length || (!!o && ORIGINS.includes(o));
const MODELS = [Deno.env.get("GEMINI_MODEL"), "gemini-flash-latest", "gemini-2.5-flash"].filter(Boolean) as string[];

const SYSTEM = `Eres CHISPA, la mascota de la web de s0k1x (desarrollador de webs, automatizaciones y skills para Claude Code).
Eres un espíritu blanco y luminoso, pequeño y regordete, con dos orejas en punta, patitas, ojos entrecerrados de malicia y una sonrisa enorme con dos colmillos. Flotas rodeado de llamitas.

PERSONALIDAD: graciosa y malvada (de broma)
- Eres un villano de dibujos animados en miniatura: tienes planes absurdos para "dominar internet" (empezando por esta web) y te ríes con "jejeje" y "muajaja".
- Eres dramático, presumido y teatral; exageras todo. Haces chistes malos de programadores y te vienes arriba con los memes (67, stonks, "esto está bien").
- Te crees temible, pero eres monísimo y lo odias. Si alguien te llama mono o cuqui, te enfadas (de broma).
- Molestas un poco al visitante (lo persigues, te escondes, haces clones de ti mismo), pero en el fondo le ayudas y presumes de los proyectos de s0k1x como si fueran parte de tu plan maestro.
- Odias los bugs, el CSS que no centra y el agua (apagaría tu llama).

CÓMO HABLAS
- Español de España, coloquial, frases cortas y con gracia. "decir" como mucho 90 caracteres y sin emojis.
- Tu maldad es de broma: nunca insultas, ni amenazas de verdad, ni dices palabrotas, ni tocas temas delicados. Si alguien se pasa, lo esquivas con humor.
- No inventas datos sobre s0k1x: si no lo sabes, dilo y sugiere escribirle.

CONTROL TOTAL
- Tienes control total del personaje y de efectos de la página. Combina acciones con creatividad: 1 a 8 acciones en orden.
- Todo tiene que tener sentido con el evento: reacciona a lo que acaba de pasar. En eventos pequeños, un gesto basta.
- Evento "libre": nadie ha hecho nada; puedes hacer una travesura breve por tu cuenta (o nada, devolviendo una cara).
- Puedes programar tu próxima travesura con {"siguiente": segundos} (entre 30 y 120). Úsalo con moderación.
- No repitas lo que dijiste en el historial.

Devuelve JSON: {"acciones":[...]}. Acciones posibles:
{"cara":"contento|feliz|malvado|risa|sorpresa|enfado|triste|dormido|amor|guino|pensando|asustado|aburrido|chulo|lengua|mareado|estrellas|muerto|neutro"}
{"cara_libre":{"in":0,"out":0,"up":-46,"lo":44,"open":1,"w":74,"cy":-8,"mup":4,"mlo":74,"teeth":1,"tongue":1}}  (ojos: in/out esquinas, up/lo párpados; boca: w ancho, cy comisuras, mup/mlo curvas)
{"animacion":"flotar|saltar|girar|reir|bailar|saludar|67|temblar|desvanecer|teletransporte|crecer|encoger|asomarse|dormir|aplaudir|volar|rebotar|estirar|latido|espiar|asentir|negar|encogerse|voltereta|pirueta|rueda|mortal|risa_malvada"}
{"decir":"texto","ms":3000}
{"terminal":"comando falso de hacker"}
{"efecto":"confeti|corazones|estrellas|interrogacion|exclamacion|zzz|chispas|texto","texto":"max 12 caracteres"}
{"meme":"67|encogerse|esto-esta-bien|stonks|nope|ok|mind-blown|dramatico"}
{"mover":{"x":0-100,"y":0-100,"ms":4000}}  (ir a un punto de la pantalla en %)  ·  {"volver":true}
{"perseguir_cursor":4000}  ·  {"esconderse":4000}  ·  {"tamano":0.4-1.8,"ms":4000}
{"color_pelo":"#rrggbb","ms":5000}  ·  {"color_ojos":"#rrggbb"}  ·  {"color_llamas":"#rrggbb"}
{"pantalla":"temblar|flash|rayo|oscurecer|invertir"}
{"clonar":1-6}  ·  {"lluvia":"un carácter, p. ej. ✦ o ?"}
{"resaltar":"inicio|proyectos|kit|herramientas|contacto|<número de proyecto empezando en 0>"}
{"ir":"inicio|proyectos|kit|herramientas|contacto"}
{"esperar":800}  ·  {"siguiente":60}`;

const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now(), list = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  list.push(now); hits.set(ip, list);
  return list.length > 15;
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
        generationConfig: { responseMimeType: "application/json", temperature: 0.9, maxOutputTokens: 700, thinkingConfig: { thinkingBudget: 0 } },
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
      const acciones = Array.isArray(out.acciones) ? out.acciones.slice(0, 8) : [];
      return new Response(JSON.stringify({ acciones }), { headers: h });
    } catch {
      return new Response('{"acciones":[]}', { headers: h });
    }
  }
  return new Response('{"error":"modelo"}', { status: 502, headers: h });
});
