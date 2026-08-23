from __future__ import annotations

import json
import re
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
HOST = "www.xn--erensanjeneratr-mtb.com.tr"


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title = ""
        self._in_title = False
        self.h1_count = 0
        self.meta: list[dict[str, str]] = []
        self.links: list[str] = []
        self.assets: list[tuple[str, str, dict[str, str]]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = {key: value or "" for key, value in attrs}
        if tag == "title":
            self._in_title = True
        elif tag == "h1":
            self.h1_count += 1
        elif tag == "meta":
            self.meta.append(data)
        elif tag == "a" and data.get("href"):
            self.links.append(data["href"])
        elif tag in {"img", "script", "link"}:
            key = "src" if tag in {"img", "script"} else "href"
            if data.get(key):
                self.assets.append((tag, data[key], data))

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self._in_title = False

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self.title += data


def meta_value(parser: PageParser, *, name: str = "", prop: str = "") -> str:
    for item in parser.meta:
        if name and item.get("name", "").lower() == name.lower():
            return item.get("content", "")
        if prop and item.get("property", "").lower() == prop.lower():
            return item.get("content", "")
    return ""


def local_target(page: Path, raw_url: str) -> Path | None:
    if not raw_url or raw_url.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
        return None
    parsed = urlparse(raw_url)
    if parsed.scheme in {"http", "https"}:
        if parsed.netloc != HOST:
            return None
        url_path = unquote(parsed.path)
        return ROOT / ("index.html" if url_path in {"", "/"} else url_path.lstrip("/"))
    url_path = unquote(parsed.path)
    if not url_path:
        return None
    if url_path.startswith("/"):
        return ROOT / ("index.html" if url_path == "/" else url_path.lstrip("/"))
    return (page.parent / url_path).resolve()


def main() -> int:
    errors: list[str] = []
    pages = sorted(ROOT.rglob("*.html"))
    titles: dict[str, Path] = {}
    descriptions: dict[str, Path] = {}
    canonical_urls: set[str] = set()
    indexable_pages: set[Path] = set()
    incoming_links: dict[Path, set[Path]] = {}

    for page in pages:
        rel = page.relative_to(ROOT)
        html = page.read_text(encoding="utf-8")
        parser = PageParser()
        parser.feed(html)

        title = parser.title.strip()
        description = meta_value(parser, name="description")
        robots = meta_value(parser, name="robots")
        canonical_match = re.search(r'<link\s+rel="canonical"\s+href="([^"]+)"', html, re.I)
        canonical = canonical_match.group(1) if canonical_match else ""

        if not title:
            errors.append(f"{rel}: title missing")
        elif title in titles:
            errors.append(f"{rel}: duplicate title with {titles[title].relative_to(ROOT)}")
        else:
            titles[title] = page
        if not description:
            errors.append(f"{rel}: meta description missing")
        elif description in descriptions:
            errors.append(f"{rel}: duplicate meta description with {descriptions[description].relative_to(ROOT)}")
        else:
            descriptions[description] = page
        if parser.h1_count != 1:
            errors.append(f"{rel}: expected one H1, found {parser.h1_count}")
        if page.name == "404.html":
            if "noindex" not in robots.lower():
                errors.append(f"{rel}: 404 page must be noindex")
        else:
            if not canonical:
                errors.append(f"{rel}: canonical missing")
            elif canonical in canonical_urls:
                errors.append(f"{rel}: duplicate canonical {canonical}")
            else:
                canonical_urls.add(canonical)
                indexable_pages.add(page.resolve())
            for field in ("twitter:card", "twitter:title", "twitter:description", "twitter:image"):
                if not meta_value(parser, name=field):
                    errors.append(f"{rel}: {field} missing")

        for script_match in re.finditer(r'<script[^>]+type="application/ld\+json"[^>]*>(.*?)</script>', html, re.I | re.S):
            try:
                json.loads(script_match.group(1))
            except json.JSONDecodeError as exc:
                errors.append(f"{rel}: invalid JSON-LD ({exc.msg})")

        for href in parser.links:
            target = local_target(page, href)
            if target is not None and not target.exists():
                errors.append(f"{rel}: broken link {href}")
            elif target is not None and target.suffix.lower() == ".html":
                incoming_links.setdefault(target.resolve(), set()).add(page.resolve())

        for tag, src, attrs in parser.assets:
            if src.startswith("/_vercel/"):
                continue
            target = local_target(page, src)
            if target is not None and not target.exists():
                errors.append(f"{rel}: missing {tag} asset {src}")
            if tag == "img":
                if not attrs.get("alt"):
                    errors.append(f"{rel}: image alt missing for {src}")
                if not attrs.get("width") or not attrs.get("height"):
                    errors.append(f"{rel}: image dimensions missing for {src}")

    sitemap = ET.parse(ROOT / "sitemap.xml")
    namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    sitemap_urls = {node.text for node in sitemap.findall(".//sm:loc", namespace) if node.text}
    expected_urls = canonical_urls
    missing_from_sitemap = expected_urls - sitemap_urls
    extra_in_sitemap = sitemap_urls - expected_urls
    for url in sorted(missing_from_sitemap):
        errors.append(f"sitemap: missing {url}")
    for url in sorted(extra_in_sitemap):
        errors.append(f"sitemap: URL has no canonical page {url}")

    for page in sorted(indexable_pages):
        if page.name == "index.html":
            continue
        sources = incoming_links.get(page, set()) - {page}
        if not sources:
            errors.append(f"{page.relative_to(ROOT)}: orphan page (no internal incoming link)")

    if errors:
        print(f"FAIL: {len(errors)} issue(s) across {len(pages)} HTML files")
        print("\n".join(f"- {item}" for item in errors))
        return 1

    print(f"PASS: {len(pages)} HTML files, {len(canonical_urls)} indexable canonicals, valid JSON-LD, local links and assets")
    return 0


if __name__ == "__main__":
    sys.exit(main())
