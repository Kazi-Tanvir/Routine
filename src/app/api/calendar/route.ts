import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to get day name from a date string (YYYY-MM-DD)
// Note: We force interpretation in local time to avoid timezone shifts
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
    const startDateStr = searchParams.get('startDate'); // YYYY-MM-DD
    const endDateStr = searchParams.get('endDate'); // YYYY-MM-DD

    if (!startDateStr || !endDateStr) {
      return NextResponse.json({ error: 'Missing date range parameters' }, { status: 400 });
    }

    const studentIds = studentIdStr 
      ? [parseInt(studentIdStr)] 
      : (await prisma.student.findMany()).map(s => s.id);

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    
    // Generate all dates in the range
    const dates: string[] = [];
    const temp = new Date(start);
    while (temp <= end) {
      dates.push(temp.toISOString().split('T')[0]);
      temp.setDate(temp.getDate() + 1);
    }

    const responseData: any = {};

    for (const id of studentIds) {
      const student = await prisma.student.findUnique({
        where: { id },
        include: { courses: true }
      });
      if (!student) continue;

      responseData[id] = {
        studentInfo: student,
        dates: {} as Record<string, any>
      };

      // Query database once for this student in this date range to optimize performance
      const weeklySlots = await prisma.weeklySlot.findMany({
        where: { studentId: id },
        include: { course: true }
      });

      const overrides = await prisma.dailyClass.findMany({
        where: {
          studentId: id,
          date: { gte: startDateStr, lte: endDateStr }
        },
        include: { course: true }
      });

      const vacations = await prisma.vacation.findMany({
        where: {
          studentId: id,
          date: { gte: startDateStr, lte: endDateStr }
        }
      });

      const attendance = await prisma.attendance.findMany({
        where: {
          studentId: id,
          date: { gte: startDateStr, lte: endDateStr }
        }
      });

      // Build vacation map
      const vacationMap = new Map<string, string>(); // date -> type (VACATION / ABSENT_DAY)
      vacations.forEach(v => vacationMap.set(v.date, v.type));

      // Resolve for each date
      for (const dateStr of dates) {
        const dayName = getDayOfWeek(dateStr);
        const dayVacationType = vacationMap.get(dateStr); // undefined, "VACATION", "ABSENT_DAY"

        // 1. Get template slots for this day of week (only if date is >= courseStartDate)
        const dayTemplates = dateStr >= student.courseStartDate
          ? weeklySlots.filter(s => s.dayOfWeek === dayName)
          : [];

        // 2. Filter overrides for this date
        const dateOverrides = overrides.filter(o => o.date === dateStr);

        const activeClasses: any[] = [];

        // Process template slots (check if overridden or deleted)
        for (const slot of dayTemplates) {
          const override = dateOverrides.find(o => o.weeklySlotId === slot.id);
          
          let classItem: any = {
            id: `template-${slot.id}-${dateStr}`,
            weeklySlotId: slot.id,
            dailyClassId: null,
            courseId: slot.courseId,
            course: slot.course,
            startTime: slot.startTime,
            endTime: slot.endTime,
            room: slot.room,
            group: slot.group,
            status: 'SCHEDULED', // default
            isExtra: false,
            attendanceStatus: null, // to resolve next
            studentId: id,
            date: dateStr
          };

          if (override) {
            // Apply override modifications
            classItem.id = `override-${override.id}`;
            classItem.dailyClassId = override.id;
            classItem.startTime = override.startTime;
            classItem.endTime = override.endTime;
            classItem.room = override.room;
            classItem.group = override.group;
            classItem.status = override.status; // SCHEDULED, RESCHEDULED, CANCELLED
          }

          // Resolve attendance status
          const att = attendance.find(a => 
            a.courseId === slot.courseId &&
            a.date === dateStr &&
            (override ? a.dailyClassId === override.id : a.weeklySlotId === slot.id)
          );

          if (dayVacationType === 'VACATION') {
            classItem.attendanceStatus = 'VACATION'; // Bypassed
          } else if (dayVacationType === 'ABSENT_DAY') {
            classItem.attendanceStatus = 'ABSENT'; // Auto-absent day
          } else if (classItem.status === 'CANCELLED') {
            classItem.attendanceStatus = 'CANCELLED';
          } else if (att) {
            classItem.attendanceStatus = att.status; // PRESENT, ABSENT, etc.
          }

          activeClasses.push(classItem);
        }

        // Process extra classes (created specifically for this day, not from templates)
        const extraClasses = dateOverrides.filter(o => o.isExtra);
        for (const extra of extraClasses) {
          let classItem: any = {
            id: `extra-${extra.id}`,
            weeklySlotId: null,
            dailyClassId: extra.id,
            courseId: extra.courseId,
            course: extra.course,
            startTime: extra.startTime,
            endTime: extra.endTime,
            room: extra.room,
            group: extra.group,
            status: extra.status,
            isExtra: true,
            attendanceStatus: null,
            studentId: id,
            date: dateStr
          };

          const att = attendance.find(a => 
            a.courseId === extra.courseId &&
            a.date === dateStr &&
            a.dailyClassId === extra.id
          );

          if (dayVacationType === 'VACATION') {
            classItem.attendanceStatus = 'VACATION';
          } else if (dayVacationType === 'ABSENT_DAY') {
            classItem.attendanceStatus = 'ABSENT';
          } else if (classItem.status === 'CANCELLED') {
            classItem.attendanceStatus = 'CANCELLED';
          } else if (att) {
            classItem.attendanceStatus = att.status;
          }

          activeClasses.push(classItem);
        }

        // Sort active classes chronologically by start time
        activeClasses.sort((a, b) => a.startTime.localeCompare(b.startTime));

        responseData[id].dates[dateStr] = {
          dayName,
          vacationType: dayVacationType || null,
          classes: activeClasses
        };
      }
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Error in calendar resolution GET:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Manage single-instance overrides (Rescheduling, Cancellations, or Adding Extra Classes)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      studentId,
      courseId,
      weeklySlotId,
      date, // YYYY-MM-DD
      startTime,
      endTime,
      room,
      group,
      status, // "SCHEDULED", "RESCHEDULED", "CANCELLED"
      isExtra
    } = body;

    if (!studentId || !courseId || !date || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required override fields' }, { status: 400 });
    }

    // Check if there is an existing override for this slot/date
    let existingOverride = null;
    if (weeklySlotId) {
      existingOverride = await prisma.dailyClass.findFirst({
        where: {
          studentId: parseInt(studentId),
          weeklySlotId: parseInt(weeklySlotId),
          date
        }
      });
    }

    let dailyClass;
    if (existingOverride) {
      // Update override
      dailyClass = await prisma.dailyClass.update({
        where: { id: existingOverride.id },
        data: {
          startTime,
          endTime,
          room: room || '',
          group: group || '',
          status
        }
      });
    } else {
      // Create new override
      dailyClass = await prisma.dailyClass.create({
        data: {
          studentId: parseInt(studentId),
          courseId: parseInt(courseId),
          weeklySlotId: weeklySlotId ? parseInt(weeklySlotId) : null,
          date,
          startTime,
          endTime,
          room: room || '',
          group: group || '',
          status: status || 'SCHEDULED',
          isExtra: !!isExtra
        }
      });
    }

    // If cancelled, make sure attendance status matches
    if (status === 'CANCELLED') {
      const existingAtt = await prisma.attendance.findFirst({
        where: {
          studentId: parseInt(studentId),
          courseId: parseInt(courseId),
          date,
          weeklySlotId: weeklySlotId ? parseInt(weeklySlotId) : null,
          dailyClassId: dailyClass.id
        }
      });

      if (existingAtt) {
        await prisma.attendance.update({
          where: { id: existingAtt.id },
          data: { status: 'CANCELLED' }
        });
      } else {
        await prisma.attendance.create({
          data: {
            studentId: parseInt(studentId),
            courseId: parseInt(courseId),
            date,
            weeklySlotId: weeklySlotId ? parseInt(weeklySlotId) : null,
            dailyClassId: dailyClass.id,
            status: 'CANCELLED'
          }
        });
      }
    }

    return NextResponse.json(dailyClass);
  } catch (error: any) {
    console.error('Error saving calendar override:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
