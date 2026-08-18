import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createCsv,
  createSampleWorkspace,
  getDashboardMetrics,
  getStudentSummaries,
  normalizeWorkspace,
  removeStudentFromAttendance,
  setAttendance,
  toggleAttendance,
} from '../src/lib/attendance.js';

describe('attendance records', () => {
  it('toggles a student without mutating the existing record', () => {
    const attendance = { '2026-08-18': ['maya'] };
    const next = toggleAttendance(attendance, '2026-08-18', 'leo');

    assert.deepEqual(attendance, { '2026-08-18': ['maya'] });
    assert.deepEqual(next, { '2026-08-18': ['maya', 'leo'] });
    assert.deepEqual(toggleAttendance(next, '2026-08-18', 'maya'), { '2026-08-18': ['leo'] });
  });

  it('removes empty attendance dates and student history cleanly', () => {
    assert.deepEqual(setAttendance({ '2026-08-18': ['maya'] }, '2026-08-18', []), {});
    assert.deepEqual(
      removeStudentFromAttendance(
        { '2026-08-11': ['maya', 'leo'], '2026-08-18': ['maya'] },
        'maya',
      ),
      { '2026-08-11': ['leo'] },
    );
  });
});

describe('student summaries', () => {
  it('derives session charges and current balances from attendance', () => {
    const workspace = createSampleWorkspace();
    const maya = getStudentSummaries(workspace).find((student) => student.id === 'maya-chen');

    assert.equal(maya.sessions, 3);
    assert.equal(maya.charges, 15);
    assert.equal(maya.currentBalance, 45);
  });

  it('calculates workspace metrics and exports valid CSV rows', () => {
    const workspace = createSampleWorkspace();
    const metrics = getDashboardMetrics(workspace);
    const csv = createCsv(getStudentSummaries(workspace));

    assert.equal(metrics.activeStudents, 4);
    assert.equal(metrics.sessionCount, 3);
    assert.match(csv, /Student,Initial credit,Sessions,Session charges,Current balance/);
    assert.match(csv, /Maya Chen,60,3,15,45/);
  });
});

describe('workspace normalization', () => {
  it('drops invalid entries and preserves valid local data', () => {
    const workspace = normalizeWorkspace({
      students: [
        { id: 'maya', name: ' Maya ', initialBalance: '42.50' },
        { name: '', initialBalance: 5 },
      ],
      settings: { sessionFee: 7.5 },
      attendance: { '2026-08-18': ['maya', 'missing', 'maya'], invalid: ['maya'] },
    });

    assert.deepEqual(workspace.students, [{ id: 'maya', name: 'Maya', initialBalance: 42.5 }]);
    assert.deepEqual(workspace.attendance, { '2026-08-18': ['maya'] });
    assert.equal(workspace.settings.sessionFee, 7.5);
  });
});
