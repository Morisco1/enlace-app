import { useState } from "react";

const categorias = ["🎬 Cine", "🍽️ Restaurante", "🎭 Teatro", "🏛️ Museo", "🎪 Festival"];
const colores = { "🎬 Cine": "#FF6B6B", "🍽️ Restaurante": "#FFB86B", "🎭 Teatro": "#DA8FFF", "🏛️ Museo": "#6BFFEE", "🎪 Festival": "#A8FF78" };

function Admin({ onVolver }) {
  const [publicaciones, setPublicaciones] = useState([
    { id: 1, tipo: "🎬 Cine", titulo: "Estreno: Misión Imposible 8", descripcion: "La nueva entrega de la saga más trepidante.", link: "https://cinemark.com.ar", fechaVence: "2026-02-20", repeticionDiaria: false, activa: true },
    { id: 2, tipo: "🍽️ Restaurante", titulo: "Promo cena para dos — La Brasserie", descripcion: "Cena romántica para dos con entrada y postre.", link: "https://labrasserie.com.ar", fechaVence: "2026-02-10", repeticionDiaria: true, activa: true },
  ]);

  const [form, setForm] = useState({ tipo: "", titulo: "", descripcion: "", link: "", fechaVence: "", repeticionDiaria: false });
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [password, setPassword] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [errorPass, setErrorPass] = useState(false);

  const PASSWORD_ADMIN = "enlace2024";

  const login = () => {
    if (password === PASSWORD_ADMIN) {
      setAutenticado(true);
      setErrorPass(false);
    } else {
      setErrorPass(true);
    }
  };

  const formularioCompleto = () => {
    return form.tipo && form.titulo && form.descripcion && form.fechaVence;
  };

  const publicar = () => {
    if (!formularioCompleto()) return;
    setPublicaciones([...publicaciones, {
      id: Date.now(),
      ...form,
      activa: true
    }]);
    setForm({ tipo: "", titulo: "", descripcion: "", link: "", fechaVence: "", repeticionDiaria: false });
    setMostrarForm(false);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  const toggleActiva = (id) => {
    setPublicaciones(publicaciones.map(p => p.id === id ? { ...p, activa: !p.activa } : p));
  };

  const eliminar = (id) => {
    setPublicaciones(publicaciones.filter(p => p.id !== id));
  };

  const diasRestantes = (fecha) => {
    const hoy = new Date();
    const vence = new Date(fecha);
    return Math.ceil((vence - hoy) / (1000 * 60 * 60 * 24));
  };

  // PANTALLA LOGIN ADMIN
  if (!autenticado) {
    return (
      <div style={{ minHeight: "100vh", background: "#08080F", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", padding: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
        <h1 style={{ color: "#fff", fontSize: 24, marginBottom: 8 }}>Panel Admin</h1>
        <p style={{ color: "#ffffff55", fontSize: 14, marginBottom: 32, textAlign: "center" }}>Solo para administradores de ENLACE</p>

        <div style={{ width: "100%", maxWidth: 300 }}>
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && login()}
            type="password"
            placeholder="Contraseña"
            style={{ width: "100%", background: "#ffffff0A", border: `1px solid ${errorPass ? "#FF6B6B" : "#ffffff22"}`, borderRadius: 12, padding: "12px 16px", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box", marginBottom: 8 }}
          />
          {errorPass && <div style={{ color: "#FF6B6B", fontSize: 13, marginBottom: 12 }}>❌ Contraseña incorrecta</div>}
          <button onClick={login}
            style={{ width: "100%", background: "#C9A96E", color: "#000", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 12 }}>
            Entrar
          </button>
          <button onClick={onVolver}
            style={{ width: "100%", background: "transparent", color: "#ffffff55", border: "none", fontSize: 14, cursor: "pointer" }}>
            ← Volver a la app
          </button>
        </div>
      </div>
    );
  }

  // PANEL ADMIN
  return (
    <div style={{ minHeight: "100vh", background: "#08080F", fontFamily: "sans-serif", paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ padding: "20px 20px 12px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #ffffff0A", background: "#0A0A0A" }}>
        <button onClick={onVolver}
          style={{ background: "none", border: "none", color: "#C9A96E", fontSize: 20, cursor: "pointer" }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#C9A96E", fontWeight: 700, fontSize: 18 }}>🔐 Panel Admin</div>
          <div style={{ color: "#ffffff44", fontSize: 12 }}>{publicaciones.length} publicaciones · {publicaciones.filter(p => p.activa).length} activas</div>
        </div>
        <button onClick={() => setMostrarForm(!mostrarForm)}
          style={{ background: "#C9A96E", border: "none", borderRadius: 20, padding: "8px 16px", color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          + Nueva
        </button>
      </div>

      {guardado && (
        <div style={{ background: "#4CAF5022", border: "1px solid #4CAF5044", padding: "10px 20px", textAlign: "center", color: "#4CAF50", fontSize: 14 }}>
          ✅ Publicación agregada exitosamente
        </div>
      )}

      {/* Formulario nueva publicacion */}
      {mostrarForm && (
        <div style={{ background: "#ffffff06", borderBottom: "1px solid #ffffff0A", padding: "20px" }}>
          <div style={{ color: "#C9A96E", fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Nueva publicación</div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ color: "#ffffff77", fontSize: 13, marginBottom: 8 }}>Categoría</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {categorias.map(cat => (
                <div key={cat} onClick={() => setForm({ ...form, tipo: cat })}
                  style={{ background: form.tipo === cat ? colores[cat] + "33" : "#ffffff08", border: `1px solid ${form.tipo === cat ? colores[cat] : "#ffffff22"}`, borderRadius: 20, padding: "6px 12px", cursor: "pointer", color: form.tipo === cat ? colores[cat] : "#ffffffcc", fontSize: 13 }}>
                  {cat}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ color: "#ffffff77", fontSize: 13, marginBottom: 8 }}>Título</div>
            <input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Ej: Estreno Avatar 3"
              style={{ width: "100%", background: "#ffffff0A", border: "1px solid #ffffff22", borderRadius: 12, padding: "10px 16px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ color: "#ffffff77", fontSize: 13, marginBottom: 8 }}>Descripción</div>
            <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción de la oferta..." rows={3}
              style={{ width: "100%", background: "#ffffff0A", border: "1px solid #ffffff22", borderRadius: 12, padding: "10px 16px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", resize: "none", fontFamily: "sans-serif" }} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ color: "#ffffff77", fontSize: 13, marginBottom: 8 }}>Link (opcional)</div>
            <input value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} placeholder="https://..."
              style={{ width: "100%", background: "#ffffff0A", border: "1px solid #ffffff22", borderRadius: 12, padding: "10px 16px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ color: "#ffffff77", fontSize: 13, marginBottom: 8 }}>⏰ Fecha de vencimiento</div>
            <input value={form.fechaVence} onChange={e => setForm({ ...form, fechaVence: e.target.value })} type="date"
              style={{ width: "100%", background: "#ffffff0A", border: "1px solid #ffffff22", borderRadius: 12, padding: "10px 16px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <div onClick={() => setForm({ ...form, repeticionDiaria: !form.repeticionDiaria })}
              style={{ width: 44, height: 24, borderRadius: 12, background: form.repeticionDiaria ? "#4CAF50" : "#ffffff22", cursor: "pointer", position: "relative", transition: "all .2s" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: form.repeticionDiaria ? 22 : 2, transition: "all .2s" }} />
            </div>
            <span style={{ color: "#ffffff77", fontSize: 13 }}>🔄 Renovar automáticamente cada día</span>
          </div>

          <button onClick={publicar}
            style={{ width: "100%", background: formularioCompleto() ? "#C9A96E" : "#ffffff22", color: formularioCompleto() ? "#000" : "#ffffff55", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 700, cursor: formularioCompleto() ? "pointer" : "not-allowed" }}>
            Publicar ✨
          </button>
        </div>
      )}

      {/* Lista publicaciones */}
      <div style={{ padding: "16px" }}>
        <div style={{ color: "#ffffff55", fontSize: 11, letterSpacing: 2, marginBottom: 12 }}>TUS PUBLICACIONES</div>
        {publicaciones.map(pub => {
          const dias = diasRestantes(pub.fechaVence);
          const color = colores[pub.tipo] || "#ffffff";
          return (
            <div key={pub.id} style={{ background: "#ffffff08", border: `1px solid ${pub.activa ? color + "33" : "#ffffff11"}`, borderRadius: 16, padding: 16, marginBottom: 12, opacity: pub.activa ? 1 : 0.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <span style={{ background: color + "22", color: color, borderRadius: 20, padding: "4px 10px", fontSize: 12 }}>{pub.tipo}</span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ color: dias <= 3 ? "#FF6B6B" : "#ffffff44", fontSize: 11 }}>
                    {dias > 0 ? `${dias} días` : "Vencida"}
                  </span>
                  <div onClick={() => toggleActiva(pub.id)}
                    style={{ width: 36, height: 20, borderRadius: 10, background: pub.activa ? "#4CAF50" : "#ffffff22", cursor: "pointer", position: "relative" }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: pub.activa ? 18 : 2, transition: "all .2s" }} />
                  </div>
                </div>
              </div>

              <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{pub.titulo}</div>
              <div style={{ color: "#ffffff66", fontSize: 13, marginBottom: 8 }}>{pub.descripcion}</div>

              {pub.repeticionDiaria && <div style={{ color: "#A8FF78", fontSize: 12, marginBottom: 8 }}>🔄 Renovación diaria activa</div>}
              {pub.link && <div style={{ color: "#6BFFEE", fontSize: 12, marginBottom: 8 }}>🔗 {pub.link}</div>}

              <button onClick={() => eliminar(pub.id)}
                style={{ background: "#FF6B6B11", border: "1px solid #FF6B6B33", borderRadius: 8, padding: "6px 14px", cursor: "pointer", color: "#FF6B6B", fontSize: 12 }}>
                🗑️ Eliminar
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Admin;