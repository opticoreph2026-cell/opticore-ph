'use client';

import { useEffect, useState, useRef } from 'react';

export default function AnimatedNumber({ value, duration = 1500, formatFn = (n) => n.toLocaleString() }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const targetValue = parseInt(value.toString().replace(/,/g, ''), 10) || 0;

    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      
      // ease-out quint
      const easeProgress = 1 - Math.pow(1 - progress, 5); 

      // If user provided a numeric target, we tick up.
      // If it's 0 or we reach the end, finalize at targetValue.
      if (progress < 1) {
        setCount(Math.floor(easeProgress * targetValue));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(targetValue);
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        animationFrame = requestAnimationFrame(animate);
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, [value, duration]);

  return <span ref={elementRef} className="text-display tracking-tight">{formatFn(count)}</span>;
}
