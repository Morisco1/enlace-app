import { useState } from "react";
import Perfil from "./Perfil";
import Chat from "./Chat";
import Salidas from "./Salidas";
import Historias from "./Historias";
import Admin from "./Admin";

const actividades = [
  "🎬 Cine", "☕ Merienda", "🍽️ Cenar", "🌿 Pasear",
  "🎭 Teatro", "🚴 Bicicleta", "🌸 Plaza", "🏛️ Museo"
];

const generos = [
  { id: "hombre", label: "Hombre", emoji: "👨" },
  { id: "mujer", label: "Mujer", emoji: "👩" },
  { id: "hombre_trans", label: "Hombre trans", emoji: "👨" },
  { id: "mujer_trans", label: "Mujer trans", emoji: "👩" },
  { id: "no_binario", label: "No binario", emoji: "⭐" },
];

const busquedas = [
  { id: "hombres", label: "Hombres", emoji: "👨" },
  { id: "mujeres", label: "Mujeres", emoji: "👩" },
  { id: "ambos", label: "Ambos", emoji: "💫" },
];

const perfilesPrueba = [
  { id: 1, nombre: "Valentina", edad: 26, genero: "mujer", buscaPareja: "hombres", ciudad: "Buenos Aires", km: 1.2, actividades: ["🎬 Cine", "☕ Merienda", "🌿 Pasear"], emoji: "💜" },
  { id: 2, nombre: "Carlos", edad: 31, genero: "hombre", buscaPareja: "mujeres", ciudad: "Buenos Aires", km: 2.5, actividades: ["🍽️ Cenar", "🎭 Teatro", "🏛️ Museo"], emoji: "💙" },
  { id: 3, nombre: "Sofia", edad: 28, genero: "mujer", buscaPareja: "mujeres", ciudad: "Buenos Aires", km: 3.1, actividades: ["🚴 Bicicleta", "🌸 Plaza", "☕ Merienda"], emoji: "🧡" },
  { id: 4, nombre: "Lucas", edad: 35, genero: "hombre", buscaPareja: "hombres", ciudad: "Buenos Aires", km: 0.8, actividades: ["🎬 Cine", "🍽️ Cenar", "🎭 Teatro"], emoji: "💚" },
  { id: 5, nombre: "Marina", edad: 29, genero: "mujer", buscaPareja: "ambos", ciudad: "Buenos Aires", km: 4.2, actividades: ["🌿 Pasear", "🏛️ Museo", "🎬 Cine"], emoji: "❤️" },
];

function sonCompatibles(miGenero, miBusqueda, otroGenero, otroBusqueda) {
  const esHombre = (g) => g === "hombre" || g === "hombre_trans";
  const esMujer = (g) => g === "mujer" || g === "mujer_trans";
  if (miBusqueda === "ambos" && otroBusqueda === "ambos") return true;
  if (miBusqueda === "hombres" && esHombre(otroGenero) && otroBusqueda === "hombres") return true;
  if (miBusqueda === "mujeres" && esMujer(otroGenero) && otroBusqueda === "mujeres") return true;
  if (miBusqueda === "hombres" && esMujer(miGenero) && esHombre(otroGenero) && otroBusqueda === "mujeres") return true;
  if (miBusqueda === "mujeres" && esHombre(miGenero) && esMujer(otroGenero) && otroBusqueda === "hombres") return true;
  return false;
}

