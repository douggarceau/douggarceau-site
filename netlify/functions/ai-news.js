exports.handler = async function handler() {
  const SOURCES = [
    { name: 'OpenAI', type: 'html', url: 'https://openai.com/news/' },
    { name: 'Anthropic', type: 'html', url: 'https://www.anthropic.com/news' },
    { name: 'Google DeepMind', type: 'html', url: 'https://deepmind.google/blog/' },
    { name: 'NVIDIA', type: 'rss', url: 'https://nvidianews.nvidia.com/rss' },
    { name: 'HuggingFace', type: 'rss', url: 'https://huggingface.co/blog/feed.xml' },
    { name: 'Meta AI', type: 'rss', url: 'https://ai.meta.com/blog/rss/' },
    { name: 'Google AI', type: 'rss', url: 'https://blog.google/technology/ai/rss/' },
    { name: 'Microsoft AI', type: 'rss', url: 'https://blogs.microsoft.com/ai/feed/' },
    { name: 'Stability AI', type: 'rss', url: 'https://stability.ai/blog/rss.xml' },
    { name: 'Mistral', type: 'rss', url: 'https://mistral.ai/news/rss.xml' }
  ];

  try {
    const settled = await Promise.allSettled(SOURCES.map(fetchSource));
    const items = settled
      .flatMap(r => (r.status === 'fulfilled' ? r.value : []))
      .filter(i => i && i.title && i.link)
      .map(cleanItem)
      .filter(dedupeByLink())
      .sort((a,b)=>new Date(b.pubDate||0)-new Date(a.pubDate||0))
      .slice(0,18);

    const sourceCounts = items.reduce((acc, item)=>{acc[item.source]=(acc[item.source]||0)+1; return acc;},{});
    return { statusCode:200, headers:{ 'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=300' }, body: JSON.stringify({ generatedAt:new Date().toISOString(), items, meta:{sourceCounts,total:items.length} })};
  } catch (error) {
    return { statusCode:500, headers:{ 'Content-Type':'application/json; charset=utf-8' }, body: JSON.stringify({ error: error.message }) };
  }
};

function fetchWithTimeout(url, options={}, timeoutMs=8000) {
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error(`Timeout after ${timeoutMs}ms fetching ${url}`)), timeoutMs);
    fetch(url,options).then(res=>{clearTimeout(timer);resolve(res);}).catch(err=>{clearTimeout(timer);reject(err);});
  });
}

async function fetchSource(source) {
  try {
    const response = await fetchWithTimeout(source.url,{headers:{'User-Agent':'Mozilla/5.0 DougGarceauAISignals/1.0'}},8000);
    if (!response.ok) throw new Error(`${source.name} returned ${response.status}`);
    const text = await response.text();
    return source.type==='rss' ? parseRSS(text, source.name) : parseHTML(text, source);
  } catch (err) { console.warn(`Source failed: ${source.name}`, err.message||err); return []; }
}

// Keep your existing parseRSS, parseHTML, looksLikeArticleUrl, guessDateNearLink, absoluteUrl,
// extractTag, stripTags, decodeHtml, normalizeDate, cleanItem, dedupeByLink functions below unchanged. 
