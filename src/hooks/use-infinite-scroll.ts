import { useEffect } from 'react';

export function useInfiniteScroll(
  fetchMore: () => void,
  hasMore: boolean,
  isLoading: boolean = false
) {
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000 && // Load more when 1000px from bottom
        hasMore &&
        !isLoading
      ) {
        fetchMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchMore, hasMore, isLoading]);
}