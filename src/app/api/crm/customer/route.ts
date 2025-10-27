import { NextResponse } from 'next/server';

export async function GET() {
  // 範例：取得客戶列表
  return NextResponse.json({ customers: [] });
}

export async function POST(request: Request) {
  // 範例：新增客戶
  const data = await request.json();
  return NextResponse.json({ message: '客戶已新增', data });
}
