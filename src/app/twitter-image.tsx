import { generateSocialImage } from "./social-image";

export const size = {
  width: 1200,
  height: 600,
};

export const contentType = "image/png";

export default async function TwitterImage() {
  return generateSocialImage(size);
}
