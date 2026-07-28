/**
 * Self-contained HTML scenes for AppSumo PNG export.
 * Kept outside React so Playwright can render without a Next.js server.
 */

function uptimeBars(incidentIndex = 31): string {
  const bars: string[] = [];
  for (let i = 0; i < 90; i++) {
    let cls = "";
    if (i === incidentIndex) cls = "down";
    else if (i === 16) cls = "maintenance";
    bars.push(`<span${cls ? ` class="${cls}"` : ""}></span>`);
  }
  return bars.join("");
}

export interface AppsumoSceneSize {
  width: number;
  height: number;
}

const DEFAULT_SIZE: AppsumoSceneSize = { width: 1920, height: 1080 };

function shell(
  title: string,
  css: string,
  body: string,
  size: AppsumoSceneSize = DEFAULT_SIZE,
): string {
  const { width, height } = size;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Instrument+Sans:wght@400;500;600;700&family=Spline+Sans+Mono:wght@400;500&display=swap"/>
<style>
:root{
  --cream-50:#fffdf7;--cream-100:#faf5ea;--carbon-900:#17130e;--ember-400:#f5921b;--ember-600:#d9480f;
  --green-bold:#2f9e44;--green-soft:#ebfbee;--green-text:#237032;--pepper-bold:#e03131;--pepper-soft:#fff5f5;--pepper-text:#c92a2a;
  --amber-bold:#f0b429;--amber-soft:#fff9db;--amber-text:#9a6700;--blue-bold:#1864ab;--verify-bold:#e8590c;
  --border-subtle:#e6dac3;--text-primary:#17130e;--text-secondary:#3e382f;--text-muted:#5c544a;
  --bg-primary:#fffdf7;--bg-secondary:#faf5ea;--bg-elevated:#fffdf7;
  --font-display:"Fraunces",Georgia,serif;--font-sans:"Instrument Sans",system-ui,sans-serif;--font-mono:"Spline Sans Mono",monospace;
}
*{box-sizing:border-box} html,body{margin:0;padding:0;width:${width}px;height:${height}px;overflow:hidden;font-family:var(--font-sans);color:var(--text-primary)}
#appsumo-canvas{width:${width}px;height:${height}px;overflow:hidden}
.badge{display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;font-size:13px;font-weight:600;border:1px solid transparent}
.badge::before{content:"";width:8px;height:8px;border-radius:50%;background:currentColor}
.badge--operational{color:var(--green-text);background:var(--green-soft);border-color:rgb(47 158 68/.25)}
.badge--down{color:var(--pepper-text);background:var(--pepper-soft);border-color:rgb(224 49 49/.25)}
.badge--degraded{color:var(--amber-text);background:var(--amber-soft);border-color:rgb(240 180 41/.35)}
.uptime-chart{display:flex;gap:2px;height:40px;align-items:stretch;margin-top:12px}
.uptime-chart span{flex:1;border-radius:3px;background:var(--green-bold)}
.uptime-chart span.down{background:var(--pepper-bold)} .uptime-chart span.maintenance{background:var(--blue-bold)}
.caption{font-size:12px;color:var(--text-muted)} .mono{font-family:var(--font-mono)}
${css}
</style>
<title>${title}</title>
</head>
<body>
<div id="appsumo-canvas" data-appsumo-ready="true">${body}</div>
</body></html>`;
}

/** AppSumo wordmark slot: image must be 4:1 to 10:1 wide. */
export const APPSUMO_WORDMARK_SIZE: AppsumoSceneSize = { width: 2000, height: 400 };

export const APPSUMO_HTML_SCENES = {
  wordmark: {
    filename: "00-wordmark.png",
    alt: "Fajita horizontal wordmark logo.",
    size: APPSUMO_WORDMARK_SIZE,
    html: shell(
      "Wordmark",
      `.w{display:grid;place-items:center;height:100%;background:var(--cream-50);padding:0 120px} .w svg{height:280px;width:auto;max-width:100%}`,
      `<div class="w"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 184.1 64" role="img" aria-label="Fajita"><rect x="3.5" y="3.5" width="57" height="57" rx="16" stroke="#17130e" stroke-width="5" fill="none"/><path d="M14 42h9.5L32 25.5 40.5 42H50" stroke="#17130e" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="32" cy="15.5" r="4.5" fill="#d9480f"/><g transform="translate(84 4) scale(0.4542)"><path d="M44.1 27.8Q45.2 27.8 46.15 27.48Q47.1 27.15 47.73 26.83Q48.35 26.5 48.5 26.5Q48.65 26.5 48.73 26.65Q48.8 26.8 48.95 27.5L53.4 45.3Q53.45 45.65 53.4 45.78Q53.35 45.9 53.25 46Q53.1 46.05 52.98 45.98Q52.85 45.9 52.7 45.65Q48.95 39.15 45.83 35.48Q42.7 31.8 39.78 30.3Q36.85 28.8 33.7 28.8L24 28.8L24 95.1Q24 95.7 24.58 96.05Q25.15 96.4 26.3 96.5L32.3 97.1Q32.65 97.15 32.77 97.23Q32.9 97.3 32.9 97.5Q32.9 97.6 32.77 97.7Q32.65 97.8 32.4 97.8L3.9 97.8Q3.65 97.8 3.53 97.7Q3.4 97.6 3.4 97.5Q3.4 97.15 4 97.1L8.1 96.5Q9.05 96.35 9.53 96.03Q10 95.7 10 95.1L10 30.5Q10 29.9 9.53 29.58Q9.05 29.25 8.1 29.1L4 28.5Q3.4 28.45 3.4 28.1Q3.4 28 3.53 27.9Q3.65 27.8 3.9 27.8ZM20.5 62.3L33.35 62.3Q37.75 62.3 39.93 60.43Q42.1 58.55 42.55 53.5Q42.6 53.25 42.68 53.15Q42.75 53.05 42.85 53.05Q43.25 53.05 43.4 53.6L47.45 70.9Q47.5 71.2 47.45 71.35Q47.4 71.5 47.25 71.55Q47.2 71.6 47.05 71.58Q46.9 71.55 46.65 71.4Q44.45 68.2 42.7 66.43Q40.95 64.65 39.1 63.93Q37.25 63.2 34.65 63.2L20.5 63.2Z" fill="#17130e"/><path d="M79.47 93.2L79.47 92.7L78.92 93.2L78.92 61Q78.92 57.4 77.42 55.48Q75.92 53.55 73.17 53.55Q70.02 53.55 68.47 55.15Q66.92 56.75 66.92 58.7L66.92 62.7Q66.92 65.25 65.14 66.95Q63.37 68.65 60.62 68.65Q58.67 68.65 57.39 67.48Q56.12 66.3 56.12 63.85Q56.12 61.25 58.22 58.73Q60.32 56.2 64.42 54.55Q68.52 52.9 74.57 52.9Q82.77 52.9 86.84 56.33Q90.92 59.75 90.92 66.05L90.92 92Q90.92 93.75 91.52 94.53Q92.12 95.3 93.02 95.3Q93.87 95.3 94.62 94.75Q95.37 94.2 95.52 92.95Q95.52 92.75 95.59 92.68Q95.67 92.6 95.77 92.6Q95.87 92.6 95.92 92.68Q95.97 92.75 95.97 92.9Q95.97 93.85 95.12 95.2Q94.27 96.55 92.32 97.63Q90.37 98.7 87.12 98.7Q83.12 98.7 81.29 97.15Q79.47 95.6 79.47 93.2ZM53.62 88.05Q53.62 82.65 58.12 79.33Q62.62 76 72.42 76Q75.52 76 77.47 76.63Q79.42 77.25 81.07 78.15L80.72 78.5Q79.02 77.65 77.24 77.23Q75.47 76.8 73.32 76.8Q69.57 76.8 67.54 79.3Q65.52 81.8 65.52 86.35Q65.52 90.7 67.47 93.03Q69.42 95.35 72.57 95.35Q74.62 95.35 76.64 94.35Q78.67 93.35 80.02 91.5L80.57 91.85Q78.37 95.2 74.54 96.98Q70.72 98.75 66.32 98.75Q60.72 98.75 57.17 95.75Q53.62 92.75 53.62 88.05Z" fill="#17130e"/><path d="M115.35 90.25Q115.35 93.6 115.95 96.18Q116.55 98.75 117.35 100.93Q118.15 103.1 118.77 105.3Q119.4 107.5 119.4 110.05Q119.4 114.85 116.42 117.73Q113.45 120.6 108.15 120.6Q104.15 120.6 101.35 119.35Q98.55 118.1 97.1 116Q95.65 113.9 95.65 111.4Q95.65 108.4 97.1 106.98Q98.55 105.55 100.9 105.55Q103.25 105.55 104.8 107.18Q106.35 108.8 106.35 111.45L106.35 116Q106.35 117.9 107.07 118.8Q107.8 119.7 109.25 119.7Q111.4 119.7 112.52 118.25Q113.65 116.8 113.65 114Q113.65 111.45 112.62 109.15Q111.6 106.85 110.07 104.73Q108.55 102.6 107 100.53Q105.45 98.45 104.42 96.28Q103.4 94.1 103.4 91.65L103.4 58.6Q103.4 58.25 103.25 58.08Q103.1 57.9 102.75 57.9L99.5 57.9Q99.25 57.9 99.15 57.8Q99.05 57.7 99.05 57.55Q99.05 57.3 99.45 57.2L113.7 53.25Q114.15 53.1 114.35 53.05Q114.55 53 114.8 53Q115.05 53 115.2 53.18Q115.35 53.35 115.35 53.65Z" fill="#17130e"/><path d="M139.24 53.6L139.24 95.05Q139.24 95.7 139.54 96.1Q139.84 96.5 140.49 96.65L143.19 97.1Q143.54 97.1 143.64 97.23Q143.74 97.35 143.74 97.5Q143.74 97.6 143.61 97.7Q143.49 97.8 143.29 97.8L123.19 97.8Q123.04 97.8 122.91 97.7Q122.79 97.6 122.79 97.5Q122.79 97.35 122.89 97.28Q122.99 97.2 123.24 97.15L126.14 96.65Q126.79 96.45 127.06 96.08Q127.34 95.7 127.34 95.05L127.34 58.55Q127.34 58.25 127.19 58.08Q127.04 57.9 126.69 57.9L123.39 57.9Q123.19 57.9 123.09 57.83Q122.99 57.75 122.99 57.55Q122.99 57.35 123.11 57.3Q123.24 57.25 123.39 57.2L137.69 53.2Q138.19 53.05 138.36 53.03Q138.54 53 138.74 53Q139.04 53 139.14 53.18Q139.24 53.35 139.24 53.6ZM133.09 46.7Q129.94 46.7 127.96 44.6Q125.99 42.5 125.99 39.5Q125.99 36.45 127.96 34.35Q129.94 32.25 133.09 32.25Q136.24 32.25 138.29 34.35Q140.34 36.45 140.34 39.5Q140.34 42.5 138.29 44.6Q136.24 46.7 133.09 46.7Z" fill="#17130e"/><path d="M150.18 55.5L145.83 54.65Q145.58 54.55 145.45 54.48Q145.33 54.4 145.33 54.25Q145.33 54.15 145.45 54.03Q145.58 53.9 145.68 53.9L150.03 53.9Q150.38 53.9 150.58 53.8Q150.78 53.7 151.03 53.45L160.68 43.95Q160.98 43.75 161.25 43.58Q161.53 43.4 161.73 43.4Q162.03 43.4 162.18 43.6Q162.33 43.8 162.33 44.15L162.33 86.25Q162.33 90.3 163.88 92.28Q165.43 94.25 168.08 94.25Q169.03 94.25 169.9 93.98Q170.78 93.7 171.5 93.1Q172.23 92.5 172.8 91.45Q173.38 90.4 173.78 88.95Q173.88 88.65 174.1 88.7Q174.33 88.75 174.23 89.05Q173.43 92.3 172 94.45Q170.58 96.6 168.35 97.65Q166.13 98.7 162.98 98.7Q157.13 98.7 153.98 95.95Q150.83 93.2 150.83 87.5L150.83 56.5Q150.83 56.05 150.7 55.83Q150.58 55.6 150.18 55.5ZM158.68 54.95L159.03 53.9L173.88 53.9Q174.13 53.9 174.23 54Q174.33 54.1 174.33 54.25Q174.33 54.55 174.03 54.75Q173.73 54.95 173.13 54.95Z" fill="#17130e"/><path d="M202.95 93.2L202.95 92.7L202.4 93.2L202.4 61Q202.4 57.4 200.9 55.48Q199.4 53.55 196.65 53.55Q193.5 53.55 191.95 55.15Q190.4 56.75 190.4 58.7L190.4 62.7Q190.4 65.25 188.62 66.95Q186.85 68.65 184.1 68.65Q182.15 68.65 180.87 67.48Q179.6 66.3 179.6 63.85Q179.6 61.25 181.7 58.73Q183.8 56.2 187.9 54.55Q192 52.9 198.05 52.9Q206.25 52.9 210.32 56.33Q214.4 59.75 214.4 66.05L214.4 92Q214.4 93.75 215 94.53Q215.6 95.3 216.5 95.3Q217.35 95.3 218.1 94.75Q218.85 94.2 219 92.95Q219 92.75 219.07 92.68Q219.15 92.6 219.25 92.6Q219.35 92.6 219.4 92.68Q219.45 92.75 219.45 92.9Q219.45 93.85 218.6 95.2Q217.75 96.55 215.8 97.63Q213.85 98.7 210.6 98.7Q206.6 98.7 204.77 97.15Q202.95 95.6 202.95 93.2ZM177.1 88.05Q177.1 82.65 181.6 79.33Q186.1 76 195.9 76Q199 76 200.95 76.63Q202.9 77.25 204.55 78.15L204.2 78.5Q202.5 77.65 200.72 77.23Q198.95 76.8 196.8 76.8Q193.05 76.8 191.02 79.3Q189 81.8 189 86.35Q189 90.7 190.95 93.03Q192.9 95.35 196.05 95.35Q198.1 95.35 200.12 94.35Q202.15 93.35 203.5 91.5L204.05 91.85Q201.85 95.2 198.02 96.98Q194.2 98.75 189.8 98.75Q184.2 98.75 180.65 95.75Q177.1 92.75 177.1 88.05Z" fill="#17130e"/><circle cx="109.2" cy="39.48" r="8.05" fill="#d9480f"/></g></svg></div>`,
      APPSUMO_WORDMARK_SIZE,
    ),
  },

  hero: {
    filename: "01-hero.png",
    alt: "Fajita uptime monitoring hero: verified alerts, Slack notifications, and public status pages.",
    html: shell(
      "Hero",
      `.hero{display:grid;grid-template-columns:1fr 1.05fr;height:100%;background:radial-gradient(120% 90% at 12% 88%, rgb(232 89 12/.18), transparent 55%), radial-gradient(80% 60% at 88% 18%, rgb(245 146 27/.12), transparent 50%), #17130e;color:#faf5ea}
.left{display:flex;flex-direction:column;justify-content:center;padding:96px 80px 96px 112px;gap:24px}
.left svg{width:220px;height:auto}
.eyebrow{margin:0;font-family:var(--font-mono);font-size:14px;letter-spacing:.12em;text-transform:uppercase;color:var(--ember-400)}
.headline{margin:0;font-family:var(--font-display);font-size:72px;line-height:1.02;letter-spacing:-.03em;max-width:14ch}
.deck{margin:0;font-size:22px;line-height:1.5;color:rgb(250 245 234/.72);max-width:36ch}
.chips{display:flex;flex-wrap:wrap;gap:10px;margin-top:8px}
.chip{padding:8px 14px;border-radius:999px;border:1px solid rgb(250 245 234/.14);background:rgb(250 245 234/.06);font-size:14px;color:rgb(250 245 234/.82)}
.right{display:flex;align-items:center;justify-content:center;padding:72px 96px 72px 24px}
.device{width:100%;max-width:780px;border-radius:20px;border:1px solid rgb(250 245 234/.12);background:#1f1a14;box-shadow:0 40px 100px rgb(0 0 0/.45);overflow:hidden}
.device-head{padding:20px 24px;border-bottom:1px solid rgb(250 245 234/.1);display:flex;align-items:center;justify-content:space-between}
.device-body{padding:28px 32px 36px}
.row{display:grid;grid-template-columns:1.2fr .8fr .8fr;gap:12px;align-items:center;padding:14px 0;border-top:1px solid rgb(250 245 234/.08)}
.row:first-of-type{border-top:none;padding-top:0}
.th{display:grid;grid-template-columns:1.2fr .8fr .8fr;gap:12px;margin-bottom:24px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:rgb(250 245 234/.45)}`,
      `<div class="hero"><div class="left"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 184.1 64"><rect x="3.5" y="3.5" width="57" height="57" rx="16" stroke="#faf5ea" stroke-width="5" fill="none"/><path d="M14 42h9.5L32 25.5 40.5 42H50" stroke="#faf5ea" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="32" cy="15.5" r="4.5" fill="#f5921b"/></svg><p class="eyebrow">Uptime monitoring</p><h1 class="headline">Know when your software gets too hot.</h1><p class="deck">Fajita watches websites, APIs, certificates, and cron jobs. Verified alerts reach your team before customers start asking.</p><div class="chips"><span class="chip">Verified failures</span><span class="chip">Slack and email alerts</span><span class="chip">Public status pages</span></div></div><div class="right"><div class="device"><div class="device-head"><span class="mono caption" style="color:rgb(250 245 234/.55)">fajita · monitors</span><span class="badge badge--operational">4 monitors healthy</span></div><div class="device-body"><div class="th"><span>Monitor</span><span>Status</span><span>Uptime</span></div><div class="row"><span>genius.ly</span><span class="badge badge--operational">Operational</span><span class="mono" style="color:#f5921b">99.98%</span></div><div class="row"><span>api.genius.ly/health</span><span class="badge badge--operational">Operational</span><span class="mono" style="color:#f5921b">99.96%</span></div><div class="row"><span>TLS genius.ly:443</span><span class="badge badge--operational">Operational</span><span class="mono" style="color:#f5921b">100%</span></div><div class="row"><span>nightly-backup heartbeat</span><span class="badge badge--operational">Operational</span><span class="mono" style="color:#f5921b">99.99%</span></div><div class="uptime-chart">${uptimeBars()}</div><div style="display:flex;justify-content:space-between;margin-top:8px"><span class="caption" style="color:rgb(250 245 234/.45)">90 days ago</span><span class="caption" style="color:rgb(250 245 234/.45)">All monitors · last 90 days</span><span class="caption" style="color:rgb(250 245 234/.45)">Today</span></div></div></div></div></div>`,
    ),
  },

  "slack-alerts": {
    filename: "02-slack-verified-alert-and-recovery.png",
    alt: "Slack channel showing a verified Fajita incident alert and recovery message for Checkout API.",
    html: shell(
      "Slack alerts",
      `.slack{display:grid;grid-template-columns:260px 1fr;height:100%;background:#fff}
.side{background:#3f0e40;color:#fff;padding:20px 0}.workspace{padding:0 16px 20px;font-weight:700;font-size:18px;border-bottom:1px solid rgb(255 255 255/.12);margin-bottom:12px}
.channel{padding:8px 16px;background:rgb(255 255 255/.12);font-size:15px}
.main{display:flex;flex-direction:column}.head{padding:16px 24px;border-bottom:1px solid #e8e8e8;font-weight:700;font-size:18px}
.feed{flex:1;padding:24px 32px;display:flex;flex-direction:column;gap:28px}
.msg{display:grid;grid-template-columns:44px 1fr;gap:12px 16px}
.avatar{width:44px;height:44px;border-radius:8px;background:#d9480f;display:grid;place-items:center;color:#fff;font-weight:700;font-size:16px}
.avatar.ok{background:#2f9e44}.meta{display:flex;align-items:baseline;gap:10px}.name{font-weight:700;font-size:15px}
.time,.app{font-size:12px;color:#616061}.app{font-size:10px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;border:1px solid #ddd;border-radius:3px;padding:1px 4px}
.card{margin-top:8px;border-left:4px solid #e03131;border-radius:4px;box-shadow:0 1px 0 rgb(0 0 0/.08)}.card.ok{border-left-color:#2f9e44}
.card-head{padding:12px 16px 8px;font-weight:700;font-size:15px}.card-body{padding:0 16px 12px;font-size:15px;line-height:1.45}
.fields{display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;padding:0 16px 12px;font-size:13px}.label{font-weight:700;color:#616061;margin-bottom:2px}
.btn{display:inline-block;margin:4px 16px 14px;padding:8px 14px;border-radius:4px;background:#007a5a;color:#fff;font-size:14px;font-weight:700}`,
      `<div class="slack"><aside class="side"><div class="workspace">Genius</div><div class="channel"># ops-alerts</div></aside><div class="main"><header class="head"># ops-alerts</header><div class="feed"><div class="msg"><div class="avatar">F</div><div><div class="meta"><span class="name">Fajita</span><span class="app">APP</span><span class="time">9:42 AM</span></div><div class="card"><div class="card-head">[Major] Checkout API</div><div class="card-body">Checkout API failed verification on two consecutive checks from us-east and eu-west.</div><div class="fields"><div><div class="label">State</div><div>Down</div></div><div><div class="label">Host</div><div>api.genius.ly</div></div><div><div class="label">Opened</div><div>2026-07-27 09:41 UTC</div></div><div><div class="label">Verification</div><div>Confirmed</div></div></div><span class="btn">Open in Fajita</span></div></div></div><div class="msg"><div class="avatar ok">F</div><div><div class="meta"><span class="name">Fajita</span><span class="app">APP</span><span class="time">9:58 AM</span></div><div class="card ok"><div class="card-head">[Resolved] Checkout API is operational</div><div class="card-body">Checkout API has recovered. Checks are passing again from all regions.</div><div class="fields"><div><div class="label">State</div><div>Operational</div></div><div><div class="label">Host</div><div>api.genius.ly</div></div><div><div class="label">Resolved</div><div>2026-07-27 09:57 UTC</div></div><div><div class="label">Duration</div><div>16 minutes</div></div></div><span class="btn">Open in Fajita</span></div></div></div></div></div></div>`,
    ),
  },

  "status-page": {
    filename: "03-public-status-page-incident.png",
    alt: "Public status page with an active checkout incident, component states, and 90-day uptime history.",
    html: shell(
      "Status page",
      `.wrap{display:flex;align-items:center;justify-content:center;height:100%;padding:64px;background:radial-gradient(90% 70% at 50% 0%, rgb(217 72 15/.06), transparent 60%), var(--bg-secondary)}
.frame{width:100%;max-width:920px;border-radius:16px;border:1px solid var(--border-subtle);background:var(--bg-primary);overflow:hidden;box-shadow:0 24px 80px rgb(23 19 14/.12)}
.frame-head{display:flex;align-items:center;justify-content:space-between;padding:20px 32px;border-bottom:1px solid var(--border-subtle);background:var(--bg-elevated)}
.brand{display:inline-flex;align-items:center;gap:12px;font-weight:600;font-size:18px}.mark{width:28px;height:28px;border-radius:8px;background:var(--blue-bold);color:#fff;display:grid;place-items:center;font-weight:700;font-size:14px}
.body{padding:32px}.incident{margin-top:20px;padding:20px 24px;border-radius:12px;border:1px solid var(--pepper-bold);background:var(--pepper-soft)}
.h3{margin:0;font-size:22px;font-weight:600}.sub{margin:8px 0 0;color:var(--text-secondary);line-height:1.5;font-size:15px}
.components{margin-top:32px;display:grid;gap:12px}.comp{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-elevated);font-weight:600}
.foot{display:flex;justify-content:space-between;align-items:center;padding:12px 32px;border-top:1px solid var(--border-subtle)}`,
      `<div class="wrap"><div class="frame"><header class="frame-head"><span class="brand"><span class="mark">G</span>Genius status</span><span class="caption">status.genius.ly</span></header><div class="body"><span class="badge badge--down">Partial outage</span><div class="incident"><p class="h3">Checkout is unavailable</p><p class="sub">Checkout requests are failing after a database migration. The team is deploying a fix. Orders already placed are not affected.</p><p class="caption mono" style="margin:8px 0 0">Identified · opened 09:18 MST · updated 09:41 MST</p></div><div class="components"><div class="comp"><span>Web application</span><span class="badge badge--operational">Operational</span></div><div class="comp"><span>API</span><span class="badge badge--degraded">Degraded</span></div><div class="comp"><span>Checkout</span><span class="badge badge--down">Down</span></div><div class="comp"><span>Background jobs</span><span class="badge badge--operational">Operational</span></div></div><div style="margin-top:32px"><div class="uptime-chart">${uptimeBars()}</div><div style="display:flex;justify-content:space-between;margin-top:8px"><span class="caption">90 days ago</span><span class="caption">Checkout · last 90 days</span><span class="caption">Today</span></div></div></div><footer class="foot"><span class="caption">© Genius</span><span class="caption">Powered by Fajita</span></footer></div></div>`,
    ),
  },

  "monitor-dashboard": {
    filename: "04-monitor-dashboard.png",
    alt: "Fajita monitor dashboard with website, API, SSL certificate, and heartbeat monitors.",
    html: shell(
      "Monitor dashboard",
      `.app{display:grid;grid-template-columns:248px 1fr;height:100%;background:var(--bg-primary)}
.side{border-right:1px solid var(--border-subtle);background:var(--bg-secondary);padding:20px 16px}
.logo{display:inline-flex;align-items:center;gap:12px;padding:8px 12px;font-weight:600;margin-bottom:24px}
.nav{display:grid;gap:2px}.nav a{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:8px;font-size:14px;color:var(--text-secondary);text-decoration:none}
.nav a.active{background:var(--bg-elevated);color:var(--text-primary);font-weight:600}
.main{display:flex;flex-direction:column}.top{display:flex;align-items:center;justify-content:space-between;padding:16px 32px;border-bottom:1px solid var(--border-subtle)}
.title{margin:0;font-size:22px;font-weight:600}.content{flex:1;padding:24px 32px}
table{width:100%;border-collapse:collapse;font-size:14px} th{text-align:left;padding:12px 16px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--text-muted);border-bottom:1px solid var(--border-subtle)}
td{padding:18px 16px;border-bottom:1px solid var(--border-subtle);vertical-align:middle}.name{font-weight:600}.dest{font-size:12px;color:var(--text-muted);font-family:var(--font-mono)}`,
      `<div class="app"><aside class="side"><div class="logo"><svg width="28" height="28" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="3.5" y="3.5" width="57" height="57" rx="16" stroke="#17130e" stroke-width="5" fill="none"/><path d="M14 42h9.5L32 25.5 40.5 42H50" stroke="#17130e" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="32" cy="15.5" r="4.5" fill="#d9480f"/></svg><span>Fajita</span></div><nav class="nav"><a href="#">Dashboard</a><a class="active" href="#">Monitors</a><a href="#">Incidents</a><a href="#">Status pages</a><a href="#">Alert channels</a></nav></aside><div class="main"><header class="top"><h1 class="title">Monitors</h1><span class="caption">Genius workspace</span></header><div class="content"><table><thead><tr><th>Monitor</th><th>Status</th><th>Uptime (90d)</th><th>Latest</th></tr></thead><tbody><tr><td><div class="name">Marketing site</div><div class="dest">genius.ly</div></td><td><span class="badge badge--operational">Operational</span></td><td class="mono">99.98%</td><td class="mono" style="color:var(--text-secondary)">142 ms</td></tr><tr><td><div class="name">Checkout API</div><div class="dest">api.genius.ly/v1/health</div></td><td><span class="badge badge--operational">Operational</span></td><td class="mono">99.96%</td><td class="mono" style="color:var(--text-secondary)">186 ms</td></tr><tr><td><div class="name">TLS certificate</div><div class="dest">genius.ly:443</div></td><td><span class="badge badge--operational">Operational</span></td><td class="mono">100%</td><td class="mono" style="color:var(--text-secondary)">212 days left</td></tr><tr><td><div class="name">Nightly backup</div><div class="dest">Expected every 24h</div></td><td><span class="badge badge--operational">Operational</span></td><td class="mono">99.99%</td><td class="mono" style="color:var(--text-secondary)">Pinged 3h ago</td></tr></tbody></table></div></div></div>`,
    ),
  },

  "incident-timeline": {
    filename: "05-incident-timeline.png",
    alt: "Incident timeline showing verified failure, alert delivery, recovery detection, and resolution.",
    html: shell(
      "Incident timeline",
      `.app{display:grid;grid-template-columns:248px 1fr;height:100%;background:var(--bg-primary)}
.side{border-right:1px solid var(--border-subtle);background:var(--bg-secondary);padding:20px 16px}
.logo{display:inline-flex;align-items:center;gap:12px;padding:8px 12px;font-weight:600;margin-bottom:24px}
.nav{display:grid;gap:2px}.nav a{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:8px;font-size:14px;color:var(--text-secondary);text-decoration:none}
.nav a.active{background:var(--bg-elevated);color:var(--text-primary);font-weight:600}
.main{display:flex;flex-direction:column}.top{display:flex;align-items:center;justify-content:space-between;padding:16px 32px;border-bottom:1px solid var(--border-subtle)}
.title{margin:0;font-size:22px;font-weight:600}.content{flex:1;padding:24px 32px}
.dot{width:12px;height:12px;border-radius:50%;margin-top:6px;background:var(--text-muted)} .dot.system{background:var(--verify-bold)} .dot.service{background:var(--blue-bold)} .dot.recovery{background:var(--green-bold)}
.item{display:grid;grid-template-columns:auto 1fr;gap:16px;margin-bottom:20px}.event-title{font-weight:600;font-size:16px}.event-desc{margin:4px 0 0;color:var(--text-secondary);font-size:14px;line-height:1.45}
.event-meta{display:flex;gap:16px;margin-top:8px;font-size:12px;color:var(--text-muted)} .intro{margin-bottom:24px}.intro h2{margin:0 0 8px;font-size:28px}.intro p{margin:0;color:var(--text-secondary);max-width:52ch;line-height:1.5}`,
      `<div class="app"><aside class="side"><div class="logo"><svg width="28" height="28" viewBox="0 0 64 64"><rect x="3.5" y="3.5" width="57" height="57" rx="16" stroke="#17130e" stroke-width="5" fill="none"/><path d="M14 42h9.5L32 25.5 40.5 42H50" stroke="#17130e" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="32" cy="15.5" r="4.5" fill="#d9480f"/></svg><span>Fajita</span></div><nav class="nav"><a href="#">Dashboard</a><a href="#">Monitors</a><a class="active" href="#">Incidents</a></nav></aside><div class="main"><header class="top"><h1 class="title">Checkout API outage</h1><span class="caption">Timeline</span></header><div class="content"><div class="intro"><h2>Timeline</h2><p>Every state change and alert, newest first. Verification ran before the team was paged.</p></div><div class="item"><div class="dot recovery"></div><div><div class="event-title">Incident resolved</div><p class="event-desc">Checkout API checks are passing from all regions. Public status page updated.</p><div class="event-meta"><span>Fajita</span><span>2 minutes ago</span></div></div></div><div class="item"><div class="dot recovery"></div><div><div class="event-title">Recovery detected</div><p class="event-desc">Two consecutive successful checks confirmed the service is back.</p><div class="event-meta"><span>Automated</span><span>3 minutes ago</span></div></div></div><div class="item"><div class="dot service"></div><div><div class="event-title">Recovery alert sent</div><p class="event-desc">Slack #ops-alerts and email team@genius.ly received the all-clear.</p><div class="event-meta"><span>Automated</span><span>3 minutes ago</span></div></div></div><div class="item"><div class="dot system"></div><div><div class="event-title">Failure verified</div><p class="event-desc">Second check agreed. Incident opened after verification window completed.</p><div class="event-meta"><span>Fajita</span><span>18 minutes ago</span></div></div></div><div class="item"><div class="dot system"></div><div><div class="event-title">Check failed</div><p class="event-desc">GET api.genius.ly/v1/checkout returned 503 from us-east.</p><div class="event-meta"><span>Fajita</span><span>19 minutes ago</span></div></div></div></div></div></div>`,
    ),
  },
} as const;

export type AppsumoHtmlSceneId = keyof typeof APPSUMO_HTML_SCENES;

export const APPSUMO_HTML_SCENE_LIST = Object.values(APPSUMO_HTML_SCENES);
