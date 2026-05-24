import { SchoolClass } from '../models';
import BadRequestError from '../errors/BadRequestError';

/** Updates the display name of a class identified by its code. */
export const updateClassName = async (classCode: string, className: string): Promise<void> => {
  const cls = await SchoolClass.findOne({ where: { classCode } });
  if (!cls) {
    throw new BadRequestError(`Class '${classCode}' not found`);
  }
  await cls.update({ className });
};
