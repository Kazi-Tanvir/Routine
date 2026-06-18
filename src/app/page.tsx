'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  BookOpen, 
  BarChart3, 
  Settings, 
  AlertCircle
} from 'lucide-react';

import DashboardView from '@/components/DashboardView';
import CalendarView from '@/components/CalendarView';
import SetupView from '@/components/SetupView';
import AnalyticsView from '@/components/AnalyticsView';
import { 
  SubjectModal, 
  OverrideModal, 
  VacationModal, 
  CourseModal, 
  SlotModal,
  CustomClassModal
} from '@/components/Modals';

export default function RoutineTracker() {
  // Mode selection & core states
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'courses' | 'analytics'>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<number>(1);
  const [currentDate, setCurrentDate] = useState<string>('');
  
  // Roster lists
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<Record<number, any[]>>({});
  const [weeklySlots, setWeeklySlots] = useState<Record<number, any[]>>({});
  
  // Custom Local Storage state for Demo Mode overrides
  const [localOverrides, setLocalOverrides] = useState<any[]>([]);
  const [localAttendance, setLocalAttendance] = useState<any[]>([]);
  const [localVacations, setLocalVacations] = useState<any[]>([]);

  // resolved calendar states
  const [calendarData, setCalendarData] = useState<Record<number, any>>({});
  const [calendarMode, setCalendarMode] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [viewDate, setViewDate] = useState<string>(''); // central focal date for calendar
  
  // Analytics
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [isCalculatingCustom, setIsCalculatingCustom] = useState(false);

  // Modals visibility and formData
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideData, setOverrideData] = useState({
    courseId: '',
    startTime: '',
    endTime: '',
    room: '',
    group: '',
    status: 'SCHEDULED',
    weeklySlotId: null as number | null,
    isExtra: false
  });

  const [showVacationModal, setShowVacationModal] = useState(false);
  const [vacationData, setVacationData] = useState({
    date: '',
    endDate: '',
    type: 'VACATION',
    description: ''
  });

  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [courseFormData, setCourseFormData] = useState({
    id: '',
    subjectId: '',
    subjectName: '',
    subjectCode: '',
    teacherName: '',
    teacherCode: '',
    teacherContact: '',
    teacherEmail: ''
  });

  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [slotFormData, setSlotFormData] = useState({
    id: '',
    courseId: '',
    dayOfWeek: 'SUNDAY',
    startTime: '08:00',
    endTime: '09:00',
    room: '',
    group: ''
  });

  const [showCustomClassModal, setShowCustomClassModal] = useState(false);
  const [customClassFormData, setCustomClassFormData] = useState({
    studentId: '',
    courseId: '',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    room: '',
    group: ''
  });

  // Initial setup: format today's date in local YYYY-MM-DD
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    setCurrentDate(todayStr);
    setViewDate(todayStr);
    
    // Set custom range default to the current month
    const startOfMonth = `${yyyy}-${mm}-01`;
    setCustomRange({ start: startOfMonth, end: todayStr });

    // Load local storage items for demo overrides
    if (typeof window !== 'undefined') {
      const storedOverrides = localStorage.getItem('routine_local_overrides');
      const storedAttendance = localStorage.getItem('routine_local_attendance');
      const storedVacations = localStorage.getItem('routine_local_vacations');
      const storedCourses = localStorage.getItem('routine_local_courses');
      const storedSlots = localStorage.getItem('routine_local_slots');
      const storedStudents = localStorage.getItem('routine_local_students');

      if (storedOverrides) setLocalOverrides(JSON.parse(storedOverrides));
      if (storedAttendance) setLocalAttendance(JSON.parse(storedAttendance));
      if (storedVacations) setLocalVacations(JSON.parse(storedVacations));
      if (storedCourses) setCourses(JSON.parse(storedCourses));
      if (storedSlots) setWeeklySlots(JSON.parse(storedSlots));
      if (storedStudents) {
        setStudents(JSON.parse(storedStudents));
      } else {
        setStudents([]);
      }
    }
    
    checkDatabaseConnection();
  }, []);

  // Check if DB is active and sync students
  const checkDatabaseConnection = async () => {
    try {
      const response = await fetch('/api/students');
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setStudents(data);
          setIsDemoMode(false);

          // Fetch and group courses from DB
          const coursesRes = await fetch('/api/courses');
          if (coursesRes.ok) {
            const coursesData = await coursesRes.json();
            const coursesMap: Record<number, any[]> = {};
            coursesData.forEach((c: any) => {
              if (!coursesMap[c.studentId]) coursesMap[c.studentId] = [];
              coursesMap[c.studentId].push(c);
            });
            setCourses(coursesMap);
          }

          // Fetch and group weekly slots from DB
          const slotsRes = await fetch('/api/weekly-slots');
          if (slotsRes.ok) {
            const slotsData = await slotsRes.json();
            const slotsMap: Record<number, any[]> = {};
            slotsData.forEach((s: any) => {
              if (!slotsMap[s.studentId]) slotsMap[s.studentId] = [];
              slotsMap[s.studentId].push(s);
            });
            setWeeklySlots(slotsMap);
          }
        } else {
          setIsDemoMode(true);
        }
      } else {
        setIsDemoMode(true);
      }
    } catch (err) {
      setIsDemoMode(true);
    }
  };

  // Update student's course start date
  const handleUpdateStartDate = async (studentId: number, date: string) => {
    if (isDemoMode) {
      const updated = students.map(s => s.id === studentId ? { ...s, courseStartDate: date } : s);
      setStudents(updated);
      saveDemoItems('routine_local_students', updated);
    } else {
      try {
        const res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: studentId,
            courseStartDate: date
          })
        });
        if (res.ok) {
          checkDatabaseConnection();
        }
      } catch (err) {
        console.error('Error updating student course start date:', err);
      }
    }
  };

  // Re-fetch calendar and stats whenever parameters change
  useEffect(() => {
    if (currentDate) {
      loadCalendarData();
      loadAnalyticsData();
    }
  }, [activeTab, selectedStudentId, viewDate, calendarMode, isDemoMode, localOverrides, localAttendance, localVacations]);

  // Save changes locally in Demo Mode
  const saveDemoItems = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Calculate local date range mapping
  const resolveLocalCalendarRange = (startDateStr: string, endDateStr: string) => {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const dates: string[] = [];
    const temp = new Date(start);
    while (temp <= end) {
      dates.push(temp.toISOString().split('T')[0]);
      temp.setDate(temp.getDate() + 1);
    }

    const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const resolved: Record<number, any> = {};

    students.forEach(student => {
      resolved[student.id] = {
        studentInfo: student,
        dates: {}
      };

      const sCourses = courses[student.id] || [];
      const sSlots = weeklySlots[student.id] || [];

      dates.forEach(dateStr => {
        const [y, m, d] = dateStr.split('-').map(Number);
        const jsDate = new Date(y, m - 1, d);
        const dayName = daysOfWeek[jsDate.getDay()];

        const vac = localVacations.find(v => v.studentId === student.id && v.date === dateStr);
        const vacationType = vac ? vac.type : null;

        const dateOverrides = localOverrides.filter(o => o.studentId === student.id && o.date === dateStr);

        const studentStartDate = student.courseStartDate || '2026-01-01';
        const dayTemplates = dateStr >= studentStartDate
          ? sSlots.filter(s => s.dayOfWeek === dayName)
          : [];
        const activeClasses: any[] = [];

        dayTemplates.forEach(slot => {
          const override = dateOverrides.find(o => o.weeklySlotId === slot.id);
          const course = sCourses.find(c => c.id === slot.courseId);

          let classItem = {
            id: `template-${slot.id}-${dateStr}`,
            weeklySlotId: slot.id,
            dailyClassId: override ? override.id : null,
            courseId: slot.courseId,
            course: course || { subjectName: 'Unknown', subjectCode: 'UNK', teacherName: 'N/A' },
            startTime: slot.startTime,
            endTime: slot.endTime,
            room: slot.room,
            group: slot.group,
            status: 'SCHEDULED',
            isExtra: false,
            attendanceStatus: null as string | null,
            studentId: student.id,
            date: dateStr
          };

          if (override) {
            classItem.id = `override-${override.id}`;
            classItem.startTime = override.startTime;
            classItem.endTime = override.endTime;
            classItem.room = override.room;
            classItem.group = override.group;
            classItem.status = override.status;
          }

          if (vacationType === 'VACATION') {
            classItem.attendanceStatus = 'VACATION';
          } else if (vacationType === 'ABSENT_DAY') {
            classItem.attendanceStatus = 'ABSENT';
          } else if (classItem.status === 'CANCELLED') {
            classItem.attendanceStatus = 'CANCELLED';
          } else {
            const att = localAttendance.find(a => 
              a.studentId === student.id &&
              a.courseId === slot.courseId &&
              a.date === dateStr &&
              (override ? a.dailyClassId === override.id : a.weeklySlotId === slot.id)
            );
            if (att) {
              classItem.attendanceStatus = att.status;
            }
          }

          activeClasses.push(classItem);
        });

        const extras = dateOverrides.filter(o => o.isExtra);
        extras.forEach(extra => {
          const course = sCourses.find(c => c.id === extra.courseId);
          let classItem = {
            id: `extra-${extra.id}`,
            weeklySlotId: null,
            dailyClassId: extra.id,
            courseId: extra.courseId,
            course: course || { subjectName: 'Unknown', subjectCode: 'UNK', teacherName: 'N/A' },
            startTime: extra.startTime,
            endTime: extra.endTime,
            room: extra.room,
            group: extra.group,
            status: extra.status,
            isExtra: true,
            attendanceStatus: null as string | null,
            studentId: student.id,
            date: dateStr
          };

          if (vacationType === 'VACATION') {
            classItem.attendanceStatus = 'VACATION';
          } else if (vacationType === 'ABSENT_DAY') {
            classItem.attendanceStatus = 'ABSENT';
          } else if (classItem.status === 'CANCELLED') {
            classItem.attendanceStatus = 'CANCELLED';
          } else {
            const att = localAttendance.find(a => 
              a.studentId === student.id &&
              a.courseId === extra.courseId &&
              a.date === dateStr &&
              a.dailyClassId === extra.id
            );
            if (att) {
              classItem.attendanceStatus = att.status;
            }
          }

          activeClasses.push(classItem);
        });

        activeClasses.sort((a, b) => a.startTime.localeCompare(b.startTime));

        resolved[student.id].dates[dateStr] = {
          dayName,
          vacationType,
          classes: activeClasses
        };
      });
    });

    return resolved;
  };

  // Load calendar grid classes
  const loadCalendarData = async () => {
    let startStr = '';
    let endStr = '';

    const current = new Date(viewDate);
    if (calendarMode === 'daily') {
      startStr = viewDate;
      endStr = viewDate;
    } else if (calendarMode === 'weekly') {
      const day = current.getDay();
      const diff = current.getDate() - day;
      const sun = new Date(current.setDate(diff));
      startStr = sun.toISOString().split('T')[0];

      const sat = new Date(sun);
      sat.setDate(sun.getDate() + 6);
      endStr = sat.toISOString().split('T')[0];
    } else {
      const year = current.getFullYear();
      const month = current.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      const startOffset = firstDay.getDay();
      const startPad = new Date(firstDay);
      startPad.setDate(firstDay.getDate() - startOffset);
      startStr = startPad.toISOString().split('T')[0];

      const endOffset = 6 - lastDay.getDay();
      const endPad = new Date(lastDay);
      endPad.setDate(lastDay.getDate() + endOffset);
      endStr = endPad.toISOString().split('T')[0];
    }

    if (isDemoMode) {
      const data = resolveLocalCalendarRange(startStr, endStr);
      setCalendarData(data);
    } else {
      try {
        const res = await fetch(`/api/calendar?startDate=${startStr}&endDate=${endStr}`);
        if (res.ok) {
          const data = await res.json();
          setCalendarData(data);
        }
      } catch (err) {
        setIsDemoMode(true);
      }
    }
  };

  // Load attendance counts & statistics
  const loadAnalyticsData = async (customStart?: string, customEnd?: string) => {
    const startStr = customStart || customRange.start;
    const endStr = customEnd || customRange.end;

    if (isDemoMode) {
      const student = students.find(s => s.id === selectedStudentId);
      const studentStartDate = student?.courseStartDate || '2026-01-01';
      const sCourses = courses[selectedStudentId] || [];
      const sSlots = weeklySlots[selectedStudentId] || [];
      
      let held = 0;
      let present = 0;
      let absent = 0;
      let cancelled = 0;

      const subjectBreakdown = sCourses.map(c => {
        let cHeld = 0;
        let cPres = 0;
        let cAbs = 0;
        let cCan = 0;

        const tempDate = new Date(startStr);
        const endDate = new Date(endStr);
        
        while (tempDate <= endDate) {
          const dateStr = tempDate.toISOString().split('T')[0];
          if (dateStr < studentStartDate) {
            tempDate.setDate(tempDate.getDate() + 1);
            continue;
          }
          const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
          const dayName = days[tempDate.getDay()];

          const vac = localVacations.find(v => v.studentId === selectedStudentId && v.date === dateStr);
          
          if (!vac || vac.type !== 'VACATION') {
            const daySlots = sSlots.filter(s => s.courseId === c.id && s.dayOfWeek === dayName);
            const dateOverrides = localOverrides.filter(o => o.studentId === selectedStudentId && o.date === dateStr && o.courseId === c.id);

            daySlots.forEach(slot => {
              const override = dateOverrides.find(o => o.weeklySlotId === slot.id);
              let status = override ? override.status : 'SCHEDULED';

              if (status === 'CANCELLED') {
                cCan++;
              } else {
                cHeld++;
                let attStatus = null;
                if (vac && vac.type === 'ABSENT_DAY') {
                  attStatus = 'ABSENT';
                } else {
                  const att = localAttendance.find(a => 
                    a.studentId === selectedStudentId &&
                    a.courseId === c.id &&
                    a.date === dateStr &&
                    (override ? a.dailyClassId === override.id : a.weeklySlotId === slot.id)
                  );
                  if (att) attStatus = att.status;
                }

                if (attStatus === 'PRESENT') cPres++;
                else if (attStatus === 'ABSENT') cAbs++;
              }
            });

            const extras = dateOverrides.filter(o => o.isExtra);
            extras.forEach(extra => {
              if (extra.status === 'CANCELLED') {
                cCan++;
              } else {
                cHeld++;
                let attStatus = null;
                if (vac && vac.type === 'ABSENT_DAY') {
                  attStatus = 'ABSENT';
                } else {
                  const att = localAttendance.find(a => 
                    a.studentId === selectedStudentId &&
                    a.courseId === c.id &&
                    a.date === dateStr &&
                    a.dailyClassId === extra.id
                  );
                  if (att) attStatus = att.status;
                }

                if (attStatus === 'PRESENT') cPres++;
                else if (attStatus === 'ABSENT') cAbs++;
              }
            });
          }

          tempDate.setDate(tempDate.getDate() + 1);
        }

        const percentage = cHeld > 0 ? Math.round((cPres / cHeld) * 100) : 100;
        return {
          courseId: c.id,
          subjectName: c.subjectName,
          subjectCode: c.subjectCode,
          held: cHeld,
          present: cPres,
          absent: cAbs,
          cancelled: cCan,
          percentage
        };
      });

      subjectBreakdown.forEach(s => {
        held += s.held;
        present += s.present;
        absent += s.absent;
        cancelled += s.cancelled;
      });

      const overall = held > 0 ? Math.round((present / held) * 100) : 100;

      setAnalyticsData({
        range: { start: startStr, end: endStr },
        summary: {
          totalClassesHeld: held,
          totalPresent: present,
          totalAbsent: absent,
          totalCancelled: cancelled,
          overallPercentage: overall
        },
        subjects: subjectBreakdown
      });
    } else {
      try {
        const res = await fetch(`/api/attendance?studentId=${selectedStudentId}&startDate=${startStr}&endDate=${endStr}`);
        if (res.ok) {
          const data = await res.json();
          setAnalyticsData(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Toggle single class attendance (Present / Absent)
  const toggleAttendance = async (studentId: number, classItem: any, date: string, targetStatus: string) => {
    if (classItem.attendanceStatus === 'VACATION') return;

    if (isDemoMode) {
      const existingIdx = localAttendance.findIndex(a => 
        a.studentId === studentId && 
        a.courseId === classItem.courseId && 
        a.date === date && 
        a.weeklySlotId === classItem.weeklySlotId &&
        a.dailyClassId === classItem.dailyClassId
      );

      let updated = [...localAttendance];
      if (existingIdx > -1) {
        if (updated[existingIdx].status === targetStatus) {
          updated.splice(existingIdx, 1);
        } else {
          updated[existingIdx].status = targetStatus;
        }
      } else {
        updated.push({
          studentId,
          courseId: classItem.courseId,
          date,
          status: targetStatus,
          weeklySlotId: classItem.weeklySlotId,
          dailyClassId: classItem.dailyClassId
        });
      }

      setLocalAttendance(updated);
      saveDemoItems('routine_local_attendance', updated);
    } else {
      try {
        const currentStatus = classItem.attendanceStatus;
        const finalStatus = currentStatus === targetStatus ? 'NONE' : targetStatus;

        const res = await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId,
            courseId: classItem.courseId,
            date,
            status: finalStatus === 'NONE' ? 'ABSENT' : finalStatus,
            weeklySlotId: classItem.weeklySlotId,
            dailyClassId: classItem.dailyClassId
          })
        });

        if (res.ok) {
          loadCalendarData();
          loadAnalyticsData();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Reschedule / Cancel class override
  const handleSaveOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;

    if (isDemoMode) {
      const newOverride = {
        id: Date.now(),
        studentId: selectedStudentId,
        courseId: parseInt(overrideData.courseId),
        weeklySlotId: overrideData.weeklySlotId,
        date: selectedClass.date,
        startTime: overrideData.startTime,
        endTime: overrideData.endTime,
        room: overrideData.room,
        group: overrideData.group,
        status: overrideData.status,
        isExtra: overrideData.isExtra
      };

      const updated = [...localOverrides, newOverride];
      setLocalOverrides(updated);
      saveDemoItems('routine_local_overrides', updated);
      
      if (overrideData.status === 'CANCELLED') {
        const updatedAtt = [...localAttendance, {
          studentId: selectedStudentId,
          courseId: parseInt(overrideData.courseId),
          date: selectedClass.date,
          status: 'CANCELLED',
          weeklySlotId: overrideData.weeklySlotId,
          dailyClassId: newOverride.id
        }];
        setLocalAttendance(updatedAtt);
        saveDemoItems('routine_local_attendance', updatedAtt);
      }

      setShowOverrideModal(false);
      setSelectedClass(null);
    } else {
      try {
        const res = await fetch('/api/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: selectedStudentId,
            courseId: parseInt(overrideData.courseId),
            weeklySlotId: overrideData.weeklySlotId,
            date: selectedClass.date,
            startTime: overrideData.startTime,
            endTime: overrideData.endTime,
            room: overrideData.room,
            group: overrideData.group,
            status: overrideData.status,
            isExtra: overrideData.isExtra
          })
        });

        if (res.ok) {
          setShowOverrideModal(false);
          setSelectedClass(null);
          loadCalendarData();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Log vacations / absent days
  const handleSaveVacation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode) {
      const startStr = vacationData.date;
      const endStr = vacationData.endDate || vacationData.date;
      const start = new Date(startStr);
      const end = new Date(endStr);
      const dates: string[] = [];
      const temp = new Date(start);
      while (temp <= end) {
        dates.push(temp.toISOString().split('T')[0]);
        temp.setDate(temp.getDate() + 1);
      }

      let updated = [...localVacations];

      if (vacationData.type === 'NONE') {
        updated = updated.filter(v => !(v.studentId === selectedStudentId && dates.includes(v.date)));
      } else {
        dates.forEach((dStr, idx) => {
          const existingIdx = updated.findIndex(v => v.studentId === selectedStudentId && v.date === dStr);
          if (existingIdx > -1) {
            updated[existingIdx] = {
              ...updated[existingIdx],
              type: vacationData.type,
              description: vacationData.description || ''
            };
          } else {
            updated.push({
              id: Date.now() + idx,
              studentId: selectedStudentId,
              date: dStr,
              type: vacationData.type,
              description: vacationData.description || ''
            });
          }
        });
      }

      setLocalVacations(updated);
      saveDemoItems('routine_local_vacations', updated);
      setShowVacationModal(false);
    } else {
      try {
        const res = await fetch('/api/vacations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: selectedStudentId,
            date: vacationData.date,
            endDate: vacationData.endDate || null,
            type: vacationData.type,
            description: vacationData.description
          })
        });

        if (res.ok) {
          setShowVacationModal(false);
          loadCalendarData();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Add / Edit Subject course details
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode) {
      const sCourses = courses[selectedStudentId] || [];
      let updated = [...sCourses];

      if (courseFormData.id) {
        const idx = updated.findIndex(c => c.id === parseInt(courseFormData.id));
        if (idx > -1) {
          updated[idx] = {
            ...updated[idx],
            subjectId: courseFormData.subjectId,
            subjectName: courseFormData.subjectName,
            subjectCode: courseFormData.subjectCode,
            teacherName: courseFormData.teacherName,
            teacherCode: courseFormData.teacherCode,
            teacherContact: courseFormData.teacherContact,
            teacherEmail: courseFormData.teacherEmail
          };
        }
      } else {
        updated.push({
          id: Date.now(),
          studentId: selectedStudentId,
          subjectId: courseFormData.subjectId,
          subjectName: courseFormData.subjectName,
          subjectCode: courseFormData.subjectCode,
          teacherName: courseFormData.teacherName,
          teacherCode: courseFormData.teacherCode,
          teacherContact: courseFormData.teacherContact,
          teacherEmail: courseFormData.teacherEmail
        });
      }

      const allCourses = { ...courses, [selectedStudentId]: updated };
      setCourses(allCourses);
      saveDemoItems('routine_local_courses', allCourses);
      setShowAddCourseModal(false);
    } else {
      try {
        const res = await fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...courseFormData,
            studentId: selectedStudentId
          })
        });
        if (res.ok) {
          checkDatabaseConnection();
          setShowAddCourseModal(false);
        } else {
          const errData = await res.json();
          alert(errData.error || 'Failed to save course');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Add / Edit default Weekly slots
  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode) {
      const sSlots = weeklySlots[selectedStudentId] || [];
      let updated = [...sSlots];

      if (slotFormData.id) {
        const idx = updated.findIndex(s => s.id === parseInt(slotFormData.id));
        if (idx > -1) {
          updated[idx] = {
            ...updated[idx],
            courseId: parseInt(slotFormData.courseId),
            dayOfWeek: slotFormData.dayOfWeek,
            startTime: slotFormData.startTime,
            endTime: slotFormData.endTime,
            room: slotFormData.room,
            group: slotFormData.group
          };
        }
      } else {
        updated.push({
          id: Date.now(),
          studentId: selectedStudentId,
          courseId: parseInt(slotFormData.courseId),
          dayOfWeek: slotFormData.dayOfWeek,
          startTime: slotFormData.startTime,
          endTime: slotFormData.endTime,
          room: slotFormData.room,
          group: slotFormData.group
        });
      }

      const allSlots = { ...weeklySlots, [selectedStudentId]: updated };
      setWeeklySlots(allSlots);
      saveDemoItems('routine_local_slots', allSlots);
      setShowAddSlotModal(false);
    } else {
      try {
        const res = await fetch('/api/weekly-slots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...slotFormData,
            studentId: selectedStudentId
          })
        });
        if (res.ok) {
          loadCalendarData();
          setShowAddSlotModal(false);
          checkDatabaseConnection();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openCustomClassModal = (studentId: number, dateStr?: string) => {
    const sCourses = courses[studentId] || [];
    const defaultCourseId = sCourses.length > 0 ? String(sCourses[0].id) : '';
    setCustomClassFormData({
      studentId: String(studentId),
      courseId: defaultCourseId,
      date: dateStr || currentDate,
      startTime: '09:00',
      endTime: '10:00',
      room: '',
      group: ''
    });
    setShowCustomClassModal(true);
  };

  const handleSaveCustomClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customClassFormData.studentId || !customClassFormData.courseId || !customClassFormData.date) {
      alert('Please fill in student, subject and date fields.');
      return;
    }

    if (isDemoMode) {
      const newOverride = {
        id: Date.now(),
        studentId: parseInt(customClassFormData.studentId),
        courseId: parseInt(customClassFormData.courseId),
        weeklySlotId: null,
        date: customClassFormData.date,
        startTime: customClassFormData.startTime,
        endTime: customClassFormData.endTime,
        room: customClassFormData.room,
        group: customClassFormData.group,
        status: 'SCHEDULED',
        isExtra: true
      };

      const updated = [...localOverrides, newOverride];
      setLocalOverrides(updated);
      saveDemoItems('routine_local_overrides', updated);
      setShowCustomClassModal(false);
      loadCalendarData();
    } else {
      try {
        const res = await fetch('/api/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: parseInt(customClassFormData.studentId),
            courseId: parseInt(customClassFormData.courseId),
            weeklySlotId: null,
            date: customClassFormData.date,
            startTime: customClassFormData.startTime,
            endTime: customClassFormData.endTime,
            room: customClassFormData.room,
            group: customClassFormData.group,
            status: 'SCHEDULED',
            isExtra: true
          })
        });

        if (res.ok) {
          setShowCustomClassModal(false);
          loadCalendarData();
        } else {
          const errData = await res.json();
          alert(errData.error || 'Failed to save custom class');
        }
      } catch (err) {
        console.error(err);
        alert('An error occurred while saving custom class.');
      }
    }
  };

  // Delete Course Subject
  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('Are you sure you want to delete this course? It will delete all schedules and attendances associated with it.')) return;
    
    if (isDemoMode) {
      const sCourses = courses[selectedStudentId] || [];
      const updated = sCourses.filter(c => c.id !== courseId);
      const allCourses = { ...courses, [selectedStudentId]: updated };
      
      const sSlots = weeklySlots[selectedStudentId] || [];
      const updatedSlots = sSlots.filter(s => s.courseId !== courseId);
      const allSlots = { ...weeklySlots, [selectedStudentId]: updatedSlots };

      setCourses(allCourses);
      setWeeklySlots(allSlots);
      saveDemoItems('routine_local_courses', allCourses);
      saveDemoItems('routine_local_slots', allSlots);
    } else {
      try {
        const res = await fetch(`/api/courses?id=${courseId}`, { method: 'DELETE' });
        if (res.ok) {
          checkDatabaseConnection();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Delete weekly slot
  const handleDeleteSlot = async (slotId: number) => {
    if (!confirm('Delete this slot from the default weekly schedule?')) return;

    if (isDemoMode) {
      const sSlots = weeklySlots[selectedStudentId] || [];
      const updated = sSlots.filter(s => s.id !== slotId);
      const allSlots = { ...weeklySlots, [selectedStudentId]: updated };
      setWeeklySlots(allSlots);
      saveDemoItems('routine_local_slots', allSlots);
    } else {
      try {
        const res = await fetch(`/api/weekly-slots?id=${slotId}`, { method: 'DELETE' });
        if (res.ok) {
          loadCalendarData();
          checkDatabaseConnection();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getStudentAccentColor = (studentId: number) => {
    const s = students.find(x => x.id === studentId);
    return s ? s.color : '#2b6cb0';
  };

  const getReadableDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleCalculateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculatingCustom(true);
    loadAnalyticsData(customRange.start, customRange.end).finally(() => {
      setIsCalculatingCustom(false);
    });
  };

  const getTodayClasses = (studentId: number) => {
    if (!calendarData[studentId] || !calendarData[studentId].dates[currentDate]) return [];
    return calendarData[studentId].dates[currentDate].classes;
  };

  const getTodayVacation = (studentId: number) => {
    if (!calendarData[studentId] || !calendarData[studentId].dates[currentDate]) return null;
    return calendarData[studentId].dates[currentDate].vacationType;
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Top Demo Mode Alert */}
      {isDemoMode && (
        <div className="wobbly-box flex-row mb-4" style={{ backgroundColor: '#fffbeb', borderColor: '#d97706', padding: '0.6rem 1.2rem' }}>
          <AlertCircle size={20} color="#d97706" />
          <p className="handwritten" style={{ fontSize: '1.2rem', color: '#b45309' }}>
            Note: App is running in <strong>Demo Mode (Local Storage)</strong> because the MySQL local server was not reachable.
          </p>
        </div>
      )}

      {/* Main App Title Sheet */}
      <div className="wobbly-box mb-4 main-title-sheet" style={{ background: '#ffffff' }}>
        <div>
          <h1 className="sketchy-heading" style={{ fontSize: '2.2rem', marginBottom: '0.2rem' }}>📒 Student Routine Planner</h1>
          <p className="handwritten" style={{ fontSize: '1.4rem', color: '#4a5568' }}>Manage class timetables, holidays, and count attendance for two students side-by-side.</p>
        </div>

        {/* Tab Selection Navigation */}
        <div className="nav-tabs-container">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`sketchy-btn ${activeTab === 'dashboard' ? 'sketchy-btn-accent' : ''}`}
          >
            <BookOpen size={16} /> Daily Planner
          </button>
          <button 
            onClick={() => setActiveTab('calendar')} 
            className={`sketchy-btn ${activeTab === 'calendar' ? 'sketchy-btn-accent' : ''}`}
          >
            <CalendarIcon size={16} /> Interactive Calendar
          </button>
          <button 
            onClick={() => setActiveTab('courses')} 
            className={`sketchy-btn ${activeTab === 'courses' ? 'sketchy-btn-accent' : ''}`}
          >
            <Settings size={16} /> Setup Timetable
          </button>
          <button 
            onClick={() => setActiveTab('analytics')} 
            className={`sketchy-btn ${activeTab === 'analytics' ? 'sketchy-btn-accent' : ''}`}
          >
            <BarChart3 size={16} /> Attendance Stats
          </button>
        </div>
      </div>

      {/* ========================================================================
          Main View Switcher
          ======================================================================== */}
      {activeTab === 'dashboard' && (
        <DashboardView 
          students={students}
          currentDate={currentDate}
          calendarData={calendarData}
          getTodayClasses={getTodayClasses}
          getTodayVacation={getTodayVacation}
          getStudentAccentColor={getStudentAccentColor}
          toggleAttendance={toggleAttendance}
          setSelectedClass={setSelectedClass}
          setShowSubjectModal={setShowSubjectModal}
          analyticsData={analyticsData}
          openCustomClassModal={openCustomClassModal}
        />
      )}

      {activeTab === 'calendar' && (
        <CalendarView 
          students={students}
          selectedStudentId={selectedStudentId}
          setSelectedStudentId={setSelectedStudentId}
          calendarMode={calendarMode}
          setCalendarMode={setCalendarMode}
          viewDate={viewDate}
          setViewDate={setViewDate}
          calendarData={calendarData}
          currentDate={currentDate}
          setSelectedClass={setSelectedClass}
          setShowSubjectModal={setShowSubjectModal}
          setVacationData={setVacationData}
          setShowVacationModal={setShowVacationModal}
          getReadableDate={getReadableDate}
          toggleAttendance={toggleAttendance}
          openCustomClassModal={openCustomClassModal}
        />
      )}

      {activeTab === 'courses' && (
        <SetupView 
          students={students}
          selectedStudentId={selectedStudentId}
          setSelectedStudentId={setSelectedStudentId}
          courses={courses}
          weeklySlots={weeklySlots}
          setCourseFormData={setCourseFormData}
          setShowAddCourseModal={setShowAddCourseModal}
          setSlotFormData={setSlotFormData}
          setShowAddSlotModal={setShowAddSlotModal}
          handleDeleteCourse={handleDeleteCourse}
          handleDeleteSlot={handleDeleteSlot}
          handleUpdateStartDate={handleUpdateStartDate}
        />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsView 
          students={students}
          selectedStudentId={selectedStudentId}
          setSelectedStudentId={setSelectedStudentId}
          analyticsData={analyticsData}
          customRange={customRange}
          setCustomRange={setCustomRange}
          handleCalculateCustom={handleCalculateCustom}
          isCalculatingCustom={isCalculatingCustom}
        />
      )}

      {/* ========================================================================
          Interactive Modal Overlays
          ======================================================================== */}
      {showSubjectModal && (
        <SubjectModal 
          selectedClass={selectedClass}
          setShowSubjectModal={setShowSubjectModal}
          setOverrideData={setOverrideData}
          setShowOverrideModal={setShowOverrideModal}
          toggleAttendance={toggleAttendance}
        />
      )}

      {showOverrideModal && (
        <OverrideModal 
          selectedClass={selectedClass}
          currentDate={currentDate}
          overrideData={overrideData}
          setOverrideData={setOverrideData}
          handleSaveOverride={handleSaveOverride}
          setShowOverrideModal={setShowOverrideModal}
          setSelectedClass={setSelectedClass}
        />
      )}

      {showVacationModal && (
        <VacationModal 
          vacationData={vacationData}
          setVacationData={setVacationData}
          handleSaveVacation={handleSaveVacation}
          setShowVacationModal={setShowVacationModal}
        />
      )}

      {showAddCourseModal && (
        <CourseModal 
          courseFormData={courseFormData}
          setCourseFormData={setCourseFormData}
          handleSaveCourse={handleSaveCourse}
          setShowAddCourseModal={setShowAddCourseModal}
        />
      )}

      {showAddSlotModal && (
        <SlotModal 
          courses={courses}
          selectedStudentId={selectedStudentId}
          slotFormData={slotFormData}
          setSlotFormData={setSlotFormData}
          handleSaveSlot={handleSaveSlot}
          setShowAddSlotModal={setShowAddSlotModal}
        />
      )}

      {showCustomClassModal && (
        <CustomClassModal 
          students={students}
          courses={courses}
          customClassFormData={customClassFormData}
          setCustomClassFormData={setCustomClassFormData}
          handleSaveCustomClass={handleSaveCustomClass}
          setShowCustomClassModal={setShowCustomClassModal}
        />
      )}
    </div>
  );
}
