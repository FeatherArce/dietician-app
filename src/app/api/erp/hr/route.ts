import { NextResponse } from 'next/server';

export async function GET() {
  // 範例：取得員工列表
  return NextResponse.json({ employees: [] });
}

export async function POST(request: Request) {
  // 範例：新增員工
  const data = await request.json();
  return NextResponse.json({ message: '員工已新增', data });
}
