import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { base64 } = await req.json();
  if (!base64) return NextResponse.json({ error: "No image data" }, { status: 400 });

  try {
    const url = await uploadImage(base64);
    return NextResponse.json({ url });
  } catch (err: any) {
    console.error("Cloudinary upload error:", err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? "Upload failed" }, { status: 500 });
  }
}
