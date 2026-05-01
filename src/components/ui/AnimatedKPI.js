'use client';

import { useState, useEffect } from 'react';

export default function AnimatedKPI({ value }) {
  const match = typeof value === 'string' ? value.match(/^([^\d-]*)([-]?\d+(?:,\d+)*(?:\.\d+)?)(.*)$/) : null;
  
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (!match) {
      setDisplayValue(value);
      return;
    }
    const prefix = match[1];
    const numStr = match[2].replace(/,/g, '');
    const suffix = match[3];
    const num = parseFloat(numStr);
    
    if (isNaN(num)) {
      setDisplayValue(value);
      return;
    }

    const startValue = 0;
    const duration = 1.5;
    
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentNum = startValue + easeProgress * (num - startValue);
      
      let formattedNum = currentNum.toFixed(numStr.includes('.') ? numStr.split('.')[1].length : 0);
      if (match[2].includes(',')) {
        formattedNum = parseFloat(formattedNum).toLocaleString(undefined, {
          minimumFractionDigits: numStr.includes('.') ? numStr.split('.')[1].length : 0,
          maximumFractionDigits: numStr.includes('.') ? numStr.split('.')[1].length : 0
        });
      }
      
      setDisplayValue(`${prefix}${formattedNum}${suffix}`);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, match]);

  return <span className="tabular-nums">{displayValue}</span>;
}
