'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [show, setShow] = useState(false);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    // Show the entry animation once per browser session.
    const alreadySeen = sessionStorage.getItem('nayak_entry_seen');
    if (alreadySeen) return;

    setShow(true);
    const hideTimer = setTimeout(() => setHide(true), 2300);
    const removeTimer = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem('nayak_entry_seen', 'true');
    }, 2850);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div className={`splash-screen ${hide ? 'splash-hide' : ''}`}>
      <div className="splash-pattern" />
      <div className="splash-card">
        <div className="splash-logo-wrap">
          <div className="splash-logo">NSB</div>
          <div className="splash-rings" />
        </div>

        <h1>Nayak Sambalpuri Bastralaya</h1>

        <div className="splash-weave" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <p>Manufacturer Of Sambalpuri cotton and silk saree</p>
        <div className="splash-loading">
          <i />
          <i />
          <i />
        </div>
      </div>
    </div>
  );
}
