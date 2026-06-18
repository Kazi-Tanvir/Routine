'use client';

import React from 'react';
import { BookOpen, Clock, MapPin, Check, X } from 'lucide-react';

interface DashboardViewProps {
  students: any[];
  currentDate: string;
  calendarData: Record<number, any>;
  getTodayClasses: (studentId: number) => any[];
  getTodayVacation: (studentId: number) => string | null;
  getStudentAccentColor: (studentId: number) => string;
  toggleAttendance: (studentId: number, classItem: any, date: string, status: string) => void;
  setSelectedClass: (classItem: any) => void;
  setShowSubjectModal: (show: boolean) => void;
  analyticsData: any;
}

export default function DashboardView({
  students,
  currentDate,
  calendarData,
  getTodayClasses,
  getTodayVacation,
  getStudentAccentColor,
  toggleAttendance,
  setSelectedClass,
  setShowSubjectModal,
  analyticsData
}: DashboardViewProps) {
  return (
    <div className="notebook-binder">
      {/* LEFT PAGE: STUDENT A */}
      <div className="notebook-page paper-lined">
        <div className="tape-decor"></div>
        
        <div className="flex-between mb-4">
          <div>
            <span className="highlight-yellow handwritten" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>BSSE 18th Year 1</span>
            <h2 className="sketchy-heading" style={{ fontSize: '1.6rem', marginTop: '0.4rem', color: getStudentAccentColor(1) }}>
              📌 Student A Schedule
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p className="handwritten" style={{ fontSize: '1.1rem' }}>Today's Date</p>
            <p className="sketchy-heading" style={{ fontSize: '0.9rem', color: '#718096' }}>{currentDate}</p>
          </div>
        </div>

        {/* Today's Classes List */}
        <div className="mt-4" style={{ minHeight: '300px' }}>
          {getTodayVacation(1) === 'VACATION' ? (
            <div style={{ padding: '2rem 1rem', textDecoration: 'none', textAlign: 'center' }}>
              <p className="handwritten" style={{ fontSize: '2rem', color: '#c53030' }}>🎉 Vacation Day!</p>
              <p className="handwritten" style={{ fontSize: '1.3rem', color: '#4a5568' }}>All classes are cancelled for today.</p>
            </div>
          ) : getTodayVacation(1) === 'ABSENT_DAY' ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
              <p className="handwritten" style={{ fontSize: '2.0rem', color: '#9b2c2c' }}>🤒 Sick Day (Full-Day Absent)</p>
              <p className="handwritten" style={{ fontSize: '1.3rem', color: '#4a5568' }}>All scheduled classes are marked absent.</p>
            </div>
          ) : getTodayClasses(1).length === 0 ? (
            <p className="handwritten" style={{ fontSize: '1.5rem', color: '#718096', textAlign: 'center', padding: '3rem 0' }}>No classes scheduled for today.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {getTodayClasses(1).map((c: any) => (
                <div 
                  key={c.id} 
                  className="wobbly-box flex-between" 
                  style={{ 
                    borderLeft: `8px solid ${getStudentAccentColor(1)}`, 
                    background: '#ffffff',
                    padding: '0.8rem 1.2rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setSelectedClass(c);
                    setShowSubjectModal(true);
                  }}
                >
                  <div>
                    <div className="flex-row">
                      <span className="sketchy-heading" style={{ fontSize: '1rem', fontWeight: 'bold' }}>{c.course.subjectCode}</span>
                      {c.group && <span className="highlight-yellow handwritten" style={{ fontSize: '1rem' }}>({c.group})</span>}
                      {c.status === 'RESCHEDULED' && <span className="highlight-pink handwritten" style={{ fontSize: '0.9rem', color: '#c05621' }}>Rescheduled</span>}
                    </div>
                    <p className="handwritten" style={{ fontSize: '1.3rem', color: '#4a5568', marginTop: '0.1rem' }}>{c.course.subjectName}</p>
                    <div className="flex-row mt-4" style={{ fontSize: '0.9rem', color: '#718096' }}>
                      <span className="flex-row"><Clock size={12} /> {c.startTime} - {c.endTime}</span>
                      <span className="flex-row"><MapPin size={12} /> Room {c.room || 'TBA'}</span>
                    </div>
                  </div>

                  {/* Log Attendance Directly */}
                  <div className="flex-row" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => toggleAttendance(1, c, currentDate, 'PRESENT')}
                      className={`sketchy-btn ${c.attendanceStatus === 'PRESENT' ? 'class-status-present' : ''}`}
                      style={{ padding: '0.3rem 0.6rem', border: '1px solid #718096', boxShadow: 'none' }}
                      title="Mark Present"
                    >
                      <Check size={14} />
                    </button>
                    <button 
                      onClick={() => toggleAttendance(1, c, currentDate, 'ABSENT')}
                      className={`sketchy-btn ${c.attendanceStatus === 'ABSENT' ? 'class-status-absent' : ''}`}
                      style={{ padding: '0.3rem 0.6rem', border: '1px solid #718096', boxShadow: 'none' }}
                      title="Mark Absent"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attendance statistics Footer */}
        <div style={{ marginTop: '3rem', borderTop: '2px dashed var(--ink-charcoal)', paddingTop: '1.5rem' }}>
          <div className="flex-between">
            <span className="sketchy-heading" style={{ fontSize: '1.1rem' }}>Overall Attendance</span>
            <span className="highlight-green handwritten" style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
              {analyticsData?.summary?.overallPercentage || 100}%
            </span>
          </div>
        </div>
      </div>

      {/* CENTER SPIRAL BINDER RINGS */}
      <div className="notebook-spiral">
        <div className="spiral-ring"></div>
        <div className="spiral-ring"></div>
        <div className="spiral-ring"></div>
        <div className="spiral-ring"></div>
        <div className="spiral-ring"></div>
        <div className="spiral-ring"></div>
        <div className="spiral-ring"></div>
        <div className="spiral-ring"></div>
        <div className="spiral-ring"></div>
        <div className="spiral-ring"></div>
      </div>

      {/* RIGHT PAGE: STUDENT B */}
      <div className="notebook-page paper-lined">
        <div className="tape-decor"></div>

        <div className="flex-between mb-4">
          <div>
            <span className="highlight-yellow handwritten" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>L1T1 Section C</span>
            <h2 className="sketchy-heading" style={{ fontSize: '1.6rem', marginTop: '0.4rem', color: getStudentAccentColor(2) }}>
              📌 Student B Schedule
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p className="handwritten" style={{ fontSize: '1.1rem' }}>Today's Date</p>
            <p className="sketchy-heading" style={{ fontSize: '0.9rem', color: '#718096' }}>{currentDate}</p>
          </div>
        </div>

        {/* Today's Classes List */}
        <div className="mt-4" style={{ minHeight: '300px' }}>
          {getTodayVacation(2) === 'VACATION' ? (
            <div style={{ padding: '2rem 1rem', textDecoration: 'none', textAlign: 'center' }}>
              <p className="handwritten" style={{ fontSize: '2rem', color: '#c53030' }}>🎉 Vacation Day!</p>
              <p className="handwritten" style={{ fontSize: '1.3rem', color: '#4a5568' }}>All classes are cancelled for today.</p>
            </div>
          ) : getTodayVacation(2) === 'ABSENT_DAY' ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
              <p className="handwritten" style={{ fontSize: '2.0rem', color: '#9b2c2c' }}>🤒 Sick Day (Full-Day Absent)</p>
              <p className="handwritten" style={{ fontSize: '1.3rem', color: '#4a5568' }}>All scheduled classes are marked absent.</p>
            </div>
          ) : getTodayClasses(2).length === 0 ? (
            <p className="handwritten" style={{ fontSize: '1.5rem', color: '#718096', textAlign: 'center', padding: '3rem 0' }}>No classes scheduled for today.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {getTodayClasses(2).map((c: any) => (
                <div 
                  key={c.id} 
                  className="wobbly-box flex-between" 
                  style={{ 
                    borderLeft: `8px solid ${getStudentAccentColor(2)}`, 
                    background: '#ffffff',
                    padding: '0.8rem 1.2rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setSelectedClass(c);
                    setShowSubjectModal(true);
                  }}
                >
                  <div>
                    <div className="flex-row">
                      <span className="sketchy-heading" style={{ fontSize: '1rem', fontWeight: 'bold' }}>{c.course.subjectCode}</span>
                      {c.group && <span className="highlight-yellow handwritten" style={{ fontSize: '1rem' }}>({c.group})</span>}
                      {c.status === 'RESCHEDULED' && <span className="highlight-pink handwritten" style={{ fontSize: '0.9rem', color: '#c05621' }}>Rescheduled</span>}
                    </div>
                    <p className="handwritten" style={{ fontSize: '1.3rem', color: '#4a5568', marginTop: '0.1rem' }}>{c.course.subjectName}</p>
                    <div className="flex-row mt-4" style={{ fontSize: '0.9rem', color: '#718096' }}>
                      <span className="flex-row"><Clock size={12} /> {c.startTime} - {c.endTime}</span>
                      <span className="flex-row"><MapPin size={12} /> Room {c.room || 'TBA'}</span>
                    </div>
                  </div>

                  {/* Log Attendance Directly */}
                  <div className="flex-row" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => toggleAttendance(2, c, currentDate, 'PRESENT')}
                      className={`sketchy-btn ${c.attendanceStatus === 'PRESENT' ? 'class-status-present' : ''}`}
                      style={{ padding: '0.3rem 0.6rem', border: '1px solid #718096', boxShadow: 'none' }}
                      title="Mark Present"
                    >
                      <Check size={14} />
                    </button>
                    <button 
                      onClick={() => toggleAttendance(2, c, currentDate, 'ABSENT')}
                      className={`sketchy-btn ${c.attendanceStatus === 'ABSENT' ? 'class-status-absent' : ''}`}
                      style={{ padding: '0.3rem 0.6rem', border: '1px solid #718096', boxShadow: 'none' }}
                      title="Mark Absent"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attendance statistics Footer */}
        <div style={{ marginTop: '3rem', borderTop: '2px dashed var(--ink-charcoal)', paddingTop: '1.5rem' }}>
          <div className="flex-between">
            <span className="sketchy-heading" style={{ fontSize: '1.1rem' }}>Overall Attendance</span>
            <span className="highlight-green handwritten" style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
              90%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
