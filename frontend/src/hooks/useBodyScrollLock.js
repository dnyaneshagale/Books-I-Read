import { useEffect } from 'react';

function useBodyScrollLock() {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow || 'unset';
    };
  }, []);
}

export default useBodyScrollLock;
