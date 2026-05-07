import {
  defaultImageUploadConfig,
  type ImageUploadConfig,
} from "#/features/uploads/shared/image-upload.types";

type ParsedImageUploadFile =
  | {
      file: File;
    }
  | {
      error: {
        message: string;
        status: number;
      };
    };

export function parseImageUploadFile(
  image: FormDataEntryValue | null,
  config: ImageUploadConfig = defaultImageUploadConfig,
): ParsedImageUploadFile {
  if (!(image instanceof File)) {
    return { error: { message: "Image file is required", status: 400 } };
  }

  if (!config.allowedContentTypes.includes(image.type)) {
    return {
      error: { message: "Only AVIF, GIF, JPEG, PNG, or WebP images can be attached", status: 415 },
    };
  }

  if (image.size > config.maxSize) {
    return { error: { message: "Image must be 5 MB or smaller", status: 413 } };
  }

  return { file: image };
}
