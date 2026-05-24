import { getWorkloadReport } from '../services/ReportService';

// ── Mock sequelize ────────────────────────────────────────────────────────────
const mockQuery = jest.fn();
jest.mock('../config/database', () => ({
  __esModule: true,
  default: { query: (...args: unknown[]) => mockQuery(...args) },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('ReportService.getWorkloadReport', () => {
  it('returns an empty object when there are no assignments', async () => {
    mockQuery.mockResolvedValue([]);
    const report = await getWorkloadReport();
    expect(report).toEqual({});
  });

  it('groups entries by teacher name', async () => {
    mockQuery.mockResolvedValue([
      { teacherName: 'Alice', subjectCode: 'MATHS', subjectName: 'Mathematics', numberOfClasses: 2 },
      { teacherName: 'Alice', subjectCode: 'ENG',   subjectName: 'English',     numberOfClasses: 1 },
      { teacherName: 'Bob',   subjectCode: 'ENG',   subjectName: 'English',     numberOfClasses: 3 },
    ]);

    const report = await getWorkloadReport();

    expect(Object.keys(report)).toEqual(['Alice', 'Bob']);
    expect(report['Alice']).toHaveLength(2);
    expect(report['Bob']).toHaveLength(1);
  });

  it('returns the correct shape for each entry', async () => {
    mockQuery.mockResolvedValue([
      { teacherName: 'Alice', subjectCode: 'MATHS', subjectName: 'Mathematics', numberOfClasses: '3' },
    ]);

    const report = await getWorkloadReport();

    expect(report['Alice'][0]).toEqual({
      subjectCode:      'MATHS',
      subjectName:      'Mathematics',
      numberOfClasses:  3, // coerced to number
    });
  });

  it('coerces numberOfClasses to a number', async () => {
    mockQuery.mockResolvedValue([
      { teacherName: 'Alice', subjectCode: 'MATHS', subjectName: 'Mathematics', numberOfClasses: '5' },
    ]);

    const report = await getWorkloadReport();
    expect(typeof report['Alice'][0].numberOfClasses).toBe('number');
  });
});
