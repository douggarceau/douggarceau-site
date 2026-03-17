const SOURCES = [
  { name: 'Boston Events', url: 'https://www.artsboston.org/abcalendar/' },
  { name: 'Providence Events', url: 'https://www.goprovidence.com/events/' },
  { name: 'WaterFire', url: 'https://waterfire.org/event-calendar/' },
  { name: 'The Met', url: 'https://themetri.com/events/' }
];

exports.handler = async function () {
  try {
    const results = await Promise.all(SOURCES.map(fetchHTML));

    let items = results.flat();

    // SIMPLE FILTER — kill junk
    items = items.filter(i =>
      i.title &&
      !/2025|2024|recap|review|preview|guide|best of/i.test(i.title)
    );

    // REMOVE DUPLICATES
    items = items.filter((item, index, self) =>
      index === self.findIndex(i => i.title === item.title)
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: items.slice(0, 20),
        meta: {
          bostonTonight: items.slice(0, 8),
          providenceWeekend: items.slice(8, 16),
          festivals: items.slice(0, 8),
          topWeekend: items.slice(0, 12)
        }
      })
    };

  } catch (e) {
    return { statusCode: 500, body: e.toString() };
  }
};

async function fetchHTML(source) {
  try {
    const res = await fetch(source.url);
    const text = await res.text();

    const matches = [...text.matchAll(/<a[^>]+>(.*?)<\/a>/g)];

    return matches
      .map(m => ({
        title: clean(m[1]),
        source: source.name,
        link: source.url
      }))
      .filter(i => i.title.length > 20)
      .slice(0, 10);

  } catch {
    return [];
  }
}

function clean(str) {
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
