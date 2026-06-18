import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to get dates between start and end
function getDatesInRange(startStr: string, endStr: string): string[] {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const dates: string[] = [];
  const temp = new Date(start);
  while (temp <= end) {
    dates.push(temp.toISOString().split('T')[0]);
    temp.setDate(temp.getDate() + 1);
  }
  return dates;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    const query: any = {};
    if (studentId) query.studentId = parseInt(studentId);

    const vacations = await prisma.vacation.findMany({
      where: query,
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(vacations);
  } catch (error: any) {
    console.error('Error fetching vacations:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, date, endDate, type, description } = body; // type: "VACATION", "ABSENT_DAY", or "NONE"

    if (!studentId || !date) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const sId = parseInt(studentId);
    const startStr = date;
    const endStr = endDate || date;

    // Generate list of dates in range
    const dates = getDatesInRange(startStr, endStr);

    const results = [];

    for (const currentDate of dates) {
      if (type === 'NONE' || !type) {
        // Delete if exists
        const existing = await prisma.vacation.findUnique({
          where: {
            studentId_date: {
              studentId: sId,
              date: currentDate
            }
          }
        });
        if (existing) {
          await prisma.vacation.delete({
            where: { id: existing.id }
          });
        }
      } else {
        // Upsert vacation
        const vacation = await prisma.vacation.upsert({
          where: {
            studentId_date: {
              studentId: sId,
              date: currentDate
            }
          },
          update: {
            type,
            description: description || ''
          },
          create: {
            studentId: sId,
            date: currentDate,
            type,
            description: description || ''
          }
        });
        results.push(vacation);
      }
    }

    return NextResponse.json({ success: true, count: dates.length, results });
  } catch (error: any) {
    console.error('Error saving vacations range:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing vacation ID' }, { status: 400 });
    }

    await prisma.vacation.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting vacation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
