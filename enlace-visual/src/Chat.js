import { useState, useRef, useEffect } from "react";

function Chat({ color, nombre, contacto, onVolver }) {
  const [mensajes, setMensajes] = useState([
    { id: 1, texto: "¡Hola! Vi que tenemos gustos en común 😊", mio: false, tipo: "texto" },
    { id: 2, texto: "¡Hola! Sí, me encanta el cine también 🎬", mio: true, tipo: "texto" },
  ]);
  const [texto, setTexto] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const enviarMensaje = () => {
    if (!texto.trim()) return;
    setMensajes([...mensajes, { id: Date.now(), texto, mio: true, tipo: "texto" }]);
    setTexto("");

    // Respuesta automática de prueba
    setTimeout(() => {
      setMensajes(prev => [...prev, {
        id: Date.now() + 1,
        texto: "¡Qué bueno! Me alegra que estemos conectados 😄",
        mio: false,
        tipo: "texto"
      }]);
    }, 1500);
  };

  const handleArchivo = (tipo) => {
    setMensajes([...mensajes, {
      id: Date.now(),
      texto: tipo === "foto" ? "📸 Foto enviada" : tipo === "audio" ? "🎵 Audio enviado" : "🎥 Video enviado",
      mio: true,
      tipo: tipo
    }]);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#08080F", fontFamily: "sans-serif", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #ffffff0A", background: "#08080F", position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={onVolver}
          style={{ background: "none", border: "none", color: color, fontSize: 20, cursor: "pointer" }}>←</button>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: color + "33", border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
          💫
        </div>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{contacto}</div>
          <div style={{ color: "#ffffff44", fontSize: 12 }}>Match ✓</div>
        </div>
      </div>

      {/* Mensajes */}
      <div style={{ flex: 1, padding: "16px 16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingBottom: 80 }}>
        {mensajes.map(msg => (
          <div key={msg.id} style={{ display: "flex", justifyContent: msg.mio ? "flex-end" : "flex-start" }}>
            <div style={{
              background: msg.mio ? color : "#ffffff11",
              color: msg.mio ? "#000" : "#fff",
              borderRadius: msg.mio ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              padding: "10px 16px",
              maxWidth: "75%",
              fontSize: 14,
              lineHeight: 1.5,
              border: msg.mio ? "none" : "1px solid #ffffff11"
            }}>
              {msg.tipo === "foto" && <span style={{ fontSize: 24 }}>📸</span>}
              {msg.tipo === "audio" && <span style={{ fontSize: 24 }}>🎵</span>}
              {msg.tipo === "video" && <span style={{ fontSize: 24 }}>🎥</span>}
              <div>{msg.texto}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#08080F", borderTop: "1px solid #ffffff0A", padding: "12px 16px", display: "flex", gap: 10, alignItems: "center" }}>

        {/* Botones multimedia */}
        <label style={{ cursor: "pointer", fontSize: 22, color: "#ffffff55" }} title="Foto">
          📸
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={() => handleArchivo("foto")} />
        </label>
        <label style={{ cursor: "pointer", fontSize: 22, color: "#ffffff55" }} title="Audio">
          🎵
          <input type="file" accept="audio/*" style={{ display: "none" }} onChange={() => handleArchivo("audio")} />
        </label>
        <label style={{ cursor: "pointer", fontSize: 22, color: "#ffffff55" }} title="Video">
          🎥
          <input type="file" accept="video/*" style={{ display: "none" }} onChange={() => handleArchivo("video")} />
        </label>

        {/* Campo de texto */}
        <input
          value={texto}
          onChange={e => setTexto(e.target.value)}
          onKeyDown={e => e.key === "Enter" && enviarMensaje()}
          placeholder="Escribí un mensaje..."
          style={{ flex: 1, background: "#ffffff0A", border: "1px solid #ffffff22", borderRadius: 24, padding: "10px 16px", color: "#fff", fontSize: 14, outline: "none" }}
        />

        {/* Botón enviar */}
        <button onClick={enviarMensaje}
          style={{ width: 42, height: 42, borderRadius: "50%", background: texto.trim() ? color : "#ffffff11", border: "none", cursor: texto.trim() ? "pointer" : "default", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
          ➤
        </button>
      </div>
    </div>
  );
}

export default Chat;