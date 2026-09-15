# README screenshots

Captured on **2026-09-15**, on a Mac running macOS 26.6.2.

- PAIDEIA-opencode: 0.2.0, source baseline `ca03229`.
- opencode: 1.17.9; Node.js: 26.5.1; Python: 3.14.2.
- Display: a real local shell in a loopback-only ttyd 1.7.7 browser terminal, at 1280 × 720. These are unedited captures, not interface mockups.
- The `paideia` shell function invokes `node <checkout>/bin/paideia.mjs` directly, so the screenshots use this checkout rather than an older globally linked copy.
- Course: a synthetic complex-analysis demo, initialized by the actual `init-course` command with a 2026-12-15 exam date.

| File | Actual command |
|------|----------------|
| `terminal-help.png` | `paideia --help` |
| `terminal-status.png` | `paideia status --banner` |
| `terminal-ingest.png` | `paideia ingest --force` |
| `terminal-doctor.png` | `paideia doctor` |

The three ingest inputs were Markdown: a short lecture on residues, five synthetic homework problems, and their solutions. This capture verifies Markdown passthrough, not PDF vision or model-generated analysis. The course remains in `setup` because no analyzed pattern index was produced. `doctor`'s “all clear” reports local checks, not a successful model request. Separate live analyze attempts encountered provider availability/authentication failures; these screenshots do not imply that those attempts succeeded.

The README's hero reuses `terminal-help.png`. The original PAIDEIA's public interactive demo is labeled separately in the README.
