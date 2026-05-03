import { useState } from "react";

// Publicaciones cargadas por el admin
const publicacionesAdmin = [
  {
    id: 1,
    tipo: "🎬 Cine",
    titulo: "Estreno: Misión Imposible 8",
    descripcion: "La nueva entrega de la saga más trepidante. Acción sin parar desde el primer minuto.",
    link: "https://www.cinemark.com.ar",
    emoji: "🎬",
    fechaVence: "2026-02-20",
    repeticionDiaria: false,
    estrellas: 47,
    color: "#FF6B6B"
  },
  {
    id: 2,
    tipo: "🍽️ Restaurante",
    titulo: "Promo cena para dos — La Brasserie",
    descripcion: "Cena romántica para dos personas con entrada, plato principal y postre. Solo por esta semana.",
    link: "https://labrasserie.com.ar",
    emoji: "🍽️",
    fechaVence: "2026-02-10",
    repeticionDiaria: true,
    estrellas: 83,
    color: "#FFB86B"
  },
  {
    id: 3,
    tipo: "🎭 Teatro",
    titulo: "Chicago — El Musical",
    descripcion: "El clásico de Broadway llega a Buenos Aires. Funciones de jueves a domingo.",
    link: "https://teatrocolon.org.ar",
    emoji: "🎭",
    fechaVence: "2026-03-01",
    repeticionDiaria: false,
    estrellas: 124,
    color: "#DA8FFF"
  },
  {
    id: 4,
    tipo: "🏛️ Museo",
    titulo: "Noche de Museos — MALBA",
    descripcion: "Entrada gratuita este sábado de 20 a 02hs. Arte latinoamericano contemporáneo.",
    link: "https://malba.org.ar",
    emoji: "🏛️",
    fechaVence: "2026-02-08",
    repeticionDiaria: false,
    estrellas: 56,
    color: "#6BFFEE"
  },
  {
    id: 5,
    tipo: "🎪 Festival",
    titulo: "Festival de Jazz en el Parque",
    descripcion: "Tres días de música en vivo en el Parque Centenario. Entrada libre y gratuita.",
    link: "",
    emoji: "🎪",
    fechaVence: "2026-02-15",
    repeticionDiaria: false,
    estrellas: 91,
    color: "#A8FF78"
  },
];

const categorias = ["Todos", "🎬 Cine", "🍽️ Restaurante", "🎭 Teatro", "🏛️ Museo", "🎪 Festival"];

