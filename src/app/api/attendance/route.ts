import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to determine day name
function getDayOfWeek(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  return days[date.getDay()];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentIdStr = searchParams.get('studentId');
    const startDateStr = searchParams.get('startDate'); // Custom range start
    const endDateStr = searchParams.get('endDate'); // Custom range end

    if (!studentIdStr) {
      return NextResponse.json({ error: 'Missing studentId' }, { status: 400 });
    }

    const studentId = parseInt(studentIdStr);

    // If custom range is specified, calculate the analytics for that period
    // We will resolve the attendance statistics for the student
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        courses: {
          include: {
            weeklySlots: true,
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Retrieve vacations, overrides, and logged attendance
    const whereClause: any = { studentId };
    if (startDateStr && endDateStr) {
      whereClause.date = { gte: startDateStr, lte: endDateStr };
    }

    const vacations = await prisma.vacation.findMany({ where: whereClause });
    const dailyClasses = await prisma.dailyClass.findMany({ where: whereClause });
    const attendances = await prisma.attendance.findMany({ where: whereClause });

    // Calculate metrics
    // To calculate class holds, we must traverse each day in the selected period (or if no range, let's scan all logged attendances, or use a default range like the last 30 days)
    // If no range, let's scan from the first attendance date to today or a standard date range.
    // Let's establish a clear date range for stats:
    // If no custom period is passed, we default to: [Earliest attendance date OR 1 month ago, Today]
    let startStr = startDateStr;
    let endStr = endDateStr;

    if (!startStr || !endStr) {
      const today = new Date();
      endStr = today.toISOString().split('T')[0];
      
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      startStr = oneMonthAgo.toISOString().split('T')[0];
    }

    const start = new Date(startStr);
    const end = new Date(endStr);
    
    // Generate dates in range
    const dates: string[] = [];
    const temp = new Date(start);
    while (temp <= end) {
      dates.push(temp.toISOString().split('T')[0]);
      temp.setDate(temp.getDate() + 1);
    }

    const vacationMap = new Map<string, string>();
    vacations.forEach(v => vacationMap.set(v.date, v.type));

    // Stats variables
    let totalClassesHeld = 0;
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalCancelled = 0;

    const courseStats: Record<string, { held: number, present: number, absent: number, cancelled: number, courseId: number, subjectName: string, subjectCode: string }> = {};
    
    student.courses.forEach(c => {
      courseStats[c.id] = {
        held: 0,
        present: 0,
        absent: 0,
        cancelled: 0,
        courseId: c.id,
        subjectName: c.subjectName,
        subjectCode: c.subjectCode
      };
    });

    // Resolve each class occurrence for each day in range to count totals
    for (const dateStr of dates) {
      if (dateStr < student.courseStartDate) {
        continue;
      }
      const dayName = getDayOfWeek(dateStr);
      const dayVacationType = vacationMap.get(dateStr);

      if (dayVacationType === 'VACATION') {
        // School closed, completely skip
        continue;
      }

      // Check template slots
      const dayTemplates = student.courses.flatMap(c => c.weeklySlots).filter(s => s.dayOfWeek === dayName);
      const dateOverrides = dailyClasses.filter(o => o.date === dateStr);

      // 1. Process templates
      for (const slot of dayTemplates) {
        const override = dateOverrides.find(o => o.weeklySlotId === slot.id);
        
        let status = 'SCHEDULED';
        if (override) {
          status = override.status;
        }

        if (status === 'CANCELLED') {
          totalCancelled++;
          courseStats[slot.courseId].cancelled++;
          continue; // not held
        }

        // It is held (either SCHEDULED or RESCHEDULED)
        // Check attendance record
        let attStatus: string | null = null;
        if (dayVacationType === 'ABSENT_DAY') {
          attStatus = 'ABSENT';
        } else {
          const att = attendances.find(a => 
            a.courseId === slot.courseId &&
            a.date === dateStr &&
            (override ? a.dailyClassId === override.id : a.weeklySlotId === slot.id)
          );
          if (att) attStatus = att.status;
        }

        totalClassesHeld++;
        courseStats[slot.courseId].held++;

        if (attStatus === 'PRESENT') {
          totalPresent++;
          courseStats[slot.courseId].present++;
        } else if (attStatus === 'ABSENT') {
          totalAbsent++;
          courseStats[slot.courseId].absent++;
        }
      }

      // 2. Process extra classes
      const extraClasses = dateOverrides.filter(o => o.isExtra);
      for (const extra of extraClasses) {
        if (extra.status === 'CANCELLED') {
          totalCancelled++;
          courseStats[extra.courseId].cancelled++;
          continue;
        }

        let attStatus: string | null = null;
        if (dayVacationType === 'ABSENT_DAY') {
          attStatus = 'ABSENT';
        } else {
          const att = attendances.find(a => 
            a.courseId === extra.courseId &&
            a.date === dateStr &&
            a.dailyClassId === extra.id
          );
          if (att) attStatus = att.status;
        }

        totalClassesHeld++;
        courseStats[extra.courseId].held++;

        if (attStatus === 'PRESENT') {
          totalPresent++;
          courseStats[extra.courseId].present++;
        } else if (attStatus === 'ABSENT') {
          totalAbsent++;
          courseStats[extra.courseId].absent++;
        }
      }
    }

    const overallPercentage = totalClassesHeld > 0 
      ? Math.round((totalPresent / totalClassesHeld) * 100) 
      : 100;

    const subjectsData = Object.values(courseStats).map(s => {
      const percentage = s.held > 0 
        ? Math.round((s.present / s.held) * 100) 
        : 100;
      return {
        ...s,
        percentage
      };
    });

    return NextResponse.json({
      range: { start: startStr, end: endStr },
      summary: {
        totalClassesHeld,
        totalPresent,
        totalAbsent,
        totalCancelled,
        overallPercentage
      },
      subjects: subjectsData
    });

  } catch (error: any) {
    console.error('Error fetching attendance stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      studentId,
      courseId,
      date,
      status, // "PRESENT", "ABSENT", "CANCELLED"
      weeklySlotId,
      dailyClassId,
    } = body;

    if (!studentId || !courseId || !date || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sId = parseInt(studentId);
    const cId = parseInt(courseId);
    const wsId = weeklySlotId ? parseInt(weeklySlotId) : null;
    const dcId = dailyClassId ? parseInt(dailyClassId) : null;

    // First find if there's an existing record
    const existing = await prisma.attendance.findFirst({
      where: {
        studentId: sId,
        courseId: cId,
        date,
        weeklySlotId: wsId,
        dailyClassId: dcId,
      },
    });

    let attendance;
    if (existing) {
      // Update
      attendance = await prisma.attendance.update({
        where: { id: existing.id },
        data: { status },
      });
    } else {
      // Create
      attendance = await prisma.attendance.create({
        data: {
          studentId: sId,
          courseId: cId,
          date,
          status,
          weeklySlotId: wsId,
          dailyClassId: dcId,
        },
      });
    }

    return NextResponse.json(attendance);
  } catch (error: any) {
    console.error('Error updating attendance:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
