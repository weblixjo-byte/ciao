import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbService } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    const rewardsPromise = dbService.getRewards(true);
    let userPointsPromise: Promise<number> = Promise.resolve(0);

    if (session && session.role === "customer") {
      userPointsPromise = dbService
        .findUserById(session.userId)
        .then((user) => user?.pointsBalance || 0);
    }

    const [rewards, userPoints] = await Promise.all([
      rewardsPromise,
      userPointsPromise,
    ]);

    return NextResponse.json(
      {
        success: true,
        rewards: rewards.map((r) => ({
          ...r,
          canRedeem: userPoints >= r.pointsRequired,
        })),
        userPoints,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=15, stale-while-revalidate=60",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(_req: Request) {
  return NextResponse.json(
    {
      error: "Direct client redemption is disabled. Please present your 6-digit PIN or QR code to the cashier at the counter to activate your discount.",
      requiresCashier: true,
    },
    { status: 403 }
  );
}
