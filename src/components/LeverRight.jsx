import { useEffect, useRef, useState } from "react";

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export function LeverRight({ disabled, onPulled }) {
  const wrapRef = useRef(null);

  const maxPull = 180;     // recorrido total
  const fireAt = maxPull;  // DISPARA solo cuando llega abajo del todo

  const [dragging, setDragging] = useState(false);
  const [pull, setPull] = useState(0);      // 0..maxPull
  const [locked, setLocked] = useState(false); // bloquea mientras “clack” + retorno
  const firedRef = useRef(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const onMove = (e) => {
      if (!dragging || disabled || locked) return;
      e.preventDefault();

      const startY = Number(wrap.dataset.startY || e.clientY);
      const dy = e.clientY - startY;

      // vertical puro
      const next = clamp(dy, 0, maxPull);
      setPull(next);

      // feedback leve cuando llega al fondo
      if (!firedRef.current && next >= fireAt) {
        firedRef.current = true;
        if (navigator.vibrate) navigator.vibrate(25);
      }
    };

    const onEnd = async () => {
      if (!dragging) return;
      setDragging(false);

      // si no llegó al fondo, vuelve arriba y NO dispara
      if (pull < fireAt || disabled) {
        setPull(0);
        firedRef.current = false;
        cleanupPointer(wrap);
        return;
      }

      // si llegó al fondo: clack, dispara 1 vez, vuelve sola
      setLocked(true);

      // “tope” duro: se queda abajo un instante
      setPull(maxPull);
      await wait(90);

      onPulled?.(); // dispara el giro

      // vuelve arriba con resorte (un poquito más lento)
      await wait(140);
      setPull(0);

      await wait(160);
      setLocked(false);
      firedRef.current = false;
      cleanupPointer(wrap);
    };

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
    };
  }, [dragging, disabled, locked, pull]);

  return (
    <div
      ref={wrapRef}
      style={{
        position: "absolute",
        right: 8,
        top: 20,
        width: 84,
        height: 320,
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        zIndex: 20,
        opacity: disabled ? 0.6 : 1,
      }}
      aria-hidden="true"
    >
      {/* Riel */}
      <div
        style={{
          position: "absolute",
          right: 26,
          top: 18,
          width: 12,
          height: 260,
          borderRadius: 999,
          background: "rgba(255,255,255,.10)",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,.25)",
        }}
      />

      {/* Varilla (opcional, para que parezca más real) */}
      <div
        style={{
          position: "absolute",
          right: 31,
          top: 18,
          width: 2,
          height: 260,
          background: "rgba(0,0,0,.25)",
        }}
      />

      {/* Perilla draggable */}
      <div
        onPointerDown={(e) => {
          if (disabled || locked) return;
          const wrap = wrapRef.current;
          if (!wrap) return;

          setDragging(true);
          wrap.dataset.pointerId = String(e.pointerId);
          wrap.dataset.startY = String(e.clientY);
          wrap.setPointerCapture?.(e.pointerId);
        }}
        style={{
          position: "absolute",
          right: 10,
          top: 18,
          width: 44,
          height: 44,
          borderRadius: 999,
          background: locked ? "#8b1515" : "#b51e1e",
          boxShadow: "0 10px 18px rgba(0,0,0,.35)",
          cursor: disabled || locked ? "not-allowed" : "grab",
          touchAction: "none",
          transform: `translate3d(0, ${pull}px, 0)`,
          transition: dragging
            ? "none"
            : "transform 260ms cubic-bezier(.18,.95,.22,1)",
          willChange: "transform",
        }}
      />

      {/* Base abajo */}
      <div
        style={{
          position: "absolute",
          right: 21,
          top: 290,
          width: 22,
          height: 22,
          borderRadius: 999,
          background: "rgba(0,0,0,.22)",
        }}
      />
    </div>
  );
}

function cleanupPointer(wrap) {
  try {
    const pid = Number(wrap.dataset.pointerId || "NaN");
    if (!Number.isNaN(pid)) wrap.releasePointerCapture?.(pid);
  } catch {}
  wrap.dataset.pointerId = "";
  wrap.dataset.startY = "";
}
