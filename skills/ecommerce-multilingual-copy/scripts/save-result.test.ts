import { describe, expect, test } from "bun:test";
import {
  expandHomePath,
  formatDate,
  formatTime,
  generateOutputPath,
  resolveUserPath,
} from "./save-result";

describe("save-result path helpers", () => {
  test("formats dates and times with zero padding", () => {
    const date = new Date(2026, 4, 9, 3, 7);

    expect(formatDate(date)).toBe("20260509");
    expect(formatTime(date)).toBe("0307");
  });

  test("expands tilde paths", () => {
    expect(expandHomePath("~/products/WT702.md", "/home/tester")).toBe(
      "/home/tester/products/WT702.md",
    );
    expect(expandHomePath("relative.md", "/home/tester")).toBe("relative.md");
  });

  test("resolves relative paths from a supplied cwd", () => {
    expect(resolveUserPath("products/WT702.md", "/work", "/home/tester")).toBe(
      "/work/products/WT702.md",
    );
  });

  test("uses requirement file as the preferred result location", () => {
    const output = generateOutputPath({
      requirement: "~/tasks/image2.md",
      product: "~/products/WT702.md",
      copyType: "title",
      dateStr: "20260512",
      homeDir: "/home/tester",
      pathExists: () => false,
    });

    expect(output).toBe("/home/tester/tasks/image2_result_20260512.md");
  });

  test("uses product file when no requirement is present", () => {
    const output = generateOutputPath({
      product: "/products/WT702.md",
      copyType: "bullets",
      dateStr: "20260512",
      pathExists: () => false,
    });

    expect(output).toBe("/products/WT702_bullets_result_20260512.md");
  });

  test("adds a time suffix when the target already exists", () => {
    const output = generateOutputPath({
      requirement: "/tasks/image2.md",
      copyType: "image-copy",
      dateStr: "20260512",
      now: new Date(2026, 4, 12, 14, 5),
      pathExists: () => true,
    });

    expect(output).toBe("/tasks/image2_result_20260512_1405.md");
  });
});
