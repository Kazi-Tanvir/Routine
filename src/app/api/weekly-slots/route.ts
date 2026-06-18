import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    const slots = await prisma.weeklySlot.findMany({
      where: studentId ? { studentId: parseInt(studentId) } : {},
      include: {
        course: true,
      },
    });

    return NextResponse.json(slots);
  } catch (error: any) {
    console.error('Error fetching weekly slots:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      studentId,
      courseId,
      dayOfWeek,
      startTime,
      endTime,
      room,
      group,
    } = body;

    if (!studentId || !courseId || !dayOfWeek || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (id) {
      const updatedSlot = await prisma.weeklySlot.update({
        where: { id: parseInt(id) },
        data: {
          courseId: parseInt(courseId),
          dayOfWeek,
          startTime,
          endTime,
          room: room || '',
          group: group || '',
        },
      });
      return NextResponse.json(updatedSlot);
    } else {
      const newSlot = await prisma.weeklySlot.create({
        data: {
          studentId: parseInt(studentId),
          courseId: parseInt(courseId),
          dayOfWeek,
          startTime,
          endTime,
          room: room || '',
          group: group || '',
        },
      });
      return NextResponse.json(newSlot, { status: 201 });
    }
  } catch (error: any) {
    console.error('Error creating/updating weekly slot:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing slot ID' }, { status: 400 });
    }

    await prisma.weeklySlot.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting weekly slot:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
