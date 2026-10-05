# Ask Amadeus — AI chat helper

Two pieces:

- `assets/amadeus-chat.js` — the chat box on the site. It appears on every page that loads `assets/app.js`. On pages with the talking Amadeus guide, the "Ask me anything" button sits on his card; elsewhere it's a gold "Ask Amadeus" button in the bottom-right corner.
- `worker/worker.js` — a tiny Cloudflare Worker that holds the Claude API key and passes questions to Claude. The website can't keep a secret, so the key lives only here.

The chat stays hidden until step 5 is done.

## Setup

1. **Claude API key.** Sign in at https://console.anthropic.com, add a payment method under Billing, and set a monthly spend limit (start small, like $10). Under API Keys, create a key named `amadeus-chat` and copy it.
2. **Cloudflare account.** Sign up free at https://dash.cloudflare.com.
3. **Create the Worker.** In Cloudflare: Workers & Pages → Create → Create Worker. Name it `amadeus-chat` → Deploy. Then Edit code, delete what's there, paste in all of `worker/worker.js`, and Deploy.
4. **Add the key.** On the Worker: Settings → Variables and Secrets → Add. Type: Secret. Name: `ANTHROPIC_API_KEY`. Value: the key from step 1. Save.
5. **Connect the site.** Copy the Worker's address (looks like `https://amadeus-chat.YOURNAME.workers.dev`). In `assets/amadeus-chat.js`, put it between the quotes on the `var RELAY = '';` line, and change `amadeus-chat.js?v=1` to `?v=2` at the bottom of `assets/app.js`.

## Changing what Amadeus knows

Edit the `SYSTEM` text near the top of `worker/worker.js` in Cloudflare (Edit code → Deploy). New pages, rules, tone — it all goes there. No change to the website needed.

## Costs and safety

- Uses Claude Haiku, the fastest, cheapest model. Answers are capped in length, and each visitor is limited to 8 messages a minute.
- Only douggarceau.com and amadeusschoolofdrums.com can use the Worker.
- The spend limit from step 1 is the hard ceiling.
- Moving to the new domain needs no change; both are already allowed.