function Salidas({ color, nombre, onVolver, onEnviarPlan }) {
  const [categoria, setCategoria] = useState("Todos");
  const [estrelladas, setEstrelladas] = useState([]);
  const [topVisible, setTopVisible] = useState(false);
  const [enviado, setEnviado] = useState(null);

  const hoy = new Date();

  const publicacionesActivas = publicacionesAdmin.filter(p => {
    const vence = new Date(p.fechaVence);
    return vence >= hoy;
  });

  const filtradas = publicacionesActivas.filter(p =>
    categoria === "Todos" || p.tipo === categoria
  );

  const darEstrella = (id) => {
    if (estrelladas.includes(id)) {
      setEstrelladas(estrelladas.filter(e => e !== id));
    } else {
      setEstrelladas([...estrelladas, id]);
    }
  };

  const enviarPlan = (pub) => {
    setEnviado(pub.id);
    setTimeout(() => setEnviado(null), 2000);
    if (onEnviarPlan) onEnviarPlan(pub);
  };

  const topLugares = [...publicacionesActivas]
    .sort((a, b) => b.estrellas - a.estrellas)
    .slice(0, 3);

  return (
    <div style={{ minHeight: "100vh", background: "#08080F", fontFamily: "sans-serif", paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ padding: "20px 20px 12px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #ffffff0A" }}>
        <button onClick={onVolver}
          style={{ background: "none", border: "none", color: color, fontSize: 20, cursor: "pointer" }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>Salidas 🎭</div>
          <div style={{ color: "#ffffff44", fontSize: 12 }}>Planes para compartir</div>
        </div>
        <button onClick={() => setTopVisible(!topVisible)}
          style={{ background: color + "22", border: `1px solid ${color}44`, borderRadius: 20, padding: "6px 12px", color: color, fontSize: 13, cursor: "pointer" }}>
          🏆 Top
        </button>
      </div>

      {/* TOP LUGARES */}
      {topVisible && (
        <div style={{ background: "#ffffff05", borderBottom: "1px solid #ffffff0A", padding: "16px 20px" }}>
          <div style={{ color: "#ffffff77", fontSize: 12, letterSpacing: 2, marginBottom: 12 }}>🏆 MEJOR PUNTUADOS</div>
          {topLugares.map((p, i) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ color: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : "#CD7F32", fontSize: 20, fontWeight: 700, width: 24 }}>
                {i + 1}
              </div>
              <div style={{ fontSize: 24 }}>{p.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{p.titulo}</div>
                <div style={{ color: "#ffffff55", fontSize: 12 }}>⭐ {p.estrellas + (estrelladas.includes(p.id) ? 1 : 0)} estrellas</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filtro categorias */}
      <div style={{ padding: "12px 16px", display: "flex", gap: 8, overflowX: "auto" }}>
        {categorias.map(cat => (
          <div key={cat} onClick={() => setCategoria(cat)}
            style={{ background: categoria === cat ? color + "33" : "#ffffff08", border: `1px solid ${categoria === cat ? color : "#ffffff11"}`, borderRadius: 20, padding: "6px 14px", cursor: "pointer", color: categoria === cat ? color : "#ffffff77", fontSize: 13, whiteSpace: "nowrap", flexShrink: 0 }}>
            {cat}
          </div>
        ))}
      </div>

      {/* Publicaciones */}
      <div style={{ padding: "8px 16px" }}>
        {filtradas.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#ffffff33" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div>No hay publicaciones en esta categoría</div>
          </div>
        ) : (
          filtradas.map(pub => {
            const diasRestantes = Math.ceil((new Date(pub.fechaVence) - hoy) / (1000 * 60 * 60 * 24));
            return (
              <div key={pub.id} style={{ background: "#ffffff08", border: `1px solid ${pub.color}33`, borderRadius: 16, padding: 16, marginBottom: 12 }}>

                {/* Tipo y dias restantes */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ background: pub.color + "22", color: pub.color, borderRadius: 20, padding: "4px 10px", fontSize: 12 }}>
                    {pub.tipo}
                  </span>
                  <span style={{ color: diasRestantes <= 3 ? "#FF6B6B" : "#ffffff44", fontSize: 11 }}>
                    {diasRestantes <= 3 ? "⚠️ " : "⏰ "}{diasRestantes} días restantes
                  </span>
                </div>

                {/* Contenido */}
                <div style={{ fontSize: 32, marginBottom: 8 }}>{pub.emoji}</div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{pub.titulo}</div>
                <div style={{ color: "#ffffff77", fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>{pub.descripcion}</div>

                {pub.repeticionDiaria && (
                  <div style={{ color: "#A8FF78", fontSize: 12, marginBottom: 10 }}>🔄 Se renueva todos los días</div>
                )}

                {pub.link && (
                  <div style={{ color: color, fontSize: 13, marginBottom: 12 }}>🔗 {pub.link}</div>
                )}

                {/* Acciones */}
                <div style={{ display: "flex", gap: 8, borderTop: "1px solid #ffffff0A", paddingTop: 12 }}>
                  <button onClick={() => darEstrella(pub.id)}
                    style={{ flex: 1, background: estrelladas.includes(pub.id) ? "#FFD70033" : "#ffffff08", border: `1px solid ${estrelladas.includes(pub.id) ? "#FFD700" : "#ffffff22"}`, borderRadius: 10, padding: "8px", cursor: "pointer", color: estrelladas.includes(pub.id) ? "#FFD700" : "#ffffff77", fontSize: 13 }}>
                    ⭐ {pub.estrellas + (estrelladas.includes(pub.id) ? 1 : 0)}
                  </button>
                  <button onClick={() => enviarPlan(pub)}
                    style={{ flex: 2, background: enviado === pub.id ? "#4CAF5033" : color + "22", border: `1px solid ${enviado === pub.id ? "#4CAF50" : color + "44"}`, borderRadius: 10, padding: "8px", cursor: "pointer", color: enviado === pub.id ? "#4CAF50" : color, fontSize: 13, fontWeight: 700 }}>
                    {enviado === pub.id ? "✅ ¡Enviado!" : "📤 Enviar como plan"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Salidas;