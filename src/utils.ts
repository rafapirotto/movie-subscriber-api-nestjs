import { HttpStatus, NotFoundException } from '@nestjs/common';

import {
  DEFAULT_INCREMENT_IN_MS,
  MAX_RETRIES,
  MOVIE_DOES_NOT_EXIST_IN_MC_DB,
} from './subscriptions/constants';

const sleep = (ms: number): Promise<number> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const callWithRetry = async (
  cb: () => any,
  retriesLeft: number = MAX_RETRIES
) => {
  const result = await cb();
  if (result.status === HttpStatus.OK) return result;
  if (retriesLeft === 0)
    throw new NotFoundException(MOVIE_DOES_NOT_EXIST_IN_MC_DB);
  const delay =
    DEFAULT_INCREMENT_IN_MS * (1 + Math.abs(MAX_RETRIES - retriesLeft));
  await sleep(delay);
  return callWithRetry(cb, retriesLeft - 1);
};
