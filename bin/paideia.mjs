#!/usr/bin/env node
// PAIDEIA harness — entry point.
// Thin shim: resolve the CLI module relative to this file and run it.
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const { main } = await import(join(here, "..", "src", "cli.mjs"));

main(process.argv.slice(2)).then(
  (code) => process.exit(typeof code === "number" ? code : 0),
  (err) => {
    console.error(`paideia: ${err?.stack || err?.message || err}`);
    process.exit(1);
  },
);
