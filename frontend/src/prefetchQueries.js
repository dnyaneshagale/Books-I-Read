import bookApi from './api/bookApi';
import reviewApi from './api/reviewApi';
import socialApi from './api/socialApi';

export const prefetchDashboard = async (queryClient) => {
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['books', 'all'],
      queryFn: () => bookApi.getAllBooks(),
      staleTime: 1000 * 60 * 5,
    }),
    queryClient.prefetchQuery({
      queryKey: ['activities', 'dates'],
      queryFn: () => bookApi.getActivityDates(),
      staleTime: 1000 * 60 * 5,
    }),
    queryClient.prefetchQuery({
      queryKey: ['activities', 'details'],
      queryFn: () => bookApi.getActivityDetails(),
      staleTime: 1000 * 60 * 5,
    }),
    queryClient.prefetchQuery({
      queryKey: ['activities', 'daily-stats'],
      queryFn: () => bookApi.getDailyStats(),
      staleTime: 1000 * 60 * 3,
    }),
    queryClient.prefetchQuery({
      queryKey: ['activities', 'period-stats'],
      queryFn: () => bookApi.getPeriodStats(),
      staleTime: 1000 * 60 * 3,
    }),
  ]);
};

export const prefetchFeed = async (queryClient) => {
  await queryClient.prefetchInfiniteQuery({
    queryKey: ['reflections', 'following', 'relevant', 15],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await socialApi.getFollowingReflections(pageParam, 15, 'relevant');
      return response.data;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 3,
  });
};

export const prefetchReviews = async (queryClient) => {
  await queryClient.prefetchQuery({
    queryKey: ['reviews', 'feed', 'following', 'relevant', 0, 20],
    queryFn: async () => {
      const response = await reviewApi.getFollowingReviews(0, 20, 'relevant');
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};
