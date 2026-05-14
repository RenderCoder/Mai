#!/usr/bin/env bun

/**
 * Collect a Mai product source from a folder or single text file.
 *
 * Product folders are the preferred source shape. The collector recursively
 * reads supported text files and prefixes each section with its source path so
 * generated copy can trace facts back to the imported product documents.
 */

import { existsSync, statSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { homedir } from "node:os";
import {
  basename,
  extname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import { parseArgs } from "node:util";

const TEXT_EXTENSIONS = new Set([
  ".md",
  ".txt",
  ".csv",
  ".json",
  ".yaml",
  ".yml",
]);

const IGNORED_DIRS = new Set([
  ".git",
  ".hg",
  ".svn",
  ".DS_Store",
  "node_modules",
  "dist",
  "build",
  "coverage",
]);

export interface ProductSourceFile {
  path: string;
  relativePath: string;
  content: string;
}

export interface CollectProductSourceOptions {
  product: string;
  cwd?: string;
  homeDir?: string;
}

export function expandHomePath(path: string, homeDir = homedir()): string {
  if (path === "~") return homeDir;
  if (path.startsWith("~/")) return join(homeDir, path.slice(2));
  return path;
}

export function resolveUserPath(
  path: string,
  cwd = process.cwd(),
  homeDir = homedir(),
): string {
  const expanded = expandHomePath(path, homeDir);
  return isAbsolute(expanded) ? resolve(expanded) : resolve(cwd, expanded);
}

function isHiddenPathPart(part: string): boolean {
  return part.startsWith(".") && part !== ".";
}

function shouldIgnoreDirectory(path: string): boolean {
  const name = basename(path);
  return IGNORED_DIRS.has(name) || isHiddenPathPart(name);
}

export function isSupportedProductSourceFile(path: string): boolean {
  const name = basename(path);
  if (name.startsWith(".")) return false;
  if (/_result_\d{8}(?:_\d{4})?\.md$/i.test(name)) return false;
  return TEXT_EXTENSIONS.has(extname(path).toLowerCase());
}

async function collectFiles(root: string, current: string): Promise<string[]> {
  const entries = await readdir(current, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const path = join(current, entry.name);
    if (entry.isDirectory()) {
      if (!shouldIgnoreDirectory(path)) {
        files.push(...(await collectFiles(root, path)));
      }
      continue;
    }

    if (entry.isFile() && isSupportedProductSourceFile(path)) {
      files.push(path);
    }
  }

  return files.sort((a, b) =>
    relative(root, a).localeCompare(relative(root, b)),
  );
}

export async function collectProductSourceFiles(
  opts: CollectProductSourceOptions,
): Promise<ProductSourceFile[]> {
  const cwd = opts.cwd ?? process.cwd();
  const homeDir = opts.homeDir ?? homedir();
  const productPath = resolveUserPath(opts.product, cwd, homeDir);

  if (!existsSync(productPath)) {
    throw new Error(`Product source not found: ${productPath}`);
  }

  const stat = statSync(productPath);
  const paths = stat.isDirectory()
    ? await collectFiles(productPath, productPath)
    : isSupportedProductSourceFile(productPath)
      ? [productPath]
      : [];

  if (paths.length === 0) {
    throw new Error(`No readable product text files found: ${productPath}`);
  }

  return await Promise.all(
    paths.map(async (path) => {
      const relativePath = stat.isDirectory()
        ? relative(productPath, path).split(sep).join("/")
        : basename(path);
      return {
        path,
        relativePath,
        content: await Bun.file(path).text(),
      };
    }),
  );
}

export function renderProductSource(files: ProductSourceFile[]): string {
  return files
    .map((file) => `## source: ${file.relativePath}\n\n${file.content.trim()}`)
    .join("\n\n---\n\n");
}

export function helpText(): string {
  return `
Usage:
  bun run scripts/collect-product-source.ts --product <folder-or-file>

Options:
  -p, --product <path>   Product source folder or text file
  -h, --help             Show this help
  `;
}

export async function runCli(args = Bun.argv.slice(2)): Promise<number> {
  const { values } = parseArgs({
    args,
    options: {
      product: { type: "string", short: "p" },
      help: { type: "boolean", short: "h", default: false },
    },
    strict: true,
  });

  if (values.help) {
    console.log(helpText());
    return 0;
  }

  if (typeof values.product !== "string") {
    throw new Error("--product is required.");
  }

  const files = await collectProductSourceFiles({ product: values.product });
  console.log(renderProductSource(files));
  return 0;
}

if (import.meta.main) {
  runCli().then(
    (code) => process.exit(code),
    (err) => {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    },
  );
}
