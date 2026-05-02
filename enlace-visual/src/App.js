import { useState } from "react";

function App() {
  const [grupo, setGrupo] = useState(null);

  if (grupo === null) {
    return (
      <div style={{ minHeight: "100vh", background: "#08080F", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", padding: 24 }}>
        <div style={{ color: "#ffffff88", fontSize: 13, letterSpacing: 3, marginBottom: 12 }}>BIENVENIDO/A</div>
        <h1 style={{ color: "#fff", fontSize: 28, marginBottom: 8, textAlign: "center" }}>¿Cuál es tu mundo?</h1>
        <p style={{ color: "#ffffff55", fontSize: 14, marginBottom: 40, textAlign: "center" }}>Cada espacio es solo para ti</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 340 }}>
          <div onClick={() => setGrupo("spark")}
            style={{ background: "#1A0A2E", border: "1px solid #FF6B9D44", borderRadius: 20, padding: "28px 24px", cursor: "pointer" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>⚡</div>
            <div style={{ color: "#FF6B9D", fontSize: 22, fontWeight: 700 }}>Spark</div>
            <div style={{ color: "#ffffff77", fontSize: 13, marginTop: 6 }}>Energía, aventura y nuevas historias</div>
          </div>

          <div onClick={() => setGrupo("esencia")}
            style={{ background: "#1A1000", border: "1px solid #C9A96E44", borderRadius: 20, padding: "28px 24px", cursor: "pointer" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>✨</div>
            <div style={{ color: "#C9A96E", fontSize: 22, fontWeight: 700 }}>Esencia</div>
            <div style={{ color: "#ffffff77", fontSize: 13, marginTop: 6 }}>Madurez, profundidad y conexiones reales</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#08080F", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <div style={{ fontSize: 60 }}>{grupo === "spark" ? "⚡" : "✨"}</div>
      <h1 style={{ color: grupo === "spark" ? "#FF6B9D" : "#C9A96E", fontSize: 28, marginTop: 16 }}>
        {grupo === "spark" ? "Bienvenido a Spark" : "Bienvenido a Esencia"}
      </h1>
      <p style={{ color: "#ffffff55" }}>Tu espacio te está esperando</p>
      <button onClick={() => setGrupo(null)}
        style={{ marginTop: 24, background: "transparent", border: "1px solid #ffffff33", color: "#fff", padding: "10px 24px", borderRadius: 12, cursor: "pointer", fontSize: 14 }}>
        Volver
      </button>
    </div>
  );
}

export default App;