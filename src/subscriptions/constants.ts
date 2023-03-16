export const ACTIVE_SUBSCRIPTION = 'Subscription is already active';
export const NO_ACTIVE_SUBSCRIPTION = 'No active subscription found';
export const buildUrl = (id: string) =>
  `https://api.movie.com.uy/api/content/detail?contentId=${id}`;
