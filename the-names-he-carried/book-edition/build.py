"""Build the full reading proof from the family's manuscript and the site's research."""
import argparse
import json
from io import BytesIO
import re
from pathlib import Path
from urllib.parse import urljoin
from xml.sax.saxutils import escape, quoteattr

from lxml import html
from PIL import Image as PillowImage, ImageOps
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, PageBreak, Paragraph, Spacer, Image,
    Table, TableStyle, KeepTogether, NextPageTemplate,
)
from reportlab.platypus.tableofcontents import TableOfContents

HERE = Path(__file__).resolve().parent
SITE = HERE.parent
URL = "https://douggarceau.com/the-names-he-carried/"
WIDTH, HEIGHT = 432, 648
TEXT_WIDTH = 332
INK = colors.HexColor("#26231e")
GOLD = colors.HexColor("#726047")
TITLE = "The Names He Carried"


def source_json(name):
    return json.loads((SITE / name).read_text(encoding="utf-8"))


def read_story():
    blocks = re.split(r"\n\s*\n", (HERE / "manuscript.txt").read_text(encoding="utf-8").strip())
    if blocks[:2] != [TITLE, "The Laurence Brown Douglas Story"]:
        raise ValueError("Check the title and subtitle in manuscript.txt")
    chapters = []
    part = ""
    for block in blocks[2:]:
        if re.fullmatch(r"Part \w+: [^\n]+", block):
            part = block
            continue
        match = re.fullmatch(r"(Prologue|Chapter \d+|Epilogue)\. (.+)", block)
        if match:
            label, title = match.groups()
            chapters.append((label, title, part if label.startswith("Chapter") else "", []))
        else:
            chapters[-1][3].append(block)
    if [c[0] for c in chapters] != ["Prologue", *[f"Chapter {i}" for i in range(1, 31)], "Epilogue"]:
        raise ValueError("Review the reading order before building this edition")
    return chapters


def register_fonts():
    root = next(p for p in [Path("/usr/share/fonts/truetype/liberation"),
                            Path("/usr/share/fonts/truetype/liberation2")] if p.is_dir())
    for face in ("Serif", "Sans"):
        for style in ("Regular", "Bold", "Italic", "BoldItalic"):
            pdfmetrics.registerFont(TTFont(face + style, str(root / f"Liberation{face}-{style}.ttf")))
        pdfmetrics.registerFontFamily(face+"Regular", normal=face+"Regular", bold=face+"Bold",
                                      italic=face+"Italic", boldItalic=face+"BoldItalic")


def style(name, font, size, leading, **kw):
    return ParagraphStyle(name, fontName=font, fontSize=size, leading=leading, textColor=INK,
                          allowWidows=0, allowOrphans=0, **kw)


BODY = style("Body", "SerifRegular", 12, 16, spaceAfter=6)
SMALL = style("Small", "SansRegular", 9.3, 13, spaceAfter=7)
KICKER = style("Label", "SansBold", 9, 13, spaceAfter=9)
HEAD = style("Heading", "SerifBold", 25, 29, spaceAfter=10, keepWithNext=True)
SUB = style("Subheading", "SerifBold", 15, 19, spaceBefore=13, spaceAfter=6, keepWithNext=True)
NOTE = style("Note", "SerifRegular", 10.6, 14.1, spaceAfter=6)
CAPTION = style("Caption", "SansRegular", 9, 12, spaceAfter=4)
DISPLAY = style("Title", "SerifRegular", 35, 39, spaceAfter=16)


def link(url, label):
    return f'<a color="#655136" href={quoteattr(url)}><u>{escape(label)}</u></a>'


def inline(node, base=URL):
    result = escape(node.text or "")
    for child in node:
        value = inline(child, base)
        if child.tag in ("i", "em"):
            value = "<i>" + value + "</i>"
        elif child.tag in ("b", "strong"):
            value = "<b>" + value + "</b>"
        elif child.tag == "a" and child.get("href"):
            value = f'<a color="#655136" href={quoteattr(urljoin(base, child.get("href")))}><u>{value}</u></a>'
        result += value + escape(child.tail or "")
    return result


