const SOURCES = [
  { name: 'OpenAI', type: 'html', category: 'ai', url: 'https://openai.com/news/' },
  { name: 'Anthropic', type: 'html', category: 'ai', url: 'https://www.anthropic.com/news' },
  { name: 'Google DeepMind', type: 'html', category: 'ai', url: 'https://deepmind.google/blog/' },
  { name: 'NVIDIA', type: 'rss', category: 'ai', url: 'https://nvidianews.nvidia.com/rss' },
  { name: 'Hugging Face', type: 'rss', category: 'ai', url: 'https://huggingface.co/blog/feed.xml' },
  { name: 'ArXiv AI Papers', type: 'rss', category: 'research', url: 'https://rss.arxiv.org/rss/cs.AI', limit: 10 },
  { name: 'AI Incident Database', type: 'rss', category: 'research', url: 'https://news.google.com/rss/search?q=site:aiaaic.org+AI+incident&hl=en-US&gl=US&ceid=US:en' },
  { name: 'MIT Technology Review AI', type: 'rss', category: 'research', url: 'https://news.google.com/rss/search?q=site:technologyreview.com+artificial+intelligence&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Papers With Code', type: 'rss', category: 'research', url: 'https://news.google.com/rss/search?q=site:paperswithcode.com+AI+papers&hl=en-US&gl=US&ceid=US:en' },
  { name: 'MIT CSAIL', type: 'rss', category: 'research', url: 'https://news.google.com/rss/search?q=site:csail.mit.edu+AI+research&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Stanford AI Lab', type: 'rss', category: 'research', url: 'https://news.google.com/rss/search?q=Stanford+AI+Lab+SAIL+research&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Berkeley AI Research', type: 'rss', category: 'research', url: 'https://news.google.com/rss/search?q=Berkeley+AI+Research+BAIR&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Carnegie Mellon AI', type: 'rss', category: 'research', url: 'https://news.google.com/rss/search?q=Carnegie+Mellon+AI+research&hl=en-US&gl=US&ceid=US:en' },
  { name: 'OpenAI Research', type: 'rss', category: 'research', url: 'https://news.google.com/rss/search?q=site:openai.com/research&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Anthropic Research', type: 'rss', category: 'research', url: 'https://news.google.com/rss/search?q=site:anthropic.com/research&hl=en-US&gl=US&ceid=US:en' },
  { name: 'DeepMind Research', type: 'rss', category: 'research', url: 'https://news.google.com/rss/search?q=site:deepmind.google+research&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Meta AI Research', type: 'rss', category: 'research', url: 'https://news.google.com/rss/search?q=site:ai.meta.com+research&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Alignment Forum', type: 'rss', category: 'research', url: 'https://news.google.com/rss/search?q=site:alignmentforum.org+AI+safety&hl=en-US&gl=US&ceid=US:en' },
  { name: 'LessWrong AI', type: 'rss', category: 'research', url: 'https://news.google.com/rss/search?q=site:lesswrong.com+AI+alignment&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Future of Life Institute', type: 'rss', category: 'research', url: 'https://news.google.com/rss/search?q=site:futureoflife.org+AI&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Center for AI Safety', type: 'rss', category: 'research', url: 'https://news.google.com/rss/search?q=Center+for+AI+Safety+CAIS&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Google AI', type: 'rss', category: 'ai', url: 'https://blog.google/technology/ai/rss/' },
  { name: 'Microsoft AI', type: 'rss', category: 'ai', url: 'https://blogs.microsoft.com/ai/feed/' },
  { name: 'Meta AI', type: 'rss', category: 'ai', url: 'https://ai.meta.com/blog/rss/' },
  { name: 'Mistral', type: 'rss', category: 'ai', url: 'https://mistral.ai/news/rss.xml' },
  { name: 'Stability AI', type: 'rss', category: 'ai', url: 'https://stability.ai/blog/rss.xml' },
  { name: 'TechCrunch AI', type: 'rss', category: 'tech', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
  { name: 'VentureBeat AI', type: 'rss', category: 'tech', url: 'https://venturebeat.com/category/ai/feed/' },
  { name: 'Ars Technica', type: 'rss', category: 'tech', url: 'https://feeds.arstechnica.com/arstechnica/index' },
  { name: 'Hacker News AI', type: 'rss', category: 'tech', url: 'https://hnrss.org/newest?q=artificial+intelligence+OR+AI' },
  { name: 'Reuters Tech', type: 'rss', category: 'mainstream', url: 'https://feeds.reuters.com/reuters/technologyNews' },
  { name: 'Reuters Politics', type: 'rss', category: 'politics', url: 'https://feeds.reuters.com/Reuters/PoliticsNews' },
  { name: 'Social Media Policy', type: 'rss', category: 'tech', url: 'https://feeds.reuters.com/technology/socialmedia' },
  { name: 'Elon Musk News', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=Elon+Musk+AI+Tesla+SpaceX&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Sam Altman News', type: 'rss', category: 'ai', url: 'https://news.google.com/rss/search?q=Sam+Altman+OpenAI+artificial+intelligence&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Jensen Huang NVIDIA', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=Jensen+Huang+NVIDIA+AI+chips&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Palantir News', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=Palantir+AI+data+analytics&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Robotics News', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=robotics+robots+automation+AI&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Tech Gadgets & Toys', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=tech+gadgets+consumer+electronics+reviews+announcements&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Transhumanism News', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=transhumanism+human+enhancement+neural+interfaces+biotech&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Jeff Bezos News', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=Jeff+Bezos+Amazon+business+technology&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Elon Musk AI Coverage', type: 'rss', category: 'ai', url: 'https://news.google.com/rss/search?q=Elon+Musk+Tesla+xAI+SpaceX+AI&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Satya Nadella Microsoft AI', type: 'rss', category: 'ai', url: 'https://news.google.com/rss/search?q=Satya+Nadella+Microsoft+OpenAI+Azure&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Sundar Pichai Google AI', type: 'rss', category: 'ai', url: 'https://news.google.com/rss/search?q=Sundar+Pichai+Google+Gemini+DeepMind&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Mark Zuckerberg Meta AI', type: 'rss', category: 'ai', url: 'https://news.google.com/rss/search?q=Mark+Zuckerberg+Meta+Llama+AI&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Demis Hassabis DeepMind', type: 'rss', category: 'ai', url: 'https://news.google.com/rss/search?q=Demis+Hassabis+Google+DeepMind+AI&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Dario Amodei Anthropic', type: 'rss', category: 'ai', url: 'https://news.google.com/rss/search?q=Dario+Amodei+Anthropic+Claude&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Lisa Su AMD AI Chips', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=Lisa+Su+AMD+AI+chips+GPU&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Alexandr Wang Scale AI', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=Alexandr+Wang+Scale+AI+data+infrastructure&hl=en-US&gl=US&ceid=US:en' },
  { name: 'VC Funding & AI Startups', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=AI+startup+funding+Series+A+B+C+venture+capital+IPO&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Quantum Computing', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=quantum+computing+IBM+Google+breakthrough&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Autonomous Vehicles', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=autonomous+vehicles+Tesla+Waymo+self+driving&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Ilya Sutskever', type: 'rss', category: 'ai', url: 'https://news.google.com/rss/search?q=Ilya+Sutskever+OpenAI+research&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Andrej Karpathy', type: 'rss', category: 'ai', url: 'https://news.google.com/rss/search?q=Andrej+Karpathy+AI+machine+learning&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Lex Fridman AI Podcast', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=Lex+Fridman+podcast+AI+interviews&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Gary Marcus AI Criticism', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=Gary+Marcus+AI+critique+hype&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Mustafa Suleyman AI', type: 'rss', category: 'ai', url: 'https://news.google.com/rss/search?q=Mustafa+Suleyman+Microsoft+DeepMind&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Yann LeCun', type: 'rss', category: 'ai', url: 'https://news.google.com/rss/search?q=Yann+LeCun+AI+godfather+research&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Emad Mostaque Stability', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=Emad+Mostaque+Stable+Diffusion+open+source&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Vitalik Buterin Crypto AI', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=Vitalik+Buterin+Ethereum+AI+crypto&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Nat Friedman Developer AI', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=Nat+Friedman+open+source+AI+developer&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Balaji Srinivasan Tech Vision', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=Balaji+Srinivasan+tech+futurism+Silicon+Valley&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Young AI Builders & Founders', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=young+founder+Gen+Z+startup+AI+builder+teenager+student&hl=en-US&gl=US&ceid=US:en' },
  { name: 'AI Artists & Creators', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=AI+art+music+film+creator+artist+generative&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Open Source AI & Hackers', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=open+source+AI+hacker+developer+GitHub+mod&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Biohacking & Human Enhancement', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=biohacking+neural+implant+human+enhancement+longevity&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Robotics Hobbyists & Builders', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=robot+hobbyist+maker+personal+robot+DIY+robotics&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Virtual Influencers & Digital Identity', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=virtual+influencer+avatar+digital+identity+AI+persona&hl=en-US&gl=US&ceid=US:en' },
  { name: 'AI in Education & Student Life', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=AI+learning+student+education+college+classroom&hl=en-US&gl=US&ceid=US:en' },
  { name: 'AI Daily Life & Lifestyle', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=AI+lifestyle+productivity+dating+business+everyday+life&hl=en-US&gl=US&ceid=US:en' },
  { name: 'AI Gone Wrong', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=AI+failure+error+hallucination+mistake+glitch&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Deepfake Reality', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=deepfake+synthetic+media+fake+video+voice+clone&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Automation Shock', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=automation+workers+job+displaced+robots+industry&hl=en-US&gl=US&ceid=US:en' },
  { name: 'The Surveillance Age', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=facial+recognition+surveillance+tracking+privacy&hl=en-US&gl=US&ceid=US:en' },
  { name: 'AI and War', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=autonomous+weapons+AI+military+drone+cyber+warfare&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Synthetic Humans', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=AI+avatar+voice+clone+synthetic+person+indistinguishable&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Algorithmic Power', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=algorithm+recommendation+system+platform+power+influence&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Data Empires', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=data+collection+privacy+training+dataset+corporate&hl=en-US&gl=US&ceid=US:en' },
  { name: 'The Race to AGI', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=AGI+artificial+general+intelligence+race+competition&hl=en-US&gl=US&ceid=US:en' },
  { name: 'What If It Works Too Well', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=superintelligence+runaway+AI+long+term+humanity+future&hl=en-US&gl=US&ceid=US:en' },
  { name: 'AI Relationships & Companions', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=AI+digital+companions+emotional+connection+relationships&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Virtual Influencers & Synthetic Celebrities', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=virtual+influencers+AI+generated+celebrities+models&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Longevity & Biohacking', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=longevity+biohacking+life+extension+anti+aging&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Brain-Computer Interfaces', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=brain+computer+interface+neural+implants+cognitive+enhancement&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Synthetic Media & AI Entertainment', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=AI+music+movies+digital+actors+synthetic+media&hl=en-US&gl=US&ceid=US:en' },
  { name: 'AI Startups & Young Founders', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=AI+startup+young+founders+tech+entrepreneurs&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Digital Identity & Deepfakes', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=deepfakes+digital+identity+avatars+online+reputation&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Future of Work & AI Careers', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=jobs+automation+AI+careers+future+of+work&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Open-Source AI Movement', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=open+source+AI+hacker+developer+culture&hl=en-US&gl=US&ceid=US:en' },
  { name: 'AI Ethics & Tech Philosophy', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=AI+ethics+consciousness+AGI+moral+philosophy&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Internet Culture & Tech Communities', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=internet+subcultures+AI+art+hacker+culture+memes&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Space Tech & Civilization', type: 'rss', category: 'tech', url: 'https://news.google.com/rss/search?q=space+tech+Mars+SpaceX+orbital+infrastructure+AI&hl=en-US&gl=US&ceid=US:en' }
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
      .filter(item => !isArxivItem(item) || isNotableArxivItem(item))
      .filter(capArxivItems(3))
      .filter(item => isValidArticleLink(item.link))
      .filter(dedupeByLink())
      .sort((a, b) => {
        const priorityDelta = storyPriority(b) - storyPriority(a);
        if (priorityDelta !== 0) return priorityDelta;
        return new Date(b.pubDate || 0) - new Date(a.pubDate || 0);
      })
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

    const researchBreakthroughs = items
      .filter(item => item.category === 'research' || /(paper|preprint|benchmark|experiment|research|breakthrough|model eval|alignment|interpretability|reasoning)/i.test(`${item.title} ${item.summary || ''}`))
      .slice(0, 16)
      .map(item => ({ title: item.title, link: item.link, source: item.source, category: item.category }));

    const darkTech = items
      .filter(item => /(deepfake|synthetic|surveillance|autonomous weapon|weaponized ai|identity theft|voice clone|manipulation|misuse|biohacking|brain[- ]computer)/i.test(`${item.title} ${item.summary || ''}`))
      .slice(0, 16)
      .map(item => ({ title: item.title, link: item.link, source: item.source, category: item.category }));

    const incidentLog = items
      .filter(item => /(incident|failure|hallucination|outage|bug|accident|harm|safety failure|red team|misalignment|breakdown)/i.test(`${item.title} ${item.summary || ''}`))
      .slice(0, 16)
      .map(item => ({ title: item.title, link: item.link, source: item.source, category: item.category }));

    const aiCulture = items
      .filter(item => /(companion|culture|creator|influencer|community|social|podcast|education|student life|lifestyle|digital identity)/i.test(`${item.title} ${item.summary || ''}`))
      .slice(0, 16)
      .map(item => ({ title: item.title, link: item.link, source: item.source, category: item.category }));

    const policyActivity = items
      .filter(item => /ai act|ai policy|ai regulation|model safety policy|executive order ai|governance/i.test(`${item.title} ${item.summary || ''}`))
      .slice(0, 10)
      .map(item => ({
        title: item.title,
        link: item.link,
        source: item.source,
        pubDate: item.pubDate
      }));

    const humanDriftActivity = items
      .filter(item => /(incident|failure|hallucination|deepfake|synthetic|identity|robot|autonomous|drone|surveillance|weapon|defense|attachment|companion|transhuman|enhancement|safety|misuse|breakdown)/i.test(`${item.title} ${item.summary || ''}`))
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
          researchBreakthroughs,
          darkTech,
          incidentLog,
          aiCulture,
          policyActivity,
          humanDriftActivity,
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
        'User-Agent': 'Mozilla/5.0 AISignals/1.0'
      }
    }, 6500);

    if (!response.ok) {
      throw new Error(`${source.name} returned ${response.status}`);
    }

    const text = await response.text();
    if (source.type === 'rss') return parseRSS(text, source);
    return parseHTML(text, source).slice(0, source.limit || 8);
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

  const cap = source.limit || 12;
  for (const chunk of matches.slice(0, cap)) {
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

function sanitizeHeadline(value = '') {
  return decodeHtml(value)
    .replace(/^\s*(?:\[[^\]]+\]|\{[^\}]+\}|\([A-Z0-9_\-]{2,20}\))\s*/, '')
    .replace(/^\s*(?:code:|id:|tag:)\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function isValidArticleLink(link = '') {
  const l = link.trim();
  if (!l.startsWith('http')) return false;
  // reject feed/channel root URLs (no path beyond a bare slash or feed extension)
  if (/\.(rss|xml|atom)(\?|$)/i.test(l)) return false;
  if (/news\.google\.com\/rss\/search/i.test(l)) return false;
  if (/\/(rss|feed|feeds)(\/|\?|$)/i.test(l)) return false;
  // reject links that are clearly just domain roots
  if (/^https?:\/\/[^/]+(\/)?$/.test(l)) return false;
  // reject anything that looks like raw code or markup leaked into a URL
  if (/<|>|{|}|\[|\]/.test(l)) return false;
  return true;
}

function cleanItem(item) {
  return {
    source: item.source || 'Live Feed',
    category: item.category || 'ai',
    title: sanitizeHeadline(item.title || ''),
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

function storyPriority(item) {
  let score = 0;
  const source = String(item.source || '').toLowerCase();
  const text = `${item.title || ''} ${item.summary || ''}`.toLowerCase();

  if (item.category === 'research') score += 6;
  if (item.category === 'ai') score += 3;

  if (/(arxiv|papers with code|mit technology review ai|mit csail|stanford ai|berkeley ai|carnegie mellon ai|openai research|anthropic research|deepmind research|meta ai research|alignment forum|future of life|center for ai safety)/.test(source)) {
    score += 6;
  }

  if (/(paper|preprint|benchmark|experiment|research|alignment|safety|frontier|breakthrough|model eval|red team|interpretability|reasoning)/.test(text)) {
    score += 4;
  }

  return score;
}

function isArxivItem(item = {}) {
  return /arxiv/i.test(String(item.source || ''));
}

function isNotableArxivItem(item = {}) {
  const text = `${item.title || ''} ${item.summary || ''}`.toLowerCase();

  const notableSignals = /(breakthrough|state[- ]of[- ]the[- ]art|sota|frontier|reasoning|chain[- ]of[- ]thought|test[- ]time compute|agentic|robot|robotic|embodied|manipulation|navigation|safety|alignment|red[- ]team|robustness|jailbreak|emergent|emergence|scaling law|world model|multimodal|tool use|planning)/;
  const lowInterestSignals = /(survey|workshop|tutorial|dataset|benchmark(ing)?|we propose|towards|an approach|preliminary|ablation|appendix|supplementary|short paper)/;

  if (!notableSignals.test(text)) return false;
  if (lowInterestSignals.test(text) && !/(breakthrough|state[- ]of[- ]the[- ]art|reasoning|robot|safety|alignment|emergent)/.test(text)) {
    return false;
  }

  return true;
}

function capArxivItems(maxCount = 3) {
  let count = 0;
  return (item) => {
    if (!isArxivItem(item)) return true;
    if (count >= maxCount) return false;
    count += 1;
    return true;
  };
}

const MARKET_SYMBOLS = [
  { ticker: 'NVDA', name: 'NVIDIA', yahooSymbol: 'NVDA', stooqSymbol: 'nvda.us', link: 'https://finance.yahoo.com/quote/NVDA' },
  { ticker: 'MSFT', name: 'Microsoft', yahooSymbol: 'MSFT', stooqSymbol: 'msft.us', link: 'https://finance.yahoo.com/quote/MSFT' },
  { ticker: 'GOOGL', name: 'Alphabet', yahooSymbol: 'GOOGL', stooqSymbol: 'googl.us', link: 'https://finance.yahoo.com/quote/GOOGL' },
  { ticker: 'META', name: 'Meta', yahooSymbol: 'META', stooqSymbol: 'meta.us', link: 'https://finance.yahoo.com/quote/META' },
  { ticker: 'TSLA', name: 'Tesla', yahooSymbol: 'TSLA', stooqSymbol: 'tsla.us', link: 'https://finance.yahoo.com/quote/TSLA' },
  { ticker: 'AMD', name: 'AMD', yahooSymbol: 'AMD', stooqSymbol: 'amd.us', link: 'https://finance.yahoo.com/quote/AMD' },
  { ticker: 'BTC', name: 'Bitcoin', yahooSymbol: 'BTC-USD', stooqSymbol: null, link: 'https://finance.yahoo.com/quote/BTC-USD' },
  { ticker: 'ETH', name: 'Ethereum', yahooSymbol: 'ETH-USD', stooqSymbol: null, link: 'https://finance.yahoo.com/quote/ETH-USD' }
];

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

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function roundNumber(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

async function fetchMarketSnapshot() {
  try {
    const yahooUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${MARKET_SYMBOLS.map(s => s.yahooSymbol).join(',')}`;
    const response = await fetchWithTimeout(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 AISignals/1.0',
        'Accept': 'application/json'
      }
    }, 5000);

    let assets = [];
    if (response.ok) {
      const data = await response.json();
      const quotes = Array.isArray(data?.quoteResponse?.result) ? data.quoteResponse.result : [];
      const quoteBySymbol = new Map(quotes.map(q => [String(q.symbol || '').toUpperCase(), q]));

      assets = MARKET_SYMBOLS
        .map(symbol => toAsset(quoteBySymbol.get(symbol.yahooSymbol), symbol.name, symbol.ticker, symbol.link))
        .filter(asset => asset && typeof asset.price === 'number');
    }

    if (assets.length < 3) {
      assets = await fetchMarketSnapshotFallback();
    }

    if (!assets.length) return null;

    const pulseValue = roundNumber(average(assets.map(a => a.changePct)), 2);
    const pulse = pulseValue > 0.35 ? 'BULLISH' : pulseValue < -0.35 ? 'BEARISH' : 'FLAT';

    return {
      pulse,
      pulseValue,
      assets,
      indexLinks: [
        { name: 'NASDAQ Composite', link: 'https://finance.yahoo.com/quote/%5EIXIC' },
        { name: 'QQQ ETF', link: 'https://finance.yahoo.com/quote/QQQ' }
      ],
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.warn('Market snapshot failed:', error.message);
    return null;
  }
}

async function fetchMarketSnapshotFallback() {
  try {
    const stooqSymbols = MARKET_SYMBOLS.filter(s => s.stooqSymbol).map(s => s.stooqSymbol).join(',');
    const response = await fetchWithTimeout(
      `https://stooq.com/q/l/?s=${stooqSymbols}&f=sd2t2ohlcv&h&e=csv`,
      { headers: { 'User-Agent': 'Mozilla/5.0 AISignals/1.0' } },
      5000
    );

    if (!response.ok) return [];

    const csv = await response.text();
    const rows = csv.split(/\r?\n/).filter(Boolean).slice(1);
    const symbolByStooq = new Map(
      MARKET_SYMBOLS
        .filter(s => s.stooqSymbol)
        .map(s => [s.stooqSymbol.toUpperCase(), s])
    );

    return rows.map(row => {
      const cols = row.split(',');
      const symbol = String(cols[0] || '').trim().toUpperCase();
      const config = symbolByStooq.get(symbol);
      if (!config) return null;

      const open = toNumber(cols[3]);
      const close = toNumber(cols[6]);
      if (close == null) return null;

      const changePct = open && open > 0 ? roundNumber(((close - open) / open) * 100, 2) : null;

      return {
        ticker: config.ticker,
        name: config.name,
        price: roundNumber(close, 2),
        changePct,
        trend: changePct > 0 ? 'UP' : changePct < 0 ? 'DOWN' : 'FLAT',
        link: config.link
      };
    }).filter(Boolean);
  } catch {
    return [];
  }
}