function App() {
  const [pantalla, setPantalla] = useState("grupos");
  const [grupo, setGrupo] = useState(null);
  const [form, setForm] = useState({ nombre: "", edad: "", genero: "", actividadesElegidas: [], buscaPareja: "" });
  const [likes, setLikes] = useState([]);
  const [matches, setMatches] = useState([]);
  const [matchNuevo, setMatchNuevo] = useState(null);
  const [chatAbierto, setChatAbierto] = useState(null);

  const color = grupo === "spark" ? "#FF6B9D" : "#C9A96E";

  const puedeRegistrarse = () => {
    let edad = parseInt(form.edad);
    if (grupo === "spark") return edad >= 18 && edad <= 40;
    if (grupo === "esencia") return edad >= 40;
    return false;
  };

  const formularioCompleto = () => {
    return form.nombre && puedeRegistrarse() && form.genero && form.actividadesElegidas.length > 0 && form.buscaPareja;
  };

  const darLike = (perfil) => {
    if (likes.includes(perfil.id)) return;
    setLikes([...likes, perfil.id]);
    if (perfil.id % 2 === 0) {
      setMatches([...matches, perfil.id]);
      setMatchNuevo(perfil);
    }
  };

  const perfilesFiltrados = perfilesPrueba.filter(p =>
    sonCompatibles(form.genero, form.buscaPareja, p.genero, p.buscaPareja)
  );

  if (chatAbierto) {
    return <Chat color={color} nombre={form.nombre} contacto={chatAbierto} onVolver={() => setChatAbierto(null)} />;
  }

  if (pantalla === "miperfil") {
    return <Perfil color={color} nombre={form.nombre} onVolver={() => setPantalla("perfiles")} />;
  }

  if (pantalla === "salidas") {
    return <Salidas color={color} nombre={form.nombre} onVolver={() => setPantalla("perfiles")} />;
  }

  if (pantalla === "historias") {
    return <Historias color={color} nombre={form.nombre} onVolver={() => setPantalla("perfiles")} />;
  }

  if (pantalla === "admin") {
    return <Admin onVolver={() => setPantalla("perfiles")} />;
  }

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
        <div onClick={() => setPantalla("admin")}
          style={{ marginTop: 40, color: "#ffffff22", fontSize: 12, cursor: "pointer" }}>
          🔐 Acceso admin
        </div>
      </div>
    );
  }

  if (pantalla === "registro") {
    const toggleActividad = (act) => {
      if (form.actividadesElegidas.includes(act)) {
        setForm({ ...form, actividadesElegidas: form.actividadesElegidas.filter(a => a !== act) });
      } else if (form.actividadesElegidas.length < 3) {
        setForm({ ...form, actividadesElegidas: [...form.actividadesElegidas, act] });
      }
    };

    return (
      <div style={{ minHeight: "100vh", background: "#08080F", fontFamily: "sans-serif", padding: "32px 24px", paddingBottom: 60 }}>
        <button onClick={() => setPantalla("grupos")}
          style={{ background: "none", border: "none", color: color, fontSize: 16, cursor: "pointer", marginBottom: 24 }}>← Volver</button>
        <div style={{ color: color, fontSize: 13, letterSpacing: 2, marginBottom: 4 }}>{grupo === "spark" ? "⚡ SPARK" : "✨ ESENCIA"}</div>
        <h1 style={{ color: "#fff", fontSize: 24, marginBottom: 24 }}>Creá tu perfil</h1>

        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#ffffff77", fontSize: 13, marginBottom: 8 }}>Tu nombre</div>
          <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="¿Cómo te llaman?"
            style={{ width: "100%", background: "#ffffff0A", border: "1px solid #ffffff22", borderRadius: 12, padding: "12px 16px", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#ffffff77", fontSize: 13, marginBottom: 8 }}>Tu edad</div>
          <input value={form.edad} onChange={e => setForm({ ...form, edad: e.target.value })} placeholder="¿Cuántos años tenés?" type="number"
            style={{ width: "100%", background: "#ffffff0A", border: "1px solid #ffffff22", borderRadius: 12, padding: "12px 16px", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" }} />
          {form.edad && !puedeRegistrarse() && (
            <div style={{ color: "#FF6B6B", fontSize: 12, marginTop: 6 }}>❌ Esta edad no corresponde al grupo {grupo === "spark" ? "Spark (18-40)" : "Esencia (+40)"}</div>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#ffffff77", fontSize: 13, marginBottom: 12 }}>¿Cómo te identificás?</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {generos.map(g => (
              <div key={g.id} onClick={() => setForm({ ...form, genero: g.id })}
                style={{ background: form.genero === g.id ? color + "33" : "#ffffff0A", border: `1px solid ${form.genero === g.id ? color : "#ffffff22"}`, borderRadius: 12, padding: "12px 16px", cursor: "pointer", color: form.genero === g.id ? color : "#ffffffcc", fontSize: 14, display: "flex", alignItems: "center", gap: 10 }}>
                <span>{g.emoji}</span><span>{g.label}</span>
              </div>
            ))}
          </div>
        </div>

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

        <div style={{ marginBottom: 32 }}>
          <div style={{ color: "#ffffff77", fontSize: 13, marginBottom: 12 }}>¿A quién buscás?</div>
          <div style={{ display: "flex", gap: 8 }}>
            {busquedas.map(op => (
              <div key={op.id} onClick={() => setForm({ ...form, buscaPareja: op.id })}
                style={{ flex: 1, background: form.buscaPareja === op.id ? color + "33" : "#ffffff0A", border: `1px solid ${form.buscaPareja === op.id ? color : "#ffffff22"}`, borderRadius: 12, padding: "10px 0", cursor: "pointer", color: form.buscaPareja === op.id ? color : "#ffffffcc", fontSize: 12, textAlign: "center" }}>
                <div>{op.emoji}</div><div>{op.label}</div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => { if (formularioCompleto()) setPantalla("perfiles"); }}
          style={{ width: "100%", background: formularioCompleto() ? color : "#ffffff22", color: formularioCompleto() ? "#000" : "#ffffff55", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 700, cursor: formularioCompleto() ? "pointer" : "not-allowed" }}>
          Crear mi perfil ✨
        </button>
      </div>
    );
  }

  if (pantalla === "perfiles") {
    return (
      <div style={{ minHeight: "100vh", background: "#08080F", fontFamily: "sans-serif", paddingBottom: 80 }}>
        <div style={{ padding: "16px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #ffffff0A" }}>
          <div>
            <div style={{ color: color, fontWeight: 700, fontSize: 20 }}>ENLACE</div>
            <div style={{ color: "#ffffff44", fontSize: 11 }}>{grupo === "spark" ? "⚡ Spark" : "✨ Esencia"}</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <div onClick={() => setPantalla("historias")}
              style={{ color: "#fff", fontSize: 12, cursor: "pointer", background: "#ffffff11", padding: "6px 10px", borderRadius: 20, border: "1px solid #ffffff22" }}>
              📖 Historias
            </div>
            <div onClick={() => setPantalla("salidas")}
              style={{ color: "#fff", fontSize: 12, cursor: "pointer", background: "#ffffff11", padding: "6px 10px", borderRadius: 20, border: "1px solid #ffffff22" }}>
              🎭 Salidas
            </div>
            <div onClick={() => setPantalla("miperfil")}
              style={{ color: "#fff", fontSize: 12, cursor: "pointer", background: color + "22", padding: "6px 10px", borderRadius: 20, border: `1px solid ${color}44` }}>
              👤 Perfil
            </div>
          </div>
        </div>

        <div style={{ padding: "16px 16px" }}>
          <div style={{ color: "#ffffff55", fontSize: 11, letterSpacing: 2, marginBottom: 12 }}>CERCA DE TI 📍</div>
          {perfilesFiltrados.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "#ffffff33" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div>No hay perfiles compatibles cerca todavía</div>
            </div>
          ) : (
            perfilesFiltrados.map(perfil => (
              <div key={perfil.id} style={{ background: "#ffffff08", border: "1px solid #ffffff11", borderRadius: 16, padding: 16, marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#ffffff11", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
                    {perfil.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{perfil.nombre}, {perfil.edad}</div>
                    <div style={{ color: "#ffffff55", fontSize: 12, marginBottom: 8 }}>📍 {perfil.km} km · {perfil.ciudad}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {perfil.actividades.map(a => (
                        <span key={a} style={{ background: color + "22", color: color, borderRadius: 20, padding: "3px 10px", fontSize: 11 }}>{a}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 12, borderTop: "1px solid #ffffff0A", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {matches.includes(perfil.id) ? (
                    <span onClick={() => setChatAbierto(perfil.nombre)} style={{ color: "#4CAF50", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>🎉 ¡Match! Podés chatear →</span>
                  ) : likes.includes(perfil.id) ? (
                    <span style={{ color: "#ffffff44", fontSize: 13 }}>❤️ Like enviado</span>
                  ) : (
                    <span style={{ color: "#ffffff55", fontSize: 13 }}>🔒 $100 para chatear</span>
                  )}
                  <button onClick={() => darLike(perfil)}
                    style={{ background: likes.includes(perfil.id) ? "#ffffff11" : color, color: likes.includes(perfil.id) ? "#ffffff55" : "#000", border: "none", borderRadius: 20, padding: "8px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
                    {likes.includes(perfil.id) ? "❤️ Likeado" : "❤️ Like"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {matchNuevo && (
          <div style={{ position: "fixed", inset: 0, background: "#000000CC", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 50 }}>
            <div style={{ background: "#0F0F1E", border: `1px solid ${color}`, borderRadius: 24, padding: 32, textAlign: "center", maxWidth: 300, width: "100%" }}>
              <div style={{ fontSize: 60, marginBottom: 12 }}>🎉</div>
              <h2 style={{ color: color, fontSize: 24, marginBottom: 8 }}>¡Match!</h2>
              <p style={{ color: "#ffffff77", marginBottom: 24 }}>Vos y {matchNuevo.nombre} se gustaron</p>
              <button onClick={() => { setChatAbierto(matchNuevo.nombre); setMatchNuevo(null); }}
                style={{ width: "100%", background: color, color: "#000", border: "none", borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                💬 Ir al chat
              </button>
              <button onClick={() => setMatchNuevo(null)}
                style={{ width: "100%", background: "transparent", color: "#ffffff55", border: "none", borderRadius: 12, padding: 10, fontSize: 14, cursor: "pointer", marginTop: 8 }}>
                Seguir viendo perfiles
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default App;