import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { name, selectedDays, timeOption, timeRange, repeatOption, repeatWeeks } = body;

  if (!name || !selectedDays || !timeRange || !timeOption) {
    return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
  }

  return NextResponse.json({
    message: 'Scheduling data received',
    data: { name, selectedDays, timeOption, timeRange, repeatOption, repeatWeeks },
  });
}