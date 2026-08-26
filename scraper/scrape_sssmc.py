import argparse
import json
import re
import time
from pathlib import Path

import requests

DATA_FILE = Path(__file__).parent.parent / "data" / "bhajans.json"
BASE_URL = "https://www.sssmediacentre.org/api/public/search/audio/"
BHAJANS_CATEGORY_ID = "a80e59ba-8850-4379-b659-e25d4d9a6222"
PAGE_SIZE = 200

FILENAME_DATE_RE = re.compile(r"^MBV_(\d{4})_(\d{2})_(\d{2})_(\d+)_")


def build_query(category_id: str) -> str:
    qry = {
        "$and": [
            {"$or": [{"categoryId": category_id}]},
            {"isEnabled": True},
            {"isDeleted": False},
        ]
    }
    return json.dumps(qry, separators=(",", ":"))


def fetch_page(session: requests.Session, category_id: str, skip: int) -> list:
    params = {
        "qry": build_query(category_id),
        "limit": PAGE_SIZE,
        "skip": skip,
    }
    resp = session.get(BASE_URL, params=params, timeout=20)
    resp.raise_for_status()
    payload = resp.json()
    return payload.get("data", [])


def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def parse_date_and_order(file_name: str):
    if not file_name:
        return None, None
    m = FILENAME_DATE_RE.match(file_name)
    if not m:
        return None, None
    year, month, day, order = m.groups()
    try:
        date_str = f"{year}-{month}-{day}"
        time.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        return None, None
    return date_str, int(order)


def normalize(record: dict) -> dict:
    name = (record.get("title") or "").strip()
    file_name = record.get("file_name") or ""
    date, order = parse_date_and_order(file_name)

    return {
        "id": record.get("_id"),
        "name": name,
        "slug": slugify(name) if name else None,
        "date": date,
        "order": order,
        "session": None,
        "deity": record.get("deity"),
        "raga": record.get("raga"),
        "beat": record.get("tala"),
        "speed": record.get("tempo"),
        "sruthi_male": record.get("sruthi_male"),
        "sruthi_female": record.get("sruthi_female"),
        "lyrics": record.get("lyrics"),
        "meaning": record.get("meaning"),
        "duration": record.get("DurationSpan"),
        "source_id": record.get("_id"),
        "sub_category": record.get("sub_category"),
    }


def load_existing() -> dict:
    if DATA_FILE.exists():
        records = json.loads(DATA_FILE.read_text())
        return {r["id"]: r for r in records}
    return {}


def save(records_by_id: dict) -> None:
    records = list(records_by_id.values())
    records.sort(key=lambda r: (r["date"] or "0000-00-00", r["order"] or 0))
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    DATA_FILE.write_text(json.dumps(records, indent=2, ensure_ascii=False))
    print(f"Wrote {len(records)} records to {DATA_FILE}")


def main():
    parser = argparse.ArgumentParser(description="Scrape SSSMC bhajan data.")
    parser.add_argument("--category-id", default=BHAJANS_CATEGORY_ID)
    parser.add_argument("--sub-category", default=None)
    parser.add_argument("--since", default=None)
    parser.add_argument("--max-pages", type=int, default=None)
    args = parser.parse_args()

    session = requests.Session()
    session.headers["User-Agent"] = "Mozilla/5.0 (personal bhajan archive project)"

    existing = load_existing()
    skip = 0
    page_num = 0

    while True:
        page_num += 1
        print(f"Fetching skip={skip} (page {page_num})...")
        raw_records = fetch_page(session, args.category_id, skip)
        if not raw_records:
            print("No more records.")
            break

        for raw in raw_records:
            record = normalize(raw)
            if args.sub_category and record["sub_category"] != args.sub_category:
                continue
            if args.since and record["date"] and record["date"] < args.since:
                continue
            if not record["id"]:
                continue
            existing[record["id"]] = record

        skip += PAGE_SIZE
        if args.max_pages and page_num >= args.max_pages:
            print(f"Hit --max-pages={args.max_pages}, stopping.")
            break
        time.sleep(0.3)

    save(existing)


if __name__ == "__main__":
    main()