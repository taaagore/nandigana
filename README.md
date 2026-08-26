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
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── data/
│   ├── bhajans.json
│   └── schema.md
└── scraper/
    ├── requirements.txt
    └── scrape_sssmc.py
```

## How It Works

The web app is purely static. The frontend reads `data/bhajans.json` locally using JavaScript, performing all filtering and searching directly in the browser without live API calls or server backends.

## Getting Started

### 1. Run the Scraper (Updating Data)

To refresh or download the full bhajan dataset:

```bash
cd scraper
pip install -r requirements.txt
python scrape_sssmc.py --sub-category "Prasanthi Mandir Bhajans"
# Or: python scrape_sssmc.py --max-pages 2
```

This will populate `data/bhajans.json`.

### 2. Local Preview

Serve from the project root:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Deployment

### GitHub Pages

Select the `main` branch and `/ (root)` as the Pages source. The root `index.html` is the application entry point.

### Render

Deploy as a Static Site, point the build directory to the repository root (`./`), and publish.

## Data Source

The bhajan archive data is sourced from the public archive of the **Sri Sathya Sai Media Centre**.

The application itself does not require a backend server or live API calls to function. All searchable data is stored locally in `data/bhajans.json`.
