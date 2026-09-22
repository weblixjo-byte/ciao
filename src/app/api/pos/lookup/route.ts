import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbService } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`pos_lookup_${ip}`, { limit: 40, windowMs: 60 * 1000 });
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Lookup rate limit exceeded. Please wait a moment." }, { status: 429 });
    }

    const session = await getSession(req);
    if (!session || (session.role !== "cashier" && session.role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized: Cashier access required" }, { status: 403 });
    }

    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Customer PIN, QR token, or phone is required" }, { status: 400 });
    }

    let cleaned = query.trim();

    // If scanned data is a full URL, extract relevant query parameters
    if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
      try {
        const parsedUrl = new URL(cleaned);
        const extracted = parsedUrl.searchParams.get("token") || parsedUrl.searchParams.get("qr") || parsedUrl.searchParams.get("pin");
        if (extracted) {
          cleaned = extracted.trim();
        }
      } catch {
        // Ignore URL parsing errors and keep cleaned
      }
    }

    let customer = null;
    let targetClaimCode: string | null = null;

    // A. Check for QR Claim format: "${qrSecret}:CLAIM:${claimCode}"
    if (cleaned.includes(":CLAIM:")) {
      const parts = cleaned.split(":CLAIM:");
      cleaned = (parts[0] || "").trim();
      targetClaimCode = (parts[1] || "").trim();
    }

    // B. Check for 8-digit format (6-digit PIN + 2-digit Reward Code)
    // Supports formats: "576-565-25", "576 565 25", "576565-25", "57656525"
    const digitsOnly = cleaned.replace(/\D/g, "");
    if (!targetClaimCode && digitsOnly.length === 8) {
      const pinPart = digitsOnly.substring(0, 6);
      targetClaimCode = digitsOnly.substring(6, 8);
      customer = await dbService.findUserByPin(pinPart);
    }

    // C. 1. Try 6-digit PIN if not already resolved
    if (!customer && digitsOnly.length === 6) {
      customer = await dbService.findUserByPin(digitsOnly);
    }

    // 2. Try QR Secret or user ID
    if (!customer) {
      customer = await dbService.findUserByQrSecret(cleaned);
    }

    // 3. Try Email address
    if (!customer && cleaned.includes("@")) {
      customer = await dbService.findUserByEmail(cleaned);
    }

    // 4. Try Phone number
    if (!customer && digitsOnly.length >= 7 && digitsOnly.length !== 8) {
      customer = await dbService.findUserByPhone(cleaned);
    }

    // 5. Try Direct user ID match
    if (!customer) {
      customer = await dbService.findUserById(cleaned);
    }

    if (!customer || customer.role !== "customer") {
      return NextResponse.json(
        { error: "Customer not found. Verify the customer PIN or scanned QR code." },
        { status: 404 }
      );
    }

    // If a reward claim code was provided, look up the target reward
    let pendingReward = null;
    if (targetClaimCode) {
      const reward = await dbService.findRewardByClaimCode(targetClaimCode, true);
      if (!reward || reward.isActive === false) {
        return NextResponse.json(
          { error: `Reward code "${targetClaimCode}" not found or inactive. Verify the 2-digit reward code.` },
          { status: 404 }
        );
      }
      pendingReward = {
        id: reward._id,
        title: reward.title,
        description: reward.description,
        pointsRequired: reward.pointsRequired,
        category: reward.category,
        imageUrl: reward.imageUrl,
        claimCode: reward.claimCode || targetClaimCode,
      };
    }

    const config = await dbService.getConfig();
    const currencyValue = Number(
      ((customer.pointsBalance / 100) * (config.discountPer100Pts || 1.0)).toFixed(3)
    );

    const recentTxs = await dbService.getCustomerTransactions(customer._id);

    return NextResponse.json({
      success: true,
      mode: pendingReward ? "redeem" : "credit",
      pendingReward,
      customer: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        pin: customer.pin,
        tier: customer.tier,
        pointsBalance: customer.pointsBalance,
        lifetimePoints: customer.lifetimePoints,
        currencyValue,
        currency: config.currency,
        pointsPerUnit: config.pointsPerUnit,
      },
      recentTransactions: recentTxs.slice(0, 5),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
