// Gamenfy — Jarvis (v9.11 — Jarvis 2.0 fase 1: function calling + actie-wachtrij)
// Jarvis kan nu zelf handelen: XP toekennen, habits afvinken, quests claimen,
// agenda-blokken plannen — via app_state.jarvis_actions, die de app zelf
// consumeert door de eigen engine (xp.js). Nooit rechtstreeks in de rpg-rij.
const GEMINI_KEY = 'REPLACE_ME_SERVER_SIDE_ONLY';
const GEMINI_MODEL = 'gemini-flash-latest';
const PIN = '1111';
const SB_URL = Deno.env.get('SUPABASE_URL')!;
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Gegenereerd uit xp.js + quests.js (v9.7): skill-validatie + quest-XP
const K = {"skills":{"saving":{"label":"Saving","icon":"🐖","habit":false,"ql":[30,60,20]},"investing":{"label":"Investing","icon":"📈","habit":false,"ql":[40,20,25,35]},"budgeting":{"label":"Budgeting","icon":"📋","habit":false,"ql":[25,15,20]},"net_worth":{"label":"Net Worth","icon":"🏦","habit":false,"ql":[30,20]},"gym":{"label":"Gym","icon":"🏋️","habit":false,"ql":[60,50,50,55,100]},"tennis":{"label":"Tennis","icon":"🎾","habit":false,"ql":[55,40,65,50]},"calisthenics":{"label":"Calisthenics","icon":"🤸","habit":false,"ql":[50,40,70]},"core":{"label":"Core","icon":"🔥","habit":false,"ql":[45,30,50,40]},"stretching":{"label":"Mobility","icon":"🧘","habit":false,"ql":[30,45,60]},"strength":{"label":"Strength","icon":"💪","habit":false,"ql":[60,100,50,50,55]},"recovery":{"label":"Recovery","icon":"❤️","habit":false,"ql":[30,20,40]},"endurance":{"label":"Endurance","icon":"🏃","habit":false,"ql":[40,30,35]},"sleep":{"label":"Sleep","icon":"😴","habit":true},"nutrition":{"label":"Nutrition","icon":"🥗","habit":true},"walking":{"label":"10k Steps","icon":"👟","habit":true},"grounding":{"label":"Grounding","icon":"🌱","habit":true},"teeth":{"label":"Brush Teeth 2×","icon":"🦷","habit":true},"household":{"label":"Household","icon":"🧹","habit":true},"reading":{"label":"Reading","icon":"📚","habit":false,"ql":[25,45,150]},"focus":{"label":"Deep Work","icon":"🎯","habit":false,"ql":[60,50,45]},"journaling":{"label":"Journaling","icon":"📓","habit":false,"ql":[20,35,40]},"meditation":{"label":"Meditation","icon":"🧘","habit":true},"gratitude":{"label":"Gratitude","icon":"🙏","habit":true},"sales":{"label":"Sales","icon":"🤝","habit":false,"ql":[40,30,150,20]},"marketing":{"label":"Marketing","icon":"📣","habit":false,"ql":[40,20,50,25]},"ai_tools":{"label":"AI Tools","icon":"🤖","habit":false,"ql":[50,30,20,70]},"coding":{"label":"Coding","icon":"💻","habit":false,"ql":[60,30,50,80]},"whistling":{"label":"Finger Whistling","icon":"🎵","habit":false,"ql":[20,50,40,60]},"dancing":{"label":"Dancing","icon":"🕺","habit":false,"ql":[30,55,40,70]},"coloring":{"label":"Coloring","icon":"🖍️","habit":false,"ql":[20,40,35]},"drawing":{"label":"Drawing","icon":"✏️","habit":false,"ql":[20,40,60]},"cooking":{"label":"Cooking","icon":"🍳","habit":false,"ql":[20,45,40]},"puzzling":{"label":"Puzzling","icon":"🧩","habit":false,"ql":[30,60,90,140]},"social":{"label":"Social","icon":"👥","habit":false,"ql":[35,40,25,30]},"dating":{"label":"Dating","icon":"❤️","habit":false,"ql":[50,40,20]},"planning":{"label":"Planning","icon":"📅","habit":false,"ql":[30,10,20]},"no_porn":{"label":"No Porn","icon":"🛡️","habit":false,"private":true},"weed_control":{"label":"Weed Control","icon":"🚫","habit":false,"private":true},"screen_time":{"label":"Screen Time","icon":"📵","habit":true},"cold_shower":{"label":"Cold Shower","icon":"🚿","habit":true},"languages":{"label":"French","icon":"🇫🇷","habit":false,"ql":[15,25,45,20]},"learning":{"label":"Learning","icon":"🎓","habit":false,"ql":[45,25,200,30]},"superiority":{"label":"Path to Superiority","icon":"🧠","habit":false,"ql":[50,150,80,100]},"piano":{"label":"Piano","icon":"🎹","habit":false,"ql":[30,55,80,100]},"content":{"label":"Content","icon":"🎬","habit":false,"ql":[60,25,40,100]}},"quests":{"saving":{"2":50,"4":100,"7":150,"12":250,"25":700,"40":1300,"60":2400,"80":3500,"100":6000},"investing":{"2":80,"5":150,"9":250,"14":300,"20":450,"26":600,"33":700,"42":900,"50":1400,"65":2000,"80":3500,"100":6000},"budgeting":{"1":30,"3":80,"6":120,"10":250,"15":300,"25":600,"40":1000,"60":2000,"85":4000},"net_worth":{"1":50,"5":120,"12":300,"25":700,"40":1200,"55":2000,"75":3500,"90":6000,"100":12000},"tennis":{"1":40,"2":50,"3":80,"4":90,"5":120,"7":150,"10":250,"15":350,"20":450,"30":700,"40":1000,"55":1800,"75":3000,"90":5000},"coloring":{"1":40,"4":90,"8":160,"14":260,"20":380,"30":550,"42":800,"55":1100,"70":1600,"88":2400},"drawing":{"1":40,"3":80,"6":150,"10":300,"16":420,"24":600,"34":850,"46":1200,"60":1700,"74":2300,"90":3200},"endurance":{"2":60,"5":130,"10":300,"16":420,"22":550,"30":750,"38":1000,"48":1400,"60":1900,"74":2600,"88":3400},"gym":{"1":40,"2":60,"3":100,"5":200,"7":260,"10":350,"15":480,"25":700,"40":1200,"50":1600,"70":2800,"90":5000},"calisthenics":{"3":80,"8":200,"14":350,"22":550,"30":800,"40":1200,"52":1800,"64":2600,"78":3800,"92":5500,"100":9000},"core":{"1":40,"2":50,"4":100,"6":180,"10":300,"15":350,"25":600,"30":750,"50":1200,"65":1600,"80":2500,"95":4000},"stretching":{"1":40,"3":90,"6":120,"10":250,"18":350,"25":500,"40":900,"60":1400,"80":2200,"95":3500},"recovery":{"1":40,"3":80,"6":150,"12":300,"20":500,"35":900,"50":1400,"70":2400,"90":4000},"strength":{"1":60,"3":100,"6":180,"10":300,"18":500,"28":800,"45":1500,"65":2500,"85":4500},"reading":{"2":50,"5":120,"10":250,"18":350,"25":550,"40":900,"50":1400,"60":1800,"75":2800,"90":4000,"100":6000},"focus":{"1":40,"3":100,"6":200,"12":400,"20":550,"35":800,"55":1800,"80":3500},"journaling":{"1":40,"3":80,"7":200,"15":500,"30":900,"50":1800,"75":4000},"sales":{"1":60,"3":150,"5":300,"10":500,"18":800,"30":1000,"45":1500,"65":2500,"85":4500},"marketing":{"1":40,"3":100,"6":250,"12":400,"20":600,"35":1000,"50":1800,"75":3500,"95":6000},"ai_tools":{"1":60,"3":120,"6":180,"12":350,"20":600,"35":1000,"55":2000,"80":4000},"coding":{"1":60,"3":100,"6":250,"12":450,"20":700,"30":900,"45":1500,"65":2800,"90":5500},"content":{"1":60,"3":120,"7":300,"15":450,"25":800,"40":1200,"60":2500,"85":4500},"dating":{"1":40,"2":50,"3":80,"5":150,"7":180,"10":300,"15":450,"25":600,"40":1000,"60":1800,"85":3500},"cooking":{"1":40,"3":100,"6":200,"12":350,"20":500,"35":900,"55":1600,"80":3000},"social":{"1":40,"3":90,"7":250,"15":400,"30":800,"50":1400,"75":3000},"planning":{"1":40,"3":100,"7":250,"15":400,"25":700,"45":1200,"70":2800},"puzzling":{"3":80,"10":200,"20":400,"32":650,"42":900,"55":1400,"65":1900,"75":2600,"88":4000,"100":7000},"languages":{"2":60,"5":120,"10":250,"15":350,"22":450,"30":600,"38":700,"45":850,"55":1100,"65":1400,"70":1700,"85":2500,"100":5000},"piano":{"2":50,"4":90,"6":150,"8":220,"10":300,"13":350,"16":420,"18":480,"20":600,"23":650,"25":720,"28":800,"30":950,"33":1000,"36":1150,"38":1300,"40":1500,"44":1700,"47":1900,"50":2200,"55":2600,"60":3200,"65":3800,"70":4500,"78":5500,"85":7000,"92":9000,"100":15000},"learning":{"2":50,"5":120,"10":300,"18":400,"25":550,"35":900,"50":1400,"70":2800,"90":5000},"superiority":{"3":100,"7":200,"11":250,"14":350,"18":350,"22":350,"28":450,"33":470,"38":500,"42":600,"47":600,"52":600,"56":650,"62":800,"70":1000,"78":1400,"84":1800,"92":2500,"100":5000},"whistling":{"2":60,"5":150,"10":250,"18":350,"28":500,"38":700,"50":1000,"65":1500,"82":2500,"100":4000},"dancing":{"1":60,"2":70,"3":90,"5":200,"8":250,"15":400,"25":700,"35":1000,"55":1800,"80":3500}}} as any;

