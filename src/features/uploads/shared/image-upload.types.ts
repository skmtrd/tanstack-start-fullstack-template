export type UploadedImage = {
  url: string;
  name: string | null;
  contentType: string | null;
  size: number | null;
};

export type ImageUploadConfig = {
  fieldName: string;
  maxSize: number;
  accept: string;
  allowedContentTypes: readonly string[];
};

export const defaultImageUploadConfig = {
  fieldName: "image",
  maxSize: 5 * 1024 * 1024,
  accept: "image/avif,image/gif,image/jpeg,image/png,image/webp",
  allowedContentTypes: ["image/avif", "image/gif", "image/jpeg", "image/png", "image/webp"],
} as const satisfies ImageUploadConfig;
