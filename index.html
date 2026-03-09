exports.handler = async function handler() {
  const SOURCES = [
    { name: "OpenAI", type: "rss", url: "https://openai.com/news/rss.xml" },
    { name: "Anthropic", type: "html", url: "https://www.anthropic.com/news" },
    { name: "Google DeepMind", type: "html", url: "https://deepmind.google/blog/" },
    { name: "NVIDIA", type: "rss", url: "https://nvidianews.nvidia.com/rss" },
    { name: "Hugging Face", type: "rss", url: "https://huggingface.co/blog/feed.xml" },
    { name: "Mistral", type: "html", url: "https://mistral.ai/news/" },
    { name: "Stability AI", type: "html", url: "https://stability.ai/news" },
    { name: "Google AI", type: "rss", url: "https://blog.google/technology/ai/rss/" }
  ];

  try {
    const settled = await Promise.allSettled(SOURCES.map(fetchSource));

    const items = settled
      .flatMap(result => (result.status === "fulfilled" ? result.value : []))
      .filter(Boolean)
      .filter(item => item.title && item.link)
      .map(cleanItem)
      .filter(item => isGoodHeadline(item.title))
      .filter(dedupeByLink())
      .sort((a, b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0))
      .slice(0, 36);

    const sourceCounts = items.reduce((acc, item) => {
      acc[item.source] = (acc[item.source] || 0) + 1;
      return acc;
    }, {});

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=300"
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
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: error.message })
    };
  }
};

async function fetchSource(source) {
  const response = await fetch(source.url, {
    headers: {
      "User-Agent": "Mozilla/5.0 DougGarceauAISignals/2.0"
    }
  });

  if (!response.ok) {
    throw new Error(`${source.name} returned ${response.status}`);
  }

  const text = await response.text();

  if (source.type === "rss") return parseRSS(text, source.name);
  return parseHTML(text, source);
}

function parseRSS(xml, sourceName) {
  const items = [];
  const matches = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];
  const altMatches = xml.match(/<entry\b[\s\S]*?<\/entry>/gi) || [];
  const chunks = matches.length ? matches : altMatches;

  for (const chunk of chunks.slice(0, 16)) {
    const title = decodeHtml(extractTag(chunk, "title"));
    const description =
      decodeHtml(stripTags(extractTag(chunk, "description"))) ||
      decodeHtml(stripTags(extractTag(chunk, "summary"))) ||
      decodeHtml(stripTags(extractTag(chunk, "content"))) ||
      `${sourceName} update pulled from live source feed.`;

    let link =
      decodeHtml(extractTag(chunk, "link")) ||
      extractLinkFromAtom(chunk) ||
      extractHref(chunk);

    const pubDate =
      normalizeDate(extractTag(chunk, "pubDate")) ||
      normalizeDate(extractTag(chunk, "published")) ||
      normalizeDate(extractTag(chunk, "updated"));

    if (title && link) {
      items.push({
        source: sourceName,
        title,
        link,
        pubDate,
        summary: description
      });
    }
  }

  return items;
}

function parseHTML(html, source) {
  const cleaned = html.replace(/\n+/g, " ");
  const matches = [...cleaned.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  const items = [];
  const seen = new Set();

  for (const match of matches) {
    const href = match[1];
    const inner = stripTags(match[2]).replace(/\s+/g, " ").trim();

    if (!inner) continue;
    if (inner.length < 18 || inner.length > 220) continue;
    if (isBadHeadline(inner)) continue;
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

    if (items.length >= 10) break;
  }

  return items;
}

function looksLikeArticleUrl(href, base) {
  const absolute = absoluteUrl(href, base);

  return (
    /\/((news|blog|updates|research|announcements|company\/news)\/|20\d{2}|[a-z0-9-]{8,})/i.test(absolute) &&
    !/\/(careers|jobs|about|pricing|api|contact|news\/?$|blog\/?$|authors|privacy|terms|login|signup)/i.test(absolute)
  );
}

function guessDateNearLink(html, href) {
  const idx = html.indexOf(href);
  if (idx === -1) return null;

  const nearby = html.slice(Math.max(0, idx - 300), Math.min(html.length, idx + 300));

  const dateMatch = nearby.match(
    /(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+20\d{2}/i
  );

  return dateMatch ? normalizeDate(dateMatch[0]) : null;
}

function extractTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? match[1].trim() : "";
}

function extractLinkFromAtom(xml) {
  const match = xml.match(/<link[^>]+href=["']([^"']+)["'][^>]*\/?>/i);
  return match ? decodeHtml(match[1].trim()) : "";
}

function extractHref(xml) {
  const match = xml.match(/https?:\/\/[^\s<"]+/i);
  return match ? match[0].trim() : "";
}

function absoluteUrl(href, base) {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

function stripTags(value = "") {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(str = "") {
  return str
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&#x27;|&#39;|&apos;/gi, "'")
    .replace(/&#x2F;/gi, "/")
    .replace(/&#x2019;|&#8217;/gi, "’")
    .replace(/&#x2018;|&#8216;/gi, "‘")
    .replace(/&#x201C;|&#8220;/gi, "“")
    .replace(/&#x201D;|&#8221;/gi, "”")
    .replace(/&#x2013;|&#8211;/gi, "–")
    .replace(/&#x2014;|&#8212;/gi, "—")
    .replace(/&#x26;|&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, num) => {
      const code = Number(num);
      return Number.isFinite(code) ? String.fromCharCode(code) : _;
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      const code = parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCharCode(code) : _;
    })
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function cleanItem(item) {
  return {
    source: item.source || "Live Feed",
    title: decodeHtml((item.title || "").replace(/\s+/g, " ").trim()),
    link: (item.link || "").trim(),
    pubDate: item.pubDate || null,
    summary: decodeHtml((item.summary || "").replace(/\s+/g, " ").trim())
  };
}

function dedupeByLink() {
  const seen = new Set();
  return item => {
    const key = (item.link || "").trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  };
}

function isBadHeadline(text = "") {
  const t = text.trim();
  return (
    /^(read more|learn more|home|about|news|blog|careers|contact|privacy|terms|documentation|developer docs)$/i.test(t) ||
    t.length < 18
  );
}

function isGoodHeadline(text = "") {
  const t = text.trim();
  if (!t || t.length < 18) return false;
  if (/^(read more|learn more|home|about|news|blog)$/i.test(t)) return false;
  if (/cookie|privacy policy|terms of use/i.test(t)) return false;
  return true;
}
