import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        courses: true,
      },
    });
    return NextResponse.json(students);
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, courseStartDate } = body;

    if (!id || !courseStartDate) {
      return NextResponse.json({ error: 'Missing student ID or start date' }, { status: 400 });
    }

    const updated = await prisma.student.update({
      where: { id: parseInt(id) },
      data: { courseStartDate },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating student start date:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
