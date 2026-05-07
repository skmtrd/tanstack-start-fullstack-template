import { describe, expect, it } from "vitest";

import { parseImageUploadFile } from "./image-file.server";

describe("parseImageUploadFile", () => {
  it("accepts supported image files", () => {
    const file = new File(["image"], "todo.png", { type: "image/png" });

    expect(parseImageUploadFile(file)).toEqual({ file });
  });

  it("rejects missing files", () => {
    expect(parseImageUploadFile(null)).toEqual({
      error: { message: "Image file is required", status: 400 },
    });
  });

  it("rejects unsupported content types", () => {
    const file = new File(["text"], "todo.txt", { type: "text/plain" });

    expect(parseImageUploadFile(file)).toEqual({
      error: { message: "Only AVIF, GIF, JPEG, PNG, or WebP images can be attached", status: 415 },
    });
  });

  it("rejects files larger than the configured size", () => {
    const file = new File(["image"], "todo.png", { type: "image/png" });

    expect(
      parseImageUploadFile(file, {
        fieldName: "image",
        maxSize: 1,
        accept: "",
        allowedContentTypes: ["image/png"],
      }),
    ).toEqual({
      error: { message: "Image must be 5 MB or smaller", status: 413 },
    });
  });
});
