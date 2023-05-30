export const ACTIVE_SUBSCRIPTION = 'Subscription is already active';
export const NO_ACTIVE_SUBSCRIPTION = 'No active subscription found';
export const buildUrl = (id: string) =>
  `https://api.movie.com.uy/api/content/detail?contentId=${id}`;
export const MOVIE_DOES_NOT_EXIST_IN_MC_DB =
  'Movie does not exist on the Movie Center database';
export const MAX_RETRIES = 2;
export const DEFAULT_INCREMENT_IN_MS = 500;
