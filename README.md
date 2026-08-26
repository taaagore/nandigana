# Sri Sathya Sai Nandigāna

A lightweight Bhajan Planner and archive web application inspired by Spotify's UI design, sourced directly from the Sri Sathya Sai Media Centre public archive (`sssmediacentre.org`).

## Features

- **Search & Filter:** Instant real-time filtering by bhajan title, deity, beat (tala), raga, and tempo.
- **Date-Based Search:** Look up specific Prasanthi Mandir sessions by date to see the exact bhajan singing order.
- **Detailed Drawer:** Side drawer displaying pitch/sruthi (male & female), duration, lyrics, and English meanings.
- **Spotify-Inspired UI:** Dark theme with deity-coded color accents and darshan portrait displays.

## Project Structure

```text
.
├── .gitignore
├── README.md
├── index.html              # Root redirect to app/index.html
├── app/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── index.html          # Main application page
├── data/
│   ├── bhajans.json        # Normalized JSON dataset
│   └── schema.md           # Schema definitions and data field mappings
└── scraper/
    ├── requirements.txt    # Python dependencies
    └── scrape_sssmc.py     # Data extraction script
```

## How It Works

The web app is purely static. The frontend reads `data/bhajans.json` locally using JavaScript, performing all filtering and searching directly in the browser without live API calls or server backends.

## Getting Started

### 1. Run the Scraper (Updating Data)

To refresh or download the full bhajan dataset:

```bash
cd scraper
pip install -r requirements.txt

# Fetch live sung Prasanthi Mandir bhajans
python scrape_sssmc.py --sub-category "Prasanthi Mandir Bhajans"

# Or run a quick test with 2 pages
python scrape_sssmc.py --max-pages 2
```

This will populate `data/bhajans.json`.

### 2. Local Preview

Serve from the **root folder** so the app can access `data/bhajans.json`:

```bash
# In the project root directory
python3 -m http.server 8000
```

Open your browser at:

```text
http://localhost:8000
```

## Deployment

### GitHub Pages

1. Go to **Repository Settings > Pages**.
2. Select the `main` branch.
3. Set the folder to `/ (root)`.
4. The root `index.html` redirects automatically to `app/index.html`.

### Render

Deploy as a **Static Site**, point the build directory to the repository root (`./`), and publish.

## Data Source

The bhajan archive data is sourced from the public archive of the **Sri Sathya Sai Media Centre**.

The application itself does not require a backend server or live API calls to function. All searchable data is stored locally in `data/bhajans.json`.