class Edition(BaseDocTemplate):
    def afterFlowable(self, item):
        if hasattr(item, "section_key"):
            self.canv.bookmarkPage(item.section_key)
            self.canv.addOutlineEntry(item.section_title, item.section_key, level=0)
            self.notify("TOCEntry", (0, item.section_title, self.page, item.section_key))


def running(canvas, doc):
    canvas.setFillColor(GOLD)
    canvas.setFont("SansRegular", 8.3)
    canvas.drawString(50, 29, TITLE.upper())
    canvas.drawRightString(WIDTH-50, 29, str(doc.page))


def cover(canvas, doc):
    canvas.drawImage(str(SITE/"img/cover-portrait.jpg"), 0, 0, width=WIDTH, height=HEIGHT)


def section(story, key, title, label, toc_title=None):
    story.extend([PageBreak(), Spacer(1, 18), Paragraph(escape(label.upper()), KICKER)])
    h = Paragraph(escape(title), HEAD)
    h.section_key = key
    h.section_title = toc_title or title
    story.append(h)


def plate(story, figure):
    img = figure.find(".//img")
    path = SITE / img.get("src")
    caption = figure.find("figcaption")
    text = caption.text_content().strip() if caption is not None else img.get("alt", "")
    # Retain at least print resolution where the source permits, while keeping
    # the download practical on a phone. The archive still hosts each original.
    buffer = BytesIO()
    with PillowImage.open(path) as source:
        rgb = ImageOps.exif_transpose(source).convert("RGB")
        rgb.thumbnail((1800, 2350), PillowImage.Resampling.LANCZOS)
        rgb.save(buffer, format="JPEG", quality=91, subsampling=0, optimize=True)
    buffer.seek(0)
    pic = Image(buffer, width=TEXT_WIDTH, height=422, kind="proportional")
    story.append(KeepTogether([Spacer(1, 7), pic, Spacer(1, 5),
                               Paragraph(escape(text), CAPTION)]))


def appendix(story, chapter):
    doc = html.fragment_fromstring(chapter["html"], create_parent="div")
    for el in doc[0]:
        if el.tag in ("h3", "h4"):
            story.append(Paragraph(inline(el), SUB))
        elif el.tag == "ol":
            for num, row in enumerate(el, 1):
                story.append(Paragraph(f"<b>{num}.</b> " + inline(row), NOTE))
        elif el.tag == "p":
            story.append(Paragraph(inline(el), NOTE if chapter["title"]=="Bibliography" else BODY))
        elif el.tag == "table":
            rows = [[Paragraph(inline(cell), NOTE) for cell in row.xpath("./td")] for row in el.xpath(".//tr")]
            t = Table(rows, colWidths=[95, TEXT_WIDTH-95], hAlign="LEFT")
            t.setStyle(TableStyle([("VALIGN", (0,0), (-1,-1), "TOP"),
                                   ("LINEBELOW", (0,0), (-1,-1), .35, colors.HexColor("#c7c2b8")),
                                   ("LEFTPADDING", (0,0), (-1,-1), 0),
                                   ("RIGHTPADDING", (0,0), (-1,-1), 7)]))
            story.append(t)
        else:
            raise ValueError("Unsupported back matter: "+el.tag)


def case_sections(story, case):
    base = URL + "sir-nathaniel/"
    for sec in case.xpath("//main/section"):
        for el in sec:
            if el.tag == "h2":
                story.append(Paragraph(inline(el), SUB))
            elif el.tag == "p":
                story.append(Paragraph(inline(el, base), SMALL if el.get("class") == "sources" else BODY))
            elif el.tag == "div" and el.get("class") == "event":
                date = el.findtext("h3")
                title = el.findtext("div/h4")
                story.append(Paragraph(escape(date + " · " + title), SUB))
                for row in el.xpath("./div/p"):
                    story.append(Paragraph(inline(row, base), SMALL if row.get("class") == "sources" else BODY))
            elif el.tag == "figure":
                caption = el.find("figcaption").text_content()
                story.append(Paragraph(link(urljoin(base, el.find("a").get("href")), caption), CAPTION))
            elif el.tag == "ol":
                for row in el.xpath("./li/a"):
                    label = " · ".join(node.text_content() for node in row.xpath("./span"))
                    story.append(Paragraph(link(urljoin(base, row.get("href")), label), NOTE))
            else:
                raise ValueError("Review the new type of case material: " + el.tag)


