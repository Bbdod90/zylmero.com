"use client";

import { useEffect, useState } from "react";

/** localhost is alleen bereikbaar op dezelfde machine; op een telefoon faalt Safari zonder tunnel/LAN-IP. */
export function LocalhostMobileHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") return;

    const narrow = () => window.matchMedia("(max-width: 768px)").matches;
    setShow(narrow());

    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = () => setShow(narrow());
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (!show) return null;

  return (
    <p className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-center text-xs leading-relaxed text-amber-950 dark:text-amber-100">
      Je gebruikt <strong>localhost</strong> op een smal scherm. Op je telefoon werkt dat meestal
      niet: open de app via je publieke URL (bijv. zylmero.com), je{" "}
      <strong>LAN-IP</strong> (bijv. 192.168.x.x:3000) of een tunnel (ngrok).
    </p>
  );
}
