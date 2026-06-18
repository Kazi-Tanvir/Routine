const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding routine database...");

  // Clean existing data
  await prisma.attendance.deleteMany({});
  await prisma.dailyClass.deleteMany({});
  await prisma.weeklySlot.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.vacation.deleteMany({});
  await prisma.student.deleteMany({});

  // 1. Create Students
  const studentA = await prisma.student.create({
    data: {
      name: "Student A (BSSE 18th)",
      code: "student_a",
      color: "#2b6cb0", // Ink blue
      courseStartDate: "2026-04-12"
    }
  });

  const studentB = await prisma.student.create({
    data: {
      name: "Student B (L1T1 Sec C)",
      code: "student_b",
      color: "#c53030", // Pencil red
      courseStartDate: "2026-01-01"
    }
  });

  console.log("Students created!");

  // 2. Courses for Student A
  const coursesAData = [
    {
      subjectId: "CSE-1101",
      subjectName: "Structured Programming",
      subjectCode: "CSE 1101",
      teacherName: "Prof. Kazi Muheymin-Us-Sakib",
      teacherCode: "KMS",
      teacherContact: "+880 123456789",
      teacherEmail: "kms@du.ac.bd"
    },
    {
      subjectId: "CSE-1102",
      subjectName: "Discrete Mathematics",
      subjectCode: "CSE 1102",
      teacherName: "Associate Prof. Shah Mostafa Khaled",
      teacherCode: "SMK",
      teacherContact: "+880 987654321",
      teacherEmail: "smk@du.ac.bd"
    },
    {
      subjectId: "STAT-1103",
      subjectName: "Probability and Statistics for Engineers I",
      subjectCode: "STAT 1103",
      teacherName: "Guest Teacher G-MML",
      teacherCode: "G-MML",
      teacherContact: "TBA",
      teacherEmail: "mml.statistics@du.ac.bd"
    },
    {
      subjectId: "MATH-1107",
      subjectName: "Calculus I",
      subjectCode: "MATH 1107",
      teacherName: "Guest Teacher G-SI",
      teacherCode: "G-SI",
      teacherContact: "TBA",
      teacherEmail: "si.math@du.ac.bd"
    },
    {
      subjectId: "GE-1105",
      subjectName: "Introduction to Sociology",
      subjectCode: "GE 1105",
      teacherName: "Guest Teacher G-MAA",
      teacherCode: "G-MAA",
      teacherContact: "TBA",
      teacherEmail: "maa.sociology@du.ac.bd"
    },
    {
      subjectId: "SE-1106",
      subjectName: "Introduction to Software Engineering",
      subjectCode: "SE 1106",
      teacherName: "Prof. Zerina Begum",
      teacherCode: "ZB",
      teacherContact: "+880 111222333",
      teacherEmail: "zb@du.ac.bd"
    },
    {
      subjectId: "CSE-1101L",
      subjectName: "Structured Programming Lab",
      subjectCode: "CSE 1101L",
      teacherName: "Associate Prof. Ahmedul Kabir + Mridha Md. Nafis Fuad",
      teacherCode: "AK+MNF",
      teacherContact: "+880 555666777",
      teacherEmail: "ak.lab@du.ac.bd"
    }
  ];

  const coursesA = {};
  for (const c of coursesAData) {
    coursesA[c.subjectId] = await prisma.course.create({
      data: {
        ...c,
        studentId: studentA.id
      }
    });
  }

  // 3. Courses for Student B
  const coursesBData = [
    {
      subjectId: "CSE-101",
      subjectName: "Structured Programming",
      subjectCode: "CSE101 (C)",
      teacherName: "MMAK, MMFZ",
      teacherCode: "MMAK+MMFZ",
      teacherContact: "TBA",
      teacherEmail: "mmak@du.ac.bd"
    },
    {
      subjectId: "PHY-129",
      subjectName: "Physics Theory",
      subjectCode: "PHY129 (C)",
      teacherName: "Physics Department Teacher",
      teacherCode: "PHY",
      teacherContact: "TBA",
      teacherEmail: "physics@du.ac.bd"
    },
    {
      subjectId: "EEE-163",
      subjectName: "Electrical Engineering Theory",
      subjectCode: "EEE163 (C)",
      teacherName: "EEE Department Teacher",
      teacherCode: "EEE",
      teacherContact: "TBA",
      teacherEmail: "eee.dept@du.ac.bd"
    },
    {
      subjectId: "EEE-164",
      subjectName: "Electrical Engineering Lab",
      subjectCode: "EEE164 (C1)",
      teacherName: "Teacher PEL / NCL",
      teacherCode: "PEL/NCL",
      teacherContact: "TBA",
      teacherEmail: "eee.lab@du.ac.bd"
    },
    {
      subjectId: "PHY-114",
      subjectName: "Physics Lab",
      subjectCode: "PHY114 (C1)",
      teacherName: "Physics Lab Instructor",
      teacherCode: "PHY-Lab",
      teacherContact: "TBA",
      teacherEmail: "physlab@du.ac.bd"
    },
    {
      subjectId: "MATH-141",
      subjectName: "Mathematics",
      subjectCode: "MATH141 (C)",
      teacherName: "Mathematics Instructor",
      teacherCode: "MATH",
      teacherContact: "TBA",
      teacherEmail: "math.dept@du.ac.bd"
    },
    {
      subjectId: "CSE-103",
      subjectName: "Computer Science Course",
      subjectCode: "CSE103 (C)",
      teacherName: "MN, RZS",
      teacherCode: "MN+RZS",
      teacherContact: "TBA",
      teacherEmail: "cse103@du.ac.bd"
    },
    {
      subjectId: "CSE-102",
      subjectName: "Computer Science Lab",
      subjectCode: "CSE102 (C1)",
      teacherName: "SAH/IRK, IMK, SSA",
      teacherCode: "SAH+IRK",
      teacherContact: "TBA",
      teacherEmail: "cselab@du.ac.bd"
    },
    {
      subjectId: "CT",
      subjectName: "Class Test",
      subjectCode: "CT (C)",
      teacherName: "Invigilator Team",
      teacherCode: "CT",
      teacherContact: "N/A",
      teacherEmail: "ct.sec_c@du.ac.bd"
    }
  ];

  const coursesB = {};
  for (const c of coursesBData) {
    coursesB[c.subjectId] = await prisma.course.create({
      data: {
        ...c,
        studentId: studentB.id
      }
    });
  }

  console.log("Courses created!");

  // 4. Weekly slots for Student A (BSSE 18th)
  // Sunday
  await prisma.weeklySlot.createMany({
    data: [
      { studentId: studentA.id, courseId: coursesA["SE-1106"].id, dayOfWeek: "SUNDAY", startTime: "10:00", endTime: "11:00", room: "107" },
      { studentId: studentA.id, courseId: coursesA["STAT-1103"].id, dayOfWeek: "SUNDAY", startTime: "11:00", endTime: "13:00", room: "107" },
      { studentId: studentA.id, courseId: coursesA["CSE-1101L"].id, dayOfWeek: "SUNDAY", startTime: "14:00", endTime: "17:00", room: "305", group: "Group A" },
      // Monday
      { studentId: studentA.id, courseId: coursesA["GE-1105"].id, dayOfWeek: "MONDAY", startTime: "09:00", endTime: "10:00", room: "107" },
      { studentId: studentA.id, courseId: coursesA["SE-1106"].id, dayOfWeek: "MONDAY", startTime: "10:00", endTime: "12:00", room: "107" },
      { studentId: studentA.id, courseId: coursesA["CSE-1101"].id, dayOfWeek: "MONDAY", startTime: "12:00", endTime: "13:00", room: "107" },
      // Tuesday
      { studentId: studentA.id, courseId: coursesA["STAT-1103"].id, dayOfWeek: "TUESDAY", startTime: "10:00", endTime: "12:00", room: "107" },
      { studentId: studentA.id, courseId: coursesA["MATH-1107"].id, dayOfWeek: "TUESDAY", startTime: "12:00", endTime: "13:00", room: "107" },
      { studentId: studentA.id, courseId: coursesA["CSE-1102"].id, dayOfWeek: "TUESDAY", startTime: "14:00", endTime: "16:00", room: "105" },
      // Wednesday
      { studentId: studentA.id, courseId: coursesA["CSE-1101L"].id, dayOfWeek: "WEDNESDAY", startTime: "10:00", endTime: "13:00", room: "305", group: "Group B" },
      { studentId: studentA.id, courseId: coursesA["CSE-1102"].id, dayOfWeek: "WEDNESDAY", startTime: "14:00", endTime: "16:00", room: "105" },
      // Thursday
      { studentId: studentA.id, courseId: coursesA["GE-1105"].id, dayOfWeek: "THURSDAY", startTime: "09:00", endTime: "11:00", room: "107" },
      { studentId: studentA.id, courseId: coursesA["MATH-1107"].id, dayOfWeek: "THURSDAY", startTime: "11:00", endTime: "13:00", room: "107" },
      { studentId: studentA.id, courseId: coursesA["CSE-1101"].id, dayOfWeek: "THURSDAY", startTime: "14:00", endTime: "16:00", room: "105" }
    ]
  });

  // 5. Weekly slots for Student B (L1T1 Sec C)
  await prisma.weeklySlot.createMany({
    data: [
      // Saturday
      { studentId: studentB.id, courseId: coursesB["CSE-101"].id, dayOfWeek: "SATURDAY", startTime: "08:00", endTime: "09:00", room: "107" },
      { studentId: studentB.id, courseId: coursesB["PHY-129"].id, dayOfWeek: "SATURDAY", startTime: "09:00", endTime: "10:00", room: "107" },
      { studentId: studentB.id, courseId: coursesB["EEE-163"].id, dayOfWeek: "SATURDAY", startTime: "10:00", endTime: "11:00", room: "107" },
      { studentId: studentB.id, courseId: coursesB["EEE-164"].id, dayOfWeek: "SATURDAY", startTime: "11:00", endTime: "13:00", room: "EEE Lab", group: "C1" },
      { studentId: studentB.id, courseId: coursesB["PHY-114"].id, dayOfWeek: "SATURDAY", startTime: "14:00", endTime: "17:00", room: "Physics Lab-1", group: "C1" },
      // Sunday
      { studentId: studentB.id, courseId: coursesB["MATH-141"].id, dayOfWeek: "SUNDAY", startTime: "10:00", endTime: "11:00", room: "107" },
      { studentId: studentB.id, courseId: coursesB["CSE-103"].id, dayOfWeek: "SUNDAY", startTime: "11:00", endTime: "12:00", room: "107" },
      { studentId: studentB.id, courseId: coursesB["PHY-129"].id, dayOfWeek: "SUNDAY", startTime: "12:00", endTime: "13:00", room: "107" },
      // Monday
      { studentId: studentB.id, courseId: coursesB["CT"].id, dayOfWeek: "MONDAY", startTime: "08:00", endTime: "09:00", room: "107" },
      { studentId: studentB.id, courseId: coursesB["MATH-141"].id, dayOfWeek: "MONDAY", startTime: "10:00", endTime: "11:00", room: "107" },
      { studentId: studentB.id, courseId: coursesB["CSE-103"].id, dayOfWeek: "MONDAY", startTime: "11:00", endTime: "12:00", room: "107" },
      { studentId: studentB.id, courseId: coursesB["CSE-101"].id, dayOfWeek: "MONDAY", startTime: "12:00", endTime: "13:00", room: "107" },
      // Tuesday
      { studentId: studentB.id, courseId: coursesB["PHY-129"].id, dayOfWeek: "TUESDAY", startTime: "09:00", endTime: "10:00", room: "107" },
      { studentId: studentB.id, courseId: coursesB["EEE-163"].id, dayOfWeek: "TUESDAY", startTime: "10:00", endTime: "11:00", room: "107" },
      { studentId: studentB.id, courseId: coursesB["CSE-102"].id, dayOfWeek: "TUESDAY", startTime: "11:00", endTime: "13:00", room: "VDAL", group: "C1" },
      // Wednesday
      { studentId: studentB.id, courseId: coursesB["CT"].id, dayOfWeek: "WEDNESDAY", startTime: "08:00", endTime: "09:00", room: "107" },
      { studentId: studentB.id, courseId: coursesB["EEE-163"].id, dayOfWeek: "WEDNESDAY", startTime: "09:00", endTime: "10:00", room: "107" },
      { studentId: studentB.id, courseId: coursesB["MATH-141"].id, dayOfWeek: "WEDNESDAY", startTime: "10:00", endTime: "11:00", room: "107" },
      { studentId: studentB.id, courseId: coursesB["CSE-103"].id, dayOfWeek: "WEDNESDAY", startTime: "11:00", endTime: "12:00", room: "107" },
      { studentId: studentB.id, courseId: coursesB["CSE-101"].id, dayOfWeek: "WEDNESDAY", startTime: "12:00", endTime: "13:00", room: "107" }
    ]
  });

  console.log("Weekly slots created!");
  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
