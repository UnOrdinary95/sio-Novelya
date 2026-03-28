"""
Script to fetch light novels from RanobeDB API and generate JSON data
matching the LightNovel interface for Novelya database import.
"""

import os
import json
import random
import time
import re
from typing import Optional
from datetime import datetime
import requests
from dotenv import load_dotenv

load_dotenv()

API_BASE_URL = os.getenv("RANOBEDB_API_URL", "https://ranobedb.org/api/v0")
NOVELYA_API_URL = os.getenv("NOVELYA_API_URL", "http://localhost:3000/api")
NOVELYA_EMAIL = os.getenv("NOVELYA_EMAIL", "")
NOVELYA_PASSWORD = os.getenv("NOVELYA_PASSWORD", "")
OUTPUT_FILE = "books_data.json"
INPUT_FILE = "books.txt"
REQUEST_DELAY = 1.1  # Respecting ~60 requests per minute limit
COVER_DOWNLOAD_TIMEOUT = 30  # Timeout for cover download in seconds

# Price range in EUR (realistic for light novels)
PRICE_MIN = 7.99
PRICE_MAX = 16.99

# Session for handling cookies
session = requests.Session()


def extract_book_id(url: str) -> Optional[str]:
    """Extract book ID from RanobeDB URL."""
    # Format: https://ranobedb.org/book/123 or similar
    match = re.search(r"/book/(\d+)", url)
    return match.group(1) if match else None


def fetch_book_details(book_id: str) -> Optional[dict]:
    """Fetch detailed book information from RanobeDB API."""
    try:
        url = f"{API_BASE_URL}/book/{book_id}"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        # RanobeDB wraps the book data in a "book" key
        return data.get("book") if "book" in data else data
    except requests.RequestException as e:
        print(f"Error fetching book {book_id}: {e}")
        return None


def get_english_title(book_data: dict) -> str:
    """Get English title, fallback to original title."""
    if not book_data:
        return "Unknown Title"

    # First try the direct title field (for English books)
    title = book_data.get("title")
    if title:
        return title

    # Try to find English title from titles array
    if "titles" in book_data:
        for title_entry in book_data["titles"]:
            if title_entry.get("lang") == "en":
                return title_entry.get("title", "Unknown Title")

    return book_data.get("title_orig", "Unknown Title")


def get_author(book_data: dict) -> str:
    """Get author name from book data."""
    if not book_data or "editions" not in book_data or not book_data["editions"]:
        return "Unknown Author"

    # Get author from first edition's staff
    first_edition = book_data["editions"][0]
    if "staff" in first_edition:
        for staff_member in first_edition["staff"]:
            if staff_member.get("role_type") == "author":
                # Prefer romaji (romanized) name, fallback to name
                author_name = staff_member.get("romaji") or staff_member.get("name", "Unknown Author")
                return author_name

    return "Unknown Author"


def get_genres(book_data: dict) -> list:
    """Extract only genres from tags (filter by ttype='genre')."""
    if not book_data or "series" not in book_data or not book_data["series"]:
        return []

    genres = []
    series = book_data["series"]

    if "tags" in series and series["tags"]:
        for tag in series["tags"]:
            if tag.get("ttype") == "genre":
                genres.append(tag.get("name", ""))

    return [g for g in genres if g]  # Remove empty strings


def get_cover_url(book_data: dict) -> str:
    """Get cover image URL from book data."""
    if not book_data:
        return ""

    # Check main image
    if book_data.get("image") and book_data["image"].get("filename"):
        filename = book_data["image"]["filename"]
        return f"https://images.ranobedb.org/{filename}"

    # Check in editions
    if "editions" in book_data and book_data["editions"]:
        for edition in book_data["editions"]:
            if edition.get("image") and edition["image"].get("filename"):
                filename = edition["image"]["filename"]
                return f"https://images.ranobedb.org/{filename}"

    return ""


def get_release_date(book_data: dict) -> str:
    """Get most recent release date."""
    if not book_data or "releases" not in book_data or not book_data["releases"]:
        return datetime.now().isoformat()

    # Get the most recent release date
    releases = book_data["releases"]
    if releases and "release_date" in releases[0]:
        timestamp = releases[0]["release_date"]
        try:
            # Unix timestamp to ISO format
            date = datetime.fromtimestamp(timestamp)
            return date.isoformat()
        except (ValueError, OSError):
            return datetime.now().isoformat()

    return datetime.now().isoformat()


def download_cover(cover_url: str, light_novel_id: str) -> bool:
    """Download cover image and upload via PATCH request."""
    if not cover_url:
        return False

    patch_response = None
    try:
        # Download cover from RanobeDB
        response = requests.get(cover_url, timeout=COVER_DOWNLOAD_TIMEOUT)
        response.raise_for_status()
        
        # Prepare multipart form data
        files = {"cover": (f"{light_novel_id}.jpg", response.content, "image/jpeg")}
        
        # Send PATCH request to Novelya API (cookies handled by session)
        patch_url = f"{NOVELYA_API_URL}/lightnovels/{light_novel_id}/cover"
        patch_response = session.patch(patch_url, files=files, timeout=10)
        patch_response.raise_for_status()
        
        return True
    except requests.RequestException as e:
        print(f"WARNING - Failed to upload cover for {light_novel_id}: {e}")
        if patch_response:
            print(f"DEBUG - Response body: {patch_response.text}")
        return False


