#!/usr/bin/env node
// PAIDEIA harness — entry point.
// Thin shim: resolve the CLI module relative to this file and run it.
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
// import() takes a URL, not a path: a bare absolute path works on POSIX but is
// rejected on Windows, where `C:\...` reads as an unsupported URL scheme.
const { main } = await import(pathToFileURL(join(here, "..", "src", "cli.mjs")).href);

// Set `exitCode` instead of calling process.exit(): when stdout is a pipe
// (`paideia status --json | jq`, CI logs) writes are buffered asynchronously,
// and process.exit() discards whatever has not flushed yet. Letting the event
// loop drain naturally keeps the exit status *and* the output.
try {
  const code = await main(process.argv.slice(2));
  process.exitCode = typeof code === "number" ? code : 0;
} catch (err) {
  console.error(`paideia: ${err?.stack || err?.message || err}`);
  process.exitCode = 1;
}
