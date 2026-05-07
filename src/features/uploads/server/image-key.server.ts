type ImageKeyInput = {
  prefix: string;
  ownerId: string;
  resourceId: number | string;
  file: File;
};

const imageExtensionsByContentType: Record<string, string> = {
  "image/avif": ".avif",
  "image/gif": ".gif",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export function imageFileExtension(file: File) {
  const extension = file.name.toLowerCase().match(/\.(avif|gif|jpe?g|png|webp)$/)?.[0];
  return extension ?? imageExtensionsByContentType[file.type] ?? "";
}

export function createImageObjectKey({ prefix, ownerId, resourceId, file }: ImageKeyInput) {
  return [
    normalizeObjectKeySegment(prefix),
    normalizeObjectKeySegment(ownerId),
    normalizeObjectKeySegment(resourceId),
    `${crypto.randomUUID()}${imageFileExtension(file)}`,
  ].join("/");
}

function normalizeObjectKeySegment(segment: number | string) {
  return String(segment).replace(/[^a-zA-Z0-9._=-]/g, "_");
}
