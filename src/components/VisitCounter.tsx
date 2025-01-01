import { useEffect, useState } from 'react';

export default function VisitCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const storedCount = localStorage.getItem('visitCount');
    const newCount = storedCount ? Number(storedCount) + 1 : 1;
    localStorage.setItem('visitCount', String(newCount));
    setCount(newCount);
  }, []);

  return (
    <div className="visit-counter">
      Visits: <span>{count}</span>
    </div>
  );
}