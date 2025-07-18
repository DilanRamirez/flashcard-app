import re
import argparse
import sys

def extract_chapters(md_path):
    """
    Read a markdown file and extract all headings that start with "# Chapter".
    Returns a list of chapter titles (without the leading "# ").
    """
    chapters = []
    pattern = re.compile(r'^#\s*Chapter\b', re.IGNORECASE)

    try:
        with open(md_path, 'r', encoding='utf-8') as f:
            for line in f:
                if pattern.match(line):
                    # strip "# " and any surrounding whitespace
                    title = line.strip()[1:].strip()
                    chapters.append(title)
    except FileNotFoundError:
        sys.stderr.write(f"Error: File not found: {md_path}\n")
        sys.exit(1)
    except IOError as e:
        sys.stderr.write(f"I/O error({e.errno}): {e.strerror}\n")
        sys.exit(1)
    print(f"Extracted {len(chapters)} chapters from {md_path}")
    return chapters

def main():
    markdown_file = 'public/decks/aws-cloud-practicioner/book-data.md'
    chapters = extract_chapters(markdown_file)
    if not chapters:
        print("No chapters found.")
        sys.exit(0)

    for chap in chapters:
        print(chap)

if __name__ == '__main__':
    main()