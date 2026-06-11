// Minimal argv parser: `--key=value`, `--key value`, boolean `--flag`, rest
// positional. `valueFlags` lists flags that consume the next token as a value.
export function parseArgs(argv, valueFlags = []) {
  const flags = {};
  const positionals = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const body = a.slice(2);
      const eq = body.indexOf("=");
      if (eq >= 0) {
        flags[body.slice(0, eq)] = body.slice(eq + 1);
      } else if (valueFlags.includes(body) && i + 1 < argv.length && !argv[i + 1].startsWith("--")) {
        flags[body] = argv[++i];
      } else {
        flags[body] = true;
      }
    } else {
      positionals.push(a);
    }
  }
  return { flags, positionals };
}

/** Join positionals back into a single argument string (the $ARGUMENTS analog). */
export function argString(positionals) {
  return positionals.join(" ").trim();
}
