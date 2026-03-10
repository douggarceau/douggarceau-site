<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Doug Garceau AI — AI Signals</title>
  <meta name="description" content="High-signal intelligence for the AI industry." />
  <style>
    :root {
      --bg: #060606;
      --bg2: #0a0a0a;
      --panel: rgba(10, 10, 10, 0.72);
      --panel-2: rgba(18, 18, 18, 0.84);
      --line: rgba(255, 115, 0, 0.22);
      --line-strong: rgba(255, 115, 0, 0.46);
      --text: #f4f4f4;
      --muted: #a7a7a7;
      --soft: #7d7d7d;
      --hot: #ff5a1f;
      --hot-2: #ff8a1f;
      --ok: #92ffb3;
      --warn: #ffd1a3;
      --glow: 0 0 30px rgba(255, 92, 31, 0.22), 0 0 80px rgba(255, 92, 31, 0.08);
      --radius: 24px;
      --radius-sm: 18px;
      --max: 1320px;
    }

    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--text);
      background:
        radial-gradient(circle at 15% 20%, rgba(255, 90, 31, 0.18), transparent 28%),
        radial-gradient(circle at 85% 30%, rgba(255, 130, 31, 0.12), transparent 26%),
        radial-gradient(circle at 50% 100%, rgba(255, 80, 0, 0.12), transparent 32%),
        linear-gradient(180deg, #050505 0%, #090909 48%, #050505 100%);
      min-height: 100vh;
      overflow-x: hidden;
    }

    body::before,
    body::after {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: -2;
    }

    body::before {
      background-image:
        linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
      background-size: 40px 40px;
      mask-image: radial-gradient(circle at center, black 50%, transparent 100%);
      opacity: 0.35;
    }

    body::after {
      background:
        linear-gradient(90deg, transparent 0%, rgba(255, 90, 31, 0.05) 50%, transparent 100%),
        radial-gradient(circle at center, rgba(255, 112, 44, 0.09), transparent 50%);
      filter: blur(24px);
      opacity: 0.75;
    }

    .circuit {
      position: fixed;
      inset: 0;
      z-index: -1;
      opacity: 0.45;
      pointer-events: none;
      background:
        linear-gradient(90deg, transparent 0 4%, rgba(255,90,31,.12) 4% 4.2%, transparent 4.2% 12%, rgba(255,90,31,.08) 12% 12.1%, transparent 12.1% 100%),
        linear-gradient(0deg, transparent 0 8%, rgba(255,90,31,.08) 8% 8.15%, transparent 8.15% 17%, rgba(255,90,31,.05) 17% 17.1%, transparent 17.1% 100%);
      mix-blend-mode: screen;
    }

    a { color: inherit; text-decoration: none; }
    .wrap { width: min(calc(100% - 32px), var(--max)); margin: 0 auto; }

    .nav {
      position: sticky; top: 0; z-index: 50; backdrop-filter: blur(16px);
      background: rgba(4, 4, 4, 0.72); border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .nav-inner {
      display: flex; align-items: center; justify-content: space-between; gap: 20px; min-height: 74px;
    }
    .brand {
      display: flex; align-items: center; gap: 14px; letter-spacing: 0.08em; font-weight: 800; text-transform: uppercase;
    }
    .brand-mark {
      width: 14px; height: 14px; border-radius: 50%; background: linear-gradient(135deg, var(--hot), var(--hot-2)); box-shadow: 0 0 18px rgba(255, 92, 31, 0.8);
    }
    .nav-links {
      display: flex; align-items: center; gap: 24px; color: var(--muted); font-size: 0.94rem;
    }
    .nav-links a:hover { color: #fff; }

    .button {
      display: inline-flex; align-items: center; justify-content: center; gap: 10px; border-radius: 999px; padding: 13px 18px;
      font-weight: 700; letter-spacing: 0.02em; transition: 180ms ease; cursor: pointer; border: 1px solid transparent;
    }
    .button-primary { background: linear-gradient(135deg, var(--hot), var(--hot-2)); color: #090909; box-shadow: var(--glow); }
    .button-primary:hover { transform: translateY(-1px); filter: brightness(1.05); }
    .button-secondary { background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.08); color: #fff; }

    .hero { padding: 62px 0 28px; position: relative; }
    .hero-grid { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 28px; align-items: stretch; }

    .hero-panel,.panel,.signal-card,.stat-card,.story-card,.subscribe-card,.contact-card,.terminal {
      background: linear-gradient(180deg, rgba(17,17,17,0.76), rgba(10,10,10,0.92));
      border: 1px solid rgba(255,255,255,0.08); box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), var(--glow);
    }

    .hero-panel {
      border-radius: 34px; padding: 42px; overflow: hidden; position: relative; min-height: 520px;
    }
    .hero-panel::before,.hero-panel::after { content: ""; position: absolute; inset: auto; pointer-events: none; }
    .hero-panel::before {
      right: -60px; top: -60px; width: 220px; height: 220px; border-radius: 50%; background: radial-gradient(circle, rgba(255,90,31,0.25), transparent 65%); filter: blur(6px);
    }
    .hero-panel::after {
      left: -40px; bottom: -40px; width: 280px; height: 280px; border-radius: 50%; background: radial-gradient(circle, rgba(255,138,31,0.12), transparent 70%); filter: blur(10px);
    }

    .eyebrow,.status-pill {
      display: inline-flex; align-items: center; gap: 10px; padding: 10px 14px; border: 1px solid var(--line); border-radius: 999px;
      color: #ffd7c8; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.18em; background: rgba(255, 90, 31, 0.08);
    }
    .eyebrow { margin-bottom: 18px; }
    .status-pill { margin-top: 18px; font-size: 0.72rem; }
    .status-pill strong { color: var(--ok); }

    h1 { margin: 0; font-size: clamp(3rem, 6vw, 5.9rem); line-height: 0.92; letter-spacing: -0.05em; font-weight: 900; text-transform: uppercase; max-width: 11ch; }
    .hero h1 span { color: #ffd6c8; display: block; text-shadow: 0 0 24px rgba(255, 112, 44, 0.18); }
    .hero-copy { margin: 24px 0 30px; max-width: 650px; color: #d6d6d6; font-size: clamp(1rem, 1.45vw, 1.18rem); line-height: 1.7; }
    .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }

    .ticker { margin-top: 28px; border: 1px solid var(--line-strong); border-radius: 999px; overflow: hidden; background: linear-gradient(180deg, rgba(255,90,31,0.08), rgba(255,90,31,0.02)); }
    .ticker-track {
      display: flex; gap: 32px; white-space: nowrap; padding: 14px 18px; color: #ffe5dc; animation: scroll 28s linear infinite;
      min-width: max-content; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.85rem;
    }
    @keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }

    .hero-side { display: grid; grid-template-rows: 1fr auto; gap: 28px; }
    .terminal { border-radius: 30px; padding: 22px; min-height: 340px; position: relative; overflow: hidden; }
    .terminal::before { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,255,255,0.02), transparent 30%, transparent 70%, rgba(255,255,255,0.02)); pointer-events: none; }
    .terminal-bar {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; color: var(--muted); font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.16em;
    }
    .dots { display: inline-flex; gap: 8px; }
    .dots span { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.25); }
    .dots span:first-child { background: var(--hot); box-shadow: 0 0 16px rgba(255, 92, 31, 0.8); }
    .terminal-lines { display: grid; gap: 14px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.94rem; line-height: 1.55; color: #ffddcf; }
    .terminal-line { display: grid; grid-template-columns: 72px 1fr; gap: 14px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; }
    .terminal-line:last-child { border-bottom: 0; }
    .time { color: #8d8d8d; }
    .pulse { color: #fff; }
    .hot { color: #ffbb97; }

    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
    .stat-card { border-radius: 24px; padding: 20px; }
    .stat-label { color: var(--muted); text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.76rem; margin-bottom: 14px; }
    .stat-value { font-size: clamp(1.6rem, 2.8vw, 2.3rem); font-weight: 800; letter-spacing: -0.04em; }
    .stat-note { color: #d0d0d0; margin-top: 8px; line-height: 1.5; font-size: 0.95rem; }

    section { padding: 28px 0; }
    .section-head { display: flex; align-items: end; justify-content: space-between; gap: 20px; margin-bottom: 22px; }
    .section-kicker { color: #ffceb8; text-transform: uppercase; letter-spacing: 0.16em; font-size: 0.76rem; margin-bottom: 10px; }
    h2 { margin: 0; font-size: clamp(2rem, 3.8vw, 3.7rem); line-height: 0.98; letter-spacing: -0.05em; text-transform: uppercase; }
    .section-copy { color: var(--muted); max-width: 680px; line-height: 1.7; font-size: 1rem; }

    .signals-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
    .signal-card { border-radius: 24px; padding: 22px; position: relative; overflow: hidden; min-height: 240px; display: grid; }
    .signal-card::before {
      content: ""; position: absolute; left: -10%; right: -10%; top: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); opacity: 0.3;
    }
    .signal-type { color: #ffb391; font-size: 0.78rem; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 18px; }
    .signal-title { font-size: 1.34rem; line-height: 1.15; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 14px; }
    .signal-text { color: #d2d2d2; line-height: 1.68; margin-bottom: 18px; }
    .signal-link { margin-top: auto; color: #ffd6c8; font-weight: 700; font-size: 0.9rem; }
    .signal-meta { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }
    .tag { padding: 8px 10px; border-radius: 999px; font-size: 0.76rem; text-transform: uppercase; letter-spacing: 0.12em; border: 1px solid rgba(255,255,255,0.08); color: #ededed; background: rgba(255,255,255,0.03); }

    .stories { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 18px; }
    .story-stack { display: grid; gap: 18px; }
    .story-card { border-radius: 28px; padding: 24px; display: grid; gap: 14px; }
    .story-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; color: var(--muted); font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.14em; }
    .story-title { font-size: clamp(1.4rem, 2.2vw, 2rem); line-height: 1.08; letter-spacing: -0.04em; font-weight: 800; max-width: 26ch; }
    .story-copy { color: #d6d6d6; line-height: 1.75; max-width: 62ch; }
    .story-impact { color: #ffcfbc; font-weight: 700; line-height: 1.7; }
    .story-link { color: #ffe5dc; font-weight: 700; }

    .matrix { border-radius: 28px; padding: 24px; display: grid; gap: 16px; align-content: start; }
    .matrix-row { display: grid; grid-template-columns: 1fr auto; gap: 16px; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .matrix-row:last-child { border-bottom: 0; }
    .matrix-name { font-weight: 700; letter-spacing: -0.02em; }
    .matrix-note { color: var(--muted); margin-top: 6px; font-size: 0.96rem; line-height: 1.55; }
    .score { min-width: 64px; text-align: right; color: #ffd6c8; font-weight: 800; font-size: 1.1rem; }

    .empty-state, .load-error {
      border-radius: 24px; padding: 22px; background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.12); color: var(--muted);
    }

    .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .subscribe-card,.contact-card { border-radius: 30px; padding: 28px; }
    .card-title { font-size: 1.7rem; line-height: 1.1; letter-spacing: -0.04em; font-weight: 800; margin: 0 0 10px; }
    .card-copy { color: var(--muted); line-height: 1.75; margin-bottom: 22px; }
    form { display: grid; gap: 12px; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    input,textarea {
      width: 100%; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.02); color: #fff;
      padding: 15px 16px; font: inherit; outline: none; transition: 160ms ease;
    }
    input:focus,textarea:focus { border-color: rgba(255, 112, 44, 0.6); box-shadow: 0 0 0 4px rgba(255, 112, 44, 0.08); }
    textarea { min-height: 130px; resize: vertical; }

    .form-status {
      min-height: 20px; color: #ffd6c8; font-size: 0.9rem;
    }

    footer { padding: 34px 0 56px; color: #8f8f8f; font-size: 0.94rem; }
    .footer-inner { display: flex; align-items: center; justify-content: space-between; gap: 18px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 26px; }

    @media (max-width: 1120px) {
      .hero-grid,.stories,.bottom-grid { grid-template-columns: 1fr; }
      .signals-grid { grid-template-columns: repeat(2, 1fr); }
      .stats { grid-template-columns: 1fr; }
    }

    @media (max-width: 760px) {
      .wrap { width: min(calc(100% - 20px), var(--max)); }
      .nav-inner { min-height: 66px; }
      .nav-links { display: none; }
      .hero { padding-top: 26px; }
      .hero-panel, .terminal, .subscribe-card, .contact-card { padding: 22px; border-radius: 24px; }
      .signals-grid,.row { grid-template-columns: 1fr; }
      h1 { max-width: none; }
      .hero-copy { font-size: 1rem; }
      .footer-inner { flex-direction: column; align-items: flex-start; }
      .terminal-line { grid-template-columns: 56px 1fr; gap: 10px; }
    }
  </style>
</head>
<body>
  <div class="circuit"></div>

  <nav class="nav">
    <div class="wrap nav-inner">
      <a href="#top" class="brand">
        <span class="brand-mark"></span>
        <span>Doug Garceau AI</span>
      </a>
      <div class="nav-links">
        <a href="#signals">Models</a>
        <a href="#signals">Compute</a>
        <a href="#signals">Markets</a>
        <a href="#signals">Research</a>
        <a href="#briefings">Capital</a>
        <a href="#briefings">Briefings</a>
        <a href="#contact">Advertise</a>
      </div>
      <a href="#subscribe" class="button button-primary">Get the Signal</a>
    </div>
  </nav>

  <main id="top">
    <section class="hero">
      <div class="wrap hero-grid">
        <div class="hero-panel">
          <div class="eyebrow">Signal Intelligence for the AI Industry</div>
          <h1>AI <span>Signals</span></h1>
          <p class="hero-copy">
            A live intelligence surface for readers who care about frontier models, compute wars, capital flows, infrastructure bottlenecks, and the companies shaping the next technological order.
          </p>
          <div class="hero-actions">
            <a href="#signals" class="button button-primary">Enter the Terminal</a>
            <a href="#briefings" class="button button-secondary">View Briefings</a>
          </div>

          <div class="status-pill">Feed status: <strong id="feed-status">CONNECTING</strong></div>

          <div class="ticker" aria-label="AI signals ticker">
            <div class="ticker-track" id="ticker-track">
              <span>Connecting to live AI feeds</span>
              <span>OpenAI</span>
              <span>Anthropic</span>
              <span>Google DeepMind</span>
              <span>NVIDIA</span>
              <span>Connecting to live AI feeds</span>
              <span>OpenAI</span>
              <span>Anthropic</span>
              <span>Google DeepMind</span>
              <span>NVIDIA</span>
            </div>
          </div>
        </div>

        <div class="hero-side">
          <div class="terminal">
            <div class="terminal-bar">
              <span>AI Signals Terminal</span>
              <div class="dots"><span></span><span></span><span></span></div>
            </div>
            <div class="terminal-lines" id="terminal-lines">
              <div class="terminal-line"><span class="time">--:--</span><span><span class="pulse">BOOT</span> Waiting for live feed.</span></div>
              <div class="terminal-line" id="terminal-source-line"><span class="time">--:--</span><span><span class="pulse">SOURCE</span> OpenAI, Anthropic, DeepMind, NVIDIA.</span></div>
              <div class="terminal-line"><span class="time">--:--</span><span><span class="pulse">FILTER</span> AI-focused headlines only.</span></div>
              <div class="terminal-line"><span class="time">--:--</span><span><span class="pulse">STATUS</span> Connecting to serverless feed endpoint.</span></div>
            </div>
          </div>

          <div class="stats">
            <div class="stat-card">
              <div class="stat-label">Coverage</div>
              <div class="stat-value" id="coverage-count">4 Sources</div>
              <div class="stat-note" id="source-list">OpenAI, Anthropic, Google DeepMind, and NVIDIA.</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Updates</div>
                <div class="stat-value">Always On</div>
                <div class="stat-note">Fresh headlines from the AI companies shaping the market.</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Focus</div>
                <div class="stat-value" id="mode-label">AI Only</div>
                <div class="stat-note">Models, compute, markets, and research.</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section>
      <div class="wrap">
        <div class="section-head">
          <div>
            <div class="section-kicker">Now Tracking</div>
            <h2>Latest Signals</h2>
          </div>
          <p class="section-copy">Fresh items pulled from live sources and rendered into your front page automatically.</p>
        </div>

        <div class="stories">
          <div class="story-stack" id="latest-signals"></div>

          <aside class="matrix panel" id="signal-radar">
            <div class="section-kicker">Trending</div>
            <div class="card-title" style="margin:0;">Signal Radar</div>
            <div class="matrix-row">
              <div>
                <div class="matrix-name">Live Feed Online</div>
                <div class="matrix-note">This panel updates after the function returns live data.</div>
              </div>
              <div class="score">--</div>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <section id="signals">
      <div class="wrap">
        <div class="section-head">
          <div>
            <div class="section-kicker">Live Surface</div>
            <h2>Major Signals</h2>
          </div>
          <p class="section-copy">These cards are now driven by the live feed endpoint instead of frozen placeholder copy.</p>
        </div>

        <div class="signals-grid" id="major-signals"></div>
      </div>
    </section>

    <section id="briefings">
      <div class="wrap">
        <div class="section-head">
          <div>
            <div class="section-kicker">Editorial Layer</div>
            <h2>Briefings</h2>
          </div>
          <p class="section-copy">A lightweight intelligence layer generated from the incoming headlines.</p>
        </div>

        <div class="stories">
          <div class="story-stack" id="briefing-stack"></div>

          <aside class="matrix panel" id="watchlist-panel">
            <div class="section-kicker">Watchlist</div>
            <div class="card-title" style="margin:0;">Current Pressure Points</div>
          </aside>
        </div>
      </div>
    </section>

    <section>
      <div class="wrap bottom-grid">
        <div id="subscribe" class="subscribe-card">
          <div class="section-kicker">Audience Capture</div>
          <h3 class="card-title">Subscribe to the signal stream.</h3>
          <p class="card-copy">This is still a front-end placeholder until you connect Mailchimp, Beehiiv, ConvertKit, or Netlify Forms.</p>
          <form name="subscribe" method="POST" data-netlify="true">
            <input type="hidden" name="form-name" value="subscribe" />
            <div class="row">
              <input type="text" name="first_name" placeholder="First name" aria-label="First name" />
              <input type="email" name="email" placeholder="Email address" aria-label="Email address" required />
            </div>
            <button type="submit" class="button button-primary">Join the List</button>
            <div class="form-status">Netlify form ready.</div>
          </form>
        </div>

        <div id="contact" class="contact-card">
          <div class="section-kicker">Tip Line</div>
          <h3 class="card-title">Send a signal.</h3>
          <p class="card-copy">This form is also Netlify-ready. It can later route to email, Slack, Airtable, or your own backend.</p>
          <form name="tips" method="POST" data-netlify="true">
            <input type="hidden" name="form-name" value="tips" />
            <div class="row">
              <input type="text" name="name" placeholder="Name" aria-label="Name" />
              <input type="email" name="email" placeholder="Email" aria-label="Email" />
            </div>
            <textarea name="message" placeholder="Send a tip, story, or intelligence note" aria-label="Signal message"></textarea>
            <button type="submit" class="button button-secondary">Transmit</button>
            <div class="form-status">Netlify form ready.</div>
          </form>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="wrap footer-inner">
      <div>Doug Garceau AI — AI Signals Intelligence</div>
      <div>Models · Compute · Markets · Research · Capital · Briefings</div>
    </div>
  </footer>

  <script>
    const endpoint = '/.netlify/functions/ai-news';

    function escapeHtml(text = '') {
      return text
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
    }

    function timeLabel(iso) {
      if (!iso) return '--:--';
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) return '--:--';
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function dateLabel(iso) {
      if (!iso) return 'Live';
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) return 'Live';
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    function summarize(title = '') {
      const trimmed = title.replace(/\s+/g, ' ').trim();
      return trimmed.length > 170 ? trimmed.slice(0, 167) + '...' : trimmed;
    }

    function detectTheme(text = '') {
      const t = text.toLowerCase();
      if (/(openai|anthropic|claude|gemini|model|reasoning|release)/.test(t)) return ['Model Signal', 'Models'];
      if (/(nvidia|gpu|blackwell|compute|chip|infrastructure)/.test(t)) return ['Compute Signal', 'Compute'];
      if (/(research|science|paper|benchmark|safety)/.test(t)) return ['Research Signal', 'Research'];
      return ['Market Signal', 'Industry'];
    }

    function renderTerminal(items) {
      const box = document.getElementById('terminal-lines');
      box.innerHTML = items.slice(0, 4).map(item => `
        <div class="terminal-line">
          <span class="time">${escapeHtml(timeLabel(item.pubDate))}</span>
          <span><span class="pulse">${escapeHtml((item.source || 'SIGNAL').toUpperCase())}</span> ${escapeHtml(summarize(item.title))}</span>
        </div>
      `).join('');
    }

    function renderTicker(items) {
      const track = document.getElementById('ticker-track');
      const labels = items.slice(0, 8).map(item => `<span>${escapeHtml(item.title)}</span>`).join('');
      track.innerHTML = labels + labels;
    }

    function renderLatest(items) {
      const box = document.getElementById('latest-signals');
      if (!items.length) {
        box.innerHTML = '<div class="empty-state">No stories returned.</div>';
        return;
      }
      box.innerHTML = items.slice(0, 3).map(item => `
        <article class="story-card">
          <div class="story-top"><span>${escapeHtml(item.source || 'Live Feed')}</span><span>${escapeHtml(dateLabel(item.pubDate))}</span></div>
          <div class="story-title">${escapeHtml(item.title)}</div>
          <div class="story-copy">${escapeHtml(item.summary || summarize(item.title))}</div>
          <div class="story-impact">Impact: live source update from ${escapeHtml(item.source || 'tracked source')}.</div>
          <a class="story-link" href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">Open source →</a>
        </article>
      `).join('');
    }

    function renderMajor(items) {
      const box = document.getElementById('major-signals');
      if (!items.length) {
        box.innerHTML = '<div class="empty-state">No live signals returned.</div>';
        return;
      }
      box.innerHTML = items.slice(0, 6).map(item => {
        const [type, tag] = detectTheme(item.title + ' ' + (item.summary || ''));
        return `
          <article class="signal-card">
            <div>
              <div class="signal-type">${escapeHtml(type)}</div>
              <div class="signal-title">${escapeHtml(item.title)}</div>
              <div class="signal-text">${escapeHtml(item.summary || summarize(item.title))}</div>
              <div class="signal-meta"><span class="tag">${escapeHtml(item.source || 'Live')}</span><span class="tag">${escapeHtml(tag)}</span></div>
            </div>
            <a class="signal-link" href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">Open source →</a>
          </article>
        `;
      }).join('');
    }

    function renderBriefings(items) {
      const box = document.getElementById('briefing-stack');
      if (!items.length) {
        box.innerHTML = '<div class="empty-state">No briefings generated yet.</div>';
        return;
      }
      box.innerHTML = items.slice(0, 2).map((item, index) => `
        <article class="story-card">
          <div class="story-top"><span>${index === 0 ? 'Lead Brief' : 'Signal Brief'}</span><span>${escapeHtml(item.source || 'Live')}</span></div>
          <div class="story-title">${escapeHtml(item.title)}</div>
          <div class="story-copy">${escapeHtml(item.summary || summarize(item.title))}</div>
          <div class="story-impact">Impact: this item is flowing directly from the live feed endpoint, not hardcoded copy.</div>
        </article>
      `).join('');
    }

    function renderRadar(meta) {
      const panel = document.getElementById('signal-radar');
      const sources = Object.entries(meta.sourceCounts || {});
      panel.innerHTML = `
        <div class="section-kicker">Trending</div>
        <div class="card-title" style="margin:0;">Signal Radar</div>
        ${sources.map(([name, count]) => `
          <div class="matrix-row">
            <div>
              <div class="matrix-name">${escapeHtml(name)}</div>
              <div class="matrix-note">Articles now visible from this live source.</div>
            </div>
            <div class="score">${escapeHtml(String(count))}</div>
          </div>
        `).join('')}
      `;
    }

    function renderWatchlist(items) {
      const panel = document.getElementById('watchlist-panel');
      const themes = [
        ['Frontier Models', items.filter(i => /openai|anthropic|gemini|model|claude/i.test(i.title)).length],
        ['Compute / NVIDIA', items.filter(i => /nvidia|chip|compute|gpu|blackwell/i.test(i.title)).length],
        ['Research / Safety', items.filter(i => /research|science|safety|benchmark/i.test(i.title)).length],
        ['Total Headlines', items.length]
      ];
      panel.innerHTML = `
        <div class="section-kicker">Watchlist</div>
        <div class="card-title" style="margin:0;">Current Pressure Points</div>
        ${themes.map(([name, count]) => `
          <div class="matrix-row">
            <div>
              <div class="matrix-name">${escapeHtml(name)}</div>
              <div class="matrix-note">Live count generated from the current feed payload.</div>
            </div>
            <div class="score">${escapeHtml(String(count))}</div>
          </div>
        `).join('')}
      `;
    }

    async function loadFeed() {
      const status = document.getElementById('feed-status');
      status.textContent = 'CONNECTING';

      try {
        const response = await fetch(endpoint, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const items = Array.isArray(data.items) ? data.items : [];

        renderTerminal(items);
        renderTicker(items);
        renderLatest(items);
        renderMajor(items);
        renderBriefings(items);
        renderRadar(data.meta || {});
        renderWatchlist(items);

        document.getElementById('coverage-count').textContent = `${Object.keys((data.meta && data.meta.sourceCounts) || {}).length} Sources`;
        const sourceNames = Object.keys((data.meta && data.meta.sourceCounts) || {}).join(', ');
        document.getElementById('source-list').textContent = sourceNames;
        document.getElementById('terminal-source-line').innerHTML = `<span class="time">${new Date().toLocaleTimeString()}</span><span><span class="pulse">SOURCE</span> ${sourceNames}.</span>`;
        document.getElementById('mode-label').textContent = items.length ? 'AI Only' : 'Standby';
        status.textContent = items.length ? 'LIVE' : 'EMPTY';
      } catch (error) {
        console.error(error);
        status.textContent = 'ERROR';
        document.getElementById('latest-signals').innerHTML = `<div class="load-error">Feed failed to load. Check your Netlify function deployment.</div>`;
        document.getElementById('major-signals').innerHTML = `<div class="load-error">Feed endpoint did not return data.</div>`;
        document.getElementById('briefing-stack').innerHTML = `<div class="load-error">The design is online, but the serverless feed is not responding yet.</div>`;
      }
    }

    loadFeed();
    setInterval(loadFeed, 15 * 60 * 1000);
  </script>
</body>
</html>
