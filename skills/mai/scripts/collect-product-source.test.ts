import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  collectProductSourceFiles,
  isSupportedProductSourceFile,
  renderProductSource,
} from "./collect-product-source";

async function tempDir(): Promise<string> {
  return await mkdtemp(join(tmpdir(), "mai-product-source-test-"));
}

describe("collect product source", () => {
  test("detects supported source files", () => {
    expect(isSupportedProductSourceFile("product.md")).toBe(true);
    expect(isSupportedProductSourceFile("specs/data.json")).toBe(true);
    expect(isSupportedProductSourceFile("draft_result_20260512.md")).toBe(
      false,
    );
    expect(isSupportedProductSourceFile("photo.png")).toBe(false);
    expect(isSupportedProductSourceFile(".secret.md")).toBe(false);
  });

  test("recursively collects text files from a product folder", async () => {
    const root = await tempDir();
    const product = join(root, "WT702");

    await mkdir(join(product, "specs"), { recursive: true });
    await mkdir(join(product, "node_modules", "ignored"), { recursive: true });
    await writeFile(join(product, "product.md"), "# WT702\nMain info");
    await writeFile(join(product, "specs", "waterproof.md"), "IPX5");
    await writeFile(join(product, "specs", "data.json"), '{"zones":2}');
    await writeFile(join(product, "WT702_title_result_20260512.md"), "old");
    await writeFile(join(product, "image.png"), "binary-ish");
    await writeFile(
      join(product, "node_modules", "ignored", "package.md"),
      "ignored",
    );

    const files = await collectProductSourceFiles({ product });

    expect(files.map((file) => file.relativePath)).toEqual([
      "product.md",
      "specs/data.json",
      "specs/waterproof.md",
    ]);
  });

  test("renders source headings", async () => {
    const output = renderProductSource([
      {
        path: "/products/WT702/product.md",
        relativePath: "product.md",
        content: "# WT702\nMain info\n",
      },
    ]);

    expect(output).toContain("## source: product.md");
    expect(output).toContain("# WT702");
  });
});
