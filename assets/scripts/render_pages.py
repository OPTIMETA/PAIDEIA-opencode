"""
Render a PDF to per-page PNGs and enforce a long-edge pixel ceiling.

Used by the harness BEFORE any vision agent runs, so the resize-before-read
ordering is guaranteed (an agent that captures an oversized image into context
wastes its whole run). dpi=160 / max-px=1800 is the course-material sweet spot;
the grade path rasterizes answer scans at a higher dpi.

Usage:
    python render_pages.py [--dpi 160] [--max-px 1800] [--prefix p] <pdf> <out_dir>

Prints the number of pages written to stdout.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from pdf2image import convert_from_path
from PIL import Image


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dpi", type=int, default=160)
    ap.add_argument("--max-px", type=int, default=1800)
    ap.add_argument("--prefix", default="p")
    ap.add_argument("pdf")
    ap.add_argument("out_dir")
    args = ap.parse_args()

    out = Path(args.out_dir)
    out.mkdir(parents=True, exist_ok=True)

    images = convert_from_path(args.pdf, dpi=args.dpi)
    for i, im in enumerate(images, 1):
        w, h = im.size
        if max(w, h) > args.max_px:
            scale = args.max_px / max(w, h)
            im = im.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
        im.save(out / f"{args.prefix}{i:02d}.png", "PNG", optimize=True)

    print(len(images))
    return 0


if __name__ == "__main__":
    sys.exit(main())
