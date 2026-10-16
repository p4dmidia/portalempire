import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const size = {
  width: 48,
  height: 48,
};
export const contentType = "image/png";

export default function Icon() {
  const filePath = path.join(process.cwd(), "public", "icon-192.png");
  let imgSrc = "";
  try {
    const fileBuffer = fs.readFileSync(filePath);
    imgSrc = `data:image/png;base64,${fileBuffer.toString("base64")}`;
  } catch {
    imgSrc = "";
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            width="48"
            height="48"
            style={{ objectFit: "contain" }}
            alt="Logo"
          />
        ) : (
          <span style={{ color: "#d97706", fontWeight: "bold", fontSize: 24 }}>E</span>
        )}
      </div>
    ),
    {
      ...size,
    }
  );
}