async function getRow(key: string): Promise<any | null> {
  const r = await fetch(`${SB_URL}/rest/v1/app_state?key=eq.${encodeURIComponent(key)}&select=data`, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } });
  if (!r.ok) return null;
  const rows = await r.json();
  return rows.length ? rows[0].data : null;
}
async function putRow(key: string, data: unknown) {
  await fetch(`${SB_URL}/rest/v1/app_state`, { method: 'POST',
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({ key, data, updated_at: new Date().toISOString() }) });
}
function todayAms(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam' }).format(new Date());
}
async function queueAction(type: string, payload: any): Promise<string> {
  const row = (await getRow('jarvis_actions')) || {};
  const queue = Array.isArray(row.queue) ? row.queue : [];
  queue.push({ id: crypto.randomUUID(), ts: Date.now(), type, payload, consumed: false });
  await putRow('jarvis_actions', { queue: queue.slice(-100) });
  return 'queued';
}

function buildContext(rpg: any, notes: string[]): string {
  const parts: string[] = [];
  const today = todayAms();
  try {
    const days = rpg?.rpg_streak_v1?.days || {};
    const shift = (d: string, n: number) => { const p = d.split('-').map(Number); const x = new Date(Date.UTC(p[0], p[1]-1, p[2]+n)); return x.toISOString().slice(0,10); };
    let streak = 0, cursor = days[today] ? today : shift(today, -1);
    while (days[cursor]) { streak++; cursor = shift(cursor, -1); }
    parts.push(`Streak: ${streak} dagen (vandaag ${days[today] ? 'veilig' : 'nog open'}).`);
  } catch (_) {}
  try {
    const hl = rpg?.rpg_habitlog_v1 || {};
    const done = Object.keys(hl).filter(k => hl[k]?.[today]);
    const allH = Object.keys(K.skills).filter(k => K.skills[k].habit && !K.skills[k].private);
    parts.push(`Habits vandaag: ${done.length ? done.join(', ') : 'nog geen'} — open: ${allH.filter(k => !done.includes(k)).join(', ')}.`);
  } catch (_) {}
  try {
    const ag = rpg?.['rpg_agenda_v1:' + today];
    if (Array.isArray(ag) && ag.length) parts.push(`Agenda vandaag: ${ag.map((i: any) => i.time + ':00 ' + i.label + (i.done ? ' ✓' : '')).join(' · ')}.`);
  } catch (_) {}
  try {
    for (const v of rpg?.rpg_ventures_v1?.ventures || []) {
      if (v.status !== 'active') continue;
      let done = 0, total = 0, next = '';
      for (const p of v.phases || []) for (const s of p.steps || []) { total++; if (s.done) done++; else if (!next) next = s.title; }
      parts.push(`Venture ${v.name}: ${done}/${total}. Volgende: ${next || 'klaar'}.`);
    }
  } catch (_) {}
  if (notes.length) parts.push('Notities: ' + notes.slice(-12).join(' | '));
  return parts.join('\n');
}

