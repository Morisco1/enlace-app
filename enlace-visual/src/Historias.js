import { useState } from "react";

function Historias({ color, nombre, onVolver }) {
  const [historias, setHistorias] = useState([
    { id: 1, autor: "Valentina", emoji: "💜", texto: "Hoy fui al parque y estaba hermoso 🌸", hora: "Hace 2hs", likes: 12, meGusta: false },
    { id: 2, autor: "Lucas", emoji: "💚", texto: "¿Alguien para ir al cine este finde? 🎬", hora: "Hace 3hs", likes: 8, meGusta: false },
    { id: 3, autor: "Sofia", emoji: "🧡", texto: "Probé el nuevo restaurante del centro... ¡una maravilla! 🍝", hora: "Hace 5hs", likes: 24, meGusta: false },
    { id: 4, autor: "Marina", emoji: "❤️", texto: "Tarde de museo y café ☕🏛️ La mejor combinación", hora: "Hace 6hs", likes: 31, meGusta: false },
  ]);

  const [nuevaHistoria, setNuevaHistoria] = useState("");
  const [nuevaFoto, setNuevaFoto] = useState(null);
  const [publicando, setPublicando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const handleFoto = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      const reader = new FileReader();
      reader.onload = (ev) => setNuevaFoto(ev.target.result);
      reader.readAsDataURL(archivo);
    }
  };

  const publicar = () => {
    if (!nuevaHistoria.trim() && !nuevaFoto) return;
    setPublicando(true);
    setTimeout(() => {
      setHistorias([{
        id: Date.now(),
        autor: nombre,
        emoji: "⭐",
        texto: nuevaHistoria,
        foto: nuevaFoto,
        hora: "Ahora",
        likes: 0,
        meGusta: false,
        mia: true
      }, ...historias]);
      setNuevaHistoria("");
      setNuevaFoto(null);
      setPublicando(false);
      setMostrarFormulario(false);
    }, 1000);
  };

  const toggleLike = (id) => {
    setHistorias(historias.map(h =>
      h.id === id ? { ...h, meGusta: !h.meGusta, likes: h.meGusta ? h.likes - 1 : h.likes + 1 } : h
    ));
  };

  return (
    <div style={{ minHeight: "100vh", background: "#08080F", fontFamily: "sans-serif", paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ padding: "20px 20px 12px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #ffffff0A" }}>
        <button onClick={onVolver}
          style={{ background: "none", border: "none", color: color, fontSize: 20, cursor: "pointer" }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>Historias 📖</div>
          <div style={{ color: "#ffffff44", fontSize: 12 }}>Lo que está pasando</div>
        </div>
        <button onClick={() => setMostrarFormulario(!mostrarFormulario)}
          style={{ background: color, border: "none", borderRadius: 20, padding: "8px 16px", color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          + Publicar
        </button>
      </div>

      {/* Formulario nueva historia */}
      {mostrarFormulario && (
        <div style={{ background: "#ffffff06", borderBottom: "1px solid #ffffff0A", padding: "16px 20px" }}>
          <div style={{ color: "#ffffff77", fontSize: 13, marginBottom: 12 }}>¿Qué querés compartir?</div>

          <textarea
            value={nuevaHistoria}
            onChange={e => setNuevaHistoria(e.target.value)}
            placeholder="Contá algo... un plan, un lugar, cómo estás 😊"
            maxLength={200}
            rows={3}
            style={{ width: "100%", background: "#ffffff0A", border: "1px solid #ffffff22", borderRadius: 12, padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", resize: "none", fontFamily: "sans-serif", marginBottom: 10 }}
          />
          <div style={{ color: "#ffffff33", fontSize: 11, textAlign: "right", marginBottom: 10 }}>{nuevaHistoria.length}/200</div>

          {nuevaFoto && (
            <div style={{ position: "relative", marginBottom: 10 }}>
              <img src={nuevaFoto} alt="" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 12 }} />
              <button onClick={() => setNuevaFoto(null)}
                style={{ position: "absolute", top: 8, right: 8, background: "#000000AA", border: "none", borderRadius: "50%", width: 28, height: 28, color: "#fff", cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <label style={{ flex: 1, background: "#ffffff08", border: "1px solid #ffffff22", borderRadius: 12, padding: "10px", textAlign: "center", cursor: "pointer", color: "#ffffff77", fontSize: 13 }}>
              📸 Agregar foto
              <input type="file" accept="image/*" onChange={handleFoto} style={{ display: "none" }} />
            </label>
            <button onClick={publicar}
              style={{ flex: 2, background: (nuevaHistoria.trim() || nuevaFoto) ? color : "#ffffff22", color: (nuevaHistoria.trim() || nuevaFoto) ? "#000" : "#ffffff55", border: "none", borderRadius: 12, padding: "10px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              {publicando ? "Publicando..." : "Publicar ✨"}
            </button>
          </div>
        </div>
      )}

      {/* Lista de historias */}
      <div style={{ padding: "16px 16px" }}>
        {historias.map(historia => (
          <div key={historia.id} style={{ background: "#ffffff08", border: `1px solid ${historia.mia ? color + "44" : "#ffffff11"}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>

            {/* Autor */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: color + "33", border: `2px solid ${color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                {historia.emoji}
              </div>
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
                  {historia.autor} {historia.mia && <span style={{ color: color, fontSize: 11 }}>· Vos</span>}
                </div>
                <div style={{ color: "#ffffff44", fontSize: 12 }}>⏰ {historia.hora}</div>
              </div>
            </div>

            {/* Foto si tiene */}
            {historia.foto && (
              <img src={historia.foto} alt="" style={{ width: "100%", maxHeight: 250, objectFit: "cover", borderRadius: 12, marginBottom: 10 }} />
            )}

            {/* Texto */}
            {historia.texto && (
              <div style={{ color: "#ffffffcc", fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
                {historia.texto}
              </div>
            )}

            {/* Acciones */}
            <div style={{ display: "flex", gap: 8, borderTop: "1px solid #ffffff0A", paddingTop: 10 }}>
              <button onClick={() => toggleLike(historia.id)}
                style={{ flex: 1, background: historia.meGusta ? color + "22" : "#ffffff08", border: `1px solid ${historia.meGusta ? color : "#ffffff22"}`, borderRadius: 10, padding: "8px", cursor: "pointer", color: historia.meGusta ? color : "#ffffff77", fontSize: 13 }}>
                ❤️ {historia.likes}
              </button>
              {!historia.mia && (
                <button style={{ flex: 1, background: "#ffffff08", border: "1px solid #ffffff22", borderRadius: 10, padding: "8px", cursor: "pointer", color: "#ffffff77", fontSize: 13 }}>
                  💬 Responder
                </button>
              )}
              {historia.mia && (
                <button onClick={() => setHistorias(historias.filter(h => h.id !== historia.id))}
                  style={{ flex: 1, background: "#FF6B6B11", border: "1px solid #FF6B6B33", borderRadius: 10, padding: "8px", cursor: "pointer", color: "#FF6B6B", fontSize: 13 }}>
                  🗑️ Borrar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Historias;