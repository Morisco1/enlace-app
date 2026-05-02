import { useState } from "react";

const actividades = [
  "🎬 Cine", "☕ Merienda", "🍽️ Cenar", "🌿 Pasear",
  "🎭 Teatro", "🚴 Bicicleta", "🌸 Plaza", "🏛️ Museo"
];

function App() {
  const [pantalla, setPantalla] = useState("grupos");
  const [grupo, setGrupo] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    edad: "",
    actividadesElegidas: [],
    buscaPareja: ""
  });

  // PANTALLA 1 - Selector de grupos
  if (pantalla === "grupos") {
    return (
      <div style={{ minHeight: "100vh", background: "#08080F", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", padding: 24 }}>
        <div style={{ color: "#ffffff88", fontSize: 13, letterSpacing: 3, marginBottom: 12 }}>BIENVENIDO/A</div>
        <h1 style={{ color: "#fff", fontSize: 28, marginBottom: 8, textAlign: "center" }}>¿Cuál es tu mundo?</h1>
        <p style={{ color: "#ffffff55", fontSize: 14, marginBottom: 40, textAlign: "center" }}>Cada espacio es solo para ti</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 340 }}>
          <div onClick={() => { setGrupo("spark"); setPantalla("registro"); }}
            style={{ background: "#1A0A2E", border: "1px solid #FF6B9D44", borderRadius: 20, padding: "28px 24px", cursor: "pointer" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>⚡</div>
            <div style={{ color: "#FF6B9D", fontSize: 22, fontWeight: 700 }}>Spark</div>
            <div style={{ color: "#ffffff77", fontSize: 13, marginTop: 6 }}>Energía, aventura y nuevas historias</div>
          </div>

          <div onClick={() => { setGrupo("esencia"); setPantalla("registro"); }}
            style={{ background: "#1A1000", border: "1px solid #C9A96E44", borderRadius: 20, padding: "28px 24px", cursor: "pointer" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>✨</div>
            <div style={{ color: "#C9A96E", fontSize: 22, fontWeight: 700 }}>Esencia</div>
            <div style={{ color: "#ffffff77", fontSize: 13, marginTop: 6 }}>Madurez, profundidad y conexiones reales</div>
          </div>
        </div>
      </div>
    );
  }

  const color = grupo === "spark" ? "#FF6B9D" : "#C9A96E";

  // PANTALLA 2 - Registro
  if (pantalla === "registro") {
    const toggleActividad = (act) => {
      if (form.actividadesElegidas.includes(act)) {
        setForm({ ...form, actividadesElegidas: form.actividadesElegidas.filter(a => a !== act) });
      } else if (form.actividadesElegidas.length < 3) {
        setForm({ ...form, actividadesElegidas: [...form.actividadesElegidas, act] });
      }
    };

    const puedeRegistrarse = () => {
      let edad = parseInt(form.edad);
      if (grupo === "spark") return edad >= 18 && edad <= 40;
      if (grupo === "esencia") return edad >= 40;
      return false;
    };

    return (
      <div style={{ minHeight: "100vh", background: "#08080F", fontFamily: "sans-serif", padding: "32px 24px" }}>
        <button onClick={() => setPantalla("grupos")}
          style={{ background: "none", border: "none", color: color, fontSize: 16, cursor: "pointer", marginBottom: 24 }}>
          ← Volver
        </button>

        <div style={{ color: color, fontSize: 13, letterSpacing: 2, marginBottom: 4 }}>
          {grupo === "spark" ? "⚡ SPARK" : "✨ ESENCIA"}
        </div>
        <h1 style={{ color: "#fff", fontSize: 24, marginBottom: 24 }}>Creá tu perfil</h1>

        {/* Nombre */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#ffffff77", fontSize: 13, marginBottom: 8 }}>Tu nombre</div>
          <input
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
            placeholder="¿Cómo te llaman?"
            style={{ width: "100%", background: "#ffffff0A", border: "1px solid #ffffff22", borderRadius: 12, padding: "12px 16px", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {/* Edad */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#ffffff77", fontSize: 13, marginBottom: 8 }}>Tu edad</div>
          <input
            value={form.edad}
            onChange={e => setForm({ ...form, edad: e.target.value })}
            placeholder="¿Cuántos años tenés?"
            type="number"
            style={{ width: "100%", background: "#ffffff0A", border: "1px solid #ffffff22", borderRadius: 12, padding: "12px 16px", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" }}
          />
          {form.edad && !puedeRegistrarse() && (
            <div style={{ color: "#FF6B6B", fontSize: 12, marginTop: 6 }}>
              ❌ Esta edad no corresponde al grupo {grupo === "spark" ? "Spark (18-40)" : "Esencia (+40)"}
            </div>
          )}
        </div>

        {/* Actividades */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#ffffff77", fontSize: 13, marginBottom: 4 }}>Actividades favoritas</div>
          <div style={{ color: "#ffffff44", fontSize: 12, marginBottom: 12 }}>Elegí hasta 3</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {actividades.map(act => (
              <div key={act} onClick={() => toggleActividad(act)}
                style={{ background: form.actividadesElegidas.includes(act) ? color + "33" : "#ffffff0A", border: `1px solid ${form.actividadesElegidas.includes(act) ? color : "#ffffff22"}`, borderRadius: 12, padding: "10px 14px", cursor: "pointer", color: form.actividadesElegidas.includes(act) ? color : "#ffffffcc", fontSize: 13 }}>
                {act}
              </div>
            ))}
          </div>
        </div>

        {/* Busca */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ color: "#ffffff77", fontSize: 13, marginBottom: 12 }}>¿A quién buscás?</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["Hombre", "Mujer", "Ambos"].map(op => (
              <div key={op} onClick={() => setForm({ ...form, buscaPareja: op })}
                style={{ flex: 1, background: form.buscaPareja === op ? color + "33" : "#ffffff0A", border: `1px solid ${form.buscaPareja === op ? color : "#ffffff22"}`, borderRadius: 12, padding: "10px 0", cursor: "pointer", color: form.buscaPareja === op ? color : "#ffffffcc", fontSize: 13, textAlign: "center" }}>
                {op}
              </div>
            ))}
          </div>
        </div>

        {/* Botón */}
        <button
          onClick={() => {
            if (form.nombre && puedeRegistrarse() && form.actividadesElegidas.length > 0 && form.buscaPareja) {
              setPantalla("perfil");
            }
          }}
          style={{ width: "100%", background: color, color: "#000", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
          Crear mi perfil ✨
        </button>
      </div>
    );
  }

  // PANTALLA 3 - Perfil creado
  if (pantalla === "perfil") {
    return (
      <div style={{ minHeight: "100vh", background: "#08080F", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", padding: 24 }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
        <h1 style={{ color: color, fontSize: 26, marginBottom: 8 }}>¡Hola, {form.nombre}!</h1>
        <p style={{ color: "#ffffff77", marginBottom: 24 }}>Tu perfil fue creado</p>

        <div style={{ background: "#ffffff08", border: `1px solid ${color}44`, borderRadius: 16, padding: 20, width: "100%", maxWidth: 340 }}>
          <div style={{ color: "#ffffff55", fontSize: 12, marginBottom: 4 }}>GRUPO</div>
          <div style={{ color: color, fontWeight: 700, marginBottom: 16 }}>{grupo === "spark" ? "⚡ Spark" : "✨ Esencia"}</div>

          <div style={{ color: "#ffffff55", fontSize: 12, marginBottom: 4 }}>EDAD</div>
          <div style={{ color: "#fff", marginBottom: 16 }}>{form.edad} años</div>

          <div style={{ color: "#ffffff55", fontSize: 12, marginBottom: 4 }}>ACTIVIDADES</div>
          <div style={{ color: "#fff", marginBottom: 16 }}>{form.actividadesElegidas.join(", ")}</div>

          <div style={{ color: "#ffffff55", fontSize: 12, marginBottom: 4 }}>BUSCA</div>
          <div style={{ color: "#fff" }}>{form.buscaPareja}</div>
        </div>

        <button onClick={() => { setPantalla("grupos"); setForm({ nombre: "", edad: "", actividadesElegidas: [], buscaPareja: "" }); }}
          style={{ marginTop: 24, background: "transparent", border: `1px solid ${color}`, color: color, padding: "10px 24px", borderRadius: 12, cursor: "pointer", fontSize: 14 }}>
          Volver al inicio
        </button>
      </div>
    );
  }
}

export default App;