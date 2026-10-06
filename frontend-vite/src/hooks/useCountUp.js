import { useState, useEffect } from 'react';

// Easing function for smooth slowing down at the end
const easeOutExpo = (t) => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

export const useCountUp = (endValue, duration = 800) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Determine if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion || endValue === 0) {
      setCount(endValue);
      return;
    }

    let startTimestamp = null;
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      const easedProgress = easeOutExpo(progress);
      
      setCount(easedProgress * endValue);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(endValue); // Ensure we end exactly on the target value
      }
    };
    
    window.requestAnimationFrame(step);
    
    return () => {
      // Cleanup if component unmounts before animation finishes
      // (requestAnimationFrame handles itself mostly, but if we had a ref to it we'd cancel it)
    };
  }, [endValue, duration]);

  return count;
};
