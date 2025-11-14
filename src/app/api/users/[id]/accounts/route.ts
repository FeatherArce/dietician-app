import { NextRequest, NextResponse } from "next/server";
import prisma from "@/services/prisma";
import { GetUserAccountsResponse } from "@/types/api/user";

// GET /api/users/[id]/accounts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: userId } = params;
    const accounts = await prisma.account.findMany({
      where: { userId },
      orderBy: { provider: "asc" },
    });
    const response: GetUserAccountsResponse = {
      success: true,
      data: { accounts },
    };
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch accounts", success: false },
      { status: 500 }
    );
  }
}
