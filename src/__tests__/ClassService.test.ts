import { updateClassName } from '../services/ClassService';

// ── Mock models ───────────────────────────────────────────────────────────────
const mockUpdate      = jest.fn().mockResolvedValue([1]);
const mockClassFindOne = jest.fn();

jest.mock('../models', () => ({
  SchoolClass: {
    findOne: (...args: unknown[]) => mockClassFindOne(...args),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockClassFindOne.mockResolvedValue({
    id: 1,
    classCode: 'CL-1',
    className: 'Old Name',
    update: mockUpdate,
  });
});

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('ClassService.updateClassName', () => {
  it('calls update with the new class name', async () => {
    await updateClassName('CL-1', 'New Name');
    expect(mockUpdate).toHaveBeenCalledWith({ className: 'New Name' });
  });

  it('throws BadRequestError when the class is not found', async () => {
    mockClassFindOne.mockResolvedValue(null);

    await expect(updateClassName('UNKNOWN', 'Name')).rejects.toMatchObject({
      message: expect.stringContaining('UNKNOWN'),
    });
  });

  it('looks up the class by classCode', async () => {
    await updateClassName('CL-1', 'New Name');
    expect(mockClassFindOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { classCode: 'CL-1' } }),
    );
  });
});