const TOOLS = [{ functionDeclarations: [
  { name: 'award_xp', description: 'Ken XP toe aan een skill omdat Joey iets heeft gedaan. Gebruik de quickLog-bedragen van die skill als anker (typisch 20-60). Max 200 tenzij een expliciete mijlpaal.',
    parameters: { type: 'OBJECT', properties: { skill: { type: 'STRING' }, amount: { type: 'NUMBER' }, reason: { type: 'STRING' } }, required: ['skill','amount','reason'] } },
  { name: 'check_habit', description: 'Vink een daily habit af voor vandaag (of gisteren met date=YYYY-MM-DD). Alleen voor skills met habit:true.',
    parameters: { type: 'OBJECT', properties: { key: { type: 'STRING' }, date: { type: 'STRING' } }, required: ['key'] } },
  { name: 'claim_quest', description: 'Claim een quest die Joey aantoonbaar heeft gehaald. Geeft de quest-XP automatisch.',
    parameters: { type: 'OBJECT', properties: { skill: { type: 'STRING' }, lvl: { type: 'NUMBER' } }, required: ['skill','lvl'] } },
  { name: 'plan_agenda', description: 'Plan een agenda-blok (uur 6-23, vandaag of date=YYYY-MM-DD).',
    parameters: { type: 'OBJECT', properties: { skill: { type: 'STRING' }, hour: { type: 'NUMBER' }, date: { type: 'STRING' } }, required: ['skill','hour'] } },
  { name: 'get_state', description: 'Haal actuele data op: habits (scores), skills (xp per skill), quests_done, agenda (vandaag), weight.',
    parameters: { type: 'OBJECT', properties: { section: { type: 'STRING' } }, required: ['section'] } },
  { name: 'propose_change', description: 'Zet een verbetervoorstel voor de app in de backlog voor Claudia (de bouwer). Gebruik dit als Joey iets wil dat jij niet kunt.',
    parameters: { type: 'OBJECT', properties: { title: { type: 'STRING' }, detail: { type: 'STRING' } }, required: ['title'] } },
] }];

