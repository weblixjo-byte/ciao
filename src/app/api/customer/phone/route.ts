import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbService } from "@/lib/db";

const JORDAN_PHONE_REGEX = /^07[789]\d{7}$/;

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    let userId = session?.userId;

    if (!userId) {
      const headerId = req.headers.get("x-customer-id");
      if (headerId) {
        userId = headerId;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in first to update your phone number" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { phone } = body;

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Strip spaces, dashes, or non-numeric characters
    const cleanPhone = phone.replace(/[\s\-().+]/g, "").trim();

    // Must be exactly 10 digits starting with 079, 078, or 077
    if (!JORDAN_PHONE_REGEX.test(cleanPhone)) {
      return NextResponse.json(
        {
          error:
            "Invalid phone number. Must be 10 digits starting with 079, 078, or 077",
        },
        { status: 400 }
      );
    }

    // Check if another customer already has this phone number
    const existing = await dbService.findUserByPhone(cleanPhone);
    if (existing && String(existing._id) !== String(userId)) {
      return NextResponse.json(
        { error: "This phone number is already registered to another member" },
        { status: 400 }
      );
    }

    // Update customer phone in database
    const updated = await dbService.updateUser(userId, { phone: cleanPhone });
    if (!updated) {
      return NextResponse.json(
        { error: "Customer account not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      phone: cleanPhone,
      message: "Phone number linked successfully",
    });
  } catch (error: any) {
    console.error("Save phone error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred while saving phone number" },
      { status: 500 }
    );
  }
}
