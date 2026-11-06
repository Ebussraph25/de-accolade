import { renderOg, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "De Accolade Magazine Hub";

export default function Image() {
  return renderOg({ kicker: "Magazine", title: "Community news, culture and heritage from across Nigeria" });
}
