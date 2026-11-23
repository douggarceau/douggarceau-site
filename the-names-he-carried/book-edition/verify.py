"""Check the PDF text, illustrations, and research sections before publication."""
import argparse
import re
import unicodedata
from itertools import pairwise

import pymupdf
from lxml import html

from build import read_story, source_json, WIDTH, HEIGHT, SITE


def normalized(text):
    return re.sub(r"\s+", "", unicodedata.normalize("NFKC", text))


def verify(path):
    with pymupdf.open(path) as doc:
        sections = [(name, page - 1) for _, name, page in doc.get_toc()]
        # Exclude the running footer so that paragraphs spanning pages can match.
        clip = pymupdf.Rect(0, 0, WIDTH, HEIGHT - 37)
        section_text = {
            name: normalized(" ".join(doc[i].get_text(clip=clip) for i in range(start, end)))
            for (name, start), (_, end) in pairwise([*sections, ("", len(doc))])
        }
        for label, title, _, paragraphs in read_story():
            text = section_text[f"{label} · {title}"]
            for paragraph in paragraphs:
                if normalized(paragraph) not in text:
                    raise ValueError(f"{label} has missing text near {paragraph[:70]!r}")
        case = html.parse(str(SITE / "sir-nathaniel/index.html"))
        case_text = section_text["The case for Sir Nathaniel Dunlop"]
        for row in case.xpath("//main/section//p|//main/section//h2|//main/section//h3|//main/section//h4|//main/section//figcaption|//main/section//li/a/span"):
            if normalized(row.text_content()) not in case_text:
                raise ValueError(f"Missing case discussion near {row.text_content()[:70]!r}")
        if not case.xpath("//main/section[@id='men']"):
            raise ValueError("Check the structure of the Shieldhill case before publishing")
        plates = 1  # Cover
        for chapter in source_json("book.json")["chapters"]:
            body = html.fragment_fromstring(chapter["html"], create_parent="div")
            if chapter["label"] in ("Appendix", "Back Matter"):
                rows = body.xpath("./*/p|.//ol/li|.//td|./*/h3")
                for row in rows:
                    if normalized(row.text_content()) not in section_text[chapter["title"]]:
                        raise ValueError(f"Missing text in {chapter['title']}: {row.text_content()[:70]}")
            elif chapter["label"] in ("Prologue", "Epilogue") or chapter["label"].startswith("Chapter "):
                plates += len(body.xpath(".//figure"))
        actual = sum(len(page.get_images()) for page in doc)
        if actual != plates:
            raise ValueError(f"Expected {plates} illustrations including the cover, found {actual}")
        for page in doc:
            if not page.get_text(clip=clip).strip() and not page.get_images():
                raise ValueError(f"Unexpected blank page {page.number + 1}")
        print(f"Verified {len(doc)} pages, {len(sections)} sections and {plates - 1} illustrations.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf")
    verify(parser.parse_args().pdf)
