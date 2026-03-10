exports.handler = async function handler() {
  const SOURCES = [
    {
      const SOURCES = [
  { name:'OpenAI', type:'html', url:'https://openai.com/news/' },
  { name:'Anthropic', type:'html', url:'https://www.anthropic.com/news' },
  { name:'Google DeepMind', type:'html', url:'https://deepmind.google/blog/' },
  { name:'NVIDIA', type:'rss', url:'https://nvidianews.nvidia.com/rss' },
  { name:'HuggingFace', type:'rss', url:'https://huggingface.co/blog/feed.xml' },
  { name:'Meta AI', type:'rss', url:'https://ai.meta.com/blog/rss/' },
  { name:'Google AI', type:'rss', url:'https://blog.google/technology/ai/rss/' },
  { name:'Microsoft AI', type:'rss', url:'https://blogs.microsoft.com/ai/feed/' },
  { name:'Stability AI', type:'rss', url:'https://stability.ai/blog/rss.xml' },
  { name:'Mistral', type:'rss', url:'https://mistral.ai/news/rss.xml' }
];}
  try {
    const settled = await Promise.allSettled(SOURCES.map(fetchSource));

    const items = settled
      .flatMap(result => (result.status === 'fulfilled' ? result.value : []))
      .filter(Boolean)
      .filter(item => item.title && item.link)
      .map(cleanItem)
      .filter(dedupeByLink())
      .sort((a, b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0))
      .slice(0, 18);

    const sourceCounts = items.reduce((acc, item) => {
      acc[item.source] = (acc[item.source] || 0) + 1;
      return acc;
    }, {});

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=300'
      },
      body: JSON.stringify({
        generatedAt: new Date().toISOString(),
        items,
        meta: {
          sourceCounts,
          total: items.length
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

async function fetchSource(source) {
  const response = await fetch(source.url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 DougGarceauAISignals/1.0'
    }
  });

  if (!response.ok) {
    throw new Error(`${source.name} returned ${response.status}`);
  }

  const text = await response.text();
  if (source.type === 'rss') return parseRSS(text, source.name);
  return parseHTML(text, source);
}

function parseRSS(xml, sourceName) {
  const items = [];
  const matches = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

  for (const chunk of matches.slice(0, 12)) {
    items.push({
      source: sourceName,
      title: decodeHtml(extractTag(chunk, 'title')),
      link: decodeHtml(extractTag(chunk, 'link')),
      pubDate: normalizeDate(extractTag(chunk, 'pubDate')),
      summary: decodeHtml(stripTags(extractTag(chunk, 'description')))
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
