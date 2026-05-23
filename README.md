# Aaj Ka Tel Bhav ⛽

> Petrol pumpa mein jaane se pehle jaan lo bhai

Live petrol and diesel prices for every city in India. Clean, minimal, Gen-Z. With Bihari/UP energy.

**Live demo:** [aajkatel.in](https://aajkatel.in)

---

## Setup

### 1. Clone and deploy to Netlify

```bash
git clone https://github.com/yourusername/aajkatel
cd aajkatel
```

Connect to Netlify (drag the folder into netlify.app or use CLI):
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### 2. Get a free API key from CollectAPI

1. Sign up at [collectapi.com](https://collectapi.com)
2. Subscribe to the **Fuel Price** API (free tier: 100 requests/day)
3. Copy your API key

### 3. Set environment variables in Netlify

In Netlify dashboard: **Site settings > Environment variables**, add:

| Variable | Value |
|---|---|
| `COLLECT_API_KEY` | Your CollectAPI key |
| `FORMSPREE_ID` | Your Formspree form ID (optional, for report emails) |

### 4. Set GitHub secret for daily updates

In GitHub repo: **Settings > Secrets and variables > Actions**, add:

| Secret | Value |
|---|---|
| `COLLECT_API_KEY` | Your CollectAPI key |

The GitHub Action runs daily at 7:30 AM IST, fetches fresh prices, commits `data/prices.json`, and Netlify auto-deploys.

### 5. Generate favicons

1. Go to [realfavicongenerator.net](https://realfavicongenerator.net)
2. Upload your logo or an emoji screenshot of ⛽
3. Configure theme color: `#f59e0b`
4. Download the package and drop all files into the root folder

### 6. Create og-image.png

The social sharing image should be 1200x630px.
Suggested design: dark background, amber "AAJ KA TEL BHAV" in DSEG7 font, a fuel price display mockup.

---

## Architecture

```
/
├── index.html              # Main page, SEO, favicon refs
├── style.css               # All styles, dark pump display aesthetic
├── app.js                  # Logic: geolocation, price fetching, reporting
├── content.js              # All copy/text (Bihari/UP flavour, edit here)
├── netlify.toml            # Netlify config, headers, redirects
├── site.webmanifest        # PWA manifest
├── og-image.png            # Social sharing image (create this)
├── api/
│   ├── get-prices.js       # Netlify Function: fetch prices
│   └── report-price.js     # Netlify Function: handle user reports
├── data/
│   └── prices.json         # Static fallback prices (auto-updated daily)
└── .github/
    ├── workflows/
    │   └── update-prices.yml   # Daily cron job
    └── scripts/
        └── update-prices.js    # Price update script
```

## Price Update Flow

```
Daily 7:30 AM IST
      |
      v
GitHub Action runs update-prices.js
      |
      v
Fetches prices from CollectAPI for all cities
      |
      v
Commits updated data/prices.json
      |
      v
Netlify auto-deploys (connected to GitHub)
      |
      v
Users get fresh prices from Netlify CDN cache
      |
      v
Netlify Function also hits CollectAPI live for real-time accuracy
```

## Customising content

All text is in `content.js`. Edit freely:
- `funFacts[]` - the rotating daily quote at the bottom
- `loadingMessages[]` - what shows while prices load
- `errors` - error messages
- Everything else

---

## License

MIT. Free to deploy. If you make money from petrol prices, iska ek percent dena bhai.
