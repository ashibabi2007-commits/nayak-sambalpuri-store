'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen() {
  // Start as true so the entry screen appears first immediately.
  // This prevents the website page from flashing before the entry animation.
  const [show, setShow] = useState(true);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem('nayak_entry_seen');

    // If user already saw it in this browser session, remove it quickly.
    if (alreadySeen) {
      setShow(false);
      return;
    }

    const hideTimer = window.setTimeout(() => setHide(true), 1850);
    const removeTimer = window.setTimeout(() => {
      setShow(false);
      sessionStorage.setItem('nayak_entry_seen', 'true');
    }, 2350);

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(removeTimer);
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
        <div className="splash-loading" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      </div>
    </div>
  );
}
