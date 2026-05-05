import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, BackHandler, Image, FlatList, Modal } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import Auth from './Auth';
import { supabase } from './supabase';

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

const actividades = ["🎬 Cine", "☕ Merienda", "🍽️ Cenar", "🌿 Pasear", "🎭 Teatro", "🚴 Bicicleta", "🌸 Plaza", "🏛️ Museo"];

const perfilesPrueba = [
  { id: 1, nombre: "Valentina", edad: 26, genero: "mujer", buscaPareja: "hombres", grupo: "spark", ciudad: "Buenos Aires", km: 1.2, actividades: ["🎬 Cine", "☕ Merienda", "🌿 Pasear"], emoji: "💜", bio: "Amo el café y los atardeceres 🌅" },
  { id: 2, nombre: "Carlos", edad: 31, genero: "hombre", buscaPareja: "mujeres", grupo: "spark", ciudad: "Buenos Aires", km: 2.5, actividades: ["🍽️ Cenar", "🎭 Teatro", "🏛️ Museo"], emoji: "💙", bio: "Músico de corazón 🎸" },
  { id: 3, nombre: "Sofia", edad: 28, genero: "mujer", buscaPareja: "mujeres", grupo: "spark", ciudad: "Buenos Aires", km: 3.1, actividades: ["🚴 Bicicleta", "🌸 Plaza", "☕ Merienda"], emoji: "🧡", bio: "Bailarina y amante de la naturaleza 🌿" },
  { id: 4, nombre: "Lucas", edad: 35, genero: "hombre", buscaPareja: "hombres", grupo: "spark", ciudad: "Buenos Aires", km: 0.8, actividades: ["🎬 Cine", "🍽️ Cenar", "🎭 Teatro"], emoji: "💚", bio: "Fotógrafo viajero 📷" },
  { id: 5, nombre: "Marina", edad: 29, genero: "mujer", buscaPareja: "ambos", grupo: "esencia", ciudad: "Buenos Aires", km: 4.2, actividades: ["🌿 Pasear", "🏛️ Museo", "🎬 Cine"], emoji: "❤️", bio: "Artista en proceso ✨" },
  { id: 6, nombre: "Roberto", edad: 52, genero: "hombre", buscaPareja: "mujeres", grupo: "esencia", ciudad: "Buenos Aires", km: 1.8, actividades: ["🎬 Cine", "☕ Merienda", "🌿 Pasear"], emoji: "💛", bio: "Chef de fin de semana 🍕" },
  { id: 7, nombre: "Patricia", edad: 47, genero: "mujer", buscaPareja: "hombres", grupo: "esencia", ciudad: "Buenos Aires", km: 3.5, actividades: ["🎭 Teatro", "🍽️ Cenar", "🏛️ Museo"], emoji: "🩷", bio: "Amante del buen vino 🍷" },
];