async function execTool(name: string, args: any, rpg: any): Promise<any> {
  const s = args?.skill ?? args?.key;
  if (name === 'award_xp') {
    if (!K.skills[args.skill]) return { error: 'onbekende skill', geldige_skills: Object.keys(K.skills).filter(k=>!K.skills[k].private) };
    await queueAction('addXP', { skill: args.skill, amount: args.amount, reason: args.reason });
    return { ok: true, note: 'XP staat klaar en verschijnt binnen een minuut in de app' };
  }
  if (name === 'check_habit') {
    if (!K.skills[args.key]?.habit) return { error: 'geen habit', habits: Object.keys(K.skills).filter(k=>K.skills[k].habit && !K.skills[k].private) };
    await queueAction('checkHabit', { key: args.key, date: args.date });
    return { ok: true };
  }
  if (name === 'claim_quest') {
    const xp = K.quests[args.skill]?.[args.lvl];
    if (!xp) return { error: 'onbekende quest', ladders: Object.keys(K.quests) };
    const doneMap = rpg?.rpg_quests_done_v1 || {};
    if (doneMap[args.skill + ':' + args.lvl]) return { error: 'al geclaimd' };
    await queueAction('claimQuest', { skill: args.skill, lvl: args.lvl });
    return { ok: true, xp };
  }
  if (name === 'plan_agenda') {
    if (!K.skills[args.skill]) return { error: 'onbekende skill' };
    await queueAction('planAgenda', { skillKey: args.skill, hour: args.hour, date: args.date });
    return { ok: true };
  }
  if (name === 'get_state') {
    const today = todayAms();
    switch (String(args.section)) {
      case 'habits': { const out: any = {}; const hl = rpg?.rpg_habitlog_v1 || {};
        for (const [k, h] of Object.entries(rpg?.rpg_habits_v1 || {})) out[k] = { score: (h as any).score, vandaag: !!hl[k]?.[today] };
        return out; }
      case 'skills': { const out: any = {}; for (const [k, v] of Object.entries(rpg?.rpg_character_v1?.skills || {})) if (!K.skills[k]?.private) out[k] = (v as any).xp; return out; }
      case 'quests_done': return rpg?.rpg_quests_done_v1 || {};
      case 'agenda': return rpg?.['rpg_agenda_v1:' + today] || [];
      case 'weight': return (await getRow('po-coach'))?.po_coach_weights?.slice(-14) || [];
      default: return { error: 'sections: habits|skills|quests_done|agenda|weight' };
    }
  }
  if (name === 'propose_change') {
    const row = (await getRow('jarvis_backlog')) || {};
    const items = Array.isArray(row.items) ? row.items : [];
    items.push({ ts: new Date().toISOString(), title: String(args.title).slice(0, 120), detail: String(args.detail || '').slice(0, 600) });
    await putRow('jarvis_backlog', { items: items.slice(-50) });
    return { ok: true, note: 'staat in de backlog voor Claudia' };
  }
  return { error: 'onbekende tool' };
}

