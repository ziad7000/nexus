import { useRef, useState, useEffect } from 'react';

export function useInView(options = { threshold: 0.1, triggerOnce: true }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const { threshold = 0.1, triggerOnce = true } = options || {};

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        if (triggerOnce) obs.unobserve(el);
      }
    }, { threshold });

    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, triggerOnce]);

  return [ref, inView];
}
