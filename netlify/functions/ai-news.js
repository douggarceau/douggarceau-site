const SOURCES = [
  { name: 'OpenAI', type: 'html', category: 'ai', url: 'https://openai.com/news/' },
  { name: 'Anthropic', type: 'html', category: 'ai', url: 'https://www.anthropic.com/news' },
  { name: 'Google DeepMind', type: 'html', category: 'ai', url: 'https://deepmind.google/blog/' },
  { name: 'NVIDIA', type: 'rss', category: 'ai', url: 'https://nvidianews.nvidia.com/rss' },
  { name: 'Hugging Face', type: 'rss', category: 'ai', url: 'https://huggingface.co/blog/feed.xml' },
  { name: 'Google AI', type: 'rss', category: 'ai', url: 'https://blog.google/technology/ai/rss/' },
  { name: 'Microsoft AI', type: 'rss', category: 'ai', url: 'https://blogs.microsoft.com/ai/feed/' },
  { name: 'Meta AI', type: 'rss', category: 'ai', url: 'https://ai.meta.com/blog/rss/' },
  { name: 'Mistral', type: 'rss', category: 'ai', url: 'https://mistral.ai/news/rss.xml' },
  { name: 'Stability AI', type: 'rss', category: 'ai', url: 'https://stability.ai/blog/rss.xml' },
  { name: 'TechCrunch AI', type: 'rss', category: 'tech', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
  { name: 'VentureBeat AI', type: 'rss', category: 'tech', url: 'https://venturebeat.com/category/ai/feed/' },
  { name: 'Ars Technica', type: 'rss', category: 'tech', url: 'https://feeds.arstechnica.com/arstechnica/index' },
  { name: 'Hacker News', type: 'rss', category: 'tech', url: 'https://hnrss.org/frontpage' },
  { name: 'Reuters Tech', type: 'rss', category: 'mainstream', url: 'https://feeds.reuters.com/reuters/technologyNews' },
  { name: 'Reuters Business', type: 'rss', category: 'finance', url: 'https://feeds.reuters.com/reuters/businessNews' },
  { name: 'Reuters Politics', type: 'rss', category: 'politics', url: 'https://feeds.reuters.com/Reuters/PoliticsNews' },
  { name: 'Trump AI + Markets', type: 'rss', category: 'politics', url: 'https://news.google.com/rss/search?q=trump+ai+technology+markets&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Federal Reserve', type: 'rss', category: 'fed', url: 'https://www.federalreserve.gov/feeds/press_all.xml' },
  { name: 'CNBC Top', type: 'rss', category: 'finance', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html' },
  { name: 'CoinDesk', type: 'rss', category: 'finance', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/' },
  { name: 'MarketWatch', type: 'rss', category: 'finance', url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories' }
];

exports.handler = async function handler() {
  try {
    const [settled, market] = await Promise.all([
      Promise.allSettled(SOURCES.map(fetchSource)),
      fetchMarketSnapshot()
    ]);

    const items = settled
      .flatMap(result => (result.status === 'fulfilled' ? result.value : []))
      .filter(Boolean)
      .filter(item => item.title && item.link)
      .map(cleanItem)
      .filter(dedupeByLink())
      .sort((a, b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0))
      .slice(0, 54);

    const sourceCounts = items.reduce((acc, item) => {
      acc[item.source] = (acc[item.source] || 0) + 1;
      return acc;
    }, {});

    const mainstreamHeadlines = items
      .filter(item => ['mainstream', 'finance', 'politics', 'tech'].includes(item.category))
      .slice(0, 16)
      .map(item => ({ title: item.title, link: item.link, source: item.source }));

    const wireHeadlines = items.slice(0, 42).map(item => ({
      title: item.title,
      link: item.link,
      source: item.source,
      category: item.category
    }));

    const fedActivity = items
      .filter(item => item.source === 'Federal Reserve' || item.category === 'fed' || /federal reserve|fed|fomc|powell|rate decision|interest rate/i.test(item.title))
      .slice(0, 10)
      .map(item => ({
        title: item.title,
        link: item.link,
        source: item.source,
        pubDate: item.pubDate
      }));

    const trumpActivity = items
      .filter(item => /\btrump\b/i.test(item.title) && /ai|artificial intelligence|chip|technology|tech|market|trade|tariff|fed|rates|crypto|bitcoin|nvidia/i.test(item.title))
      .slice(0, 10)
      .map(item => ({
        title: item.title,
        link: item.link,
        source: item.source,
        pubDate: item.pubDate,
        category: item.category
      }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=180'
      },
      body: JSON.stringify({
        generatedAt: new Date().toISOString(),
        items,
        meta: {
          sourceCounts,
          total: items.length,
          mainstreamHeadlines,
          wireHeadlines,
          fedActivity,
          trumpActivity,
          market
        }
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: error.message })
    };
  }
};

function fetchWithTimeout(url, options = {}, timeoutMs = 6500) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms fetching ${url}`)), timeoutMs);
    fetch(url, options)
      .then(res => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch(err => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

async function fetchSource(source) {
  try {
    const response = await fetchWithTimeout(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 DougGarceauAISignals/1.0'
      }
    }, 6500);

    if (!response.ok) {
      throw new Error(`${source.name} returned ${response.status}`);
    }

    const text = await response.text();
    if (source.type === 'rss') return parseRSS(text, source);
    return parseHTML(text, source);
  } catch (err) {
    console.warn(`Source failed: ${source.name} (${source.url})`, err.message || err);
    return [];
  }
}

function parseRSS(xml, source) {
  const items = [];
  const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
  const entryMatches = xml.match(/<entry>[\s\S]*?<\/entry>/gi) || [];
  const matches = [...itemMatches, ...entryMatches];

  for (const chunk of matches.slice(0, 12)) {
    const link = extractRssLink(chunk);
    const summary = extractTag(chunk, 'description') || extractTag(chunk, 'summary') || extractTag(chunk, 'content');
    const pubDate = extractTag(chunk, 'pubDate') || extractTag(chunk, 'updated') || extractTag(chunk, 'published');

    items.push({
      source: source.name,
      category: source.category,
      title: decodeHtml(extractTag(chunk, 'title')),
      link: decodeHtml(link),
      pubDate: normalizeDate(pubDate),
      summary: decodeHtml(stripTags(summary))
    });
  }

  return items;
}

function parseHTML(html, source) {
  const cleaned = html.replace(/\n+/g, ' ');
  const matches = [...cleaned.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  const items = [];
  const seen = new Set();

  for (const match of matches) {
    const href = match[1];
    const inner = stripTags(match[2]).replace(/\s+/g, ' ').trim();
    if (!inner || inner.length < 24) continue;
    if (inner.length > 180) continue;
    if (/^(learn more|read more|start building|developer docs|home|news|about)$/i.test(inner)) continue;
    if (!looksLikeArticleUrl(href, source.url)) continue;

    const link = absoluteUrl(href, source.url);
    if (seen.has(link)) continue;
    seen.add(link);

    items.push({
      source: source.name,
      category: source.category,
      title: decodeHtml(inner),
      link,
      pubDate: guessDateNearLink(cleaned, href),
      summary: `${source.name} update pulled from the live source page.`
    });

    if (items.length >= 8) break;
  }

  return items;
}

function looksLikeArticleUrl(href, base) {
  const absolute = absoluteUrl(href, base);
  return /\/((news|blog|engineering|research)\/|20\d{2}|[a-z0-9-]{8,})/i.test(absolute) && !/\/careers|\/about|\/pricing|\/api|\/index|\/news\/?$/i.test(absolute);
}

function guessDateNearLink(html, href) {
  const idx = html.indexOf(href);
  if (idx === -1) return null;
  const nearby = html.slice(Math.max(0, idx - 240), Math.min(html.length, idx + 240));
  const dateMatch = nearby.match(/(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+20\d{2}/i);
  return dateMatch ? normalizeDate(dateMatch[0]) : null;
}

function absoluteUrl(href, base) {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

function extractTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? match[1].trim() : '';
}

function extractRssLink(chunk) {
  const plainLink = extractTag(chunk, 'link');
  if (plainLink) return plainLink;

  const attrLink = chunk.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i);
  return attrLink ? attrLink[1] : '';
}

function stripTags(value = '') {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function decodeHtml(str = '') {
  return str
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8217;/g, '’')
    .replace(/&#8211;/g, '–')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”');
}

function normalizeDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function cleanItem(item) {
  return {
    source: item.source || 'Live Feed',
    category: item.category || 'ai',
    title: (item.title || '').replace(/\s+/g, ' ').trim(),
    link: (item.link || '').trim(),
    pubDate: item.pubDate || null,
    summary: (item.summary || '').replace(/\s+/g, ' ').trim()
  };
}

function dedupeByLink() {
  const seen = new Set();
  return item => {
    if (seen.has(item.link)) return false;
    seen.add(item.link);
    return true;
  };
}

async function fetchMarketSnapshot() {
  try {
    const symbols = ['BTC-USD', 'GC=F', 'SI=F', '^GSPC', '^IXIC'];
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols.join(','))}`;
    const response = await fetchWithTimeout(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 DougGarceauAISignals/1.0' }
    }, 6500);

    if (!response.ok) throw new Error(`Market API returned ${response.status}`);

    const data = await response.json();
    const results = (data && data.quoteResponse && data.quoteResponse.result) || [];
    const bySymbol = Object.fromEntries(results.map(item => [item.symbol, item]));

    const assets = [
      toAsset(bySymbol['BTC-USD'], 'Bitcoin', 'BTC', 'https://finance.yahoo.com/quote/BTC-USD'),
      toAsset(bySymbol['GC=F'], 'Gold', 'XAU', 'https://finance.yahoo.com/quote/GC=F'),
      toAsset(bySymbol['SI=F'], 'Silver', 'XAG', 'https://finance.yahoo.com/quote/SI=F')
    ].filter(Boolean);

    const spx = bySymbol['^GSPC'];
    const ndx = bySymbol['^IXIC'];
    const pulseValue = average([spx && spx.regularMarketChangePercent, ndx && ndx.regularMarketChangePercent]);
    const pulse = pulseValue > 0.15 ? 'UP' : pulseValue < -0.15 ? 'DOWN' : 'FLAT';

    return {
      pulse,
      pulseValue: roundNumber(pulseValue, 2),
      assets,
      indexLinks: [
        { name: 'S&P 500', link: 'https://finance.yahoo.com/quote/%5EGSPC' },
        { name: 'NASDAQ', link: 'https://finance.yahoo.com/quote/%5EIXIC' }
      ]
    };
  } catch (error) {
    console.warn('Market snapshot failed', error.message || error);
    return null;
  }
}

function toAsset(quote, name, ticker, link) {
  if (!quote) return null;
  const price = quote.regularMarketPrice;
  const changePct = quote.regularMarketChangePercent;

  return {
    ticker,
    name,
    price: typeof price === 'number' ? roundNumber(price, 2) : null,
    changePct: typeof changePct === 'number' ? roundNumber(changePct, 2) : null,
    trend: changePct > 0 ? 'UP' : changePct < 0 ? 'DOWN' : 'FLAT',
    link
  };
}

function average(values) {
  const valid = values.filter(v => typeof v === 'number' && Number.isFinite(v));
  if (!valid.length) return 0;
  return valid.reduce((sum, v) => sum + v, 0) / valid.length;
}

function roundNumber(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
