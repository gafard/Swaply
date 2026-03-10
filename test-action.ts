import { suggestListingFromImage } from './src/app/actions/ai';

// A tiny 1x1 black pixel in base64
const dummyImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

async function test() {
  try {
    const res = await suggestListingFromImage(dummyImage);
    console.log("AI Result:", res);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("AI Action Failed:", message);
  }
}

test();
