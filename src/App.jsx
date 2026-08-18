import { useEffect, useMemo, useState } from 'react';
import {
  createCsv,
  createEmptyWorkspace,
  createId,
  createSampleWorkspace,
  DEFAULT_SESSION_FEE,
  formatCurrency,
  formatDate,
  getAttendanceForDate,
  getDashboardMetrics,
  getStudentSummaries,
  normalizeWorkspace,
  removeStudentFromAttendance,
  setAttendance,
  toggleAttendance,
} from './lib/attendance';

const STORAGE_KEY = 'attendance-manager:workspace:v1';

export default function App() {
  const [workspace, setWorkspace] = useState(readWorkspace);
  const [selectedDate, setSelectedDate] = useState(today());
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  }, [workspace]);

  useEffect(() => {
    document.title = 'Attendance Manager';
  }, []);

  const summaries = useMemo(() => getStudentSummaries(workspace), [workspace]);
  const metrics = useMemo(() => getDashboardMetrics(workspace), [workspace]);
  const selectedAttendance = useMemo(
    () => getAttendanceForDate(workspace.attendance, selectedDate),
    [workspace.attendance, selectedDate],
  );
  const selectedStudent = summaries.find((student) => student.id === selectedStudentId) || null;

  function updateWorkspace(updater) {
    setWorkspace((current) => normalizeWorkspace(updater(current)));
  }

  function addStudent({ name, initialBalance }) {
    const normalizedName = name.trim().replace(/\s+/g, ' ');
    const duplicate = workspace.students.some(
      (student) => student.name.toLowerCase() === normalizedName.toLowerCase(),
    );

    if (normalizedName.length < 2) {
      showToast('Enter a student name with at least two characters.', 'error');
      return false;
    }

    if (duplicate) {
      showToast('That student is already on the roster.', 'error');
      return false;
    }

    updateWorkspace((current) => ({
      ...current,
      students: [
        ...current.students,
        { id: createId('student'), name: normalizedName, initialBalance: Number(initialBalance) || 0 },
      ],
    }));
    showToast(`${normalizedName} was added to the roster.`);
    return true;
  }

  function toggleStudentAttendance(studentId) {
    updateWorkspace((current) => ({
      ...current,
      attendance: toggleAttendance(current.attendance, selectedDate, studentId),
    }));
  }

  function markEveryonePresent() {
    updateWorkspace((current) => ({
      ...current,
      attendance: setAttendance(
        current.attendance,
        selectedDate,
        current.students.map((student) => student.id),
      ),
    }));
    showToast('Everyone on the roster is marked present.');
  }

  function clearSelectedDate() {
    updateWorkspace((current) => ({
      ...current,
      attendance: setAttendance(current.attendance, selectedDate, []),
    }));
    showToast('Attendance was cleared for the selected date.');
  }

  function updateSessionFee(value) {
    const sessionFee = Number(value);

    if (!Number.isFinite(sessionFee) || sessionFee <= 0) {
      return;
    }

    updateWorkspace((current) => ({
      ...current,
      settings: { ...current.settings, sessionFee },
    }));
  }

  function adjustStudentBalance(studentId, amount) {
    if (!Number.isFinite(amount) || amount === 0) {
      showToast('Enter a non-zero adjustment.', 'error');
      return false;
    }

    updateWorkspace((current) => ({
      ...current,
      students: current.students.map((student) =>
        student.id === studentId
          ? { ...student, initialBalance: Number(student.initialBalance) + amount }
          : student,
      ),
    }));
    showToast('Student credit was updated.');
    return true;
  }

  function deleteStudent(student) {
    if (!window.confirm(`Remove ${student.name} and their attendance history?`)) {
      return;
    }

    updateWorkspace((current) => ({
      ...current,
      students: current.students.filter((candidate) => candidate.id !== student.id),
      attendance: removeStudentFromAttendance(current.attendance, student.id),
    }));
    setSelectedStudentId(null);
    showToast(`${student.name} was removed.`);
  }

  function loadSampleData() {
    if (workspace.students.length > 0 && !window.confirm('Replace the current workspace with sample data?')) {
      return;
    }

    setWorkspace(createSampleWorkspace());
    setSelectedStudentId(null);
    showToast('Sample workspace loaded.');
  }

  function clearWorkspace() {
    if (!window.confirm('Clear every student and attendance record from this browser?')) {
      return;
    }

    setWorkspace(createEmptyWorkspace());
    setSelectedStudentId(null);
    showToast('Workspace cleared.');
  }

  function exportWorkspace(format) {
    const content =
      format === 'csv'
        ? createCsv(summaries)
        : JSON.stringify({ exportedAt: new Date().toISOString(), ...workspace }, null, 2);
    const type = format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json;charset=utf-8';
    const fileName = `attendance-manager-${today()}.${format}`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([content], { type }));
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast(`${format.toUpperCase()} export downloaded.`);
  }

  function showToast(message, tone = 'success') {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 3600);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#overview" aria-label="Attendance Manager home">
          <span className="brand-mark" aria-hidden="true">A</span>
          <span>Attendance Manager</span>
        </a>
        <div className="topbar-actions">
          <span className="storage-indicator"><i aria-hidden="true" /> Saved in this browser</span>
          <button className="button button-quiet" type="button" onClick={loadSampleData}>
            Load sample
          </button>
        </div>
      </header>

      <main id="overview" className="page-content">
        <section className="hero-panel">
          <div>
            <p className="eyebrow">Class operations, simplified</p>
            <h1>Attendance that stays in step with every balance.</h1>
            <p className="hero-copy">
              Keep a lightweight record of your roster, sessions, and prepaid credits. Your data is stored
              locally on this device and can be exported at any time.
            </p>
          </div>
          <div className="hero-actions">
            <button className="button button-primary" type="button" onClick={() => setShowStudentForm(true)}>
              <span aria-hidden="true">+</span> Add student
            </button>
            <button className="button button-secondary" type="button" onClick={() => exportWorkspace('csv')}>
              Export CSV
            </button>
          </div>
        </section>

        <section className="metric-grid" aria-label="Workspace summary">
          <Metric label="Active students" value={metrics.activeStudents} detail="Current roster" />
          <Metric label="Recorded sessions" value={metrics.sessionCount} detail="Unique attendance dates" />
          <Metric label="Session fee" value={formatCurrency(workspace.settings.sessionFee)} detail="Applied per attendance" />
          <Metric label="Available credit" value={formatCurrency(metrics.outstandingBalance)} detail="Across every student" />
        </section>

        <section className="workspace-grid">
          <section className="attendance-card">
            <div className="section-heading-row">
              <div>
                <p className="eyebrow">Take attendance</p>
                <h2>Choose a date, then check in the room.</h2>
              </div>
              <label className="date-control">
                <span className="sr-only">Attendance date</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                />
              </label>
            </div>

            <div className="attendance-toolbar">
              <p><strong>{selectedAttendance.size}</strong> present on {formatDate(selectedDate)}</p>
              <div className="toolbar-actions">
                <button className="text-button" type="button" onClick={markEveryonePresent} disabled={workspace.students.length === 0}>
                  Mark all present
                </button>
                <button className="text-button text-button-danger" type="button" onClick={clearSelectedDate} disabled={selectedAttendance.size === 0}>
                  Clear date
                </button>
              </div>
            </div>

            {summaries.length === 0 ? (
              <EmptyRoster onAdd={() => setShowStudentForm(true)} onSample={loadSampleData} />
            ) : (
              <div className="attendance-list" role="list">
                {summaries.map((student) => (
                  <label className="attendance-row" key={student.id}>
                    <input
                      type="checkbox"
                      checked={selectedAttendance.has(student.id)}
                      onChange={() => toggleStudentAttendance(student.id)}
                    />
                    <span className="checkmark" aria-hidden="true">✓</span>
                    <span className="student-avatar">{initials(student.name)}</span>
                    <span className="attendance-name">
                      <strong>{student.name}</strong>
                      <small>{student.sessions} {student.sessions === 1 ? 'session' : 'sessions'} recorded</small>
                    </span>
                    <span className={student.currentBalance < 0 ? 'balance balance-negative' : 'balance'}>
                      {formatCurrency(student.currentBalance)}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </section>

          <aside className="control-column">
            <section className="settings-card">
              <p className="eyebrow">Session settings</p>
              <h2>One clear rate.</h2>
              <p>Each attendance record applies this fee to a student’s prepaid credit.</p>
              <label className="currency-field">
                <span>Fee per session</span>
                <span className="input-with-prefix"><b>$</b><input type="number" min="0.01" step="0.5" value={workspace.settings.sessionFee} onChange={(event) => updateSessionFee(event.target.value)} /></span>
              </label>
            </section>

            <section className="roster-card">
              <div className="section-heading-row compact">
                <div>
                  <p className="eyebrow">Roster</p>
                  <h2>Student records</h2>
                </div>
                <span className="count-chip">{summaries.length}</span>
              </div>
              <div className="roster-list">
                {summaries.map((student) => (
                  <button
                    className={selectedStudent?.id === student.id ? 'roster-entry is-selected' : 'roster-entry'}
                    key={student.id}
                    type="button"
                    onClick={() => setSelectedStudentId(student.id)}
                  >
                    <span className="student-avatar small">{initials(student.name)}</span>
                    <span><strong>{student.name}</strong><small>{formatCurrency(student.currentBalance)} remaining</small></span>
                    <span aria-hidden="true">→</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="export-card">
              <p className="eyebrow">Portable by default</p>
              <p>Download a complete snapshot whenever you need it.</p>
              <div className="export-actions">
                <button className="button button-secondary" type="button" onClick={() => exportWorkspace('csv')}>CSV report</button>
                <button className="button button-secondary" type="button" onClick={() => exportWorkspace('json')}>JSON backup</button>
              </div>
            </section>
          </aside>
        </section>

        {selectedStudent && (
          <StudentDetail
            student={selectedStudent}
            onClose={() => setSelectedStudentId(null)}
            onAdjust={adjustStudentBalance}
            onDelete={deleteStudent}
          />
        )}

        <section className="data-footer">
          <div>
            <p className="eyebrow">Your workspace</p>
            <h2>Private, local, and under your control.</h2>
          </div>
          <button className="text-button text-button-danger" type="button" onClick={clearWorkspace}>
            Clear workspace
          </button>
        </section>
      </main>

      <footer className="footer">
        <span>Attendance Manager</span>
        <span>Roster · attendance · credit tracking</span>
      </footer>

      {showStudentForm && (
        <StudentForm
          onClose={() => setShowStudentForm(false)}
          onSubmit={(details) => {
            if (addStudent(details)) {
              setShowStudentForm(false);
            }
          }}
        />
      )}

      {toast && <div className={`toast toast-${toast.tone}`} role="status">{toast.message}</div>}
    </div>
  );
}

function Metric({ label, value, detail }) {
  return <article className="metric-card"><p>{label}</p><strong>{value}</strong><span>{detail}</span></article>;
}

function EmptyRoster({ onAdd, onSample }) {
  return (
    <div className="empty-state">
      <span aria-hidden="true">◌</span>
      <h3>Your roster is ready for its first student.</h3>
      <p>Add someone manually or load sample data to explore the workflow.</p>
      <div><button className="button button-primary" type="button" onClick={onAdd}>Add student</button><button className="button button-secondary" type="button" onClick={onSample}>Load sample</button></div>
    </div>
  );
}

function StudentForm({ onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState('0');

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ name, initialBalance });
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <form className="dialog-card" onSubmit={handleSubmit} onMouseDown={(event) => event.stopPropagation()}>
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Close">×</button>
        <p className="eyebrow">New student</p>
        <h2>Add a student to the roster.</h2>
        <label>Student name<input autoFocus value={name} maxLength="50" onChange={(event) => setName(event.target.value)} placeholder="Maya Chen" required /></label>
        <label>Starting credit<span className="input-with-prefix"><b>$</b><input type="number" min="0" step="0.5" value={initialBalance} onChange={(event) => setInitialBalance(event.target.value)} required /></span></label>
        <div className="dialog-actions"><button className="button button-secondary" type="button" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit">Add student</button></div>
      </form>
    </div>
  );
}

function StudentDetail({ student, onClose, onAdjust, onDelete }) {
  const [adjustment, setAdjustment] = useState('');

  function handleAdjustment(event) {
    event.preventDefault();
    if (onAdjust(student.id, Number(adjustment))) {
      setAdjustment('');
    }
  }

  return (
    <section className="detail-card" aria-labelledby="student-detail-heading">
      <div className="detail-header"><div><p className="eyebrow">Student detail</p><h2 id="student-detail-heading">{student.name}</h2></div><button className="button button-quiet" type="button" onClick={onClose}>Close</button></div>
      <div className="detail-metrics"><Metric label="Starting credit" value={formatCurrency(student.initialBalance)} detail="Including adjustments" /><Metric label="Session charges" value={formatCurrency(student.charges)} detail={`${student.sessions} sessions`} /><Metric label="Current balance" value={formatCurrency(student.currentBalance)} detail={student.currentBalance < 0 ? 'Credit needs attention' : 'Available to use'} /></div>
      <div className="detail-lower"><div><p className="eyebrow">Attendance history</p>{student.dates.length ? <div className="date-pills">{student.dates.map((date) => <span key={date}>{formatDate(date)}</span>)}</div> : <p className="muted-copy">No attendance recorded yet.</p>}</div><form className="adjust-form" onSubmit={handleAdjustment}><label>Adjust starting credit<span className="input-with-prefix"><b>$</b><input type="number" step="0.5" value={adjustment} onChange={(event) => setAdjustment(event.target.value)} placeholder="25 or -5" /></span></label><button className="button button-secondary" type="submit">Apply adjustment</button></form></div>
      <div className="detail-danger"><span>Removing a student also removes their attendance history.</span><button className="text-button text-button-danger" type="button" onClick={() => onDelete(student)}>Remove student</button></div>
    </section>
  );
}

function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function today() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function readWorkspace() {
  try {
    return normalizeWorkspace(JSON.parse(window.localStorage.getItem(STORAGE_KEY)));
  } catch {
    return createEmptyWorkspace();
  }
}
