import { useState } from "react";

const opcionesOjos = ["🟤 Marrones", "🔵 Azules", "🟢 Verdes", "⚫ Negros", "🩶 Grises"];
const opcionesCabello = ["⚫ Negro", "🟤 Castaño", "🟡 Rubio", "🔴 Pelirrojo", "⚪ Canoso", "🎨 Teñido"];
const etiquetasOpciones = [
  "🌎 Viajero", "🐾 Mascotas", "🍕 Foodie", "🎮 Gamer",
  "💪 Deportista", "🎨 Artista", "🎸 Músico", "🚀 Emprendedor",
  "📚 Lector", "🧘 Yoga", "🍷 Sommelier", "🌿 Vegano",
  "📷 Fotógrafo", "🎬 Cinéfilo", "✈️ Mochilero", "🏊 Nadador"
];

function Perfil({ color, nombre, onVolver }) {
  const [fotos, setFotos] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [altura, setAltura] = useState("");
  const [ojos, setOjos] = useState("");
  const [cabello, setCabello] = useState("");
  const [etiquetas, setEtiquetas] = useState([]);
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [twitter, setTwitter] = useState("");
  const [guardado, setGuardado] = useState(false);

  const toggleEtiqueta = (et) => {
    if (etiquetas.includes(et)) {
      setEtiquetas(etiquetas.filter(e => e !== et));
    } else if (etiquetas.length < 5) {
      setEtiquetas([...etiquetas, et]);
    }
  };

  const handleFoto = (e) => {
    const archivos = Array.from(e.target.files);
    archivos.forEach(archivo => {
      if (fotos.length < 6) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setFotos(prev => prev.length < 6 ? [...prev, ev.target.result] : prev);
        };
        reader.readAsDataURL(archivo);
      }
    });
  };

  const guardarPerfil = () => {
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#08080F", fontFamily: "sans-serif", paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ padding: "20px 20px 12px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #ffffff0A" }}>
        <button onClick={onVolver}
          style={{ background: "none", border: "none", color: color, fontSize: 20, cursor: "pointer" }}>←</button>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>Mi perfil</div>
      </div>

      <div style={{ padding: "20px 20px" }}>

        {/* Fotos */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: "#ffffff77", fontSize: 13, marginBottom: 4 }}>Tus fotos</div>
          <div style={{ color: "#ffffff44", fontSize: 12, marginBottom: 12 }}>Hasta 6 fotos · La primera es tu foto principal</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
            {[0,1,2,3,4,5].map(i => (
              <div key={i} style={{ aspectRatio: "1", borderRadius: 12, background: fotos[i] ? "transparent" : "#ffffff08", border: `1px solid ${fotos[i] ? color : "#ffffff22"}`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {fotos[i] ? (
                  <img src={fotos[i]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ color: "#ffffff33", fontSize: 24 }}>+</span>
                )}
              </div>
            ))}
          </div>
          <label style={{ display: "block", background: color + "22", border: `1px solid ${color}44`, borderRadius: 12, padding: "10px", textAlign: "center", cursor: "pointer", color: color, fontSize: 14 }}>
            📸 Subir fotos
            <input type="file" accept="image/*" multiple onChange={handleFoto} style={{ display: "none" }} />
          </label>
        </div>

        {/* Descripcion */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#ffffff77", fontSize: 13, marginBottom: 8 }}>Descripción personal</div>
          <textarea
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Contá algo sobre vos... ¿qué te hace único/a?"
            maxLength={300}
            rows={4}
            style={{ width: "100%", background: "#ffffff0A", border: "1px solid #ffffff22", borderRadius: 12, padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", resize: "none", fontFamily: "sans-serif" }}
          />
          <div style={{ color: "#ffffff33", fontSize: 11, textAlign: "right" }}>{descripcion.length}/300</div>
        </div>

        {/* Etiquetas */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#ffffff77", fontSize: 13, marginBottom: 4 }}>Etiquetas</div>
          <div style={{ color: "#ffffff44", fontSize: 12, marginBottom: 12 }}>Elegí hasta 5 que te representen</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {etiquetasOpciones.map(et => (
              <div key={et} onClick={() => toggleEtiqueta(et)}
                style={{ background: etiquetas.includes(et) ? color + "33" : "#ffffff0A", border: `1px solid ${etiquetas.includes(et) ? color : "#ffffff22"}`, borderRadius: 20, padding: "6px 12px", cursor: "pointer", color: etiquetas.includes(et) ? color : "#ffffffcc", fontSize: 13 }}>
                {et}
              </div>
            ))}
          </div>
        </div>

        {/* Datos fisicos opcionales */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#ffffff77", fontSize: 13, marginBottom: 12 }}>Datos físicos <span style={{ color: "#ffffff33" }}>(opcional)</span></div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ color: "#ffffff55", fontSize: 12, marginBottom: 6 }}>📏 Altura (cm)</div>
            <input value={altura} onChange={e => setAltura(e.target.value)} placeholder="Ej: 170" type="number"
              style={{ width: "100%", background: "#ffffff0A", border: "1px solid #ffffff22", borderRadius: 12, padding: "10px 16px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ color: "#ffffff55", fontSize: 12, marginBottom: 8 }}>👁️ Color de ojos</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {opcionesOjos.map(op => (
                <div key={op} onClick={() => setOjos(op)}
                  style={{ background: ojos === op ? color + "33" : "#ffffff0A", border: `1px solid ${ojos === op ? color : "#ffffff22"}`, borderRadius: 20, padding: "6px 12px", cursor: "pointer", color: ojos === op ? color : "#ffffffcc", fontSize: 12 }}>
                  {op}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ color: "#ffffff55", fontSize: 12, marginBottom: 8 }}>💇 Color de cabello</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {opcionesCabello.map(op => (
                <div key={op} onClick={() => setCabello(op)}
                  style={{ background: cabello === op ? color + "33" : "#ffffff0A", border: `1px solid ${cabello === op ? color : "#ffffff22"}`, borderRadius: 20, padding: "6px 12px", cursor: "pointer", color: cabello === op ? color : "#ffffffcc", fontSize: 12 }}>
                  {op}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Redes sociales */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ color: "#ffffff77", fontSize: 13, marginBottom: 12 }}>Redes sociales <span style={{ color: "#ffffff33" }}>(opcional)</span></div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ color: "#ffffff55", fontSize: 12, marginBottom: 6 }}>📸 Instagram</div>
            <input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@tuusuario"
              style={{ width: "100%", background: "#ffffff0A", border: "1px solid #ffffff22", borderRadius: 12, padding: "10px 16px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ color: "#ffffff55", fontSize: 12, marginBottom: 6 }}>🎵 TikTok</div>
            <input value={tiktok} onChange={e => setTiktok(e.target.value)} placeholder="@tuusuario"
              style={{ width: "100%", background: "#ffffff0A", border: "1px solid #ffffff22", borderRadius: 12, padding: "10px 16px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div>
            <div style={{ color: "#ffffff55", fontSize: 12, marginBottom: 6 }}>🐦 X (Twitter)</div>
            <input value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="@tuusuario"
              style={{ width: "100%", background: "#ffffff0A", border: "1px solid #ffffff22", borderRadius: 12, padding: "10px 16px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>

        {/* Boton guardar */}
        <button onClick={guardarPerfil}
          style={{ width: "100%", background: color, color: "#000", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
          {guardado ? "✅ ¡Guardado!" : "Guardar perfil"}
        </button>

      </div>
    </div>
  );
}

export default Perfil;