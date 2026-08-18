export const DEFAULT_SESSION_FEE = 5;

export function createEmptyWorkspace() {
  return {
    version: 1,
    settings: { sessionFee: DEFAULT_SESSION_FEE },
    students: [],
    attendance: {},
  };
}

export function createSampleWorkspace() {
  return {
    version: 1,
    settings: { sessionFee: DEFAULT_SESSION_FEE },
    students: [
      { id: 'maya-chen', name: 'Maya Chen', initialBalance: 60 },
      { id: 'leo-martin', name: 'Leo Martin', initialBalance: 45 },
      { id: 'sana-patel', name: 'Sana Patel', initialBalance: 75 },
      { id: 'omar-hassan', name: 'Omar Hassan', initialBalance: 30 },
    ],
    attendance: {
      '2026-08-03': ['maya-chen', 'leo-martin', 'sana-patel'],
      '2026-08-10': ['maya-chen', 'sana-patel', 'omar-hassan'],
      '2026-08-17': ['maya-chen', 'leo-martin', 'sana-patel', 'omar-hassan'],
    },
  };
}

export function normalizeWorkspace(value) {
  const empty = createEmptyWorkspace();

  if (!value || typeof value !== 'object') {
    return empty;
  }

  const students = Array.isArray(value.students)
    ? value.students
        .filter((student) => student && typeof student.name === 'string')
        .map((student) => ({
          id: String(student.id || createId('student')),
          name: student.name.trim(),
          initialBalance: toCurrencyNumber(student.initialBalance),
        }))
        .filter((student) => student.name.length > 0)
    : [];
  const studentIds = new Set(students.map((student) => student.id));
  const attendance = {};

  if (value.attendance && typeof value.attendance === 'object') {
    for (const [date, ids] of Object.entries(value.attendance)) {
      if (!isDateKey(date) || !Array.isArray(ids)) {
        continue;
      }

      const present = [...new Set(ids.map(String).filter((id) => studentIds.has(id)))];

      if (present.length > 0) {
        attendance[date] = present;
      }
    }
  }

  return {
    version: 1,
    settings: {
      sessionFee: positiveCurrencyNumber(value.settings?.sessionFee, DEFAULT_SESSION_FEE),
    },
    students,
    attendance,
  };
}

export function createId(prefix) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getAttendanceForDate(attendance, date) {
  return new Set(attendance[date] || []);
}

export function toggleAttendance(attendance, date, studentId) {
  const present = getAttendanceForDate(attendance, date);

  if (present.has(studentId)) {
    present.delete(studentId);
  } else {
    present.add(studentId);
  }

  const next = { ...attendance };

  if (present.size === 0) {
    delete next[date];
  } else {
    next[date] = [...present];
  }

  return next;
}

export function setAttendance(attendance, date, studentIds) {
  const uniqueIds = [...new Set(studentIds)];
  const next = { ...attendance };

  if (uniqueIds.length === 0) {
    delete next[date];
  } else {
    next[date] = uniqueIds;
  }

  return next;
}

export function removeStudentFromAttendance(attendance, studentId) {
  return Object.entries(attendance).reduce((next, [date, ids]) => {
    const remaining = ids.filter((id) => id !== studentId);

    if (remaining.length > 0) {
      next[date] = remaining;
    }

    return next;
  }, {});
}

export function getStudentSummary(student, attendance, sessionFee) {
  const dates = Object.entries(attendance)
    .filter(([, ids]) => ids.includes(student.id))
    .map(([date]) => date)
    .sort();
  const sessions = dates.length;
  const initialBalance = toCurrencyNumber(student.initialBalance);
  const charges = sessions * positiveCurrencyNumber(sessionFee, DEFAULT_SESSION_FEE);

  return {
    ...student,
    initialBalance,
    sessions,
    charges,
    currentBalance: initialBalance - charges,
    dates,
  };
}

export function getStudentSummaries(workspace) {
  return workspace.students
    .map((student) => getStudentSummary(student, workspace.attendance, workspace.settings.sessionFee))
    .sort((first, second) => first.name.localeCompare(second.name));
}

export function getDashboardMetrics(workspace) {
  const summaries = getStudentSummaries(workspace);
  const totalInitialBalance = summaries.reduce((total, student) => total + student.initialBalance, 0);
  const totalCharges = summaries.reduce((total, student) => total + student.charges, 0);
  const sessionCount = Object.keys(workspace.attendance).length;

  return {
    activeStudents: summaries.length,
    sessionCount,
    totalInitialBalance,
    totalCharges,
    outstandingBalance: totalInitialBalance - totalCharges,
  };
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`));
}

export function createCsv(summaries) {
  const header = ['Student', 'Initial credit', 'Sessions', 'Session charges', 'Current balance'];
  const rows = summaries.map((student) => [
    student.name,
    student.initialBalance,
    student.sessions,
    student.charges,
    student.currentBalance,
  ]);

  return [header, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
}

function escapeCsv(value) {
  const stringValue = String(value);
  return /[",\n]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
}

function isDateKey(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function toCurrencyNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0;
}

function positiveCurrencyNumber(value, fallback) {
  const parsed = toCurrencyNumber(value);
  return parsed > 0 ? parsed : fallback;
}
