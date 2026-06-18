'use client';

import React from 'react';
import { Plus, Edit3, Trash2, Clock, MapPin } from 'lucide-react';

interface SetupViewProps {
  students: any[];
  selectedStudentId: number;
  setSelectedStudentId: (id: number) => void;
  courses: Record<number, any[]>;
  weeklySlots: Record<number, any[]>;
  setCourseFormData: (data: any) => void;
  setShowAddCourseModal: (show: boolean) => void;
  setSlotFormData: (data: any) => void;
  setShowAddSlotModal: (show: boolean) => void;
  handleDeleteCourse: (id: number) => void;
  handleDeleteSlot: (id: number) => void;
  handleUpdateStartDate: (studentId: number, date: string) => void;
}

export default function SetupView({
  students,
  selectedStudentId,
  setSelectedStudentId,
  courses,
  weeklySlots,
  setCourseFormData,
  setShowAddCourseModal,
  setSlotFormData,
  setShowAddSlotModal,
  handleDeleteCourse,
  handleDeleteSlot,
  handleUpdateStartDate
}: SetupViewProps) {
  const activeStudent = students.find(s => s.id === selectedStudentId);
  const courseStartDate = activeStudent ? activeStudent.courseStartDate || '2026-01-01' : '2026-01-01';

  return (
    <div className="wobbly-box" style={{ background: '#ffffff', padding: '2rem' }}>
      <div className="flex-between mb-4">
        <div className="flex-row" style={{ flexWrap: 'wrap' }}>
          <div className="flex-row">
            <h2 className="sketchy-heading" style={{ fontSize: '1.5rem' }}>⚙ Setup Course Timetables</h2>
            <select 
              value={selectedStudentId} 
              onChange={(e) => setSelectedStudentId(parseInt(e.target.value))}
              className="wobbly-input" 
              style={{ width: '250px', padding: '0.3rem 0.5rem', fontSize: '1.2rem' }}
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-row" style={{ marginLeft: '1.5rem' }}>
            <span className="handwritten" style={{ fontSize: '1.2rem' }}>Course Start Date:</span>
            <input 
              type="date" 
              value={courseStartDate} 
              onChange={(e) => handleUpdateStartDate(selectedStudentId, e.target.value)}
              className="wobbly-input" 
              style={{ width: '180px', padding: '0.2rem 0.5rem', fontSize: '1.1rem' }}
            />
          </div>
        </div>
        <div className="flex-row">
          <button 
            onClick={() => {
              setCourseFormData({ id: '', subjectId: '', subjectName: '', subjectCode: '', teacherName: '', teacherCode: '', teacherContact: '', teacherEmail: '' });
              setShowAddCourseModal(true);
            }} 
            className="sketchy-btn sketchy-btn-accent"
          >
            <Plus size={14} /> Add Subject / Course
          </button>
          <button 
            onClick={() => {
              const sCourses = courses[selectedStudentId] || [];
              if (sCourses.length === 0) {
                alert('Please add a course first!');
                return;
              }
              setSlotFormData({ id: '', courseId: String(sCourses[0].id), dayOfWeek: 'SUNDAY', startTime: '08:00', endTime: '09:00', room: '', group: '' });
              setShowAddSlotModal(true);
            }} 
            className="sketchy-btn"
          >
            <Plus size={14} /> Add Timetable Slot
          </button>
        </div>
      </div>

      <div className="grid-cols-2">
        {/* Left Column: Courses list */}
        <div className="wobbly-box" style={{ padding: '1rem' }}>
          <h3 className="sketchy-heading mb-4" style={{ fontSize: '1.1rem' }}>📚 Subjects Roster</h3>
          {(courses[selectedStudentId] || []).length === 0 ? (
            <p className="handwritten" style={{ padding: '2rem 0', color: '#718096', textAlign: 'center' }}>No subjects added yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {(courses[selectedStudentId] || []).map(c => (
                <div key={c.id} className="wobbly-box flex-between" style={{ padding: '0.6rem 1rem', background: '#fcfcfc' }}>
                  <div>
                    <span className="sketchy-heading" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{c.subjectCode}</span>
                    <p className="handwritten" style={{ fontSize: '1.2rem', color: '#4a5568' }}>{c.subjectName}</p>
                    <p className="handwritten" style={{ fontSize: '0.9rem', color: '#718096' }}>Code: {c.subjectId} | Teacher: {c.teacherCode || 'N/A'}</p>
                  </div>
                  <div className="flex-row">
                    <button 
                      onClick={() => {
                        setCourseFormData({
                          id: String(c.id),
                          subjectId: c.subjectId,
                          subjectName: c.subjectName,
                          subjectCode: c.subjectCode,
                          teacherName: c.teacherName,
                          teacherCode: c.teacherCode,
                          teacherContact: c.teacherContact,
                          teacherEmail: c.teacherEmail
                        });
                        setShowAddCourseModal(true);
                      }}
                      className="sketchy-btn" 
                      style={{ padding: '0.3rem 0.5rem', boxShadow: 'none' }}
                    >
                      <Edit3 size={12} />
                    </button>
                    <button 
                      onClick={() => handleDeleteCourse(c.id)}
                      className="sketchy-btn sketchy-btn-danger" 
                      style={{ padding: '0.3rem 0.5rem', boxShadow: 'none' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Weekly slots template list */}
        <div className="wobbly-box" style={{ padding: '1rem' }}>
          <h3 className="sketchy-heading mb-4" style={{ fontSize: '1.1rem' }}>🕒 Weekly Recurring Timetable Template</h3>
          {(weeklySlots[selectedStudentId] || []).length === 0 ? (
            <p className="handwritten" style={{ padding: '2rem 0', color: '#718096', textAlign: 'center' }}>No weekly routine slots mapped.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {[...(weeklySlots[selectedStudentId] || [])]
                .sort((a, b) => {
                  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
                  const dayDiff = days.indexOf(a.dayOfWeek) - days.indexOf(b.dayOfWeek);
                  if (dayDiff !== 0) return dayDiff;
                  return a.startTime.localeCompare(b.startTime);
                })
                .map(slot => {
                  const course = (courses[selectedStudentId] || []).find(c => c.id === slot.courseId);
                  return (
                    <div key={slot.id} className="wobbly-box flex-between" style={{ padding: '0.6rem 1rem', background: '#fcfcfc' }}>
                      <div>
                        <div className="flex-row">
                          <span className="highlight-yellow handwritten" style={{ fontSize: '1rem', fontWeight: 'bold' }}>{slot.dayOfWeek}</span>
                          <span className="sketchy-heading" style={{ fontSize: '0.85rem' }}>{course ? course.subjectCode : 'Unknown'}</span>
                        </div>
                        <div className="flex-row mt-4" style={{ fontSize: '0.9rem', color: '#718096' }}>
                          <span><Clock size={10} /> {slot.startTime} - {slot.endTime}</span>
                          {slot.room && <span><MapPin size={10} /> Rm {slot.room}</span>}
                          {slot.group && <span>({slot.group})</span>}
                        </div>
                      </div>
                      <div className="flex-row">
                        <button 
                          onClick={() => {
                            setSlotFormData({
                              id: String(slot.id),
                              courseId: String(slot.courseId),
                              dayOfWeek: slot.dayOfWeek,
                              startTime: slot.startTime,
                              endTime: slot.endTime,
                              room: slot.room || '',
                              group: slot.group || ''
                            });
                            setShowAddSlotModal(true);
                          }}
                          className="sketchy-btn" 
                          style={{ padding: '0.3rem 0.5rem', boxShadow: 'none' }}
                        >
                          <Edit3 size={12} />
                        </button>
                        <button 
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="sketchy-btn sketchy-btn-danger" 
                          style={{ padding: '0.3rem 0.5rem', boxShadow: 'none' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
