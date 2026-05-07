import { describe, expect, it } from "vitest";

import { createImageObjectKey, imageFileExtension } from "./image-key.server";

describe("imageFileExtension", () => {
  it("keeps supported filename extensions", () => {
    const file = new File(["image"], "todo.jpeg", { type: "image/jpeg" });

    expect(imageFileExtension(file)).toBe(".jpeg");
  });

  it("falls back to the image content type", () => {
    const file = new File(["image"], "todo", { type: "image/webp" });

    expect(imageFileExtension(file)).toBe(".webp");
  });
});

describe("createImageObjectKey", () => {
  it("creates scoped object keys with normalized path segments", () => {
    const file = new File(["image"], "todo.png", { type: "image/png" });

    const key = createImageObjectKey({
      prefix: "todo-images",
      ownerId: "user/1",
      resourceId: 42,
      file,
    });

    expect(key).toMatch(/^todo-images\/user_1\/42\/[a-f0-9-]{36}\.png$/);
  });
});
