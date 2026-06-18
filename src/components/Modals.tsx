'use client';

import React from 'react';
import { X, Clock, MapPin, User, Mail, Phone, FileText, Edit3, Check } from 'lucide-react';

// ============================================================================
// 1. SUBJECT DETAIL MODAL
// ============================================================================
interface SubjectModalProps {
  selectedClass: any;
  setShowSubjectModal: (show: boolean) => void;
  setOverrideData: (data: any) => void;
  setShowOverrideModal: (show: boolean) => void;
  toggleAttendance: (studentId: number, classItem: any, date: string, status: string) => void;
}

export function SubjectModal({
  selectedClass,
  setShowSubjectModal,
  setOverrideData,
  setShowOverrideModal,
  toggleAttendance
}: SubjectModalProps) {
  if (!selectedClass) return null;

  return (
    <div className="paper-modal-overlay" onClick={() => setShowSubjectModal(false)}>
      <div className="paper-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setShowSubjectModal(false)}><X /></button>
        <div className="tape-decor"></div>
        
        <span className="highlight-yellow handwritten" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Subject Detail Sheet</span>
        
        <h2 className="sketchy-heading" style={{ fontSize: '1.6rem', marginTop: '0.6rem', marginBottom: '1rem' }}>
          📚 {selectedClass.course.subjectName}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }} className="handwritten">
          <div className="flex-row">
            <FileText size={18} /> <strong>Subject Code:</strong> {selectedClass.course.subjectCode} ({selectedClass.course.subjectId})
          </div>
          <div className="flex-row">
            <Clock size={18} /> <strong>Session Schedule:</strong> {selectedClass.startTime} - {selectedClass.endTime}
          </div>
          {selectedClass.room && (
            <div className="flex-row">
              <MapPin size={18} /> <strong>Assigned Room:</strong> {selectedClass.room}
            </div>
          )}
        </div>

        {/* Teacher Details */}
        <div className="wobbly-box mt-4" style={{ background: '#f7fafc', padding: '1rem' }}>
          <div className="tape-decor-angle"></div>
          <h3 className="sketchy-heading" style={{ fontSize: '0.9rem', marginBottom: '0.6rem' }}>🧑‍🏫 Instructor File</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }} className="handwritten">
            <div className="flex-row" style={{ fontSize: '1.2rem' }}>
              <User size={14} /> <strong>Name:</strong> {selectedClass.course.teacherName} {selectedClass.course.teacherCode && `(${selectedClass.course.teacherCode})`}
            </div>
            {selectedClass.course.teacherContact && selectedClass.course.teacherContact !== 'TBA' && (
              <div className="flex-row" style={{ fontSize: '1.1rem' }}>
                <Phone size={14} /> <strong>Contact:</strong> {selectedClass.course.teacherContact}
              </div>
            )}
            {selectedClass.course.teacherEmail && selectedClass.course.teacherEmail !== 'TBA' && (
              <div className="flex-row" style={{ fontSize: '1.1rem' }}>
                <Mail size={14} /> <strong>Email:</strong> {selectedClass.course.teacherEmail}
              </div>
            )}
          </div>
        </div>

        {/* Class Instance Attendance Logging */}
        <div className="wobbly-box mt-4" style={{ padding: '1rem', background: '#f0fff4', borderColor: '#2f855a' }}>
          <h3 className="sketchy-heading" style={{ fontSize: '0.9rem', marginBottom: '0.6rem', color: '#2f855a' }}>
            📅 Class Date: {selectedClass.date}
          </h3>
          <div className="flex-between">
            <span className="handwritten" style={{ fontSize: '1.2rem' }}>
              Current Status: <strong>{selectedClass.attendanceStatus || 'SCHEDULED'}</strong>
            </span>
            <div className="flex-row">
              <button 
                onClick={() => {
                  toggleAttendance(selectedClass.studentId, selectedClass, selectedClass.date, 'PRESENT');
                  setShowSubjectModal(false);
                }}
                className={`sketchy-btn ${selectedClass.attendanceStatus === 'PRESENT' ? 'class-status-present' : ''}`}
                style={{ padding: '0.3rem 0.6rem', border: '1px solid #718096', boxShadow: 'none' }}
                title="Mark Done / Present"
              >
                <Check size={14} /> Done
              </button>
              <button 
                onClick={() => {
                  toggleAttendance(selectedClass.studentId, selectedClass, selectedClass.date, 'ABSENT');
                  setShowSubjectModal(false);
                }}
                className={`sketchy-btn ${selectedClass.attendanceStatus === 'ABSENT' ? 'class-status-absent' : ''}`}
                style={{ padding: '0.3rem 0.6rem', border: '1px solid #718096', boxShadow: 'none' }}
                title="Mark Absent"
              >
                <X size={14} /> Absent
              </button>
            </div>
          </div>
        </div>

        {/* Quick override controls */}
        <div className="mt-4 flex-row" style={{ justifyContent: 'flex-end' }}>
          <button 
            onClick={() => {
              setOverrideData({
                courseId: String(selectedClass.courseId),
                startTime: selectedClass.startTime,
                endTime: selectedClass.endTime,
                room: selectedClass.room || '',
                group: selectedClass.group || '',
                status: selectedClass.status,
                weeklySlotId: selectedClass.weeklySlotId,
                isExtra: selectedClass.isExtra
              });
              setShowSubjectModal(false);
              setShowOverrideModal(true);
            }}
            className="sketchy-btn sketchy-btn-accent"
          >
            <Edit3 size={14} /> Reschedule / Cancel Session
          </button>
          <button onClick={() => setShowSubjectModal(false)} className="sketchy-btn">
            Close Page
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. OVERRIDE SESSION MODAL (Cancellations, Rescheduling)
// ============================================================================
interface OverrideModalProps {
  selectedClass: any;
  currentDate: string;
  overrideData: any;
  setOverrideData: (data: any) => void;
  handleSaveOverride: (e: React.FormEvent) => void;
  setShowOverrideModal: (show: boolean) => void;
  setSelectedClass: (c: any) => void;
}

