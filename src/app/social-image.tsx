import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

async function getLogoDataUrl() {
  const logoPath = path.join(process.cwd(), "public", "Logo-512x512.png");
  const logoBuffer = await readFile(logoPath);
  return `data:image/png;base64,${logoBuffer.toString("base64")}`;
}

export async function generateSocialImage({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const logo = await getLogoDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(circle at top left, #818cf8 0%, #4f46e5 38%, #111827 100%)",
          color: "white",
          padding: "56px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            borderRadius: "36px",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            padding: "56px",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 24px 80px rgba(15, 23, 42, 0.35)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              maxWidth: "65%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "18px",
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.72)",
              }}
            >
              Swaply
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 68,
                  lineHeight: 1,
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                }}
              >
                Trade locally.
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 68,
                  lineHeight: 1,
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                }}
              >
                Scale globally.
              </div>
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 26,
                lineHeight: 1.4,
                color: "rgba(255,255,255,0.82)",
                maxWidth: "90%",
              }}
            >
              Local swap marketplace with geo-based discovery, Swaps wallet and
              country-specific payment rails.
            </div>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo}
            alt=""
            width={220}
            height={220}
            style={{
              borderRadius: 48,
              background: "rgba(255,255,255,0.95)",
              padding: 20,
              boxShadow: "0 24px 60px rgba(15, 23, 42, 0.28)",
            }}
          />
        </div>
      </div>
    ),
    {
      width,
      height,
    }
  );
}