const salidasData = [
  { id: 1, tipo: "🎬 Cine", titulo: "Estreno: Misión Imposible 8", desc: "Acción sin parar.", emoji: "🎬", dias: 14, estrellas: 47, color: "#FF6B6B" },
  { id: 2, tipo: "🍽️ Restaurante", titulo: "Promo cena para dos", desc: "Cena romántica con entrada y postre.", emoji: "🍽️", dias: 7, estrellas: 83, color: "#FFB86B" },
  { id: 3, tipo: "🎭 Teatro", titulo: "Chicago — El Musical", desc: "El clásico de Broadway en Buenos Aires.", emoji: "🎭", dias: 25, estrellas: 124, color: "#DA8FFF" },
  { id: 4, tipo: "🏛️ Museo", titulo: "Noche de Museos — MALBA", desc: "Entrada gratuita este sábado.", emoji: "🏛️", dias: 3, estrellas: 56, color: "#6BFFEE" },
  { id: 5, tipo: "🎪 Festival", titulo: "Festival de Jazz en el Parque", desc: "Tres días de música en vivo.", emoji: "🎪", dias: 10, estrellas: 91, color: "#A8FF78" },
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

const estadoInicial = { likes: [], matches: [], chats: {}, bloqueados: [] };

// Componente separado para la app principal
function MainApp({ sesion, onCerrarSesion }) {
  const [pantalla, setPantalla] = useState('inicio');
  const [tabActivo, setTabActivo] = useState('radar');
  const [grupo, setGrupo] = useState(null);
  const [form, setForm] = useState({ nombre: "", edad: "", genero: "", actividadesElegidas: [], buscaPareja: "" });
  const [estadoSpark, setEstadoSpark] = useState({ ...estadoInicial, chats: {} });
  const [estadoEsencia, setEstadoEsencia] = useState({ ...estadoInicial, chats: {} });
  const [chatAbierto, setChatAbierto] = useState(null);
  const [perfilViendo, setPerfilViendo] = useState(null);
  const [textoMensaje, setTextoMensaje] = useState("");
  const [estrelladas, setEstrelladas] = useState([]);
  const [quienMeVio, setQuienMeVio] = useState([]);
  const [matchNuevo, setMatchNuevo] = useState(null);
  const [confirmBloqueo, setConfirmBloqueo] = useState(null);
  const [mostrarEnviarCita, setMostrarEnviarCita] = useState(null);
  const [citaEnviada, setCitaEnviada] = useState(null);
  const [tabSalidas, setTabSalidas] = useState('todas');
  const [historias, setHistorias] = useState([
    { id: 1, autor: "Valentina", emoji: "💜", texto: "Hoy fui al parque y estaba hermoso 🌸", likes: 12, meGusta: false, grupo: "spark" },
    { id: 2, autor: "Lucas", emoji: "💚", texto: "¿Alguien para ir al cine este finde? 🎬", likes: 8, meGusta: false, grupo: "spark" },
    { id: 3, autor: "Roberto", emoji: "💛", texto: "Qué buena cena hoy en La Brasserie 🍷", likes: 15, meGusta: false, grupo: "esencia" },
  ]);
  const [nuevaHistoria, setNuevaHistoria] = useState("");
  const [fotoHistoria, setFotoHistoria] = useState(null);

  const color = grupo === 'spark' ? '#FF6B9D' : '#C9A96E';
  const estado = grupo === 'spark' ? estadoSpark : estadoEsencia;
  const setEstado = grupo === 'spark' ? setEstadoSpark : setEstadoEsencia;

  useEffect(() => {
    const backAction = () => {
      if (mostrarEnviarCita) { setMostrarEnviarCita(null); return true; }
      if (perfilViendo) { setPerfilViendo(null); return true; }
      if (chatAbierto) { setChatAbierto(null); return true; }
      if (pantalla === 'registro') { setPantalla('grupos'); return true; }
      if (pantalla === 'grupos') { setPantalla('inicio'); return true; }
      if (pantalla === 'main') { return true; }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [pantalla, chatAbierto, perfilViendo, mostrarEnviarCita]);

  const puedeRegistrarse = () => {
    let edad = parseInt(form.edad);
    if (grupo === 'spark') return edad >= 18 && edad <= 40;
    if (grupo === 'esencia') return edad >= 40;
    return false;
  };

  const formularioCompleto = () => form.nombre && puedeRegistrarse() && form.genero && form.actividadesElegidas.length > 0 && form.buscaPareja;

  const toggleActividad = (act) => {
    if (form.actividadesElegidas.includes(act)) {
      setForm({ ...form, actividadesElegidas: form.actividadesElegidas.filter(a => a !== act) });
    } else if (form.actividadesElegidas.length < 3) {
      setForm({ ...form, actividadesElegidas: [...form.actividadesElegidas, act] });
    }
  };

  const cambiarGrupo = () => {
    setGrupo(grupo === 'spark' ? 'esencia' : 'spark');
    setChatAbierto(null);
    setPerfilViendo(null);
    setTabActivo('radar');
  };

  const darLike = (perfil) => {
    if (estado.likes.includes(perfil.id)) return;
    const nuevosLikes = [...estado.likes, perfil.id];
    let nuevosMatches = [...estado.matches];
    let nuevoMatch = null;
    if (perfil.id % 2 === 0) { nuevosMatches = [...nuevosMatches, perfil.id]; nuevoMatch = perfil; }
    setEstado({ ...estado, likes: nuevosLikes, matches: nuevosMatches });
    if (nuevoMatch) setMatchNuevo(nuevoMatch);
  };

  const bloquear = (perfil) => {
    const id = perfil.id || perfil;
    setEstado({ ...estado, bloqueados: [...estado.bloqueados, id], matches: estado.matches.filter(m => m !== id), likes: estado.likes.filter(l => l !== id) });
    setChatAbierto(null); setPerfilViendo(null); setConfirmBloqueo(null);
  };

  const verPerfil = (perfil) => {
    setPerfilViendo(perfil);
    if (!quienMeVio.includes(perfil.nombre)) setQuienMeVio([...quienMeVio, perfil.nombre]);
  };

  const enviarMensaje = () => {
    if (!textoMensaje.trim()) return;
    const chatActual = estado.chats[chatAbierto] || [];
    const nuevosChats = { ...estado.chats, [chatAbierto]: [...chatActual, { id: Date.now(), texto: textoMensaje, mio: true }] };
    setEstado({ ...estado, chats: nuevosChats });
    setTextoMensaje("");
    setTimeout(() => {
      setEstado(prev => ({ ...prev, chats: { ...prev.chats, [chatAbierto]: [...(nuevosChats[chatAbierto] || []), { id: Date.now() + 1, texto: "¡Qué bueno! 😄", mio: false }] } }));
    }, 1500);
  };

  const elegirFotoHistoria = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) { alert("Necesitamos permiso para acceder a tus fotos"); return; }
    const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!resultado.canceled) setFotoHistoria(resultado.assets[0].uri);
  };

  const publicarHistoria = () => {
    if (!nuevaHistoria.trim() && !fotoHistoria) return;
    setHistorias([{ id: Date.now(), autor: form.nombre, emoji: '⭐', texto: nuevaHistoria, foto: fotoHistoria, likes: 0, meGusta: false, mia: true, grupo }, ...historias]);
    setNuevaHistoria(""); setFotoHistoria(null);
  };

  const enviarCita = (salida, contacto) => {
    const chatActual = estado.chats[contacto] || [];
    const msg = { id: Date.now(), texto: `🎯 Te invito a una cita:\n${salida.emoji} ${salida.titulo}\n📍 ¡Qué te parece?`, mio: true, esCita: true };
    setEstado({ ...estado, chats: { ...estado.chats, [contacto]: [...chatActual, msg] } });
    setMostrarEnviarCita(null); setCitaEnviada(contacto);
    setTimeout(() => setCitaEnviada(null), 2000);
  };

  const misMatchesNombres = perfilesPrueba.filter(p => estado.matches.includes(p.id)).map(p => p.nombre);
  const perfilesFiltrados = perfilesPrueba.filter(p => p.grupo === grupo && sonCompatibles(form.genero, form.buscaPareja, p.genero, p.buscaPareja) && !estado.bloqueados.includes(p.id));
  const historiasGrupo = historias.filter(h => h.grupo === grupo);

  if (pantalla === 'inicio') {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={s.container}>
          <StatusBar style="light" />
          <Text style={{ fontSize: 60, marginBottom: 16 }}>💫</Text>
          <Text style={[s.titulo, { color: '#FF6B9D' }]}>VYNKA</Text>
          <Text style={s.subtitulo}>donde los vínculos comienzan</Text>
          <TouchableOpacity style={[s.boton, { backgroundColor: '#FF6B9D', marginTop: 30 }]} onPress={() => setPantalla('grupos')}>
            <Text style={s.botonTexto}>Comenzar ✨</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onCerrarSesion} style={{ marginTop: 20 }}>
            <Text style={{ color: '#ffffff33', fontSize: 12 }}>Cerrar sesión</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (pantalla === 'grupos') {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#08080F' }}>
          <StatusBar style="light" />
          <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
            <Text style={s.subtitulo}>BIENVENIDO/A</Text>
            <Text style={s.tituloGrande}>¿Cuál es tu mundo?</Text>
            <Text style={s.subtitulo}>Cada espacio es solo para ti</Text>
            <TouchableOpacity style={s.cardSpark} onPress={() => { setGrupo('spark'); setPantalla('registro'); }}>
              <Text style={{ fontSize: 36, marginBottom: 8 }}>⚡</Text>
              <Text style={s.cardTituloSpark}>Spark</Text>
              <Text style={s.cardDesc}>Energía, aventura y nuevas historias</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.cardEsencia} onPress={() => { setGrupo('esencia'); setPantalla('registro'); }}>
              <Text style={{ fontSize: 36, marginBottom: 8 }}>✨</Text>
              <Text style={s.cardTituloEsencia}>Esencia</Text>
              <Text style={s.cardDesc}>Madurez, profundidad y conexiones reales</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (pantalla === 'registro') {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#08080F' }}>
          <StatusBar style="light" />
          <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
            <TouchableOpacity onPress={() => setPantalla('grupos')} style={{ marginBottom: 20 }}>
              <Text style={{ color, fontSize: 16 }}>← Volver</Text>
            </TouchableOpacity>
            <Text style={{ color, fontSize: 12, letterSpacing: 2, marginBottom: 4 }}>{grupo === 'spark' ? '⚡ SPARK' : '✨ ESENCIA'}</Text>
            <Text style={s.tituloGrande}>Creá tu perfil</Text>
            <Text style={s.label}>Tu nombre</Text>
            <TextInput value={form.nombre} onChangeText={t => setForm({ ...form, nombre: t })} placeholder="¿Cómo te llaman?" placeholderTextColor="#ffffff44" style={s.input} />
            <Text style={s.label}>Tu edad</Text>
            <TextInput value={form.edad} onChangeText={t => setForm({ ...form, edad: t })} placeholder="¿Cuántos años tenés?" placeholderTextColor="#ffffff44" keyboardType="numeric" style={s.input} />
            {form.edad !== "" && !puedeRegistrarse() && <Text style={{ color: '#FF6B6B', fontSize: 12, marginBottom: 8 }}>❌ Edad no corresponde a este grupo</Text>}
            <Text style={s.label}>¿Cómo te identificás?</Text>
            {generos.map(g => (
              <TouchableOpacity key={g.id} onPress={() => setForm({ ...form, genero: g.id })}
                style={[s.opcion, { borderColor: form.genero === g.id ? color : '#ffffff22', backgroundColor: form.genero === g.id ? color + '22' : '#ffffff0A' }]}>
                <Text style={{ color: form.genero === g.id ? color : '#ffffffcc', fontSize: 15 }}>{g.emoji} {g.label}</Text>
              </TouchableOpacity>
            ))}
            <Text style={s.label}>Actividades favoritas <Text style={{ color: '#ffffff44' }}>(hasta 3)</Text></Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {actividades.map(act => (
                <TouchableOpacity key={act} onPress={() => toggleActividad(act)}
                  style={[s.chip, { borderColor: form.actividadesElegidas.includes(act) ? color : '#ffffff22', backgroundColor: form.actividadesElegidas.includes(act) ? color + '22' : '#ffffff0A' }]}>
                  <Text style={{ color: form.actividadesElegidas.includes(act) ? color : '#ffffffcc', fontSize: 13 }}>{act}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={s.label}>¿A quién buscás?</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
              {busquedas.map(op => (
                <TouchableOpacity key={op.id} onPress={() => setForm({ ...form, buscaPareja: op.id })}
                  style={[s.opcionFlex, { borderColor: form.buscaPareja === op.id ? color : '#ffffff22', backgroundColor: form.buscaPareja === op.id ? color + '22' : '#ffffff0A' }]}>
                  <Text style={{ fontSize: 20 }}>{op.emoji}</Text>
                  <Text style={{ color: form.buscaPareja === op.id ? color : '#ffffffcc', fontSize: 13 }}>{op.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={() => { if (formularioCompleto()) setPantalla('main'); }}
              style={[s.boton, { backgroundColor: formularioCompleto() ? color : '#ffffff22' }]}>
              <Text style={[s.botonTexto, { color: formularioCompleto() ? '#000' : '#ffffff55' }]}>Crear mi perfil ✨</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (perfilViendo) {
    const tieneMatch = estado.matches.includes(perfilViendo.id);
    const dioLike = estado.likes.includes(perfilViendo.id);
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#08080F' }}>
          <StatusBar style="light" />
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#ffffff0A' }}>
            <TouchableOpacity onPress={() => setPerfilViendo(null)}>
              <Text style={{ color, fontSize: 20, marginRight: 12 }}>←</Text>
            </TouchableOpacity>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Perfil</Text>
          </View>
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <View style={[s.avatar, { width: 100, height: 100, marginBottom: 12 }]}>
                <Text style={{ fontSize: 50 }}>{perfilViendo.emoji}</Text>
              </View>
              <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>{perfilViendo.nombre}, {perfilViendo.edad}</Text>
              <Text style={{ color: '#ffffff55', fontSize: 14, marginTop: 4 }}>📍 {perfilViendo.km} km · {perfilViendo.ciudad}</Text>
            </View>
            {perfilViendo.bio && (
              <View style={s.card}>
                <Text style={{ color: '#ffffff55', fontSize: 12, marginBottom: 4 }}>BIO</Text>
                <Text style={{ color: '#fff', fontSize: 14 }}>{perfilViendo.bio}</Text>
              </View>
            )}
            <View style={s.card}>
              <Text style={{ color: '#ffffff55', fontSize: 12, marginBottom: 8 }}>ACTIVIDADES</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {perfilViendo.actividades.map(a => (
                  <View key={a} style={[s.chip, { borderColor: color + '44', backgroundColor: color + '22' }]}>
                    <Text style={{ color, fontSize: 12 }}>{a}</Text>
                  </View>
                ))}
              </View>
            </View>
            {tieneMatch ? (
              <TouchableOpacity onPress={() => { setChatAbierto(perfilViendo.nombre); setPerfilViendo(null); }}
                style={[s.boton, { backgroundColor: '#4CAF50', marginBottom: 8 }]}>
                <Text style={s.botonTexto}>💬 Chatear</Text>
              </TouchableOpacity>
            ) : (
              <View style={[s.card, { backgroundColor: color + '11', borderColor: color + '33', alignItems: 'center' }]}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>🔒</Text>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>Para chatear con {perfilViendo.nombre}</Text>
                <Text style={{ color: '#ffffff55', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>Primero hacé match dando like</Text>
                <TouchableOpacity onPress={() => darLike(perfilViendo)} style={[s.boton, { backgroundColor: dioLike ? '#ffffff22' : color }]}>
                  <Text style={[s.botonTexto, { color: dioLike ? '#ffffff55' : '#000' }]}>{dioLike ? '❤️ Like enviado' : '❤️ Dar like'}</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity onPress={() => setConfirmBloqueo(perfilViendo)}
              style={[s.boton, { backgroundColor: '#FF6B6B11', borderWidth: 1, borderColor: '#FF6B6B44', marginTop: 8 }]}>
              <Text style={{ color: '#FF6B6B' }}>🚫 Bloquear</Text>
            </TouchableOpacity>
          </ScrollView>
          {confirmBloqueo && (
            <View style={s.overlay}>
              <View style={s.popup}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>🚫</Text>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>¿Bloquear a {confirmBloqueo.nombre}?</Text>
                <Text style={{ color: '#ffffff55', fontSize: 13, marginBottom: 24, textAlign: 'center' }}>No se podrán ver ni contactar.</Text>
                <TouchableOpacity onPress={() => bloquear(confirmBloqueo)} style={[s.boton, { backgroundColor: '#FF6B6B', width: '100%', marginBottom: 8 }]}>
                  <Text style={s.botonTexto}>Sí, bloquear</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setConfirmBloqueo(null)}>
                  <Text style={{ color: '#ffffff55', fontSize: 14 }}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (chatAbierto) {
    const perfilChat = perfilesPrueba.find(p => p.nombre === chatAbierto);
    const mensajesChat = estado.chats[chatAbierto] || [{ id: 1, texto: "¡Hola! Me alegra que hagamos match 😊", mio: false }];
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#08080F' }}>
          <StatusBar style="light" />
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#ffffff0A' }}>
            <TouchableOpacity onPress={() => setChatAbierto(null)}>
              <Text style={{ color, fontSize: 20, marginRight: 12 }}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { if (perfilChat) verPerfil(perfilChat); }} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={[s.avatar, { width: 36, height: 36 }]}>
                <Text style={{ fontSize: 18 }}>{perfilChat?.emoji || '👤'}</Text>
              </View>
              <View>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{chatAbierto}</Text>
                <Text style={{ color, fontSize: 11 }}>Tocá para ver perfil 👁️</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setConfirmBloqueo({ nombre: chatAbierto, id: perfilChat?.id })}>
              <Text style={{ color: '#FF6B6B', fontSize: 13 }}>🚫</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1, padding: 16 }}>
            {mensajesChat.map(msg => (
              <View key={msg.id} style={{ alignItems: msg.mio ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
                <View style={{ backgroundColor: msg.esCita ? color + '33' : msg.mio ? color : '#ffffff11', borderRadius: 16, padding: 12, maxWidth: '80%', borderWidth: msg.esCita ? 1 : 0, borderColor: msg.esCita ? color : 'transparent' }}>
                  <Text style={{ color: msg.mio && !msg.esCita ? '#000' : '#fff', fontSize: 14 }}>{msg.texto}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={{ flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#ffffff0A', gap: 8 }}>
            <TextInput value={textoMensaje} onChangeText={setTextoMensaje} placeholder="Escribí un mensaje..." placeholderTextColor="#ffffff44"
              style={[s.input, { flex: 1, marginBottom: 0 }]} />
            <TouchableOpacity onPress={enviarMensaje}
              style={[s.boton, { backgroundColor: textoMensaje.trim() ? color : '#ffffff22', paddingHorizontal: 16, paddingVertical: 10 }]}>
              <Text style={{ color: '#000', fontWeight: 'bold' }}>➤</Text>
            </TouchableOpacity>
          </View>
          {confirmBloqueo && (
            <View style={s.overlay}>
              <View style={s.popup}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>🚫</Text>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>¿Bloquear a {confirmBloqueo.nombre}?</Text>
                <Text style={{ color: '#ffffff55', fontSize: 13, marginBottom: 24, textAlign: 'center' }}>No se podrán ver ni contactar.</Text>
                <TouchableOpacity onPress={() => bloquear(confirmBloqueo)} style={[s.boton, { backgroundColor: '#FF6B6B', width: '100%', marginBottom: 8 }]}>
                  <Text style={s.botonTexto}>Sí, bloquear</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setConfirmBloqueo(null)}>
                  <Text style={{ color: '#ffffff55', fontSize: 14 }}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (pantalla === 'main') {
    const renderRadar = () => (
      <View style={{ flex: 1 }}>
        <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#ffffff55', fontSize: 11, letterSpacing: 2 }}>CERCA DE TI 📍</Text>
          <Text style={{ color: '#ffffff33', fontSize: 12 }}>📡 {perfilesFiltrados.length} personas</Text>
        </View>
        <FlatList
          data={perfilesFiltrados}
          numColumns={2}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: 8 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
              <Text style={{ color: '#ffffff33' }}>No hay perfiles compatibles cerca</Text>
            </View>
          }
          renderItem={({ item: perfil }) => (
            <TouchableOpacity onPress={() => verPerfil(perfil)}
              style={{ flex: 1, margin: 6, backgroundColor: '#ffffff08', borderWidth: 1, borderColor: estado.matches.includes(perfil.id) ? '#4CAF5044' : '#ffffff11', borderRadius: 16, padding: 12, alignItems: 'center' }}>
              <View style={{ position: 'relative' }}>
                <View style={[s.avatar, { width: 70, height: 70, marginBottom: 8 }]}>
                  <Text style={{ fontSize: 35 }}>{perfil.emoji}</Text>
                </View>
                {estado.matches.includes(perfil.id) && (
                  <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: '#4CAF50', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 10 }}>💬</Text>
                  </View>
                )}
              </View>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>{perfil.nombre}</Text>
              <Text style={{ color: '#ffffff55', fontSize: 12 }}>{perfil.edad} años</Text>
              <Text style={{ color: '#ffffff44', fontSize: 11 }}>📍 {perfil.km} km</Text>
              <View style={{ flexDirection: 'row', gap: 4, marginTop: 8 }}>
                <TouchableOpacity onPress={() => darLike(perfil)}
                  style={{ backgroundColor: estado.likes.includes(perfil.id) ? '#ffffff11' : color + '33', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Text style={{ fontSize: 14 }}>❤️</Text>
                </TouchableOpacity>
                {estado.matches.includes(perfil.id) && (
                  <TouchableOpacity onPress={() => setChatAbierto(perfil.nombre)}
                    style={{ backgroundColor: '#4CAF5033', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ fontSize: 14 }}>💬</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );

    const renderHistorias = () => (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ marginBottom: 16, backgroundColor: '#ffffff08', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#ffffff11' }}>
          <Text style={{ color: '#ffffff77', fontSize: 13, marginBottom: 8 }}>¿Qué querés compartir?</Text>
          <TextInput value={nuevaHistoria} onChangeText={setNuevaHistoria} placeholder="Contá algo..." placeholderTextColor="#ffffff44"
            style={[s.input, { marginBottom: 8 }]} multiline />
          {fotoHistoria && (
            <View style={{ position: 'relative', marginBottom: 8 }}>
              <Image source={{ uri: fotoHistoria }} style={{ width: '100%', height: 180, borderRadius: 12 }} />
              <TouchableOpacity onPress={() => setFotoHistoria(null)}
                style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#000000AA', borderRadius: 15, width: 30, height: 30, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff' }}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={elegirFotoHistoria}
              style={[s.boton, { flex: 1, backgroundColor: '#ffffff11', borderWidth: 1, borderColor: '#ffffff22' }]}>
              <Text style={{ color: '#ffffff77', fontSize: 13 }}>📸 Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={publicarHistoria} style={[s.boton, { flex: 2, backgroundColor: color }]}>
              <Text style={s.botonTexto}>Publicar ✨</Text>
            </TouchableOpacity>
          </View>
        </View>
        {historiasGrupo.map(h => (
          <View key={h.id} style={s.card}>
            <TouchableOpacity onPress={() => { const p = perfilesPrueba.find(x => x.nombre === h.autor); if (p && !h.mia) verPerfil(p); }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <View style={s.avatar}><Text style={{ fontSize: 18 }}>{h.emoji}</Text></View>
              <View>
                <Text style={{ color: h.mia ? color : '#fff', fontWeight: 'bold' }}>{h.autor}</Text>
                {!h.mia && <Text style={{ color: '#ffffff44', fontSize: 11 }}>Tocá para ver perfil 👁️</Text>}
                {h.mia && <Text style={{ color, fontSize: 11 }}>Tu historia</Text>}
              </View>
            </TouchableOpacity>
            {h.foto && <Image source={{ uri: h.foto }} style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 10 }} />}
            {h.texto ? <Text style={{ color: '#ffffffcc', fontSize: 14, marginBottom: 12 }}>{h.texto}</Text> : null}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={() => setHistorias(historias.map(x => x.id === h.id ? { ...x, meGusta: !x.meGusta, likes: x.meGusta ? x.likes - 1 : x.likes + 1 } : x))}
                style={[s.chip, { borderColor: h.meGusta ? color : '#ffffff22', backgroundColor: h.meGusta ? color + '22' : '#ffffff0A' }]}>
                <Text style={{ color: h.meGusta ? color : '#ffffff77', fontSize: 13 }}>❤️ {h.likes}</Text>
              </TouchableOpacity>
              {h.mia && (
                <TouchableOpacity onPress={() => setHistorias(historias.filter(x => x.id !== h.id))}
                  style={[s.chip, { borderColor: '#FF6B6B33', backgroundColor: '#FF6B6B11' }]}>
                  <Text style={{ color: '#FF6B6B', fontSize: 13 }}>🗑️ Borrar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    );

    const renderSalidas = () => {
      const salidasOrdenadas = tabSalidas === 'ranking'
        ? [...salidasData].sort((a, b) => (b.estrellas + (estrelladas.includes(b.id) ? 1 : 0)) - (a.estrellas + (estrelladas.includes(a.id) ? 1 : 0)))
        : salidasData;
      return (
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', padding: 12, gap: 8 }}>
            <TouchableOpacity onPress={() => setTabSalidas('todas')}
              style={[s.chip, { borderColor: tabSalidas === 'todas' ? color : '#ffffff22', backgroundColor: tabSalidas === 'todas' ? color + '22' : '#ffffff0A' }]}>
              <Text style={{ color: tabSalidas === 'todas' ? color : '#ffffff77', fontSize: 13 }}>🎭 Todas</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTabSalidas('ranking')}
              style={[s.chip, { borderColor: tabSalidas === 'ranking' ? '#FFD700' : '#ffffff22', backgroundColor: tabSalidas === 'ranking' ? '#FFD70022' : '#ffffff0A' }]}>
              <Text style={{ color: tabSalidas === 'ranking' ? '#FFD700' : '#ffffff77', fontSize: 13 }}>🏆 Ranking</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0 }}>
            {salidasOrdenadas.map((pub, index) => (
              <View key={pub.id} style={[s.card, { borderColor: pub.color + '33' }]}>
                {tabSalidas === 'ranking' && (
                  <View style={{ position: 'absolute', top: 12, left: 12, width: 28, height: 28, borderRadius: 14, backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#ffffff22', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 13 }}>{index + 1}</Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, marginLeft: tabSalidas === 'ranking' ? 36 : 0 }}>
                  <View style={{ backgroundColor: pub.color + '22', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ color: pub.color, fontSize: 12 }}>{pub.tipo}</Text>
                  </View>
                  <Text style={{ color: pub.dias <= 3 ? '#FF6B6B' : '#ffffff44', fontSize: 11 }}>⏰ {pub.dias} días</Text>
                </View>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>{pub.emoji}</Text>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>{pub.titulo}</Text>
                <Text style={{ color: '#ffffff77', fontSize: 13, marginBottom: 12 }}>{pub.desc}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity onPress={() => setEstrelladas(estrelladas.includes(pub.id) ? estrelladas.filter(e => e !== pub.id) : [...estrelladas, pub.id])}
                    style={[s.chip, { flex: 1, borderColor: estrelladas.includes(pub.id) ? '#FFD700' : '#ffffff22', backgroundColor: estrelladas.includes(pub.id) ? '#FFD70022' : '#ffffff0A', justifyContent: 'center' }]}>
                    <Text style={{ color: estrelladas.includes(pub.id) ? '#FFD700' : '#ffffff77', fontSize: 13 }}>⭐ {pub.estrellas + (estrelladas.includes(pub.id) ? 1 : 0)}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { if (misMatchesNombres.length === 0) { alert("Necesitás tener al menos un match"); return; } setMostrarEnviarCita(pub); }}
                    style={[s.chip, { flex: 2, borderColor: citaEnviada ? '#4CAF5044' : color + '44', backgroundColor: citaEnviada ? '#4CAF5022' : color + '22', justifyContent: 'center' }]}>
                    <Text style={{ color: citaEnviada ? '#4CAF50' : color, fontSize: 13, fontWeight: 'bold' }}>{citaEnviada ? '✅ ¡Enviada!' : '🎯 Enviar como cita'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
          <Modal visible={!!mostrarEnviarCita} transparent animationType="slide">
            <View style={s.overlay}>
              <View style={[s.popup, { maxHeight: '70%' }]}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>🎯 Enviar como cita</Text>
                <Text style={{ color: '#ffffff55', fontSize: 13, marginBottom: 16 }}>¿A quién querés invitar?</Text>
                {misMatchesNombres.length === 0 ? (
                  <Text style={{ color: '#ffffff55', textAlign: 'center', marginBottom: 16 }}>No tenés matches todavía</Text>
                ) : (
                  <ScrollView style={{ width: '100%', maxHeight: 200 }}>
                    {misMatchesNombres.map(nombre => {
                      const perfil = perfilesPrueba.find(p => p.nombre === nombre);
                      return (
                        <TouchableOpacity key={nombre} onPress={() => enviarCita(mostrarEnviarCita, nombre)}
                          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: '#ffffff08', borderRadius: 12, marginBottom: 8 }}>
                          <View style={[s.avatar, { width: 40, height: 40 }]}>
                            <Text style={{ fontSize: 20 }}>{perfil?.emoji || '👤'}</Text>
                          </View>
                          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>{nombre}</Text>
                          <Text style={{ color, marginLeft: 'auto' }}>Enviar →</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
                <TouchableOpacity onPress={() => setMostrarEnviarCita(null)} style={{ marginTop: 12 }}>
                  <Text style={{ color: '#ffffff55', fontSize: 14 }}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      );
    };

    const renderMiPerfil = () => (
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={[s.avatar, { width: 90, height: 90, marginBottom: 12 }]}>
            <Text style={{ fontSize: 45 }}>👤</Text>
          </View>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>{form.nombre}</Text>
          <Text style={{ color: '#ffffff55', fontSize: 14 }}>{form.edad} años</Text>
          <Text style={{ color: '#ffffff44', fontSize: 12, marginTop: 4 }}>{sesion?.user?.email}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 }}>
            <View style={{ backgroundColor: color + '22', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: color + '44' }}>
              <Text style={{ color, fontSize: 14, fontWeight: 'bold' }}>{grupo === 'spark' ? '⚡ Spark' : '✨ Esencia'}</Text>
            </View>
            <TouchableOpacity onPress={cambiarGrupo} style={{ backgroundColor: '#ffffff11', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#ffffff22' }}>
              <Text style={{ color: '#ffffff77', fontSize: 12 }}>🔄 Cambiar grupo</Text>
            </TouchableOpacity>
          </View>
          {quienMeVio.length > 0 && (
            <View style={{ backgroundColor: color + '22', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginTop: 12, borderWidth: 1, borderColor: color + '44' }}>
              <Text style={{ color, fontSize: 13 }}>👁️ {quienMeVio.length} {quienMeVio.length === 1 ? 'persona vio' : 'personas vieron'} tu perfil</Text>
            </View>
          )}
        </View>
        <View style={s.card}>
          <Text style={{ color: '#ffffff55', fontSize: 12, marginBottom: 4 }}>ACTIVIDADES</Text>
          <Text style={{ color: '#fff', fontSize: 14 }}>{form.actividadesElegidas.join(', ')}</Text>
        </View>
        <View style={s.card}>
          <Text style={{ color: '#ffffff55', fontSize: 12, marginBottom: 4 }}>BUSCA</Text>
          <Text style={{ color: '#fff', fontSize: 14 }}>{busquedas.find(b => b.id === form.buscaPareja)?.label}</Text>
        </View>
        <View style={s.card}>
          <Text style={{ color: '#ffffff55', fontSize: 12, marginBottom: 4 }}>MATCHES EN ESTE GRUPO</Text>
          <Text style={{ color: '#fff', fontSize: 14 }}>{estado.matches.length} matches ❤️</Text>
        </View>
        <TouchableOpacity onPress={onCerrarSesion} style={[s.boton, { backgroundColor: '#FF6B6B22', borderWidth: 1, borderColor: '#FF6B6B44', marginTop: 16 }]}>
          <Text style={{ color: '#FF6B6B', fontWeight: 'bold' }}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    );

    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#08080F' }}>
          <StatusBar style="light" />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#ffffff0A' }}>
            <Text style={{ color, fontWeight: 'bold', fontSize: 22, letterSpacing: 2 }}>VYNKA</Text>
            <TouchableOpacity onPress={cambiarGrupo}
              style={{ backgroundColor: color + '22', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: color + '44', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ color, fontSize: 13, fontWeight: 'bold' }}>{grupo === 'spark' ? '⚡ Spark' : '✨ Esencia'}</Text>
              <Text style={{ color: '#ffffff55', fontSize: 11 }}>🔄</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            {tabActivo === 'radar' && renderRadar()}
            {tabActivo === 'historias' && renderHistorias()}
            {tabActivo === 'salidas' && renderSalidas()}
            {tabActivo === 'perfil' && renderMiPerfil()}
          </View>
          <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#ffffff0A', backgroundColor: '#08080F' }}>
            {[
              { id: 'radar', emoji: '📡', label: 'Radar' },
              { id: 'historias', emoji: '📖', label: 'Historias' },
              { id: 'salidas', emoji: '🎭', label: 'Salidas' },
              { id: 'perfil', emoji: '👤', label: 'Perfil' },
            ].map(tab => (
              <TouchableOpacity key={tab.id} onPress={() => setTabActivo(tab.id)}
                style={{ flex: 1, alignItems: 'center', paddingVertical: 12, borderTopWidth: 2, borderTopColor: tabActivo === tab.id ? color : 'transparent' }}>
                <Text style={{ fontSize: 22 }}>{tab.emoji}</Text>
                <Text style={{ color: tabActivo === tab.id ? color : '#ffffff44', fontSize: 11, marginTop: 2 }}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {matchNuevo && (
            <View style={s.overlay}>
              <View style={[s.popup, { borderColor: color }]}>
                <Text style={{ fontSize: 60, marginBottom: 12 }}>🎉</Text>
                <Text style={{ color, fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>¡Match!</Text>
                <Text style={{ color: '#ffffff77', marginBottom: 24 }}>Vos y {matchNuevo.nombre} se gustaron</Text>
                <TouchableOpacity onPress={() => { setChatAbierto(matchNuevo.nombre); setMatchNuevo(null); }}
                  style={[s.boton, { backgroundColor: color, width: '100%', marginBottom: 8 }]}>
                  <Text style={s.botonTexto}>💬 Ir al chat</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setMatchNuevo(null)}>
                  <Text style={{ color: '#ffffff55', fontSize: 14 }}>Seguir viendo perfiles</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }
}

// Componente principal que maneja la sesion
export default function App() {
  const [sesion, setSesion] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSesion(session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSesion(session));
    return () => listener.subscription.unsubscribe();
  }, []);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    setSesion(null);
  };

  if (!sesion) {
    return <Auth onLogin={() => supabase.auth.getSession().then(({ data: { session } }) => setSesion(session))} />;
  }

  return <MainApp sesion={sesion} onCerrarSesion={cerrarSesion} />;
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08080F', alignItems: 'center', justifyContent: 'center', padding: 24 },
  titulo: { fontSize: 32, fontWeight: 'bold', letterSpacing: 4, marginBottom: 8 },
  tituloGrande: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitulo: { color: '#ffffff55', fontSize: 13, marginBottom: 16, textAlign: 'center' },
  boton: { borderRadius: 12, paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center' },
  botonTexto: { color: '#000', fontSize: 15, fontWeight: 'bold' },
  input: { backgroundColor: '#ffffff0A', borderWidth: 1, borderColor: '#ffffff22', borderRadius: 12, padding: 12, color: '#fff', fontSize: 14, marginBottom: 16 },
  label: { color: '#ffffff77', fontSize: 13, marginBottom: 8 },
  opcion: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8 },
  opcionFlex: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 10, alignItems: 'center' },
  chip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 4 },
  card: { backgroundColor: '#ffffff08', borderWidth: 1, borderColor: '#ffffff11', borderRadius: 16, padding: 16, marginBottom: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#ffffff11', alignItems: 'center', justifyContent: 'center' },
  navBtn: { backgroundColor: '#ffffff11', borderWidth: 1, borderColor: '#ffffff22', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000000CC', alignItems: 'center', justifyContent: 'center', padding: 24 },
  popup: { backgroundColor: '#0F0F1E', borderWidth: 1, borderColor: '#ffffff22', borderRadius: 24, padding: 28, alignItems: 'center', width: '100%' },
  cardSpark: { backgroundColor: '#1A0A2E', borderWidth: 1, borderColor: '#FF6B9D44', borderRadius: 20, padding: 24, width: '100%', marginBottom: 16 },
  cardEsencia: { backgroundColor: '#1A1000', borderWidth: 1, borderColor: '#C9A96E44', borderRadius: 20, padding: 24, width: '100%' },
  cardTituloSpark: { color: '#FF6B9D', fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  cardTituloEsencia: { color: '#C9A96E', fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  cardDesc: { color: '#ffffff77', fontSize: 13 },
});