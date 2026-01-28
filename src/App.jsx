import { useState } from "react";
import { LeverRight } from "./components/LeverRight";
import { SlotReels } from "./components/SlotReels";

export default function App() {
  // símbolos (por ahora solo texto, después van imágenes)
  const SYMBOLS = [
    { id: "SWALLOW", label: "Tatuaje pequeño" },
    { id: "X2", label: "2x1 pequeños" },
    { id: "X3", label: "3x1 pequeños" },
    { id: "DAGGER", label: "Tatuaje 15cm" },
    { id: "COIN", label: "Jackpot" },
  ];

  const [spinning, setSpinning] = useState(false);
  const [finalReels, setFinalReels] = useState([
    "SWALLOW",
    "X2",
    "DAGGER",
  ]);

  function randomSymbol() {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].id;
  }

  function handlePulled() {
    if (spinning) return;

    setSpinning(true);

    // resultado simulado
    const win = Math.random() < 0.3; // 30% AAA (solo para probar)
    if (win) {
      const s = randomSymbol();
      setFinalReels([s, s, s]);
    } else {
      setFinalReels([
        randomSymbol(),
        randomSymbol(),
        randomSymbol(),
      ]);
    }
  }

  return (
    <div className="page">
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: 12 }}>
          MALAMBO TATTOO
        </h1>

        <SlotReels
          symbols={SYMBOLS}
          finalReels={finalReels}
          spinning={spinning}
          onFinished={() => setSpinning(false)}
        />

        <LeverRight
          disabled={spinning}
          onPulled={handlePulled}
        />
      </div>
    </div>
  );
}