def build(output):
    register_fonts()
    chapters = read_story()
    web = source_json("book.json")["chapters"]
    narrative = {ch["label"]:ch for ch in web if ch["label"] in {c[0] for c in chapters}}
    back = [ch for ch in web if ch["label"] in ("Appendix", "Back Matter")]
    case = html.parse(str(SITE/"sir-nathaniel/index.html"))
    assessment = case.xpath("//header//p[last()]")
    if not assessment:
        raise ValueError("The case assessment has moved. Check the research afterword.")
    exhibits = source_json("cold-case-file/items.json")
    reg = source_json("cold-case-file/register.json")
    register_count = len(exhibits) + sum(row.get("kind") != "Family testimony" for row in reg)
    def count_rows(title, xpath):
        ch = next(x for x in back if x["title"]==title)
        return len(html.fromstring(ch["html"]).xpath(xpath))
    notes = count_rows("Notes", ".//ol[@class='notes']/li")
    bib = count_rows("Bibliography", "./p[not(@class='lede')]")
    doc = Edition(str(output), pagesize=(WIDTH,HEIGHT), title=TITLE, author="Doug Garceau",
                  pageCompression=1)
    frame = Frame(50,46,TEXT_WIDTH,HEIGHT-92,leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)
    doc.addPageTemplates([PageTemplate("Cover",[frame],onPage=cover),
                          PageTemplate("Reading",[frame],onPage=running)])
    story = [NextPageTemplate("Reading"), PageBreak(), Spacer(1,96),
             Paragraph(TITLE, DISPLAY), Paragraph("The Laurence Brown Douglas Story", SUB),
             Spacer(1,20), Paragraph("Doug Garceau", BODY), Spacer(1,40),
             Paragraph("For my mother, Constance Anderson Douglas", BODY),
             Spacer(1,42), Paragraph("Full-length working book proof", SMALL),
             PageBreak(), Paragraph("Contents", HEAD)]
    toc = TableOfContents()
    toc.dotsMinLevel = 0
    toc.levelStyles = [style("Contents line","SerifRegular",11.5,14,spaceBefore=1)]
    story.append(toc)
    for label,title,part,blocks in chapters:
        if label not in narrative or narrative[label]["title"].casefold()!=title.casefold():
            raise ValueError("Review chapter-to-illustration mapping: " + label + " / " + title)
        key = label.lower().replace(" ","-")
        section(story,key,title," · ".join(filter(None,[part,label])), label+" · "+title)
        for index, para in enumerate(blocks):
            if index == 0 and len(para) < 90 and label.startswith("Chapter"):
                story.append(Paragraph(escape(para), SMALL))
                continue
            story.append(Paragraph(escape(para).replace("\n","<br/>"), BODY))
        evidence = narrative[label].get("evidenceNote")
        if evidence:
            story.append(Paragraph("What the records establish", SUB))
            story.append(Paragraph(escape(evidence["text"]), NOTE))
            for href, caption in evidence["links"]:
                story.append(Paragraph(link(href if href.startswith("https://") else URL + href, caption), SMALL))
        for figure in html.fragment_fromstring(narrative[label]["html"],create_parent="div").xpath(".//figure"):
            plate(story,figure)
    section(story,"research","The case for Sir Nathaniel Dunlop","Research afterword")
    story.append(Paragraph(escape(assessment[-1].text_content().strip()),BODY))
    story.append(Paragraph("This proof follows the family’s full thirty-chapter manuscript. This afterword reproduces the current Shieldhill investigation. The four appendices, chapter notes and bibliography come from the website’s reading edition, whose wording sometimes differs from the manuscript.", BODY))
    case_sections(story, case)
    story.append(Paragraph(f"The published case register has {register_count} entries, including {len(exhibits)} numbered exhibits. The book’s research apparatus contains {notes} chapter endnotes and {bib} bibliography entries. The same record may appear in all three lists.",BODY))
    story.append(Paragraph(link(URL+"cold-case-file/how-do-we-know.html","Browse the case register"),SMALL))
    for ch in back:
        section(story,"section-"+str(ch["n"]),ch["title"],ch["label"])
        appendix(story,ch)
    doc.multiBuild(story)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output",type=Path)
    build(parser.parse_args().output)
