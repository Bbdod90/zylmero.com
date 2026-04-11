import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** iOS / Safari “opslaan op beginscherm” en sommige tab-preview’s. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #4F6EF7 0%, #3b5bdb 100%)",
          color: "#fff",
          fontSize: 72,
          fontWeight: 700,
          fontFamily: "system-ui, sans-serif",
          borderRadius: 36,
        }}
      >
        ZM
      </div>
    ),
    { ...size },
  );
}
