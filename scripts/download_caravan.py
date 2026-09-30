#!/usr/bin/env python3
"""Download script for the Caravan global hydrological dataset.

Official Source: Zenodo Record 6578598 (DOI: 10.5281/zenodo.6578598)
Reference: Kratzert et al. (Nature Scientific Data, 2023)
License: Creative Commons Attribution 4.0 International (CC-BY-4.0)

Features:
- Resumable downloading with HTTP Range headers
- MD5 checksum validation against official Zenodo metadata
- Checksum and metadata logging to JSON
"""

from __future__ import annotations

import argparse
import hashlib
import json
import logging
from pathlib import Path
from typing import Any

import requests

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Verified official Zenodo record details
ZENODO_RECORD_ID = "6578598"
ZENODO_API_URL = f"https://zenodo.org/api/records/{ZENODO_RECORD_ID}"
CARAVAN_FILES: dict[str, dict[str, Any]] = {
    "Caravan.zip": {
        "url": f"https://zenodo.org/api/records/{ZENODO_RECORD_ID}/files/Caravan.zip/content",
        "size_bytes": 4277481741,
        "md5": "60b587c75c5e2d070ac23c5fb0409fd4",
    },
    "README.md": {
        "url": f"https://zenodo.org/api/records/{ZENODO_RECORD_ID}/files/README.md/content",
        "size_bytes": 7223,
        "md5": "357a01f2ab40dfe0aed568bbcc3367af",
    },
}


def compute_md5(file_path: Path, chunk_size: int = 1024 * 1024) -> str:
    """Compute MD5 hash of a local file."""
    md5_hash = hashlib.md5()
    with open(file_path, "rb") as f:
        while chunk := f.read(chunk_size):
            md5_hash.update(chunk)
    return md5_hash.hexdigest()


def download_file_resumable(
    url: str,
    target_path: Path,
    expected_size: int | None = None,
    expected_md5: str | None = None,
    chunk_size: int = 1024 * 1024,
) -> bool:
    """Download a file with HTTP Range support for resumption."""
    target_path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = target_path.with_suffix(target_path.suffix + ".part")

    initial_pos = temp_path.stat().st_size if temp_path.exists() else 0

    if target_path.exists():
        if expected_md5:
            current_md5 = compute_md5(target_path)
            if current_md5 == expected_md5:
                logger.info(
                    "File '%s' already exists with verified MD5 checksum.", target_path.name
                )
                return True
            logger.warning(
                "File '%s' exists but MD5 (%s) does not match expected (%s). Redownloading.",
                target_path.name,
                current_md5,
                expected_md5,
            )
        elif expected_size and target_path.stat().st_size == expected_size:
            logger.info("File '%s' already exists with matching size.", target_path.name)
            return True

    headers: dict[str, str] = {}
    if initial_pos > 0:
        headers["Range"] = f"bytes={initial_pos}-"
        logger.info(
            "Resuming download of '%s' from byte offset %d...", target_path.name, initial_pos
        )
    else:
        logger.info("Starting fresh download of '%s' from %s...", target_path.name, url)

    response = requests.get(url, headers=headers, stream=True, timeout=60)

    # 416 Range Not Satisfiable: restart from 0
    if response.status_code == 416:
        logger.warning("Range header rejected (416). Restarting download from scratch.")
        initial_pos = 0
        response = requests.get(url, stream=True, timeout=60)

    response.raise_for_status()

    mode = "ab" if initial_pos > 0 else "wb"
    downloaded = initial_pos

    with open(temp_path, mode) as f:
        for chunk in response.iter_content(chunk_size=chunk_size):
            if chunk:
                f.write(chunk)
                downloaded += len(chunk)
                if expected_size:
                    pct = (downloaded / expected_size) * 100.0
                    if downloaded % (50 * 1024 * 1024) < chunk_size:
                        logger.info(
                            "Progress [%s]: %.1f%% (%d / %d bytes)",
                            target_path.name,
                            pct,
                            downloaded,
                            expected_size,
                        )

    # Validate checksum if available
    computed_md5 = compute_md5(temp_path)
    if expected_md5 and computed_md5 != expected_md5:
        msg = f"Checksum mismatch for '{target_path.name}'! Expected {expected_md5}, got {computed_md5}."
        logger.error(msg)
        raise ValueError(msg)

    temp_path.rename(target_path)
    logger.info(
        "Successfully downloaded and verified '%s' (MD5: %s).", target_path.name, computed_md5
    )
    return True


def main() -> None:
    parser = argparse.ArgumentParser(description="Download Caravan dataset from Zenodo.")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("data/raw/caravan"),
        help="Target directory for downloaded dataset.",
    )
    parser.add_argument(
        "--file",
        choices=["all", "README.md", "Caravan.zip"],
        default="README.md",
        help="Target file to fetch (default: 'README.md' for audit; use 'Caravan.zip' or 'all' for full 4.2GB payload).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print verified URLs and file sizes without downloading.",
    )

    args = parser.parse_args()
    output_dir: Path = args.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)

    logger.info("=== Caravan Dataset Downloader ===")
    logger.info("Official Zenodo Record: %s (%s)", ZENODO_RECORD_ID, ZENODO_API_URL)

    selected_files = list(CARAVAN_FILES.keys()) if args.file == "all" else [args.file]

    if args.dry_run:
        logger.info("Dry-run requested. Verified Caravan payload manifest:")
        for filename in selected_files:
            meta = CARAVAN_FILES[filename]
            logger.info(
                " - %s: %s bytes | MD5: %s | URL: %s",
                filename,
                meta["size_bytes"],
                meta["md5"],
                meta["url"],
            )
        return

    checksum_log: dict[str, Any] = {
        "zenodo_record_id": ZENODO_RECORD_ID,
        "official_doi": "10.5281/zenodo.6578598",
        "license": "CC-BY-4.0",
        "files": {},
    }

    for filename in selected_files:
        meta = CARAVAN_FILES[filename]
        dest = output_dir / filename
        download_file_resumable(
            url=meta["url"],
            target_path=dest,
            expected_size=meta["size_bytes"],
            expected_md5=meta["md5"],
        )
        checksum_log["files"][filename] = {
            "size_bytes": dest.stat().st_size,
            "md5": meta["md5"],
            "path": str(dest.as_posix()),
        }

    log_path = output_dir / "checksums.json"
    with open(log_path, "w", encoding="utf-8") as f:
        json.dump(checksum_log, f, indent=2)
    logger.info("Checksum log written to: %s", log_path)


if __name__ == "__main__":
    main()
