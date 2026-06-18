import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    
    const courses = await prisma.course.findMany({
      where: studentId ? { studentId: parseInt(studentId) } : {},
      orderBy: { subjectId: 'asc' },
    });
    
    return NextResponse.json(courses);
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      studentId,
      subjectId,
      subjectName,
      subjectCode,
      teacherName,
      teacherCode,
      teacherContact,
      teacherEmail,
    } = body;

    if (!studentId || !subjectId || !subjectName || !subjectCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (id) {
      // Edit existing course
      const updatedCourse = await prisma.course.update({
        where: { id: parseInt(id) },
        data: {
          subjectId,
          subjectName,
          subjectCode,
          teacherName: teacherName || '',
          teacherCode: teacherCode || '',
          teacherContact: teacherContact || '',
          teacherEmail: teacherEmail || '',
        },
      });
      return NextResponse.json(updatedCourse);
    } else {
      // Create new course
      // Check if unique constraint is violated
      const existing = await prisma.course.findUnique({
        where: {
          studentId_subjectId: {
            studentId: parseInt(studentId),
            subjectId,
          },
        },
      });

      if (existing) {
        return NextResponse.json({ error: `Subject ID ${subjectId} already exists for this student` }, { status: 400 });
      }

      const newCourse = await prisma.course.create({
        data: {
          studentId: parseInt(studentId),
          subjectId,
          subjectName,
          subjectCode,
          teacherName: teacherName || '',
          teacherCode: teacherCode || '',
          teacherContact: teacherContact || '',
          teacherEmail: teacherEmail || '',
        },
      });
      return NextResponse.json(newCourse, { status: 201 });
    }
  } catch (error: any) {
    console.error('Error creating/updating course:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing course ID' }, { status: 400 });
    }

    await prisma.course.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
