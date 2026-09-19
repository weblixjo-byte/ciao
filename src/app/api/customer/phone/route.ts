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
        { error: "يرجى تسجيل الدخول أولاً لتحديث رقم الهاتف" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { phone } = body;

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "رقم الهاتف مطلوب" },
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
            "رقم الهاتف غير صالح. يجب أن يتكون من 10 أرقام ويبدأ بـ 079 أو 078 أو 077",
        },
        { status: 400 }
      );
    }

    // Check if another customer already has this phone number
    const existing = await dbService.findUserByPhone(cleanPhone);
    if (existing && String(existing._id) !== String(userId)) {
      return NextResponse.json(
        { error: "هذا الرقم مسجل مسبقاً بحساب عميل آخر" },
        { status: 400 }
      );
    }

    // Update customer phone in database
    const updated = await dbService.updateUser(userId, { phone: cleanPhone });
    if (!updated) {
      return NextResponse.json(
        { error: "لم يتم العثور على حساب العميل" },
        { status: 404 }
      );
    }

    // Create an in-app confirmation notification
    try {
      await dbService.createNotification({
        customerId: userId,
        title: "تم ربط رقم الهاتف بنجاح",
        message: `تم ربط رقم هاتفك (${cleanPhone}) ببطاقة الولاء بنجاح. يمكنك الآن مشاركته مع الكاشير لجمع النقاط.`,
        type: "SYSTEM",
      });
    } catch {
      // Non-critical notification failure ignored
    }

    return NextResponse.json({
      success: true,
      phone: cleanPhone,
      message: "تم حفظ رقم الهاتف وربطه بالحساب بنجاح",
    });
  } catch (error: any) {
    console.error("Save phone error:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء حفظ رقم الهاتف" },
      { status: 500 }
    );
  }
}
