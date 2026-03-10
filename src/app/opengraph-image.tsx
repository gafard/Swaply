import { generateSocialImage } from "./social-image";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OpenGraphImage() {
  return generateSocialImage(size);
}
