import { useEffect, useMemo, useRef, useState } from "react";

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

function buildStrip(symbolIds, finalId, minLen = 28) {
  // crea una lista larga que simula giro y TERMINA en finalId
  const strip = [];
  while (strip.length < minLen - 1) {
    strip.push(symbolIds[Math.floor(Math.random() * symbolIds.length)]);
  }
  strip.push(finalId); // último = el símbolo final
  return strip;
}

export function SlotReels({
  symbols,     // [{id, img, label}]
  finalReels,  // ["SWALLOW","X2","DAGGER"]
  spinning,    // true/false
  onFinished,  // callback cuando termina
}) {
  const cellH = 92; // tamaño de cada símbolo (px)
  const windowH = cellH; // 1 símbolo visible

  const symbolIds = useMemo(() => symbols.map((s) => s.id), [symbols]);

  const [strips, setStrips] = useState([
    buildStrip(symbolIds, symbolIds[0]),
    buildStrip(symbolIds, symbolIds[0]),
    buildStrip(symbolIds, symbolIds[0]),
  ]);

  const offsetsRef = useRef([0, 0, 0]);
  const animRef = useRef(null);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!spinning) return;
    if (!finalReels || finalReels.length !== 3) return;

    // 1) construimos strips que terminen EXACTO en los 3 símbolos pedidos
    const nextStrips = [
      buildStrip(symbolIds, finalReels[0]),
      buildStrip(symbolIds, finalReels[1]),
      buildStrip(symbolIds, finalReels[2]),
    ];
    setStrips(nextStrips);

    // 2) animación con parada escalonada 1-2-3
    const durations = [900, 1150, 1400]; // ms
    const starts = [performance.now(), performance.now(), performance.now()];
    const targets = nextStrips.map((strip) => (strip.length - 1) * cellH);

    offsetsRef.current = [0, 0, 0];

    const tick = (now) => {
      const newOffsets = [0, 0, 0];
      let done = 0;

      for (let i = 0; i < 3; i++) {
        const t = (now - starts[i]) / durations[i];
        const clamped = Math.max(0, Math.min(1, t));
        const eased = easeOutCubic(clamped);

        const base = targets[i] * eased;
        const overshoot = clamped < 1 ? 0 : 10; // rebote al final
        newOffsets[i] = clamped < 1 ? base : targets[i] + overshoot;

        if (clamped >= 1) done += 1;
      }

      offsetsRef.current = newOffsets;
      setFrame((x) => x + 1);

      if (done < 3) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        // vuelta del rebote
        setTimeout(() => {
          offsetsRef.current = targets;
          setFrame((x) => x + 1);
          onFinished?.();
        }, 120);
      }
    };

    animRef.current = requestAnimationFrame(tick);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, finalReels?.join("|")]);

  const byId = useMemo(() => {
    const m = new Map();
    symbols.forEach((s) => m.set(s.id, s));
    return m;
  }, [symbols]);

  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 110,
            height: windowH,
            overflow: "hidden",
            borderRadius: 14,
            border: "2px solid rgba(255,255,255,.12)",
            background: "rgba(0,0,0,.55)",
            boxShadow: "inset 0 0 0 2px rgba(0,0,0,.3)",
          }}
        >
          <div
            style={{
              transform: `translate3d(0, ${-offsetsRef.current[i]}px, 0)`,
              willChange: "transform",
            }}
          >
            {strips[i].map((id, idx) => {
              const sym = byId.get(id);
              return (
                <div
                  key={`${id}-${idx}`}
                  style={{
                    height: cellH,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 84,
                      height: 84,
                      borderRadius: 14,
                      display: "grid",
                      placeItems: "center",
                      background: "rgba(255,255,255,.06)",
                      border: "1px solid rgba(255,255,255,.10)",
                      fontWeight: 800,
                      letterSpacing: 0.3,
                    }}
                  >
                    {/* Si no hay imagen todavía, muestra el ID en texto */}
                    {sym?.img ? (
                      <img
                        src={sym.img}
                        alt={sym.label}
                        style={{ width: 78, height: 78, objectFit: "contain" }}
                        draggable={false}
                      />
                    ) : (
                      <span style={{ fontSize: 12 }}>{id}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
