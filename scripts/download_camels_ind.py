#!/usr/bin/env python3
"""Download and ingestion script for CAMELS-IND (Peninsular India).

Official Source: Zenodo Record 14005378 (DOI: 10.5281/zenodo.14005378)
Reference: Mangukiya, N. K., et al. (2025). CAMELS-IND: hydrometeorological time series
and catchment attributes for 228 catchments in Peninsular India.
Earth System Science Data, 17, 461–491. https://doi.org/10.5194/essd-17-461-2025
License: Creative Commons Attribution 4.0 International (CC-BY-4.0)

Access Policy:
- Zenodo deposit is flagged as 'access_right: restricted'.
- Requires submitting an access request on Zenodo for academic/research usage.
- Once approved, downloads can be authenticated via Zenodo Personal Access Token,
  or downloaded ZIP archives can be imported locally.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import logging
import os
import zipfile
from pathlib import Path
from typing import Any

import requests

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

ZENODO_RECORD_ID = "14005378"
ZENODO_API_URL = f"https://zenodo.org/api/records/{ZENODO_RECORD_ID}"
DOI_URL = f"https://doi.org/10.5281/zenodo.{ZENODO_RECORD_ID}"


def compute_md5(file_path: Path, chunk_size: int = 1024 * 1024) -> str:
    """Compute MD5 hash of a local file."""
    md5_hash = hashlib.md5()
    with open(file_path, "rb") as f:
        while chunk := f.read(chunk_size):
            md5_hash.update(chunk)
    return md5_hash.hexdigest()


def check_zenodo_access(token: str | None = None) -> dict[str, Any]:
    """Query Zenodo API record metadata and test access permissions."""
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    resp = requests.get(ZENODO_API_URL, headers=headers, timeout=30)
    resp.raise_for_status()
    data: dict[str, Any] = resp.json()
    return data


def download_file_resumable(
    url: str,
    target_path: Path,
    token: str | None = None,
    chunk_size: int = 1024 * 1024,
) -> bool:
    """Download file with HTTP Range resume headers."""
    target_path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = target_path.with_suffix(target_path.suffix + ".part")
    initial_pos = temp_path.stat().st_size if temp_path.exists() else 0

    headers: dict[str, str] = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if initial_pos > 0:
        headers["Range"] = f"bytes={initial_pos}-"

    response = requests.get(url, headers=headers, stream=True, timeout=60)
    if response.status_code == 416:
        initial_pos = 0
        response = requests.get(
            url,
            headers={"Authorization": f"Bearer {token}"} if token else {},
            stream=True,
            timeout=60,
        )
    response.raise_for_status()

    mode = "ab" if initial_pos > 0 else "wb"
    with open(temp_path, mode) as f:
        for chunk in response.iter_content(chunk_size=chunk_size):
            if chunk:
                f.write(chunk)

    temp_path.rename(target_path)
    return True


def import_local_archive(archive_path: Path, target_dir: Path) -> list[str]:
    """Extract and import a manually downloaded CAMELS-IND ZIP file."""
    if not archive_path.exists():
        msg = f"Archive file '{archive_path}' does not exist."
        raise FileNotFoundError(msg)

    logger.info("Extracting '%s' to '%s'...", archive_path.name, target_dir)
    target_dir.mkdir(parents=True, exist_ok=True)

    extracted_files: list[str] = []
    with zipfile.ZipFile(archive_path, "r") as zf:
        zf.extractall(target_dir)
        extracted_files = zf.namelist()

    logger.info("Extracted %d files successfully.", len(extracted_files))
    return extracted_files


def main() -> None:
    parser = argparse.ArgumentParser(description="Fetch or import CAMELS-IND dataset.")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("data/raw/camels_ind"),
        help="Target directory for downloaded/extracted dataset.",
    )
    parser.add_argument(
        "--token",
        type=str,
        default=os.environ.get("ZENODO_ACCESS_TOKEN"),
        help="Zenodo Personal Access Token with approved access.",
    )
    parser.add_argument(
        "--import-zip",
        type=Path,
        default=None,
        help="Path to manually downloaded CAMELS_IND_Catchments_Streamflow_Sufficient.zip.",
    )
    parser.add_argument(
        "--check-status",
        action="store_true",
        help="Check Zenodo deposit status and access authorization without downloading.",
    )

    args = parser.parse_args()
    output_dir: Path = args.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)

    logger.info("=== CAMELS-IND Dataset Tool ===")
    logger.info("Official DOI: %s", DOI_URL)
    logger.info("Zenodo API URL: %s", ZENODO_API_URL)

    # 1. Local import mode
    if args.import_zip:
        files = import_local_archive(args.import_zip, output_dir)
        checksum_log = {
            "source_archive": str(args.import_zip),
            "archive_md5": compute_md5(args.import_zip),
            "extracted_count": len(files),
        }
        with open(output_dir / "checksums.json", "w", encoding="utf-8") as f:
            json.dump(checksum_log, f, indent=2)
        return

    # 2. Check metadata from Zenodo
    try:
        record_data = check_zenodo_access(args.token)
        access_right = record_data.get("metadata", {}).get("access_right", "unknown")
        files_list = record_data.get("files", [])

        logger.info("Zenodo Record Access Status: '%s'", access_right)
        logger.info("Available files in payload: %d", len(files_list))

        if len(files_list) == 0:
            logger.warning(
                "\n"
                "====================================================================================\n"
                "IMPORTANT NOTICE REGARDING CAMELS-IND ACCESS:\n"
                "The CAMELS-IND dataset on Zenodo (Record 14005378) has 'access_right: restricted'.\n"
                "Per the dataset authors' policy (Mangukiya et al., IIT Roorkee / IISc Bangalore),\n"
                "files are released upon submitting an access request for academic/research use.\n"
                "\n"
                "How to obtain the files:\n"
                f"1. Open {DOI_URL} in your browser and log into your Zenodo account.\n"
                "2. Click 'Request Access' and provide your project affiliation.\n"
                "3. Once approved, either:\n"
                "   a) Pass your token via --token <ZENODO_ACCESS_TOKEN>, or\n"
                "   b) Download 'CAMELS_IND_Catchments_Streamflow_Sufficient.zip' and run:\n"
                "      python scripts/download_camels_ind.py --import-zip path/to/archive.zip\n"
                "====================================================================================\n"
            )
            if args.check_status:
                return

        for f_meta in files_list:
            f_name = f_meta["key"]
            f_url = f_meta["links"]["self"]
            logger.info("Downloading file '%s' from %s...", f_name, f_url)
            dest = output_dir / f_name
            download_file_resumable(f_url, dest, token=args.token)

    except requests.exceptions.RequestException as e:
        logger.error("Failed to query Zenodo API: %s", e)
        raise


if __name__ == "__main__":
    main()