Deno.serve(async (req: Request) => {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'content-type, x-jarvis-pin', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.headers.get('x-jarvis-pin') !== PIN) return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: cors });

  let userMsg = '';
  let audio: { data: string; mime: string } | null = null;
  try {
    const b = await req.json();
    userMsg = String(b.message || '').slice(0, 4000);
    if (b.audio?.data && b.audio?.mime) audio = { data: String(b.audio.data).slice(0, 8_000_000), mime: String(b.audio.mime).slice(0, 40) };
  } catch (_) {}
  if (!userMsg && !audio) return new Response(JSON.stringify({ error: 'empty' }), { status: 400, headers: cors });

  const rpg = await getRow('rpg');
  const mem = (await getRow('jarvis_memory')) || { notes: [], history: [] };
  const notes: string[] = Array.isArray(mem.notes) ? mem.notes : [];
  const history: any[] = Array.isArray(mem.history) ? mem.history : [];

  const skillList = Object.entries(K.skills).filter(([, v]: any) => !v.private)
    .map(([k, v]: any) => `${k}${v.habit ? ' (habit)' : ''}`).join(', ');
  const voiceRule = audio ? `\n\nDe gebruiker stuurde een NEDERLANDS SPRAAKBERICHT als audio. Begin je output EXACT zo: <heard>letterlijke, beknopte transcriptie</heard> en handel daarna de inhoud af.` : '';
  const system = `Je bent Jarvis, Joey's persoonlijke coach binnen Gamenfy — zijn RPG-levensdashboard. Toon: direct, warm, Nederlands, kort (max ~120 woorden). Kernprincipe: duw Joey altijd naar één concrete eerste actie van vandaag.

JIJ KUNT HANDELEN via tools. Als Joey zegt dat hij iets heeft GEDAAN: ken direct XP toe (award_xp, quickLog-bedragen als anker) en/of vink de habit af (check_habit) en/of claim de quest (claim_quest) — vraag geen bevestiging bij duidelijke gevallen. Noem in je antwoord kort wat je hebt uitgevoerd met ✅. Als iets "niet lukt": kijk met get_state naar zijn ladder en stel een haalbaar alternatief voor (lagere quest of quickLog). Wil Joey iets aan de app veranderen: propose_change.

GAMENFY-KENNIS: XP → levels 1-100. Tier gates op 10/25/50/75 (gate-quest claimen ontgrendelt het level). Habits: +15 XP per check, score 0-10, −1 per gemiste dag. Fysieke skills: −1 level per 14 dagen inactief. Joey traint push/pull/core — GEEN squat of deadlift. Skills: ${skillList}.
Vandaag: ${todayAms()}.${voiceRule}

Bij blijvende inzichten over Joey: eindig met <remember>notitie</remember> (max 1).

LIVE STATUS:
${buildContext(rpg, notes)}`;

  const histContents = history.slice(-16).map((m: any) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: String(m.content || '') }] }));
  const userParts: any[] = [];
  if (audio) userParts.push({ inlineData: { mimeType: audio.mime, data: audio.data } });
  if (userMsg) userParts.push({ text: userMsg });
  if (audio && !userMsg) userParts.push({ text: '(spraakbericht — transcribeer en handel af)' });
  const contents: any[] = [...histContents, { role: 'user', parts: userParts }];

  let reply = '';
  for (let round = 0; round < 5; round++) {
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-goog-api-key': GEMINI_KEY },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents, tools: TOOLS,
        generationConfig: { maxOutputTokens: 700, temperature: 0.7 } }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      return new Response(JSON.stringify({ reply: 'Jarvis-storing: ' + t.slice(0, 200) }), { headers: cors });
    }
    const data = await resp.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const calls = parts.filter((p: any) => p.functionCall);
    if (!calls.length) {
      reply = parts.map((p: any) => p.text || '').join('').trim();
      break;
    }
    contents.push({ role: 'model', parts });
    const responses: any[] = [];
    for (const c of calls) {
      const result = await execTool(c.functionCall.name, c.functionCall.args || {}, rpg);
      responses.push({ functionResponse: { name: c.functionCall.name, response: { result } } });
    }
    contents.push({ role: 'user', parts: responses });
  }
  if (!reply) reply = '…';

  let heard = '';
  const hm = reply.match(/<heard>([\s\S]*?)<\/heard>/);
  if (hm) { heard = hm[1].trim().slice(0, 600); reply = reply.replace(/<heard>[\s\S]*?<\/heard>/g, '').trim(); }
  const rm = reply.match(/<remember>([\s\S]*?)<\/remember>/);
  if (rm) { notes.push(rm[1].trim().slice(0, 200)); reply = reply.replace(/<remember>[\s\S]*?<\/remember>/g, '').trim(); }

  const userForHistory = userMsg || (heard ? '🎙️ ' + heard : '🎙️ (spraakbericht)');
  const newHistory = [...history, { role: 'user', content: userForHistory }, { role: 'assistant', content: reply }].slice(-40);
  await putRow('jarvis_memory', { notes: notes.slice(-50), history: newHistory });

  return new Response(JSON.stringify({ reply, heard: heard || undefined }), { headers: cors });
});
