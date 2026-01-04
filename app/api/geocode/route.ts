import { NextRequest, NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/geocoding";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    const result = await geocodeAddress(address);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Geocode API error:", error);
    return NextResponse.json(
      { error: "Failed to geocode address" },
      { status: 500 }
    );
  }
}
