import { useEffect, useRef, useState } from "react";

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export function LeverRight({ disabled, onPulled }) {
  const wrapRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [pull, setPull] = useState(0); // 0..maxPull
  const firedRef = useRef(false);

  const maxPull = 130;
  const threshold = Math.round(maxPull * 0.72);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const onMove = (e) => {
      if (!dragging || disabled) return;
      e.preventDefault();

      const startY = Number(wrap.dataset.startY || e.clientY);
      const dy = e.clientY - startY;
      const next = clamp(dy, 0, maxPull);

      setPull(next);

      if (!firedRef.current && next >= threshold) {
        firedRef.current = true;
        if (navigator.vibrate) navigator.vibrate(18);
      }
    };

    const onEnd = async () => {
      if (!dragging) return;
      setDragging(false);

      const success = pull >= threshold;

      if (success && !disabled) {
        setPull(maxPull);
        await wait(70);
        onPulled?.();
        await wait(160);
      }

      setPull(0);
      firedRef.current = false;

      try {
        const pid = Number(wrap.dataset.pointerId || "NaN");
        if (!Number.isNaN(pid)) wrap.releasePointerCapture?.(pid);
      } catch {}
      wrap.dataset.pointerId = "";
      wrap.dataset.startY = "";
    };

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
    };
  }, [dragging, disabled, pull, threshold, maxPull, onPulled]);

  const angle = (pull / maxPull) * 24;

  return (
    <div
      ref={wrapRef}
      style={{
        position: "absolute",
        right: 8,
        top: 20,
        width: 84,
        height: 280,
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        zIndex: 20,
        opacity: disabled ? 0.6 : 1,
      }}
      aria-hidden="true"
    >
      <div
        style={{
          position: "absolute",
          right: 8,
          top: 8,
          width: 70,
          height: 250,
          transformOrigin: "50% 18%",
          transform: `rotate(${angle}deg)`,
          transition: dragging ? "none" : "transform 220ms cubic-bezier(.2,.9,.2,1)",
          willChange: "transform",
        }}
      >
        <div
          onPointerDown={(e) => {
            if (disabled) return;
            const wrap = wrapRef.current;
            if (!wrap) return;

            setDragging(true);
            wrap.dataset.pointerId = String(e.pointerId);
            wrap.dataset.startY = String(e.clientY);
            wrap.setPointerCapture?.(e.pointerId);
          }}
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            width: 44,
            height: 44,
            transform: "translateX(-50%)",
            borderRadius: 999,
            background: "#b51e1e",
            boxShadow: "0 10px 18px rgba(0,0,0,.35)",
            cursor: disabled ? "not-allowed" : "grab",
            touchAction: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 30,
            width: 12,
            height: 185,
            transform: "translateX(-50%)",
            borderRadius: 999,
            background: "rgba(255,255,255,.22)",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,.15)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 210,
            width: 22,
            height: 22,
            transform: "translateX(-50%)",
            borderRadius: 999,
            background: "rgba(0,0,0,.25)",
          }}
        />
      </div>
    </div>
  );
}
