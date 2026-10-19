# City Edition content spec — The Guitar Doug Report

The Guitar Doug Report is a dark, serious Seattle news site. We are launching identical BOSTON and NEW YORK CITY editions. You are gathering one slice of real, current content for one city. Today is Monday, October 19, 2026 (America/New_York).

Exact record formats: copy the field names and value styles from `_editions/samples.json` (Seattle examples). Write output as a JSON array (or object where the sample is an object) with UTF-8, `ensure_ascii=False`.

## Hard rules (apply to every record)
- Everything must be REAL and verifiable: real events, real places, real reporting, real working URLs you actually found. Never invent a story, show, venue, band, quote, number or URL. If you can't verify it, leave it out.
- Dates: news and crime from roughly Sept 20 – Oct 19, 2026, newest first, weighted to the last 10 days. Calendar/show/event items from Oct 19 – Nov 22, 2026.
- NO gay/LGBTQ news, NO drag shows, NO Pride events — anywhere (wire, scene, calendar, venue news, venue list items described as drag/queer nights). Skip them.
- NO stories about injured, abused or dead animals.
- Serious news tone, no jokes, no puns. Accused means accused.
- Neighborhood field (`hood`): use the city's real neighborhood names (Boston: e.g. Dorchester, Roxbury, Mattapan, South Boston, East Boston, Back Bay, South End, Fenway, Allston, Brighton, Jamaica Plain, Charlestown, North End, Downtown, Chinatown, Hyde Park, Roslindale, West Roxbury, Seaport; nearby cities like Cambridge, Somerville, Quincy, Lynn, Brockton, Chelsea, Revere, Lowell are fine for the wider metro. NYC: borough or neighborhood, e.g. Harlem, Bronx – Mott Haven, Brooklyn – Bed-Stuy, Queens – Jamaica, Lower East Side, Midtown, etc.).
- `outlet` = the publication name. `url` = the exact article/listing page.
- Boston outlets: Boston Globe, Boston Herald, WCVB, WBZ/CBS Boston, NBC10 Boston, 7News WHDH, Boston 25 FOX, Universal Hub, Dorchester Reporter, MassLive, Patch, WBUR, GBH, Boston Police news (bpdnews.com), Suffolk DA. 
- NYC outlets: New York Post, Daily News, NY Times, Gothamist, ABC7 NY, NBC4 NY, CBS NY, PIX11, FOX5 NY, News 12, The City, Patch, amNY, NYPD news / DCPI, Brooklyn Paper, Bronx Times, QNS.

## Output location
Write files to `_editions/<city>/` where `<city>` is `boston` or `nyc`. Use the file names given in your task. Write partial progress to the file as you go (rewrite the whole valid JSON each time) so nothing is lost. When done, run `python3 -c "import json;print(len(json.load(open(PATH))))"` on each file to confirm it parses, and reply with a 3-line summary (counts, any gaps). Do not paste the data back in your reply.
