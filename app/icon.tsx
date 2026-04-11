import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Tabfavicon — voorkomt dat Safari oude “CF”-initialen uit cache/metadata toont. */
export default function Icon() {
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
          fontSize: 15,
          fontWeight: 700,
          fontFamily: "system-ui, sans-serif",
          borderRadius: 7,
        }}
      >
        ZM
      </div>
    ),
    { ...size },
  );
}
