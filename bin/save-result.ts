#!/usr/bin/env bun

import { runCli } from "../skills/ecommerce-multilingual-copy/scripts/save-result";

runCli().then(
  (code) => process.exit(code),
  (err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  },
);
