import { useState } from "react";
import { LeverRight } from "./components/LeverRight";
import { SlotReels } from "./components/SlotReels";

export default function App() {
  const SYMBOLS = [
    { id: "SWALLOW", label: "Tatuaje pequeño" },
    { id: "X2", label: "2x1 pequeños" },
    { id: "X3", label: "3x1 pequeños" },
    { id: "DAGGER", label: "Tatuaje 15cm" },
    { id: "COIN", label: "Jackpot" },
  ];

  const [spinning, setSpinning] = useState(false);
  const [finalReels, setFinalReels] = useState(["SWALLOW", "X2", "DAGGER"]);

  function randomSymbol() {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].id;
  }

  function handlePulled() {
    if (spinning) return;

    setSpinning(true);

    // Resultado simulado (solo para probar animación)
    const win = Math.random() < 0.3;
    if (win) {
      const s = randomSymbol();
      setFinalReels([s, s, s]);
    } else {
      setFinalReels([randomSymbol(), randomSymbol(), randomSymbol()]);
    }
  }

  return (
    <div className="page">
      <div style={{ width: "100%", maxWidth: 520, margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", marginBottom: 12 }}>
          MALAMBO TATTOO
        </h1>

        <div
          style={{
            position: "relative",
            width: "100%",
            height: 320,
            borderRadius: 18,
            padding: "24px 84px 24px 24px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
            display: "grid",
            placeItems: "center",
            overflow: "hidden",
          }}
        >
          <SlotReels
            symbols={SYMBOLS}
            finalReels={finalReels}
            spinning={spinning}
            onFinished={() => setSpinning(false)}
          />

          <LeverRight disabled={spinning} onPulled={handlePulled} />
        </div>
      </div>
    </div>
  );
}
