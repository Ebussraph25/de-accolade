import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const ogSize = { width: 1200, height: 630 };

/** Branded 1200×630 share card used for articles without a photo and for the site default. */
export async function renderOg({ kicker, title }: { kicker: string; title: string }) {
  const [serif, sans, mark, word] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/newsreader-latin-600-normal.woff")),
    readFile(join(process.cwd(), "assets/fonts/libre-franklin-latin-600-normal.woff")),
    readFile(join(process.cwd(), "public/brand/logo-mark-light.png"), "base64"),
    readFile(join(process.cwd(), "public/brand/logo-wordmark-light.png"), "base64"),
  ]);
  const size = title.length > 90 ? 52 : title.length > 60 ? 60 : 70;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0b1f3f", padding: "64px 72px", color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`data:image/png;base64,${mark}`} width={86} height={84} alt="" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`data:image/png;base64,${word}`} width={250} height={50} alt="" />
          </div>
          <div style={{ fontFamily: "Franklin", fontSize: 24, color: "#d8b75f" }}>{kicker}</div>
        </div>
        <div style={{ fontFamily: "Newsreader", fontSize: size, lineHeight: 1.1, letterSpacing: -1, display: "flex" }}>{title}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "3px solid #c39a36", paddingTop: 22, fontFamily: "Franklin", fontSize: 22, color: "rgba(255,255,255,.75)" }}>
          <span>Your Voice. Our Community. Our Story.</span>
          <span>An Agunjiegbe Online Television Publication</span>
        </div>
      </div>
    ),
    { ...ogSize, fonts: [{ name: "Newsreader", data: serif, weight: 600 }, { name: "Franklin", data: sans, weight: 600 }] },
  );
}
