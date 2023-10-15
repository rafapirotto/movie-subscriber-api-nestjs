export const ACTIVE_SUBSCRIPTION = 'Subscription is already active';
export const NO_SUBSCRIPTION_FOUND = 'No active subscription found';
export const INACTIVE_SUBSCRIPTION =
  'Subscription already exists but is inactive because tickets were already available';
export const CINEMA_NOT_FOUND = 'Cinema not found';
export const buildUrl = (id: string) =>
  `https://api.movie.com.uy/api/content/detail?contentId=${id}`;
export const MOVIE_DOES_NOT_EXIST_IN_MC_DB =
  'Movie does not exist on the Movie Center database';
export const MAX_RETRIES = 2;
export const DEFAULT_INCREMENT_IN_MS = 500;
export const DEFAULT_PUSHOVER_PRIORITY = 0;
export const DEFAULT_CINEMA = {
  id: '001',
  name: 'Movie Montevideo',
};
