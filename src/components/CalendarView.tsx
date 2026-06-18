'use client';

import React from 'react';
import { Plus, Clock, MapPin, CheckCircle, AlertCircle, Check, X } from 'lucide-react';

interface CalendarViewProps {
  students: any[];
  selectedStudentId: number;
  setSelectedStudentId: (id: number) => void;
  calendarMode: 'daily' | 'weekly' | 'monthly';
  setCalendarMode: (mode: 'daily' | 'weekly' | 'monthly') => void;
  viewDate: string;
  setViewDate: (date: string) => void;
  calendarData: Record<number, any>;
  currentDate: string;
  setSelectedClass: (c: any) => void;
  setShowSubjectModal: (show: boolean) => void;
  setVacationData: (data: any) => void;
  setShowVacationModal: (show: boolean) => void;
  getReadableDate: (dateStr: string) => string;
  toggleAttendance: (studentId: number, classItem: any, date: string, status: string) => void;
}

// Helper to convert time "HH:MM" to decimal hours (e.g. "10:30" -> 10.5)
function timeToDecimal(timeStr: string): number {
  if (!timeStr) return 8;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + minutes / 60;
}

// Helper to format hour labels
function formatHourLabel(hour: number): string {
  const h = hour > 12 ? hour - 12 : hour;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${h}:00 ${ampm}`;
}

export default function CalendarView({
  students,
  selectedStudentId,
  setSelectedStudentId,
  calendarMode,
  setCalendarMode,
  viewDate,
  setViewDate,
  calendarData,
  currentDate,
  setSelectedClass,
  setShowSubjectModal,
  setVacationData,
  setShowVacationModal,
  getReadableDate,
  toggleAttendance
}: CalendarViewProps) {

  const activeStudent = students.find(s => s.id === selectedStudentId);
  const studentColor = activeStudent ? activeStudent.color : '#2b6cb0';

  // Hours displayed on the vertical timeline grid (8 AM to 6 PM)
  const START_HOUR = 8;
  const END_HOUR = 18;
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  // Return helper colors for status
  const getEventCardStyle = (c: any) => {
    if (c.attendanceStatus === 'PRESENT') {
      return { backgroundColor: '#def7ec', borderColor: '#03543f', color: '#03543f' };
    }
    if (c.attendanceStatus === 'ABSENT') {
      return { backgroundColor: '#fde8e8', borderColor: '#9b1c1c', color: '#9b1c1c', textDecoration: 'line-through' };
    }
    if (c.attendanceStatus === 'CANCELLED' || c.status === 'CANCELLED') {
      return { backgroundColor: '#f3f4f6', borderColor: '#4b5563', color: '#4b5563', opacity: 0.6, textDecoration: 'line-through' };
    }
    if (c.status === 'RESCHEDULED') {
      return { backgroundColor: '#fef3c7', borderColor: '#d97706', color: '#d97706' };
    }
    // Default scheduled (outlined with student color theme)
    return { backgroundColor: '#ffffff', borderColor: studentColor, color: '#1f2937' };
  };

  return (
    <div className="wobbly-box" style={{ background: '#ffffff', padding: '1.5rem' }}>
      {/* Top Header controls */}
      <div className="flex-between mb-4 flex-wrap" style={{ gap: '1rem' }}>
        <div className="flex-row">
          <h2 className="sketchy-heading" style={{ fontSize: '1.5rem' }}>📅 Interactive Routine</h2>
          <div style={{ display: 'flex', border: '2px solid var(--ink-charcoal)', borderRadius: '8px', overflow: 'hidden' }}>
            {students.map(s => (
              <button 
                key={s.id}
                onClick={() => setSelectedStudentId(s.id)}
                className="sketchy-tab"
                style={{ 
                  borderRadius: 0, 
                  border: 'none', 
                  margin: 0,
                  transform: 'none',
                  backgroundColor: selectedStudentId === s.id ? s.color : '#e2dcd5',
                  color: selectedStudentId === s.id ? 'white' : 'black',
                  fontWeight: selectedStudentId === s.id ? 'bold' : 'normal',
                  padding: '0.4rem 1.2rem'
                }}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* View mode filter, log vacation button, and navigators */}
        <div className="flex-row flex-wrap" style={{ gap: '0.8rem' }}>
          <button 
            onClick={() => {
              setVacationData({ date: currentDate, endDate: '', type: 'VACATION', description: '' });
              setShowVacationModal(true);
            }} 
            className="sketchy-btn sketchy-btn-danger"
          >
            <Plus size={14} /> Log Vacation Range
          </button>

          <div style={{ display: 'flex', border: '2px solid var(--ink-charcoal)', borderRadius: '8px', overflow: 'hidden' }}>
            {(['daily', 'weekly', 'monthly'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setCalendarMode(mode)}
                className="handwritten"
                style={{
                  border: 'none',
                  padding: '0.3rem 0.8rem',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  backgroundColor: calendarMode === mode ? '#fef08a' : 'white',
                  fontWeight: calendarMode === mode ? 'bold' : 'normal'
                }}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex-row">
            <button 
              onClick={() => {
                const prev = new Date(viewDate);
                if (calendarMode === 'daily') prev.setDate(prev.getDate() - 1);
                else if (calendarMode === 'weekly') prev.setDate(prev.getDate() - 7);
                else prev.setMonth(prev.getMonth() - 1);
                setViewDate(prev.toISOString().split('T')[0]);
              }} 
              className="sketchy-btn"
            >
              ◀
            </button>
            <span className="sketchy-heading" style={{ fontSize: '0.9rem', minWidth: '130px', textAlign: 'center' }}>
              {calendarMode === 'daily' ? getReadableDate(viewDate) : `Focus: ${viewDate}`}
            </span>
            <button 
              onClick={() => {
                const next = new Date(viewDate);
                if (calendarMode === 'daily') next.setDate(next.getDate() + 1);
                else if (calendarMode === 'weekly') next.setDate(next.getDate() + 7);
                else next.setMonth(next.getMonth() + 1);
                setViewDate(next.toISOString().split('T')[0]);
              }} 
              className="sketchy-btn"
            >
              ▶
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================
          MODE A: GOOGLE CALENDAR WEEKLY VIEW
          ======================================================================== */}
      {calendarMode === 'weekly' && calendarData[selectedStudentId] && (
        <div className="gcal-weekly-container">
          {/* Header Row: time label and 7 days headings */}
          <div className="gcal-weekly-header">
            <div className="gcal-time-header">Time</div>
            {Object.keys(calendarData[selectedStudentId].dates).map(dateKey => {
              const dData = calendarData[selectedStudentId].dates[dateKey];
              const isToday = dateKey === currentDate;
              return (
                <div 
                  key={dateKey} 
                  className="gcal-header-cell"
                  style={isToday ? { backgroundColor: '#fef08a', fontWeight: 'bold' } : {}}
                >
                  <div>{dData.dayName.substring(0, 3)}</div>
                  <div style={{ fontSize: '1.1rem', marginTop: '0.1rem' }}>{dateKey.split('-')[2]}</div>
                </div>
              );
            })}
          </div>

          {/* All day row (for vacations/absent day flags) */}
          <div className="gcal-all-day-row">
            <div className="gcal-time-header" style={{ fontSize: '0.65rem' }}>All Day</div>
            {Object.keys(calendarData[selectedStudentId].dates).map(dateKey => {
              const dData = calendarData[selectedStudentId].dates[dateKey];
              return (
                <div key={dateKey} className="gcal-all-day-cell">
                  {dData.vacationType === 'VACATION' && (
                    <span className="gcal-all-day-badge class-status-cancelled">🌴 Vacation</span>
                  )}
                  {dData.vacationType === 'ABSENT_DAY' && (
                    <span className="gcal-all-day-badge class-status-absent">🤒 Sick Day</span>
                  )}
                  {!dData.vacationType && <span style={{ color: '#e2e8f0' }}>-</span>}
                </div>
              );
            })}
          </div>

          {/* Scrollable grid timeline body */}
          <div className="gcal-grid-scroll">
            <div className="gcal-weekly-grid">
              
              {/* Horizontal line indicators backdrops */}
              <div className="gcal-grid-lines-container">
                {hours.map(h => (
                  <div key={h} className="gcal-grid-line"></div>
                ))}
              </div>

              {/* Hours axis column */}
              <div className="gcal-time-col">
                {hours.map(h => (
                  <div key={h} className="gcal-time-slot">
                    {formatHourLabel(h)}
                  </div>
                ))}
              </div>

              {/* 7 Days Columns */}
              {Object.keys(calendarData[selectedStudentId].dates).map(dateKey => {
                const dayData = calendarData[selectedStudentId].dates[dateKey];
                const isToday = dateKey === currentDate;

                let colClass = "gcal-day-column";
                if (isToday) colClass += " today";
                if (dayData.vacationType) colClass += " vacation-column";

                return (
                  <div key={dateKey} className={colClass}>
                    
                    {/* Render event cards absolute inside the column if not vacation */}
                    {!dayData.vacationType && dayData.classes.map((c: any) => {
                      const decimalStart = timeToDecimal(c.startTime);
                      const decimalEnd = timeToDecimal(c.endTime);

                      // Calculate absolute offsets (Assuming 60px height per hour, grid starts at 8.0)
                      const topOffset = (decimalStart - START_HOUR) * 60;
                      const height = (decimalEnd - decimalStart) * 60;

                      // Skip rendering if class falls completely outside bounds
                      if (topOffset < 0 || height <= 0) return null;

                      const customStyle = getEventCardStyle(c);

                      return (
                        <div
                          key={c.id}
                          onClick={() => {
                            setSelectedClass(c);
                            setShowSubjectModal(true);
                          }}
                          className="gcal-event-card"
                          style={{
                            top: `${topOffset}px`,
                            height: `${height}px`,
                            ...customStyle
                          }}
                        >
                          <div className="gcal-event-title">{c.course.subjectCode}</div>
                          {height > 40 && <div className="gcal-event-desc">{c.course.subjectName}</div>}
                          {height > 60 && (
                            <div className="gcal-event-meta">
                              <span className="flex-row" style={{ fontSize: '0.65rem' }}><MapPin size={8} /> Room {c.room || 'TBA'}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================
          MODE B: GOOGLE CALENDAR MONTHLY VIEW
          ======================================================================== */}
      {calendarMode === 'monthly' && calendarData[selectedStudentId] && (
        <div className="gcal-month-grid">
          {/* Weekday headers */}
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
            <div 
              key={day} 
              className="calendar-day-header"
              style={{ padding: '0.5rem', fontWeight: 'bold' }}
            >
              {day}
            </div>
          ))}

          {/* Month grid cells */}
          {Object.keys(calendarData[selectedStudentId].dates).map(dateKey => {
            const dayData = calendarData[selectedStudentId].dates[dateKey];
            const isToday = dateKey === currentDate;
            const dateNum = dateKey.split('-')[2];

            let cellClass = "gcal-month-cell";
            if (isToday) cellClass += " today";
            if (dayData.vacationType === 'VACATION') cellClass += " vacation-day";
            if (dayData.vacationType === 'ABSENT_DAY') cellClass += " absent-day";

            return (
              <div key={dateKey} className={cellClass}>
                {/* Date header */}
                <div className="gcal-month-date">
                  <span className={isToday ? "gcal-month-date today-badge" : ""}>
                    {dateNum}
                  </span>
                </div>

                {/* Shaded holiday banner */}
                {dayData.vacationType === 'VACATION' && (
                  <div className="gcal-month-event-chip class-status-cancelled" style={{ textAlign: 'center', cursor: 'default' }}>
                    🌴 Vacation
                  </div>
                )}

                {dayData.vacationType === 'ABSENT_DAY' && (
                  <div className="gcal-month-event-chip class-status-absent" style={{ textAlign: 'center', cursor: 'default' }}>
                    🤒 Sick Day
                  </div>
                )}

                {/* Stack of horizontal event chips */}
                {!dayData.vacationType && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                    {dayData.classes.map((c: any) => {
                      const chipStyle = getEventCardStyle(c);
                      return (
                        <div
                          key={c.id}
                          onClick={() => {
                            setSelectedClass(c);
                            setShowSubjectModal(true);
                          }}
                          className="gcal-month-event-chip"
                          style={chipStyle}
                        >
                          {c.startTime} {c.course.subjectCode}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================
          MODE C: DAILY LIST VIEW
          ======================================================================== */}
      {calendarMode === 'daily' && calendarData[selectedStudentId] && (
        <div style={{ minHeight: '300px' }}>
          {Object.keys(calendarData[selectedStudentId].dates).map(dateKey => {
            const dayData = calendarData[selectedStudentId].dates[dateKey];
            if (dateKey !== viewDate) return null;

            return (
              <div key={dateKey}>
                <div className="flex-between mb-4">
                  <h3 className="sketchy-heading" style={{ fontSize: '1.2rem' }}>
                    📋 Class Log List for {getReadableDate(dateKey)}
                  </h3>
                </div>

                {dayData.vacationType === 'VACATION' ? (
                  <div className="wobbly-box" style={{ padding: '3rem', textAlign: 'center', background: '#edf2f7' }}>
                    <p className="handwritten" style={{ fontSize: '2rem', color: '#c53030' }}>🎉 Vacation Day!</p>
                    <p className="handwritten" style={{ fontSize: '1.3rem', color: '#4a5568' }}>No classes scheduled due to holiday.</p>
                  </div>
                ) : dayData.vacationType === 'ABSENT_DAY' ? (
                  <div className="wobbly-box" style={{ padding: '3rem', textAlign: 'center', background: '#fee2e2' }}>
                    <p className="handwritten" style={{ fontSize: '2rem', color: '#9b2c2c' }}>🤒 Sick Day (Full-Day Absent)</p>
                    <p className="handwritten" style={{ fontSize: '1.3rem', color: '#4a5568' }}>All scheduled classes are marked absent.</p>
                  </div>
                ) : dayData.classes.length === 0 ? (
                  <p className="handwritten" style={{ textAlign: 'center', padding: '3rem', color: '#718096', fontSize: '1.3rem' }}>
                    No classes scheduled for this day.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {dayData.classes.map((c: any) => (
                      <div 
                        key={c.id} 
                        onClick={() => {
                          setSelectedClass(c);
                          setShowSubjectModal(true);
                        }}
                        className="wobbly-box flex-between" 
                        style={{ borderLeft: `8px solid ${studentColor}`, background: 'white', cursor: 'pointer' }}
                      >
                        <div>
                          <div className="flex-row">
                            <span className="sketchy-heading" style={{ fontSize: '1rem', fontWeight: 'bold' }}>{c.course.subjectCode}</span>
                            {c.group && <span className="highlight-yellow handwritten">({c.group})</span>}
                            {c.status === 'RESCHEDULED' && <span className="highlight-pink handwritten" style={{ color: '#c05621' }}>Rescheduled</span>}
                            {c.status === 'CANCELLED' && <span className="highlight-pink handwritten" style={{ color: '#718096', textDecoration: 'none' }}>Cancelled</span>}
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
                            onClick={() => toggleAttendance(selectedStudentId, c, dateKey, 'PRESENT')}
                            className={`sketchy-btn ${c.attendanceStatus === 'PRESENT' ? 'class-status-present' : ''}`}
                            style={{ padding: '0.3rem 0.6rem', border: '1px solid #718096', boxShadow: 'none' }}
                            title="Mark Done / Present"
                          >
                            <Check size={14} />
                          </button>
                          <button 
                            onClick={() => toggleAttendance(selectedStudentId, c, dateKey, 'ABSENT')}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