export function OverrideModal({
  selectedClass,
  currentDate,
  overrideData,
  setOverrideData,
  handleSaveOverride,
  setShowOverrideModal,
  setSelectedClass
}: OverrideModalProps) {
  if (!selectedClass) return null;

  return (
    <div className="paper-modal-overlay" onClick={() => { setShowOverrideModal(false); setSelectedClass(null); }}>
      <div className="paper-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => { setShowOverrideModal(false); setSelectedClass(null); }}><X /></button>
        <div className="tape-decor"></div>
        
        <h2 className="sketchy-heading" style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>✏ Edit Class Session Override</h2>
        <p className="handwritten mb-4" style={{ fontSize: '1.1rem', color: '#718096' }}>Modifying this session only on the date: <strong>{selectedClass.date}</strong></p>

        <form onSubmit={handleSaveOverride} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Course ID</label>
            <input type="text" value={selectedClass.course.subjectName} disabled className="wobbly-input" style={{ background: '#edf2f7' }} />
          </div>
          
          <div className="grid-cols-2">
            <div>
              <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Start Time</label>
              <input 
                type="time" 
                value={overrideData.startTime} 
                onChange={(e) => setOverrideData({ ...overrideData, startTime: e.target.value })}
                className="wobbly-input" 
                required 
              />
            </div>
            <div>
              <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>End Time</label>
              <input 
                type="time" 
                value={overrideData.endTime} 
                onChange={(e) => setOverrideData({ ...overrideData, endTime: e.target.value })}
                className="wobbly-input" 
                required 
              />
            </div>
          </div>

          <div className="grid-cols-2">
            <div>
              <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Room</label>
              <input 
                type="text" 
                value={overrideData.room} 
                onChange={(e) => setOverrideData({ ...overrideData, room: e.target.value })}
                className="wobbly-input" 
              />
            </div>
            <div>
              <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Group</label>
              <input 
                type="text" 
                value={overrideData.group} 
                onChange={(e) => setOverrideData({ ...overrideData, group: e.target.value })}
                className="wobbly-input" 
              />
            </div>
          </div>

          <div>
            <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Status</label>
            <select 
              value={overrideData.status} 
              onChange={(e) => setOverrideData({ ...overrideData, status: e.target.value })}
              className="wobbly-input"
              style={{ padding: '0.4rem' }}
            >
              <option value="SCHEDULED">Scheduled (Default)</option>
              <option value="RESCHEDULED">Rescheduled (Time/Room Modified)</option>
              <option value="CANCELLED">Cancelled (No Class Held)</option>
            </select>
          </div>

          <div className="flex-row mt-4" style={{ justifyContent: 'flex-end' }}>
            <button type="submit" className="sketchy-btn sketchy-btn-accent">Save Override</button>
            <button type="button" onClick={() => { setShowOverrideModal(false); setSelectedClass(null); }} className="sketchy-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 3. VACATION / SICK DAY LOGGING MODAL
// ============================================================================
interface VacationModalProps {
  vacationData: any;
  setVacationData: (data: any) => void;
  handleSaveVacation: (e: React.FormEvent) => void;
  setShowVacationModal: (show: boolean) => void;
}

export function VacationModal({
  vacationData,
  setVacationData,
  handleSaveVacation,
  setShowVacationModal
}: VacationModalProps) {
  return (
    <div className="paper-modal-overlay" onClick={() => setShowVacationModal(false)}>
      <div className="paper-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setShowVacationModal(false)}><X /></button>
        <div className="tape-decor"></div>

        <h2 className="sketchy-heading" style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>✏ Log Vacation or Absent Day</h2>

        <form onSubmit={handleSaveVacation} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="grid-cols-2">
            <div>
              <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Start Date</label>
              <input 
                type="date" 
                value={vacationData.date} 
                onChange={(e) => setVacationData({ ...vacationData, date: e.target.value })}
                className="wobbly-input" 
                required 
              />
            </div>
            <div>
              <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>End Date (Optional)</label>
              <input 
                type="date" 
                value={vacationData.endDate || ''} 
                onChange={(e) => setVacationData({ ...vacationData, endDate: e.target.value })}
                className="wobbly-input" 
              />
            </div>
          </div>

          <div>
            <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Type</label>
            <select 
              value={vacationData.type} 
              onChange={(e) => setVacationData({ ...vacationData, type: e.target.value })}
              className="wobbly-input"
              style={{ padding: '0.4rem' }}
            >
              <option value="VACATION">Vacation (No classes held, does not count in attendance)</option>
              <option value="ABSENT_DAY">Absent Day (Classes held, student absent all day)</option>
              <option value="NONE">None (Clear vacation status for this date)</option>
            </select>
          </div>

          <div>
            <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Description / Reason</label>
            <input 
              type="text" 
              value={vacationData.description} 
              onChange={(e) => setVacationData({ ...vacationData, description: e.target.value })}
              placeholder="e.g. Eid Vacation, Fever..."
              className="wobbly-input" 
            />
          </div>

          <div className="flex-row mt-4" style={{ justifyContent: 'flex-end' }}>
            <button type="submit" className="sketchy-btn sketchy-btn-accent">Save Log</button>
            <button type="button" onClick={() => setShowVacationModal(false)} className="sketchy-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 4. SUBJECT / COURSE CRUD MODAL
// ============================================================================
interface CourseModalProps {
  courseFormData: any;
  setCourseFormData: (data: any) => void;
  handleSaveCourse: (e: React.FormEvent) => void;
  setShowAddCourseModal: (show: boolean) => void;
}

export function CourseModal({
  courseFormData,
  setCourseFormData,
  handleSaveCourse,
  setShowAddCourseModal
}: CourseModalProps) {
  return (
    <div className="paper-modal-overlay" onClick={() => setShowAddCourseModal(false)}>
      <div className="paper-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setShowAddCourseModal(false)}><X /></button>
        <div className="tape-decor"></div>

        <h2 className="sketchy-heading" style={{ fontSize: '1.4rem', marginBottom: '1.2rem' }}>
          {courseFormData.id ? '✏ Edit Subject Details' : '📚 Add Subject Course'}
        </h2>

        <form onSubmit={handleSaveCourse} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Subject Code (Display)</label>
            <input 
              type="text" 
              value={courseFormData.subjectCode} 
              onChange={(e) => setCourseFormData({ ...courseFormData, subjectCode: e.target.value })}
              placeholder="e.g. CSE 1101"
              className="wobbly-input" 
              required 
            />
          </div>

          <div>
            <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Subject ID (Unique Key)</label>
            <input 
              type="text" 
              value={courseFormData.subjectId} 
              onChange={(e) => setCourseFormData({ ...courseFormData, subjectId: e.target.value })}
              placeholder="e.g. CSE-1101"
              className="wobbly-input" 
              required 
              disabled={!!courseFormData.id}
            />
          </div>

          <div>
            <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Subject Name</label>
            <input 
              type="text" 
              value={courseFormData.subjectName} 
              onChange={(e) => setCourseFormData({ ...courseFormData, subjectName: e.target.value })}
              placeholder="e.g. Structured Programming"
              className="wobbly-input" 
              required 
            />
          </div>

          <div className="grid-cols-2">
            <div>
              <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Teacher Name</label>
              <input 
                type="text" 
                value={courseFormData.teacherName} 
                onChange={(e) => setCourseFormData({ ...courseFormData, teacherName: e.target.value })}
                className="wobbly-input" 
              />
            </div>
            <div>
              <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Teacher Code</label>
              <input 
                type="text" 
                value={courseFormData.teacherCode} 
                onChange={(e) => setCourseFormData({ ...courseFormData, teacherCode: e.target.value })}
                placeholder="e.g. KMS"
                className="wobbly-input" 
              />
            </div>
          </div>

          <div className="grid-cols-2">
            <div>
              <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Teacher Contact</label>
              <input 
                type="text" 
                value={courseFormData.teacherContact} 
                onChange={(e) => setCourseFormData({ ...courseFormData, teacherContact: e.target.value })}
                className="wobbly-input" 
              />
            </div>
            <div>
              <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Teacher Email</label>
              <input 
                type="email" 
                value={courseFormData.teacherEmail} 
                onChange={(e) => setCourseFormData({ ...courseFormData, teacherEmail: e.target.value })}
                className="wobbly-input" 
              />
            </div>
          </div>

          <div className="flex-row mt-4" style={{ justifyContent: 'flex-end' }}>
            <button type="submit" className="sketchy-btn sketchy-btn-accent">Save Subject</button>
            <button type="button" onClick={() => setShowAddCourseModal(false)} className="sketchy-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 5. TIMETABLE SLOT CRUD MODAL
// ============================================================================
interface SlotModalProps {
  courses: Record<number, any[]>;
  selectedStudentId: number;
  slotFormData: any;
  setSlotFormData: (data: any) => void;
  handleSaveSlot: (e: React.FormEvent) => void;
  setShowAddSlotModal: (show: boolean) => void;
}

export function SlotModal({
  courses,
  selectedStudentId,
  slotFormData,
  setSlotFormData,
  handleSaveSlot,
  setShowAddSlotModal
}: SlotModalProps) {
  return (
    <div className="paper-modal-overlay" onClick={() => setShowAddSlotModal(false)}>
      <div className="paper-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setShowAddSlotModal(false)}><X /></button>
        <div className="tape-decor"></div>

        <h2 className="sketchy-heading" style={{ fontSize: '1.4rem', marginBottom: '1.2rem' }}>
          {slotFormData.id ? '✏ Edit Weekly Slot' : '🕒 Add Recurring Timetable Slot'}
        </h2>

        <form onSubmit={handleSaveSlot} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Select Subject</label>
            <select 
              value={slotFormData.courseId} 
              onChange={(e) => setSlotFormData({ ...slotFormData, courseId: e.target.value })}
              className="wobbly-input"
              style={{ padding: '0.4rem' }}
              required
            >
              {(courses[selectedStudentId] || []).map(c => (
                <option key={c.id} value={c.id}>{c.subjectCode} - {c.subjectName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Day of Week</label>
            <select 
              value={slotFormData.dayOfWeek} 
              onChange={(e) => setSlotFormData({ ...slotFormData, dayOfWeek: e.target.value })}
              className="wobbly-input"
              style={{ padding: '0.4rem' }}
              required
            >
              {['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          <div className="grid-cols-2">
            <div>
              <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Start Time</label>
              <input 
                type="time" 
                value={slotFormData.startTime} 
                onChange={(e) => setSlotFormData({ ...slotFormData, startTime: e.target.value })}
                className="wobbly-input" 
                required 
              />
            </div>
            <div>
              <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>End Time</label>
              <input 
                type="time" 
                value={slotFormData.endTime} 
                onChange={(e) => setSlotFormData({ ...slotFormData, endTime: e.target.value })}
                className="wobbly-input" 
                required 
              />
            </div>
          </div>

          <div className="grid-cols-2">
            <div>
              <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Room</label>
              <input 
                type="text" 
                value={slotFormData.room} 
                onChange={(e) => setSlotFormData({ ...slotFormData, room: e.target.value })}
                placeholder="e.g. 107"
                className="wobbly-input" 
              />
            </div>
            <div>
              <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Group</label>
              <input 
                type="text" 
                value={slotFormData.group} 
                onChange={(e) => setSlotFormData({ ...slotFormData, group: e.target.value })}
                placeholder="e.g. Group A / C1"
                className="wobbly-input" 
              />
            </div>
          </div>

          <div className="flex-row mt-4" style={{ justifyContent: 'flex-end' }}>
            <button type="submit" className="sketchy-btn sketchy-btn-accent">Save Slot</button>
            <button type="button" onClick={() => setShowAddSlotModal(false)} className="sketchy-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 6. CUSTOM / EXTRA CLASS CRUD MODAL
// ============================================================================
interface CustomClassModalProps {
  students: any[];
  courses: Record<number, any[]>;
  customClassFormData: {
    studentId: string;
    courseId: string;
    date: string;
    startTime: string;
    endTime: string;
    room: string;
    group: string;
  };
  setCustomClassFormData: (data: any) => void;
  handleSaveCustomClass: (e: React.FormEvent) => void;
  setShowCustomClassModal: (show: boolean) => void;
}

export function CustomClassModal({
  students,
  courses,
  customClassFormData,
  setCustomClassFormData,
  handleSaveCustomClass,
  setShowCustomClassModal
}: CustomClassModalProps) {
  const currentStudentId = parseInt(customClassFormData.studentId) || (students.length > 0 ? students[0].id : 1);
  const studentCourses = courses[currentStudentId] || [];

  return (
    <div className="paper-modal-overlay" onClick={() => setShowCustomClassModal(false)}>
      <div className="paper-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setShowCustomClassModal(false)}><X /></button>
        <div className="tape-decor"></div>

        <h2 className="sketchy-heading" style={{ fontSize: '1.4rem', marginBottom: '1.2rem' }}>
          ➕ Add Custom Class Session
        </h2>

        <form onSubmit={handleSaveCustomClass} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Select Student</label>
            <select 
              value={customClassFormData.studentId} 
              onChange={(e) => {
                const newStudentId = e.target.value;
                const nextCourses = courses[parseInt(newStudentId)] || [];
                const defaultCourseId = nextCourses.length > 0 ? String(nextCourses[0].id) : '';
                setCustomClassFormData({ 
                  ...customClassFormData, 
                  studentId: newStudentId,
                  courseId: defaultCourseId
                });
              }}
              className="wobbly-input"
              style={{ padding: '0.4rem' }}
              required
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Select Subject</label>
            {studentCourses.length === 0 ? (
              <div style={{ color: '#c53030', fontFamily: 'var(--font-hand)', fontSize: '1.2rem', padding: '0.5rem 0' }}>
                ⚠️ No courses found for this student. Add courses in Setup tab first!
              </div>
            ) : (
              <select 
                value={customClassFormData.courseId} 
                onChange={(e) => setCustomClassFormData({ ...customClassFormData, courseId: e.target.value })}
                className="wobbly-input"
                style={{ padding: '0.4rem' }}
                required
              >
                {studentCourses.map(c => (
                  <option key={c.id} value={c.id}>{c.subjectCode} - {c.subjectName}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Date</label>
            <input 
              type="date" 
              value={customClassFormData.date} 
              onChange={(e) => setCustomClassFormData({ ...customClassFormData, date: e.target.value })}
              className="wobbly-input" 
              required 
            />
          </div>

          <div className="grid-cols-2">
            <div>
              <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Start Time</label>
              <input 
                type="time" 
                value={customClassFormData.startTime} 
                onChange={(e) => setCustomClassFormData({ ...customClassFormData, startTime: e.target.value })}
                className="wobbly-input" 
                required 
              />
            </div>
            <div>
              <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>End Time</label>
              <input 
                type="time" 
                value={customClassFormData.endTime} 
                onChange={(e) => setCustomClassFormData({ ...customClassFormData, endTime: e.target.value })}
                className="wobbly-input" 
                required 
              />
            </div>
          </div>

          <div className="grid-cols-2">
            <div>
              <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Room</label>
              <input 
                type="text" 
                value={customClassFormData.room} 
                onChange={(e) => setCustomClassFormData({ ...customClassFormData, room: e.target.value })}
                placeholder="e.g. 107"
                className="wobbly-input" 
              />
            </div>
            <div>
              <label className="sketchy-heading" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Group</label>
              <input 
                type="text" 
                value={customClassFormData.group} 
                onChange={(e) => setCustomClassFormData({ ...customClassFormData, group: e.target.value })}
                placeholder="e.g. Group A / C1"
                className="wobbly-input" 
              />
            </div>
          </div>

          <div className="flex-row mt-4" style={{ justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              className="sketchy-btn sketchy-btn-accent"
              disabled={studentCourses.length === 0}
            >
              Add Class
            </button>
            <button type="button" onClick={() => setShowCustomClassModal(false)} className="sketchy-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
