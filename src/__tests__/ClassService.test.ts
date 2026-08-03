import { updateClassName } from "../services/ClassService";

// ── Mock models ───────────────────────────────────────────────────────────────
const mockUpdate = jest.fn().mockResolvedValue([1]); // Simulate sequelize update result successful
const mockClassFindOne = jest.fn();

// Mock the SchoolClass model and its findOne method
jest.mock("../models", () => ({
  SchoolClass: {
    findOne: (...args: unknown[]) => mockClassFindOne(...args),
  },
}));

beforeEach(() => {
  // Clear mocks before each test
  jest.clearAllMocks();
  // Mock Database response result
  mockClassFindOne.mockResolvedValue({
    id: 1,
    classCode: "CL-1",
    className: "Old Name",
    update: mockUpdate,
  });
});

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("ClassService.updateClassName", () => {
  it("calls update with the new class name", async () => {
    await updateClassName("CL-1", "New Name");
    expect(mockUpdate).toHaveBeenCalledWith({ className: "New Name" });
  });

  it("throws BadRequestError when the class is not found", async () => {
    mockClassFindOne.mockResolvedValue(null);

    await expect(updateClassName("UNKNOWN", "Name")).rejects.toMatchObject({
      message: expect.stringContaining("UNKNOWN"),
    });

    await expect(updateClassName("UNKNOWN", "Name")).rejects.toMatchObject({
      message: expect.stringContaining("not found"),
    });
  });

  it("looks up the class by classCode", async () => {
    await updateClassName("CL-1", "New Name");
    expect(mockClassFindOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { classCode: "CL-1" } }),
    );
  });
});
