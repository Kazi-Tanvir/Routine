'use client';

import React from 'react';

interface AnalyticsViewProps {
  students: any[];
  selectedStudentId: number;
  setSelectedStudentId: (id: number) => void;
  analyticsData: any;
  customRange: { start: string; end: string };
  setCustomRange: (range: { start: string; end: string }) => void;
  handleCalculateCustom: (e: React.FormEvent) => void;
  isCalculatingCustom: boolean;
}

export default function AnalyticsView({
  students,
  selectedStudentId,
  setSelectedStudentId,
  analyticsData,
  customRange,
  setCustomRange,
  handleCalculateCustom,
  isCalculatingCustom
}: AnalyticsViewProps) {
  return (
    <div className="wobbly-box" style={{ background: '#ffffff', padding: '2rem' }}>
      <div className="flex-between mb-4">
        <div className="flex-row">
          <h2 className="sketchy-heading" style={{ fontSize: '1.5rem' }}>📊 Attendance Statistics</h2>
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

        {/* Custom period query form */}
        <form onSubmit={handleCalculateCustom} className="flex-row wobbly-box" style={{ padding: '0.4rem 1rem', background: '#f7fafc', boxShadow: 'none' }}>
          <span className="handwritten" style={{ fontSize: '1.1rem' }}>From:</span>
          <input 
            type="date" 
            value={customRange.start} 
            onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
            className="wobbly-input"
            style={{ width: '150px', padding: '0.2rem 0.4rem', fontSize: '1rem' }}
          />
          <span className="handwritten" style={{ fontSize: '1.1rem' }}>To:</span>
          <input 
            type="date" 
            value={customRange.end} 
            onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
            className="wobbly-input"
            style={{ width: '150px', padding: '0.2rem 0.4rem', fontSize: '1rem' }}
          />
          <button type="submit" className="sketchy-btn sketchy-btn-accent" disabled={isCalculatingCustom}>
            {isCalculatingCustom ? 'Recalculating...' : 'Get Average'}
          </button>
        </form>
      </div>

      {analyticsData ? (
        <div>
          {/* Overall stats widgets */}
          <div className="grid-cols-2 mb-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="wobbly-box" style={{ padding: '1rem', textAlign: 'center' }}>
              <p className="handwritten" style={{ fontSize: '1.1rem' }}>Overall Percentage</p>
              <p className="sketchy-heading" style={{ fontSize: '1.8rem', color: '#2f855a' }}>
                {analyticsData.summary.overallPercentage}%
              </p>
            </div>
            <div className="wobbly-box" style={{ padding: '1rem', textAlign: 'center' }}>
              <p className="handwritten" style={{ fontSize: '1.1rem' }}>Classes Held</p>
              <p className="sketchy-heading" style={{ fontSize: '1.8rem' }}>{analyticsData.summary.totalClassesHeld}</p>
            </div>
            <div className="wobbly-box" style={{ padding: '1rem', textAlign: 'center' }}>
              <p className="handwritten" style={{ fontSize: '1.1rem' }}>Total Present</p>
              <p className="sketchy-heading" style={{ fontSize: '1.8rem', color: '#2b6cb0' }}>{analyticsData.summary.totalPresent}</p>
            </div>
            <div className="wobbly-box" style={{ padding: '1rem', textAlign: 'center' }}>
              <p className="handwritten" style={{ fontSize: '1.1rem' }}>Total Absent Class</p>
              <p className="sketchy-heading" style={{ fontSize: '1.8rem', color: '#c53030' }}>{analyticsData.summary.totalAbsent}</p>
            </div>
          </div>

          {/* Subject Breakdown List */}
          <div className="wobbly-box" style={{ padding: '1.5rem' }}>
            <h3 className="sketchy-heading mb-4" style={{ fontSize: '1.2rem' }}>📚 Attendance Per Subject</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--ink-charcoal)' }}>
                  <th style={{ padding: '0.6rem 0.4rem', fontFamily: 'var(--font-sketch)' }}>Code</th>
                  <th style={{ padding: '0.6rem 0.4rem', fontFamily: 'var(--font-sketch)' }}>Subject Name</th>
                  <th style={{ padding: '0.6rem 0.4rem', fontFamily: 'var(--font-sketch)' }}>Classes Held</th>
                  <th style={{ padding: '0.6rem 0.4rem', fontFamily: 'var(--font-sketch)' }}>Attended</th>
                  <th style={{ padding: '0.6rem 0.4rem', fontFamily: 'var(--font-sketch)' }}>Absent</th>
                  <th style={{ padding: '0.6rem 0.4rem', fontFamily: 'var(--font-sketch)' }}>Rate</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.subjects.map((s: any) => (
                  <tr key={s.courseId} style={{ borderBottom: '1px dashed #cbd5e0' }}>
                    <td style={{ padding: '0.8rem 0.4rem', fontWeight: 'bold' }}>{s.subjectCode}</td>
                    <td style={{ padding: '0.8rem 0.4rem' }} className="handwritten">{s.subjectName}</td>
                    <td style={{ padding: '0.8rem 0.4rem' }}>{s.held}</td>
                    <td style={{ padding: '0.8rem 0.4rem', color: '#2b6cb0' }}>{s.present}</td>
                    <td style={{ padding: '0.8rem 0.4rem', color: '#c53030' }}>{s.absent}</td>
                    <td style={{ padding: '0.8rem 0.4rem' }}>
                      <span 
                        className="highlight-green handwritten" 
                        style={{ 
                          fontSize: '1.1rem', 
                          fontWeight: 'bold',
                          backgroundColor: s.percentage < 75 ? 'rgba(254, 202, 202, 0.6)' : 'rgba(187, 247, 208, 0.6)'
                        }}
                      >
                        {s.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="handwritten" style={{ textAlign: 'center', padding: '3rem' }}>Fetching attendance logs analytics data...</p>
      )}
    </div>
  );
}
