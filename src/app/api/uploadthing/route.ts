import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: process.env.UPLOADTHING_TOKEN
    ? {
        token: process.env.UPLOADTHING_TOKEN,
      }
    : undefined,
});
