"""
Deterministic Markdown -> PDF for the cheatsheet (and any compact reference).

Prefers pandoc/pypandoc when a LaTeX engine is available (best math rendering);
otherwise falls back to a self-contained reportlab renderer that handles the
markdown subset the cheatsheet uses: #/##/### headers, pipe tables, bullet
lists, bold/italic/code spans, and paragraphs. LaTeX math ($...$) is kept as
legible source text — fine for a printable one-pager.

Usage:  python md_to_pdf.py <input.md> <output.pdf>
"""
from __future__ import annotations

import html
import re
import sys
from pathlib import Path


def try_pandoc(src: Path, out: Path) -> bool:
    try:
        import pypandoc  # type: ignore
        pypandoc.convert_file(str(src), "pdf", outputfile=str(out))
        return out.exists() and out.stat().st_size > 0
    except Exception:
        return False


def _inline(text: str) -> str:
    """Escape XML, then apply a minimal markdown-span -> reportlab-markup pass."""
    t = html.escape(text, quote=False)
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    t = re.sub(r"`([^`]+)`", r'<font face="Courier">\1</font>', t)
    t = re.sub(r"(?<!\w)_(.+?)_(?!\w)", r"<i>\1</i>", t)
    return t


def reportlab_render(src: Path, out: Path) -> None:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, ListFlowable, ListItem,
    )

    S = getSampleStyleSheet()
    h1 = ParagraphStyle("h1", parent=S["Heading1"], fontSize=14, spaceAfter=6, spaceBefore=4)
    h2 = ParagraphStyle("h2", parent=S["Heading2"], fontSize=11, spaceAfter=4, spaceBefore=8)
    h3 = ParagraphStyle("h3", parent=S["Heading3"], fontSize=9.5, spaceAfter=3, spaceBefore=6)
    body = ParagraphStyle("body", parent=S["BodyText"], fontSize=9, leading=12, spaceAfter=3)
    cell = ParagraphStyle("cell", parent=body, fontSize=8, leading=10, spaceAfter=0)

    lines = src.read_text(encoding="utf-8").splitlines()
    flow = []
    i = 0
    n = len(lines)

    def flush_table(rows):
        if not rows:
            return
        data = [[Paragraph(_inline(c), cell) for c in r] for r in rows]
        cols = max(len(r) for r in rows)
        data = [r + [Paragraph("", cell)] * (cols - len(r)) for r in data]
        t = Table(data, repeatRows=1, hAlign="LEFT")
        t.setStyle(TableStyle([
            ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#bbbbbb")),
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f0f0f0")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 2),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ]))
        flow.append(t)
        flow.append(Spacer(1, 4))

    bullets = []

    def flush_bullets():
        nonlocal bullets
        if bullets:
            flow.append(ListFlowable(
                [ListItem(Paragraph(_inline(b), body), leftIndent=10) for b in bullets],
                bulletType="bullet", start="•", leftIndent=12,
            ))
            bullets = []

    while i < n:
        line = lines[i].rstrip()
        stripped = line.strip()

        # pipe table block
        if "|" in line and stripped.startswith("|"):
            flush_bullets()
            block = []
            while i < n and "|" in lines[i] and lines[i].strip().startswith("|"):
                block.append(lines[i])
                i += 1
            rows = []
            for r in block:
                if re.match(r"^\s*\|?[\s:|-]+\|?\s*$", r) and set(r.strip()) <= set("|:- "):
                    continue  # separator row
                cells = [c.strip() for c in r.strip().strip("|").split("|")]
                rows.append(cells)
            flush_table(rows)
            continue

        if not stripped:
            flush_bullets()
            flow.append(Spacer(1, 4))
        elif stripped.startswith("### "):
            flush_bullets(); flow.append(Paragraph(_inline(stripped[4:]), h3))
        elif stripped.startswith("## "):
            flush_bullets(); flow.append(Paragraph(_inline(stripped[3:]), h2))
        elif stripped.startswith("# "):
            flush_bullets(); flow.append(Paragraph(_inline(stripped[2:]), h1))
        elif stripped.startswith(("- ", "* ")):
            bullets.append(stripped[2:])
        else:
            flush_bullets(); flow.append(Paragraph(_inline(stripped), body))
        i += 1

    flush_bullets()

    doc = SimpleDocTemplate(
        str(out), pagesize=letter,
        topMargin=0.5 * inch, bottomMargin=0.5 * inch,
        leftMargin=0.5 * inch, rightMargin=0.5 * inch,
        title=src.stem,
    )
    doc.build(flow)


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: python md_to_pdf.py <input.md> <output.pdf>", file=sys.stderr)
        return 2
    src, out = Path(sys.argv[1]), Path(sys.argv[2])
    if not src.exists():
        print(f"error: {src} not found", file=sys.stderr)
        return 1
    out.parent.mkdir(parents=True, exist_ok=True)
    if try_pandoc(src, out):
        print(f"wrote {out} (pandoc)")
        return 0
    try:
        reportlab_render(src, out)
        print(f"wrote {out} (reportlab)")
        return 0
    except Exception as e:  # never hard-fail the cheatsheet over PDF cosmetics
        print(f"error: PDF render failed: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
