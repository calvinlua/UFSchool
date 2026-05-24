import { processImport } from "../services/DataImportService";
import { CsvItem } from "CsvItem";

// ── Mock sequelize transaction ────────────────────────────────────────────────
const mockTransaction = {};
jest.mock("../config/database", () => ({
  __esModule: true,
  default: {
    transaction: jest.fn((cb: (t: Record<string, unknown>) => Promise<void>) =>
      cb(mockTransaction),
    ),
  },
}));

// ── Mock models ───────────────────────────────────────────────────────────────
const mockTeacherUpsert = jest.fn().mockResolvedValue([{}, true]);
const mockStudentUpsert = jest.fn().mockResolvedValue([{}, true]);
const mockClassUpsert = jest.fn().mockResolvedValue([{}, true]);
const mockSubjectUpsert = jest.fn().mockResolvedValue([{}, true]);

const mockTeacherFindAll = jest.fn();
const mockStudentFindAll = jest.fn();
const mockClassFindAll = jest.fn();
const mockSubjectFindAll = jest.fn();

const mockFindOrCreate = jest.fn().mockResolvedValue([{}, true]);
const mockDestroy = jest.fn().mockResolvedValue(1);

jest.mock("../models", () => ({
  Teacher: {
    upsert: (...args: unknown[]) => mockTeacherUpsert(...args),
    findAll: (...args: unknown[]) => mockTeacherFindAll(...args),
  },
  Student: {
    upsert: (...args: unknown[]) => mockStudentUpsert(...args),
    findAll: (...args: unknown[]) => mockStudentFindAll(...args),
  },
  SchoolClass: {
    upsert: (...args: unknown[]) => mockClassUpsert(...args),
    findAll: (...args: unknown[]) => mockClassFindAll(...args),
  },
  Subject: {
    upsert: (...args: unknown[]) => mockSubjectUpsert(...args),
    findAll: (...args: unknown[]) => mockSubjectFindAll(...args),
  },
  TeachingAssignment: {
    findOrCreate: (...args: unknown[]) => mockFindOrCreate(...args),
    destroy: (...args: unknown[]) => mockDestroy(...args),
  },
}));

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeRow = (overrides: Partial<CsvItem> = {}): CsvItem => ({
  teacherEmail: "teacher@test.com",
  teacherName: "Teacher One",
  studentEmail: "student@test.com",
  studentName: "Student One",
  classCode: "CL-1",
  classname: "Class One",
  subjectCode: "MATHS",
  subjectName: "Mathematics",
  toDelete: "0",
  ...overrides,
});

const setupIdMocks = () => {
  mockTeacherFindAll.mockResolvedValue([{ email: "teacher@test.com", id: 1 }]);
  mockStudentFindAll.mockResolvedValue([{ email: "student@test.com", id: 10 }]);
  mockClassFindAll.mockResolvedValue([{ classCode: "CL-1", id: 100 }]);
  mockSubjectFindAll.mockResolvedValue([{ subjectCode: "MATHS", id: 1000 }]);
};

beforeEach(() => {
  jest.clearAllMocks();
  setupIdMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("DataImportService.processImport", () => {
  it("resolves immediately when given an empty array", async () => {
    await expect(processImport([])).resolves.toBeUndefined();
    expect(mockTeacherUpsert).not.toHaveBeenCalled();
  });

  it("upserts all entity tables for a valid row", async () => {
    await processImport([makeRow()]);

    expect(mockTeacherUpsert).toHaveBeenCalledWith(
      { email: "teacher@test.com", name: "Teacher One" },
      { transaction: mockTransaction },
    );
    expect(mockStudentUpsert).toHaveBeenCalledWith(
      { email: "student@test.com", name: "Student One" },
      { transaction: mockTransaction },
    );
    expect(mockClassUpsert).toHaveBeenCalledWith(
      { classCode: "CL-1", className: "Class One" },
      { transaction: mockTransaction },
    );
    expect(mockSubjectUpsert).toHaveBeenCalledWith(
      { subjectCode: "MATHS", subjectName: "Mathematics" },
      { transaction: mockTransaction },
    );
  });

  it("calls findOrCreate for a toDelete=0 row", async () => {
    await processImport([makeRow({ toDelete: "0" })]);
    expect(mockFindOrCreate).toHaveBeenCalledTimes(1);
    expect(mockDestroy).not.toHaveBeenCalled();
  });

  it("calls destroy and not findOrCreate for a toDelete=1 row", async () => {
    await processImport([makeRow({ toDelete: "1" })]);
    expect(mockDestroy).toHaveBeenCalledTimes(1);
    expect(mockFindOrCreate).not.toHaveBeenCalled();
  });

  it("uses the latest name when the same email appears multiple times", async () => {
    mockTeacherFindAll.mockResolvedValue([
      { email: "teacher@test.com", id: 1 },
    ]);

    await processImport([
      makeRow({ teacherName: "Old Name" }),
      makeRow({ teacherName: "New Name" }),
    ]);

    // Only one upsert should happen (the map deduplicates), using the last name.
    expect(mockTeacherUpsert).toHaveBeenCalledTimes(1);
    expect(mockTeacherUpsert).toHaveBeenCalledWith(
      { email: "teacher@test.com", name: "New Name" },
      { transaction: mockTransaction },
    );
  });

  it("throws BadRequestError when a required field is missing", async () => {
    await expect(
      processImport([makeRow({ teacherEmail: "" })]),
    ).rejects.toMatchObject({
      message: expect.stringContaining("teacherEmail"),
    });
  });

  it("throws BadRequestError when toDelete is not 0 or 1", async () => {
    await expect(
      processImport([makeRow({ toDelete: "2" })]),
    ).rejects.toMatchObject({ message: expect.stringContaining("toDelete") });
  });
});
