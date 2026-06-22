#!/usr/bin/env python3
"""Download dedicated pinyin syllable MP3s (NOT HSK word readings)."""

from __future__ import annotations

import json
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AUDIO_DIR = ROOT / "audio" / "pinyin"
PINYIN_JS = ROOT / "js" / "pinyin.js"
MANIFEST_OUT = AUDIO_DIR / "manifest.json"
PINYIN_MP3_BASE = (
    "https://raw.githubusercontent.com/davinfifield/mp3-chinese-pinyin-sound/master/mp3/{key}.mp3"
)
SYLLABS_BASE = (
    "https://raw.githubusercontent.com/hugolpz/audio-cmn/master/64k/syllabs/cmn-{key}.mp3"
)


def parse_manifest_from_js() -> list[dict]:
    text = PINYIN_JS.read_text(encoding="utf-8")
    entries: dict[str, dict] = {}
    for match in re.finditer(r"\{[^{}]*audio:\s*'([^']+\.mp3)'[^{}]*audioKey:\s*'([^']+)'", text):
        filename, audio_key = match.groups()
        if filename not in entries:
            entries[filename] = {"filename": filename, "audioKey": audio_key}
    return list(entries.values())


def try_download(url: str) -> bytes | None:
    try:
        with urllib.request.urlopen(url, timeout=30) as resp:
            data = resp.read()
        return data if len(data) >= 500 else None
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError):
        return None


def download_pinyin_syllable(audio_key: str, dest: Path) -> str | None:
    for url, source in (
        (PINYIN_MP3_BASE.format(key=audio_key), "mp3-chinese-pinyin-sound"),
        (SYLLABS_BASE.format(key=audio_key), "audio-cmn-syllabs"),
    ):
        data = try_download(url)
        if data:
            dest.write_bytes(data)
            return source
    return None


def main() -> int:
    force = "--force" in sys.argv
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    items = parse_manifest_from_js()
    keep = {item["filename"] for item in items}

    if force:
        for path in AUDIO_DIR.glob("*.mp3"):
            if path.name not in keep:
                path.unlink()

    print(f"Building {len(items)} pinyin syllable files -> {AUDIO_DIR}")

    manifest: list[dict] = []
    failed: list[str] = []

    for item in items:
        dest = AUDIO_DIR / item["filename"]
        source = "existing"

        if not force and dest.exists() and dest.stat().st_size > 500:
            source = "existing"
        else:
            downloaded = download_pinyin_syllable(item["audioKey"], dest)
            if downloaded:
                source = downloaded
            else:
                source = "missing"
                failed.append(f"{item['filename']} ({item['audioKey']})")

        manifest.append({**item, "source": source})

    ok = sum(
        1
        for m in manifest
        if (AUDIO_DIR / m["filename"]).exists()
        and (AUDIO_DIR / m["filename"]).stat().st_size > 500
    )

    MANIFEST_OUT.write_text(
        json.dumps(
            {
                "total": len(manifest),
                "ok": ok,
                "failed": failed,
                "note": "Dedicated pinyin syllable recordings — not HSK character/word audio",
                "files": manifest,
                "attribution": {
                    "primary": "davinfifield/mp3-chinese-pinyin-sound (Unlicense)",
                    "fallback": "hugolpz/audio-cmn syllabs (CC-BY-SA, Chen Wang)",
                },
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    print(f"Done: {ok}/{len(manifest)} files ready")
    if failed:
        print("Missing:", ", ".join(failed), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
