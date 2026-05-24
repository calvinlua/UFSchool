import { getStudentsForClass } from '../services/StudentService';

// ── Mock axios ────────────────────────────────────────────────────────────────
const mockAxiosGet = jest.fn();
jest.mock('axios', () => ({ get: (...args: unknown[]) => mockAxiosGet(...args) }));

// ── Mock models ───────────────────────────────────────────────────────────────
const mockClassFindOne          = jest.fn();
const mockAssignmentFindAll     = jest.fn();
const mockStudentFindAll        = jest.fn();

jest.mock('../models', () => ({
  SchoolClass: {
    findOne: (...args: unknown[]) => mockClassFindOne(...args),
  },
  TeachingAssignment: {
    findAll: (...args: unknown[]) => mockAssignmentFindAll(...args),
  },
  Student: {
    findAll: (...args: unknown[]) => mockStudentFindAll(...args),
  },
}));

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeExternalResponse = (students: { id: number; name: string; email: string }[]) => ({
  data: { count: students.length, students },
});

const mockClass = { id: 1, classCode: 'CL-1', className: 'Class One' };

beforeEach(() => {
  jest.clearAllMocks();
  mockClassFindOne.mockResolvedValue(mockClass);
  mockAssignmentFindAll.mockResolvedValue([]);
  mockStudentFindAll.mockResolvedValue([]);
  mockAxiosGet.mockResolvedValue(makeExternalResponse([]));
});

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('StudentService.getStudentsForClass', () => {
  it('throws BadRequestError when class is not found', async () => {
    mockClassFindOne.mockResolvedValue(null);

    await expect(getStudentsForClass('UNKNOWN', 0, 10)).rejects.toMatchObject({
      message: expect.stringContaining('UNKNOWN'),
    });
  });

  it('returns an empty result when there are no students', async () => {
    const result = await getStudentsForClass('CL-1', 0, 10);
    expect(result).toEqual({ count: 0, students: [] });
  });

  it('does not query students table when no assignments exist', async () => {
    mockAssignmentFindAll.mockResolvedValue([]);
    await getStudentsForClass('CL-1', 0, 10);
    expect(mockStudentFindAll).not.toHaveBeenCalled();
  });

  it('returns internal students with isExternal=false', async () => {
    mockAssignmentFindAll.mockResolvedValue([{ studentId: 1 }]);
    mockStudentFindAll.mockResolvedValue([
      { id: 1, name: 'Alice', email: 'alice@test.com' },
    ]);

    const result = await getStudentsForClass('CL-1', 0, 10);

    expect(result.count).toBe(1);
    expect(result.students[0]).toMatchObject({ isExternal: false, name: 'Alice' });
  });

  it('returns external students with isExternal=true', async () => {
    mockAxiosGet.mockResolvedValue(
      makeExternalResponse([{ id: 99, name: 'Zara', email: 'zara@ext.com' }]),
    );

    const result = await getStudentsForClass('CL-1', 0, 10);

    expect(result.count).toBe(1);
    expect(result.students[0]).toMatchObject({ isExternal: true, name: 'Zara' });
  });

  it('merges and sorts internal and external students alphanumerically', async () => {
    mockAssignmentFindAll.mockResolvedValue([{ studentId: 1 }]);
    mockStudentFindAll.mockResolvedValue([
      { id: 1, name: 'Charlie', email: 'charlie@test.com' },
    ]);
    mockAxiosGet.mockResolvedValue(
      makeExternalResponse([{ id: 5, name: 'Alice', email: 'alice@ext.com' }]),
    );

    const result = await getStudentsForClass('CL-1', 0, 10);

    expect(result.count).toBe(2);
    expect(result.students[0].name).toBe('Alice');
    expect(result.students[1].name).toBe('Charlie');
  });

  it('applies offset and limit to the merged list', async () => {
    mockAssignmentFindAll.mockResolvedValue([{ studentId: 1 }, { studentId: 2 }, { studentId: 3 }]);
    mockStudentFindAll.mockResolvedValue([
      { id: 1, name: 'Alice',   email: 'alice@test.com' },
      { id: 2, name: 'Bob',     email: 'bob@test.com' },
      { id: 3, name: 'Charlie', email: 'charlie@test.com' },
    ]);

    const result = await getStudentsForClass('CL-1', 1, 1);

    expect(result.count).toBe(3);
    expect(result.students).toHaveLength(1);
    expect(result.students[0].name).toBe('Bob');
  });

  it('passes classCode to the external API', async () => {
    await getStudentsForClass('CL-1', 0, 10);
    expect(mockAxiosGet).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ params: expect.objectContaining({ class: 'CL-1' }) }),
    );
  });

  it('deduplicates students with multiple assignments in the same class', async () => {
    // Student 1 is taught by two different teachers in the same class → two assignment rows.
    mockAssignmentFindAll.mockResolvedValue([{ studentId: 1 }, { studentId: 1 }]);
    mockStudentFindAll.mockResolvedValue([
      { id: 1, name: 'Alice', email: 'alice@test.com' },
    ]);

    const result = await getStudentsForClass('CL-1', 0, 10);
    expect(result.count).toBe(1);
  });
});