def create_light_novel(novel_data: dict) -> Optional[str]:
    """Create light novel via POST request. Returns light novel ID on success."""
    try:
        url = f"{NOVELYA_API_URL}/lightnovels"
        response = session.post(url, json=novel_data, timeout=10)
        response.raise_for_status()
        
        created_novel = response.json()
        return created_novel.get("_id")
    except requests.RequestException as e:
        print(f"WARNING - Failed to create light novel: {e}")
        return None


def login_to_api() -> bool:
    """Login to Novelya API and establish session with cookies."""
    if not NOVELYA_EMAIL or not NOVELYA_PASSWORD:
        print("ERROR - NOVELYA_EMAIL and NOVELYA_PASSWORD not set in .env")
        return False
    
    try:
        login_url = f"{NOVELYA_API_URL}/login"
        response = session.post(
            login_url,
            json={"email": NOVELYA_EMAIL, "password": NOVELYA_PASSWORD},
            timeout=10
        )
        response.raise_for_status()
        print("CHECK - Successfully logged in to Novelya API")
        return True
    except requests.RequestException as e:
        print(f"ERROR - Failed to login: {e}")
        return False


def generate_price() -> float:
    """Generate realistic price for light novel in EUR."""
    # Round to .99 for realistic pricing
    base_price = round(random.uniform(PRICE_MIN, PRICE_MAX), 2)
    # Make it end in .99
    return int(base_price) + 0.99


def process_book(book_id: str) -> Optional[dict]:
    """Process a single book and return formatted data."""
    print(f"Fetching book {book_id}...", end=" ")

    book_data = fetch_book_details(book_id)
    if not book_data:
        return None

    # 20% chance of being out of stock
    in_stock = random.random() > 0.2
    
    cover_url = get_cover_url(book_data)

    novel = {
        "title": get_english_title(book_data),
        "author": get_author(book_data),
        "price": generate_price(),
        "inStock": in_stock,
        "description": book_data.get("description", "No description available")[
            :500
        ],  # Limit description
        "genres": get_genres(book_data),
        "releaseDate": get_release_date(book_data),
    }

    print(f"CHECK - {novel['title']}")
    return {"data": novel, "cover_url": cover_url}


def read_book_urls(filename: str) -> list:
    """Read book URLs from file."""
    if not os.path.exists(filename):
        print(f"ERROR - File '{filename}' not found!")
        return []

    with open(filename, "r", encoding="utf-8") as f:
        # Strip whitespace and newlines, skip empty lines
        urls = [line.strip() for line in f.readlines() if line.strip()]

    return urls


def main():
    """Main execution function."""
    print("RanobeDB Light Novel Fetcher\n")
    
    # Check if API configuration is set
    upload_to_api = NOVELYA_EMAIL and NOVELYA_PASSWORD
    if upload_to_api:
        print(f"API Mode: Uploading to {NOVELYA_API_URL}")
        if not login_to_api():
            print("ERROR - Could not login to API. Switching to Local Mode")
            upload_to_api = False
    else:
        print("Local Mode: Generating JSON file only")
    print()

    # Read URLs
    urls = read_book_urls(INPUT_FILE)
    if not urls:
        print("ERROR - No URLs to process. Create 'books.txt' with book URLs.")
        return

    print(f"Found {len(urls)} books to fetch\n")

    # Extract book IDs and fetch data
    books_data = []
    successfully_created = 0
    failed_cover_uploads = 0
    
    for i, url in enumerate(urls, 1):
        book_id = extract_book_id(url)

        if not book_id:
            print(f"WARNING - Could not extract ID from: {url}")
            continue

        book = process_book(book_id)
        if not book:
            continue
        
        novel_data = book["data"]
        cover_url = book["cover_url"]
        
        if upload_to_api:
            # Create light novel via API
            created_id = create_light_novel(novel_data)
            if created_id:
                books_data.append({**novel_data, "_id": created_id})
                successfully_created += 1
                
                # Upload cover if available (optional, skip on network errors)
                if cover_url:
                    time.sleep(0.5)  # Wait a bit before uploading cover
                    download_cover(cover_url, created_id)
            else:
                print(f"SKIP - Failed to create: {novel_data['title']}")
        else:
            # Local mode: just collect data
            books_data.append(novel_data)

        # Rate limiting: wait before next request (except last one)
        if i < len(urls):
            time.sleep(REQUEST_DELAY)

    # Save to JSON
    if books_data:
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(books_data, f, indent=2, ensure_ascii=False)

        print(f"\nCHECK - Successfully processed {len(books_data)}/{len(urls)} books")
        if upload_to_api:
            print(f"CHECK - Created {successfully_created} light novels in API")
            if failed_cover_uploads > 0:
                print(f"WARNING - Failed to upload {failed_cover_uploads} covers")
        print(f"CHECK - Data saved to '{OUTPUT_FILE}'")
    else:
        print("\nERROR - No books were successfully processed")


if __name__ == "__main__":
    main()
