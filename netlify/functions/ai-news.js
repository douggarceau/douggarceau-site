const SOURCES = [
 const SOURCES = [
  { name: 'ArtsBoston', type: 'html', category: 'music', url: 'https://www.artsboston.org/abcalendar/' },
  { name: 'GoProvidence', type: 'html', category: 'weekend', url: 'https://www.goprovidence.com/events/' },
  { name: 'WaterFire', type: 'html', category: 'festivals', url: 'https://waterfire.org/event-calendar/' },
  { name: 'The Met', type: 'html', category: 'music', url: 'https://themetri.com/events/' }
];
];

exports.handler = async function handler() {
  try {
    const results = await Promise.allSettled(SOURCES.map(fetchSource));

    const items = results
      .flatMap(r => (r.status === 'fulfilled' ? r.value : []))
      .filter(Boolean)
      .filter(item => item.title && item.link)
      .map(cleanItem)
      .sort((a, b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0))
      .slice(0, 50);

    const bostonTonight = items.filter(i =>
      /boston|cambridge|somerville/i.test(`${i.title} ${i.source}`)
    ).slice(0, 10);

    const providenceWeekend = items.filter(i =>
      /providence|rhode island|newport/i.test(`${i.title} ${i.source}`)
    ).slice(0, 10);

    const festivals = items.filter(i =>
      /festival|fair|food|beer|wine|arts/i.test(i.title)
    ).slice(0, 10);

    const topWeekend = items.filter(i =>
      /weekend|tonight|friday|saturday|sunday/i.test(i.title)
    ).slice(0, 10);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        generatedAt: new Date().toISOString(),
        items,
        meta: {
          total: items.length,
          bostonTonight,
          providenceWeekend,
          festivals,
          topWeekend
        }
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};

async function fetchSource(source) {
  try {
    const res = await fetch(source.url);
    const text = await res.text();
    return parseRSS(text, source);
  } catch {
    return [];
  }
}

function parseRSS(xml, source) {
  const matches = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
  return matches.slice(0, 10).map(chunk => ({
    source: source.name,
    category: source.category,
    title: decode(extract(chunk, 'title')),
    link: decode(extract(chunk, 'link')),
    pubDate: extract(chunk, 'pubDate')
  }));
}

function extract(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return m ? m[1] : '';
}

function decode(str = '') {
  return str.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&amp;/g, '&');
}

function cleanItem(item) {
  return {
    title: item.title,
    link: item.link,
    source: item.source,
    category: item.category,
    pubDate: item.pubDate
  };
}
