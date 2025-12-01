import userService from "@/services/user-services";
import { NextRequest, NextResponse } from "next/server";

// 啟用使用者
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const updatedUser = await userService.restoreUser(userId);
    return NextResponse.json({
      user: updatedUser,
      message: "使用者已復原",
      success: true,
    });
  } catch (error) {
    const { id: userId } = await params;
    console.error(`POST /api/lunch/users/${userId}/restore/ error:`, error);
    return NextResponse.json(
      { error: "Failed to perform user action", success: false },
      { status: 500 }
    );
  }
}
