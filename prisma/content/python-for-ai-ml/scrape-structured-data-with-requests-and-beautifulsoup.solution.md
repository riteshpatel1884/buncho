**First choose the lowest-risk source:** an official API or downloadable dataset, then a sitemap or JSON embedded in the page, and only then HTML scraping. Check the site's **terms of service** and **`robots.txt`**. Some sites forbid scraping outright.

```python
import json
import time

import requests
from bs4 import BeautifulSoup

HEADERS = {"User-Agent": "research-bot/1.0 (contact: you@example.com)"}


def fetch(url: str) -> str:
    r = requests.get(url, headers=HEADERS, timeout=15)
    r.raise_for_status()
    return r.text


def parse(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")
    rows = []
    for item in soup.select("li.movie"):                       # CSS selectors, not fragile string slicing
        title = item.select_one(".title")
        rating = item.select_one(".rating")
        if not title or not rating:                             # layouts change: skip, do not crash
            continue
        rows.append({
            "rank": int(item["data-rank"]),
            "title": title.get_text(strip=True),
            "year": int(item.select_one(".year").get_text(strip=True).strip("()")),
            "rating": float(rating.get_text(strip=True)),
        })
    return rows


# Offline demo using a static snippet instead of the network:
html = '''
<ul>
  <li class="movie" data-rank="1"><span class="title">Movie A</span><span class="year">(1994)</span><span class="rating">9.3</span></li>
  <li class="movie" data-rank="2"><span class="title">Movie B</span><span class="year">(1972)</span><span class="rating">9.2</span></li>
</ul>'''
rows = parse(html)
assert rows == [
    {"rank": 1, "title": "Movie A", "year": 1994, "rating": 9.3},
    {"rank": 2, "title": "Movie B", "year": 1972, "rating": 9.2},
]

with open("movies.jsonl", "w", encoding="utf-8") as f:           # JSONL is easy to append and stream
    for row in rows:
        f.write(json.dumps(row) + "\n")

# Live use: for url in pages: parse(fetch(url)); time.sleep(1)  # be polite
```

**Precautions**

- **Identify yourself** with a User-Agent and **rate limit** (a sleep between requests, exponential backoff on 429). Cache raw HTML so you never fetch the same page twice while debugging.
- **Validate** each record (types, ranges, required fields) and log pages that fail to parse. Silent misses are the main source of bad scraped datasets.
- Pages built by JavaScript will not appear in `requests`. Look for the JSON the page calls (browser network tab) or use a headless browser such as Playwright.
- Pagination: follow "next" links or page parameters until a page returns no rows.
- Keep `source_url` and `fetched_at` with every record. Do not scrape personal data without a lawful basis, and check licence terms before training on the content.
