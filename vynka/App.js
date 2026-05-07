import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, BackHandler, Image, FlatList, Modal, Animated } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import Auth from './Auth';
import { supabase } from './supabase';

// ============================
// PALETAS DE COLORES
// ============================
const SPARK = {
  fondo: '#0D0D12',
  accion: '#8A2BE2',
  accion2: '#FF007F',
  corazon: '#FF2D55',
  historias: '#00F5FF',
  texto: '#FFFFFF',
  textoSec: '#A0A0A0',
  card: '#1A1A24',
  border: '#2A2A3A',
};

const ESENCIA = {
  fondo: '#FDFCF8',
  accion: '#004D40',
  accion2: '#1A237E',
  corazon: '#C5A059',
  historias: '#E0E0E0',
  texto: '#1C1C1C',
  textoSec: '#5F6368',
  card: '#F0EFE9',
  border: '#E0DDD5',
};

const VYNKA_BRAND = '#FF5722';

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

const etiquetasHistoria = ["💍 Algo Serio", "⚡ Algo Express", "🎭 Cita de Salida"];

const perfilesPrueba = [
  { id: 1, nombre: "Valentina", edad: 26, genero: "mujer", buscaPareja: "hombres", grupo: "spark", ciudad: "Buenos Aires", km: 1.2, actividades: ["🎬 Cine", "☕ Merienda", "🌿 Pasear"], emoji: "💜", bio: "Amo el café y los atardeceres 🌅", corazones: 45, accesoDual: false },
  { id: 2, nombre: "Carlos", edad: 31, genero: "hombre", buscaPareja: "mujeres", grupo: "spark", ciudad: "Buenos Aires", km: 2.5, actividades: ["🍽️ Cenar", "🎭 Teatro", "🏛️ Museo"], emoji: "💙", bio: "Músico de corazón 🎸", corazones: 38, accesoDual: false },
  { id: 3, nombre: "Sofia", edad: 28, genero: "mujer", buscaPareja: "mujeres", grupo: "spark", ciudad: "Buenos Aires", km: 3.1, actividades: ["🚴 Bicicleta", "🌸 Plaza", "☕ Merienda"], emoji: "🧡", bio: "Bailarina y amante de la naturaleza 🌿", corazones: 62, accesoDual: false },
  { id: 4, nombre: "Lucas", edad: 35, genero: "hombre", buscaPareja: "hombres", grupo: "spark", ciudad: "Buenos Aires", km: 0.8, actividades: ["🎬 Cine", "🍽️ Cenar", "🎭 Teatro"], emoji: "💚", bio: "Fotógrafo viajero 📷", corazones: 29, accesoDual: false },
  { id: 5, nombre: "Marina", edad: 40, genero: "mujer", buscaPareja: "ambos", grupo: "spark", ciudad: "Buenos Aires", km: 4.2, actividades: ["🌿 Pasear", "🏛️ Museo", "🎬 Cine"], emoji: "❤️", bio: "Artista en proceso ✨", corazones: 71, accesoDual: true },
  { id: 6, nombre: "Roberto", edad: 52, genero: "hombre", buscaPareja: "mujeres", grupo: "esencia", ciudad: "Buenos Aires", km: 1.8, actividades: ["🎬 Cine", "☕ Merienda", "🌿 Pasear"], emoji: "💛", bio: "Chef de fin de semana 🍕", corazones: 0, accesoDual: false },
  { id: 7, nombre: "Patricia", edad: 47, genero: "mujer", buscaPareja: "hombres", grupo: "esencia", ciudad: "Buenos Aires", km: 3.5, actividades: ["🎭 Teatro", "🍽️ Cenar", "🏛️ Museo"], emoji: "🩷", bio: "Amante del buen vino 🍷", corazones: 0, accesoDual: true },
];

const salidasData = [
  { id: 1, tipo: "🎬 Cine", titulo: "Estreno: Misión Imposible 8", desc: "Acción sin parar.", emoji: "🎬", dias: 14, estrellas: 47, color: "#8A2BE2" },
  { id: 2, tipo: "🍽️ Restaurante", titulo: "Promo cena para dos", desc: "Cena romántica con entrada y postre.", emoji: "🍽️", dias: 7, estrellas: 83, color: "#FF007F" },
  { id: 3, tipo: "🎭 Teatro", titulo: "Chicago — El Musical", desc: "El clásico de Broadway en Buenos Aires.", emoji: "🎭", dias: 25, estrellas: 124, color: "#00F5FF" },
  { id: 4, tipo: "🏛️ Museo", titulo: "Noche de Museos — MALBA", desc: "Entrada gratuita este sábado.", emoji: "🏛️", dias: 3, estrellas: 56, color: "#FF5722" },
  { id: 5, tipo: "🎪 Festival", titulo: "Festival de Jazz en el Parque", desc: "Tres días de música en vivo.", emoji: "🎪", dias: 10, estrellas: 91, color: "#C5A059" },
];

const historiasIniciales = [
  { id: 1, autorId: 1, autor: "Valentina", emoji: "💜", texto: "Hoy fui al parque 🌸", grupo: "spark", etiqueta: "💍 Algo Serio" },
  { id: 2, autorId: 3, autor: "Sofia", emoji: "🧡", texto: "¡Fin de semana genial! 🎉", grupo: "spark", etiqueta: "⚡ Algo Express" },
  { id: 3, autorId: 5, autor: "Marina", emoji: "❤️", texto: "Nueva expo en el MALBA 🎨", grupo: "spark", etiqueta: "🎭 Cita de Salida" },
];

const mensajeBienvenida = [
  { id: 'w1', texto: "👋 ¡Bienvenido/a a VYNKA!\n\nSoy tu asistente de bienvenida.", mio: false, esVynka: true },
  { id: 'w2', texto: "📡 En el RADAR ves las personas cercanas. Tocá un perfil para verlo y dar like.", mio: false, esVynka: true },
  { id: 'w3', texto: "💬 Cuando dos personas se dan like, ¡es un MATCH! Ahí pueden chatear gratis.", mio: false, esVynka: true },
  { id: 'w4', texto: "🎭 En SALIDAS encontrás eventos y podés enviar invitaciones a tus matches como cita.", mio: false, esVynka: true },
  { id: 'w5', texto: "🏆 En TOP ves los perfiles más queridos y las historias del día.\n\n¡Que empiece la conexión! ✨", mio: false, esVynka: true },
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

function MainApp({ sesion, onCerrarSesion }) {
  const [pantalla, setPantalla] = useState('inicio');
  const [tabActivo, setTabActivo] = useState('radar');
  const [grupo, setGrupo] = useState(null);
  const [explorarTodos, setExplorarTodos] = useState(false);
  const [form, setForm] = useState({ nombre: "", edad: "", genero: "", actividadesElegidas: [], buscaPareja: "" });
  const [estadoSpark, setEstadoSpark] = useState({ ...estadoInicial, chats: { 'VYNKA': [...mensajeBienvenida] } });
  const [estadoEsencia, setEstadoEsencia] = useState({ ...estadoInicial, chats: { 'VYNKA': [...mensajeBienvenida] } });
  const [chatAbierto, setChatAbierto] = useState(null);
  const [perfilViendo, setPerfilViendo] = useState(null);
  const [textoMensaje, setTextoMensaje] = useState("");
  const [estrelladas, setEstrelladas] = useState([]);
  const [quienMeVio, setQuienMeVio] = useState([]);
  const [mostrarQuienMeVio, setMostrarQuienMeVio] = useState(false);
  const [notifVisto, setNotifVisto] = useState(null);
  const [matchNuevo, setMatchNuevo] = useState(null);
  const [confirmBloqueo, setConfirmBloqueo] = useState(null);
  const [mostrarEnviarCita, setMostrarEnviarCita] = useState(null);
  const [citaEnviada, setCitaEnviada] = useState(null);
  const [tabSalidas, setTabSalidas] = useState('todas');
  const [historias, setHistorias] = useState(historiasIniciales);
  const [historiaViendo, setHistoriaViendo] = useState(null);
  const [nuevaHistoria, setNuevaHistoria] = useState("");
  const [fotoHistoria, setFotoHistoria] = useState(null);
  const [etiquetaSeleccionada, setEtiquetaSeleccionada] = useState("");
  const [filtroEtiqueta, setFiltroEtiqueta] = useState("Todas");
  const [corazonesPerfiles, setCorazonesPerfiles] = useState({});
  const [misCorazones, setMisCorazones] = useState([]);
  const [mostrarCambioGrupo, setMostrarCambioGrupo] = useState(false);
  const [mostrarAccesoDual, setMostrarAccesoDual] = useState(false);
  const notifAnim = useRef(new Animated.Value(0)).current;

  const tema = grupo === 'spark' ? SPARK : ESENCIA;
  const estado = grupo === 'spark' ? estadoSpark : estadoEsencia;
  const setEstado = grupo === 'spark' ? setEstadoSpark : setEstadoEsencia;

  useEffect(() => {
    const backAction = () => {
      if (historiaViendo) { setHistoriaViendo(null); return true; }
      if (mostrarQuienMeVio) { setMostrarQuienMeVio(false); return true; }
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
  }, [pantalla, chatAbierto, perfilViendo, mostrarEnviarCita, mostrarQuienMeVio, historiaViendo]);

  useEffect(() => {
    if (notifVisto) {
      Animated.sequence([
        Animated.timing(notifAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(2500),
        Animated.timing(notifAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setNotifVisto(null));
    }
  }, [notifVisto]);

  const determinarGrupo = (edad) => parseInt(edad) >= 45 ? 'esencia' : 'spark';

  const puedeRegistrarse = () => parseInt(form.edad) >= 18;

  const formularioCompleto = () => form.nombre && puedeRegistrarse() && form.genero && form.actividadesElegidas.length > 0 && form.buscaPareja;

  const toggleActividad = (act) => {
    if (form.actividadesElegidas.includes(act)) {
      setForm({ ...form, actividadesElegidas: form.actividadesElegidas.filter(a => a !== act) });
    } else if (form.actividadesElegidas.length < 3) {
      setForm({ ...form, actividadesElegidas: [...form.actividadesElegidas, act] });
    }
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

  const darCorazon = (perfilId) => {
    if (misCorazones.includes(perfilId)) return;
    setMisCorazones([...misCorazones, perfilId]);
    setCorazonesPerfiles(prev => ({ ...prev, [perfilId]: (prev[perfilId] || 0) + 1 }));
  };

  const bloquear = (perfil) => {
    const id = perfil.id || perfil;
    setEstado({ ...estado, bloqueados: [...estado.bloqueados, id], matches: estado.matches.filter(m => m !== id), likes: estado.likes.filter(l => l !== id) });
    setChatAbierto(null); setPerfilViendo(null); setConfirmBloqueo(null);
  };

  const verPerfil = (perfil) => {
    setPerfilViendo(perfil);
    if (!quienMeVio.find(p => p.id === perfil.id)) {
      setQuienMeVio(prev => [...prev, perfil]);
      setNotifVisto(perfil);
    }
  };

  const enviarMensaje = () => {
    if (!textoMensaje.trim()) return;
    const chatActual = estado.chats[chatAbierto] || [];
    const nuevosChats = { ...estado.chats, [chatAbierto]: [...chatActual, { id: Date.now(), texto: textoMensaje, mio: true }] };
    setEstado({ ...estado, chats: nuevosChats });
    setTextoMensaje("");
    if (chatAbierto !== 'VYNKA') {
      setTimeout(() => {
        setEstado(prev => ({ ...prev, chats: { ...prev.chats, [chatAbierto]: [...(nuevosChats[chatAbierto] || []), { id: Date.now() + 1, texto: "¡Qué bueno! 😄", mio: false }] } }));
      }, 1500);
    }
  };

  const elegirFotoHistoria = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) { alert("Necesitamos permiso para acceder a tus fotos"); return; }
    const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!resultado.canceled) setFotoHistoria(resultado.assets[0].uri);
  };

  const publicarHistoria = () => {
    if (!nuevaHistoria.trim() && !fotoHistoria) return;
    if (!etiquetaSeleccionada) { alert("Elegí una etiqueta para tu historia"); return; }
    const yaPublico = historias.find(h => h.autor === form.nombre && h.mia);
    if (yaPublico) { alert("Solo podés publicar 1 historia por día"); return; }
    setHistorias([{ id: Date.now(), autorId: 0, autor: form.nombre, emoji: '⭐', texto: nuevaHistoria, foto: fotoHistoria, likes: 0, meGusta: false, mia: true, grupo, etiqueta: etiquetaSeleccionada }, ...historias]);
    setNuevaHistoria(""); setFotoHistoria(null); setEtiquetaSeleccionada("");
  };

  const enviarCita = (salida, contacto) => {
    const chatActual = estado.chats[contacto] || [];
    const msg = { id: Date.now(), texto: `🎯 Te invito a una cita:\n${salida.emoji} ${salida.titulo}\n📍 ¡Qué te parece?`, mio: true, esCita: true };
    setEstado({ ...estado, chats: { ...estado.chats, [contacto]: [...chatActual, msg] } });
    setMostrarEnviarCita(null); setCitaEnviada(contacto);
    setTimeout(() => setCitaEnviada(null), 2000);
  };

  const misMatchesNombres = perfilesPrueba.filter(p => estado.matches.includes(p.id)).map(p => p.nombre);
  const todosLosChats = ['VYNKA', ...misMatchesNombres];

  const perfilesFiltrados = perfilesPrueba.filter(p => {
    if (estado.bloqueados.includes(p.id)) return false;
    if (explorarTodos) return p.accesoDual || p.grupo === grupo;
    return p.grupo === grupo && sonCompatibles(form.genero, form.buscaPareja, p.genero, p.buscaPareja);
  });

  const perfilesTopSpark = [...perfilesPrueba.filter(p => p.grupo === 'spark')]
    .sort((a, b) => ((b.corazones || 0) + (corazonesPerfiles[b.id] || 0)) - ((a.corazones || 0) + (corazonesPerfiles[a.id] || 0)))
    .slice(0, 10);

  const historiasGrupo = historias.filter(h => {
    const grupoOk = h.grupo === grupo;
    const etiquetaOk = filtroEtiqueta === 'Todas' || h.etiqueta === filtroEtiqueta;
    return grupoOk && etiquetaOk;
  });

  const esEsencia = grupo === 'esencia';

  // PANTALLA INICIO
  if (pantalla === 'inicio') {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={[s.container, { backgroundColor: '#0D0D12' }]}>
          <StatusBar style="light" />
          <Text style={{ fontSize: 64, marginBottom: 16 }}>💫</Text>
          <Text style={{ fontSize: 36, fontWeight: 'bold', letterSpacing: 6, color: VYNKA_BRAND, marginBottom: 8 }}>VYNKA</Text>
          <Text style={{ color: '#A0A0A0', fontSize: 14, marginBottom: 48 }}>donde los vínculos comienzan</Text>
          <TouchableOpacity style={{ backgroundColor: VYNKA_BRAND, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 48 }} onPress={() => setPantalla('grupos')}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17 }}>Comenzar ✨</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onCerrarSesion} style={{ marginTop: 24 }}>
            <Text style={{ color: '#ffffff33', fontSize: 12 }}>Cerrar sesión</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // PANTALLA GRUPOS
  if (pantalla === 'grupos') {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D12' }}>
          <StatusBar style="light" />
          <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
            <Text style={{ color: '#A0A0A0', fontSize: 12, letterSpacing: 3, marginBottom: 12 }}>BIENVENIDO/A</Text>
            <Text style={{ color: '#fff', fontSize: 26, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>¿Cuál es tu mundo?</Text>
            <Text style={{ color: '#A0A0A0', fontSize: 13, marginBottom: 32, textAlign: 'center' }}>Tu grupo se asigna automáticamente por edad</Text>

            <TouchableOpacity style={{ backgroundColor: '#1A1A24', borderWidth: 1, borderColor: '#8A2BE244', borderRadius: 20, padding: 24, width: '100%', marginBottom: 16 }}
              onPress={() => { setGrupo('spark'); setPantalla('registro'); }}>
              <Text style={{ fontSize: 36, marginBottom: 8 }}>⚡</Text>
              <Text style={{ color: '#8A2BE2', fontSize: 22, fontWeight: 'bold', marginBottom: 6 }}>Spark</Text>
              <Text style={{ color: '#A0A0A0', fontSize: 13 }}>Menores de 45 años · Energía y aventura</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ backgroundColor: '#F0EFE9', borderWidth: 1, borderColor: '#004D4044', borderRadius: 20, padding: 24, width: '100%' }}
              onPress={() => { setGrupo('esencia'); setPantalla('registro'); }}>
              <Text style={{ fontSize: 36, marginBottom: 8 }}>✨</Text>
              <Text style={{ color: '#004D40', fontSize: 22, fontWeight: 'bold', marginBottom: 6 }}>Esencia</Text>
              <Text style={{ color: '#5F6368', fontSize: 13 }}>45 años o más · Madurez y profundidad</Text>
            </TouchableOpacity>

            <View style={{ backgroundColor: VYNKA_BRAND + '22', borderRadius: 12, padding: 12, marginTop: 20, borderWidth: 1, borderColor: VYNKA_BRAND + '44', width: '100%' }}>
              <Text style={{ color: VYNKA_BRAND, fontSize: 13, textAlign: 'center' }}>✨ Acceso Dual Premium: aparecé en ambos grupos</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // PANTALLA REGISTRO
  if (pantalla === 'registro') {
    const grupoSugerido = form.edad ? determinarGrupo(form.edad) : grupo;
    const colorReg = grupoSugerido === 'spark' ? '#8A2BE2' : '#004D40';
    const fondoReg = grupoSugerido === 'spark' ? '#0D0D12' : '#FDFCF8';
    const textoReg = grupoSugerido === 'spark' ? '#fff' : '#1C1C1C';
    const textoSecReg = grupoSugerido === 'spark' ? '#A0A0A0' : '#5F6368';

    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: fondoReg }}>
          <StatusBar style={grupoSugerido === 'spark' ? 'light' : 'dark'} />
          <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
            <TouchableOpacity onPress={() => setPantalla('grupos')} style={{ marginBottom: 20 }}>
              <Text style={{ color: colorReg, fontSize: 16 }}>← Volver</Text>
            </TouchableOpacity>
            <Text style={{ color: colorReg, fontSize: 12, letterSpacing: 2, marginBottom: 4 }}>{grupoSugerido === 'spark' ? '⚡ SPARK' : '✨ ESENCIA'}</Text>
            <Text style={{ color: textoReg, fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>Creá tu perfil</Text>

            <Text style={{ color: textoSecReg, fontSize: 13, marginBottom: 8 }}>Tu nombre</Text>
            <TextInput value={form.nombre} onChangeText={t => setForm({ ...form, nombre: t })} placeholder="¿Cómo te llaman?" placeholderTextColor={textoSecReg}
              style={{ backgroundColor: grupoSugerido === 'spark' ? '#1A1A24' : '#F0EFE9', borderWidth: 1, borderColor: grupoSugerido === 'spark' ? '#2A2A3A' : '#E0DDD5', borderRadius: 12, padding: 12, color: textoReg, fontSize: 14, marginBottom: 16 }} />

            <Text style={{ color: textoSecReg, fontSize: 13, marginBottom: 8 }}>Tu edad</Text>
            <TextInput value={form.edad} onChangeText={t => { setForm({ ...form, edad: t }); if (parseInt(t) >= 18) setGrupo(determinarGrupo(t)); }}
              placeholder="¿Cuántos años tenés?" placeholderTextColor={textoSecReg} keyboardType="numeric"
              style={{ backgroundColor: grupoSugerido === 'spark' ? '#1A1A24' : '#F0EFE9', borderWidth: 1, borderColor: grupoSugerido === 'spark' ? '#2A2A3A' : '#E0DDD5', borderRadius: 12, padding: 12, color: textoReg, fontSize: 14, marginBottom: 8 }} />

            {form.edad !== "" && parseInt(form.edad) < 18 && (
              <Text style={{ color: '#FF2D55', fontSize: 12, marginBottom: 8 }}>❌ Debes tener al menos 18 años</Text>
            )}
            {form.edad !== "" && parseInt(form.edad) >= 18 && (
              <View style={{ backgroundColor: colorReg + '22', borderRadius: 10, padding: 10, marginBottom: 16, borderWidth: 1, borderColor: colorReg + '44' }}>
                <Text style={{ color: colorReg, fontSize: 13 }}>✅ Grupo asignado: {grupoSugerido === 'spark' ? '⚡ Spark (menores de 45)' : '✨ Esencia (45 o más)'}</Text>
              </View>
            )}

            <Text style={{ color: textoSecReg, fontSize: 13, marginBottom: 12 }}>¿Cómo te identificás?</Text>
            {generos.map(g => (
              <TouchableOpacity key={g.id} onPress={() => setForm({ ...form, genero: g.id })}
                style={{ borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8, borderColor: form.genero === g.id ? colorReg : (grupoSugerido === 'spark' ? '#2A2A3A' : '#E0DDD5'), backgroundColor: form.genero === g.id ? colorReg + '22' : (grupoSugerido === 'spark' ? '#1A1A24' : '#F0EFE9') }}>
                <Text style={{ color: form.genero === g.id ? colorReg : textoReg, fontSize: 15 }}>{g.emoji} {g.label}</Text>
              </TouchableOpacity>
            ))}

            <Text style={{ color: textoSecReg, fontSize: 13, marginBottom: 8 }}>Actividades favoritas <Text style={{ color: textoSecReg + '88' }}>(hasta 3)</Text></Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {actividades.map(act => (
                <TouchableOpacity key={act} onPress={() => toggleActividad(act)}
                  style={{ borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, borderColor: form.actividadesElegidas.includes(act) ? colorReg : (grupoSugerido === 'spark' ? '#2A2A3A' : '#E0DDD5'), backgroundColor: form.actividadesElegidas.includes(act) ? colorReg + '22' : (grupoSugerido === 'spark' ? '#1A1A24' : '#F0EFE9') }}>
                  <Text style={{ color: form.actividadesElegidas.includes(act) ? colorReg : textoReg, fontSize: 13 }}>{act}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ color: textoSecReg, fontSize: 13, marginBottom: 12 }}>¿A quién buscás?</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
              {busquedas.map(op => (
                <TouchableOpacity key={op.id} onPress={() => setForm({ ...form, buscaPareja: op.id })}
                  style={{ flex: 1, borderWidth: 1, borderRadius: 12, padding: 10, alignItems: 'center', borderColor: form.buscaPareja === op.id ? colorReg : (grupoSugerido === 'spark' ? '#2A2A3A' : '#E0DDD5'), backgroundColor: form.buscaPareja === op.id ? colorReg + '22' : (grupoSugerido === 'spark' ? '#1A1A24' : '#F0EFE9') }}>
                  <Text style={{ fontSize: 20 }}>{op.emoji}</Text>
                  <Text style={{ color: form.buscaPareja === op.id ? colorReg : textoReg, fontSize: 13 }}>{op.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={() => { if (formularioCompleto()) setPantalla('main'); }}
              style={{ borderRadius: 12, paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center', backgroundColor: formularioCompleto() ? colorReg : '#ffffff22' }}>
              <Text style={{ color: formularioCompleto() ? '#fff' : '#ffffff55', fontSize: 15, fontWeight: 'bold' }}>Crear mi perfil ✨</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // VER PERFIL
  if (perfilViendo) {
    const tieneMatch = estado.matches.includes(perfilViendo.id);
    const dioLike = estado.likes.includes(perfilViendo.id);
    const totalCorazones = (perfilViendo.corazones || 0) + (corazonesPerfiles[perfilViendo.id] || 0);
    const temaP = perfilViendo.grupo === 'spark' ? SPARK : ESENCIA;
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: temaP.fondo }}>
          <StatusBar style={perfilViendo.grupo === 'spark' ? 'light' : 'dark'} />
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: temaP.border }}>
            <TouchableOpacity onPress={() => setPerfilViendo(null)}>
              <Text style={{ color: temaP.accion, fontSize: 20, marginRight: 12 }}>←</Text>
            </TouchableOpacity>
            <Text style={{ color: temaP.texto, fontWeight: 'bold', fontSize: 18 }}>Perfil</Text>
          </View>
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: temaP.card, borderWidth: 2, borderColor: temaP.accion, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 50 }}>{perfilViendo.emoji}</Text>
              </View>
              <Text style={{ color: temaP.texto, fontSize: 24, fontWeight: 'bold' }}>{perfilViendo.nombre}, {perfilViendo.edad}</Text>
              <Text style={{ color: temaP.textoSec, fontSize: 14, marginTop: 4 }}>📍 {perfilViendo.km} km · {perfilViendo.ciudad}</Text>
              {perfilViendo.accesoDual && (
                <View style={{ backgroundColor: VYNKA_BRAND + '22', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginTop: 8, borderWidth: 1, borderColor: VYNKA_BRAND + '44' }}>
                  <Text style={{ color: VYNKA_BRAND, fontSize: 12 }}>⚡✨ Acceso Dual</Text>
                </View>
              )}
              {perfilViendo.grupo === 'spark' && (
                <TouchableOpacity onPress={() => darCorazon(perfilViendo.id)}
                  style={{ backgroundColor: misCorazones.includes(perfilViendo.id) ? SPARK.corazon + '33' : temaP.card, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginTop: 12, borderWidth: 1, borderColor: misCorazones.includes(perfilViendo.id) ? SPARK.corazon : temaP.border, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 18 }}>{misCorazones.includes(perfilViendo.id) ? '❤️' : '🤍'}</Text>
                  <Text style={{ color: misCorazones.includes(perfilViendo.id) ? SPARK.corazon : temaP.textoSec, fontWeight: 'bold' }}>{totalCorazones}</Text>
                </TouchableOpacity>
              )}
            </View>

            {perfilViendo.bio && (
              <View style={{ backgroundColor: temaP.card, borderWidth: 1, borderColor: temaP.border, borderRadius: 16, padding: 16, marginBottom: 12 }}>
                <Text style={{ color: temaP.textoSec, fontSize: 12, marginBottom: 4 }}>BIO</Text>
                <Text style={{ color: temaP.texto, fontSize: 14 }}>{perfilViendo.bio}</Text>
              </View>
            )}

            <View style={{ backgroundColor: temaP.card, borderWidth: 1, borderColor: temaP.border, borderRadius: 16, padding: 16, marginBottom: 12 }}>
              <Text style={{ color: temaP.textoSec, fontSize: 12, marginBottom: 8 }}>ACTIVIDADES</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {perfilViendo.actividades.map(a => (
                  <View key={a} style={{ borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, borderColor: temaP.accion + '44', backgroundColor: temaP.accion + '22' }}>
                    <Text style={{ color: temaP.accion, fontSize: 12 }}>{a}</Text>
                  </View>
                ))}
              </View>
            </View>

            {tieneMatch ? (
              <TouchableOpacity onPress={() => { setChatAbierto(perfilViendo.nombre); setPerfilViendo(null); }}
                style={{ borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: '#4CAF50', marginBottom: 8 }}>
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>💬 Chatear</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ backgroundColor: temaP.accion + '11', borderColor: temaP.accion + '33', borderWidth: 1, borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>🔒</Text>
                <Text style={{ color: temaP.texto, fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>Para chatear con {perfilViendo.nombre}</Text>
                <Text style={{ color: temaP.textoSec, fontSize: 13, marginBottom: 12, textAlign: 'center' }}>Primero hacé match dando like</Text>
                <TouchableOpacity onPress={() => darLike(perfilViendo)}
                  style={{ borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: dioLike ? temaP.card : temaP.accion }}>
                  <Text style={{ color: dioLike ? temaP.textoSec : '#fff', fontWeight: 'bold' }}>{dioLike ? '❤️ Like enviado' : '❤️ Dar like'}</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity onPress={() => setConfirmBloqueo(perfilViendo)}
              style={{ borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: '#FF2D5511', borderWidth: 1, borderColor: '#FF2D5533' }}>
              <Text style={{ color: '#FF2D55' }}>🚫 Bloquear</Text>
            </TouchableOpacity>
          </ScrollView>

          {confirmBloqueo && (
            <View style={s.overlay}>
              <View style={[s.popup, { backgroundColor: temaP.fondo, borderColor: temaP.border }]}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>🚫</Text>
                <Text style={{ color: temaP.texto, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>¿Bloquear a {confirmBloqueo.nombre}?</Text>
                <Text style={{ color: temaP.textoSec, fontSize: 13, marginBottom: 24, textAlign: 'center' }}>No se podrán ver ni contactar.</Text>
                <TouchableOpacity onPress={() => bloquear(confirmBloqueo)} style={{ borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: '#FF2D55', width: '100%', marginBottom: 8 }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Sí, bloquear</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setConfirmBloqueo(null)}>
                  <Text style={{ color: temaP.textoSec, fontSize: 14 }}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // CHAT
  if (chatAbierto) {
    const esVynka = chatAbierto === 'VYNKA';
    const perfilChat = perfilesPrueba.find(p => p.nombre === chatAbierto);
    const mensajesChat = estado.chats[chatAbierto] || [];
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: tema.fondo }}>
          <StatusBar style={esEsencia ? 'dark' : 'light'} />
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: tema.border }}>
            <TouchableOpacity onPress={() => setChatAbierto(null)}>
              <Text style={{ color: tema.accion, fontSize: 20, marginRight: 12 }}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { if (perfilChat) verPerfil(perfilChat); }} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }} disabled={esVynka}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: esVynka ? VYNKA_BRAND + '33' : tema.card, borderWidth: 1, borderColor: esVynka ? VYNKA_BRAND : tema.border, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 18 }}>{esVynka ? '💫' : (perfilChat?.emoji || '👤')}</Text>
              </View>
              <View>
                <Text style={{ color: esVynka ? VYNKA_BRAND : tema.texto, fontWeight: 'bold', fontSize: 16 }}>{chatAbierto}</Text>
                {!esVynka && <Text style={{ color: tema.accion, fontSize: 11 }}>Tocá para ver perfil 👁️</Text>}
                {esVynka && <Text style={{ color: VYNKA_BRAND, fontSize: 11 }}>Asistente oficial ✓</Text>}
              </View>
            </TouchableOpacity>
            {!esVynka && (
              <TouchableOpacity onPress={() => setConfirmBloqueo({ nombre: chatAbierto, id: perfilChat?.id })}>
                <Text style={{ color: '#FF2D55', fontSize: 13 }}>🚫</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={{ flex: 1, padding: 16 }}>
            {mensajesChat.map(msg => (
              <View key={msg.id} style={{ alignItems: msg.mio ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
                {msg.esVynka && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Text style={{ fontSize: 14 }}>💫</Text>
                    <Text style={{ color: VYNKA_BRAND, fontSize: 11, fontWeight: 'bold' }}>VYNKA</Text>
                  </View>
                )}
                <View style={{
                  backgroundColor: msg.esVynka ? VYNKA_BRAND + '22' : msg.esCita ? tema.accion + '33' : msg.mio ? tema.accion : tema.card,
                  borderRadius: 16, padding: 12, maxWidth: '82%',
                  borderWidth: msg.esVynka ? 1 : msg.esCita ? 1 : 0,
                  borderColor: msg.esVynka ? VYNKA_BRAND + '66' : msg.esCita ? tema.accion : 'transparent'
                }}>
                  <Text style={{ color: msg.mio && !msg.esCita && !msg.esVynka ? '#fff' : tema.texto, fontSize: 14 }}>{msg.texto}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {!esVynka && (
            <View style={{ flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: tema.border, gap: 8 }}>
              <TextInput value={textoMensaje} onChangeText={setTextoMensaje} placeholder="Escribí un mensaje..." placeholderTextColor={tema.textoSec}
                style={{ flex: 1, backgroundColor: tema.card, borderWidth: 1, borderColor: tema.border, borderRadius: 12, padding: 12, color: tema.texto, fontSize: 14 }} />
              <TouchableOpacity onPress={enviarMensaje}
                style={{ borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', backgroundColor: textoMensaje.trim() ? tema.accion : tema.card }}>
                <Text style={{ color: textoMensaje.trim() ? '#fff' : tema.textoSec, fontWeight: 'bold' }}>➤</Text>
              </TouchableOpacity>
            </View>
          )}

          {confirmBloqueo && (
            <View style={s.overlay}>
              <View style={[s.popup, { backgroundColor: tema.fondo, borderColor: tema.border }]}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>🚫</Text>
                <Text style={{ color: tema.texto, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>¿Bloquear a {confirmBloqueo.nombre}?</Text>
                <Text style={{ color: tema.textoSec, fontSize: 13, marginBottom: 24, textAlign: 'center' }}>No se podrán ver ni contactar.</Text>
                <TouchableOpacity onPress={() => bloquear(confirmBloqueo)} style={{ borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: '#FF2D55', width: '100%', marginBottom: 8 }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Sí, bloquear</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setConfirmBloqueo(null)}>
                  <Text style={{ color: tema.textoSec, fontSize: 14 }}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // HISTORIA VIENDO
  if (historiaViendo) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
          <StatusBar style="light" />
          <View style={{ height: 3, backgroundColor: '#ffffff33', margin: 16, borderRadius: 2 }}>
            <View style={{ height: '100%', width: '60%', backgroundColor: '#fff', borderRadius: 2 }} />
          </View>
          <TouchableOpacity onPress={() => setHistoriaViendo(null)} style={{ position: 'absolute', top: 40, right: 20, zIndex: 10 }}>
            <Text style={{ color: '#fff', fontSize: 28 }}>✕</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#ffffff22', borderWidth: 2, borderColor: SPARK.historias, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 36 }}>{historiaViendo.emoji}</Text>
            </View>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20, marginBottom: 4 }}>{historiaViendo.autor}</Text>
            {historiaViendo.etiqueta && (
              <View style={{ backgroundColor: VYNKA_BRAND + '33', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 16, borderWidth: 1, borderColor: VYNKA_BRAND + '66' }}>
                <Text style={{ color: VYNKA_BRAND, fontSize: 12 }}>{historiaViendo.etiqueta}</Text>
              </View>
            )}
            {historiaViendo.foto && <Image source={{ uri: historiaViendo.foto }} style={{ width: '100%', height: 300, borderRadius: 16, marginBottom: 16 }} />}
            {historiaViendo.texto ? <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center' }}>{historiaViendo.texto}</Text> : null}
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // QUIEN ME VIO
  if (mostrarQuienMeVio) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: tema.fondo }}>
          <StatusBar style={esEsencia ? 'dark' : 'light'} />
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: tema.border }}>
            <TouchableOpacity onPress={() => setMostrarQuienMeVio(false)}>
              <Text style={{ color: tema.accion, fontSize: 20, marginRight: 12 }}>←</Text>
            </TouchableOpacity>
            <Text style={{ color: tema.texto, fontWeight: 'bold', fontSize: 18 }}>👁️ Quién vio tu perfil</Text>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {quienMeVio.length === 0 ? (
              <View style={{ alignItems: 'center', padding: 40 }}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>👀</Text>
                <Text style={{ color: tema.textoSec }}>Nadie vio tu perfil todavía</Text>
              </View>
            ) : (
              quienMeVio.map(perfil => (
                <TouchableOpacity key={perfil.id} onPress={() => { setMostrarQuienMeVio(false); setPerfilViendo(perfil); }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: tema.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: tema.border }}>
                  <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: tema.fondo, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: tema.border }}>
                    <Text style={{ fontSize: 24 }}>{perfil.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: tema.texto, fontWeight: 'bold', fontSize: 15 }}>{perfil.nombre}, {perfil.edad}</Text>
                    <Text style={{ color: tema.textoSec, fontSize: 12 }}>📍 {perfil.km} km</Text>
                  </View>
                  <Text style={{ color: tema.accion, fontSize: 12 }}>Ver →</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // MAIN APP
  if (pantalla === 'main') {

    const renderRadar = () => (
      <View style={{ flex: 1 }}>
        <View style={{ padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: tema.textoSec, fontSize: 11, letterSpacing: 2 }}>CERCA DE TI 📍</Text>
          <TouchableOpacity onPress={() => setExplorarTodos(!explorarTodos)}
            style={{ backgroundColor: explorarTodos ? tema.accion + '33' : tema.card, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: explorarTodos ? tema.accion : tema.border }}>
            <Text style={{ color: explorarTodos ? tema.accion : tema.textoSec, fontSize: 12 }}>🌍 {explorarTodos ? 'Explorando todos' : 'Explorar todos'}</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={perfilesFiltrados}
          numColumns={2}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: 8 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
              <Text style={{ color: tema.textoSec }}>No hay perfiles compatibles cerca</Text>
            </View>
          }
          renderItem={({ item: perfil }) => (
            <TouchableOpacity onPress={() => verPerfil(perfil)}
              style={{ flex: 1, margin: 6, backgroundColor: tema.card, borderWidth: 1, borderColor: estado.matches.includes(perfil.id) ? '#4CAF5044' : perfil.grupo !== grupo ? VYNKA_BRAND + '33' : tema.border, borderRadius: 16, padding: 12, alignItems: 'center' }}>
              {perfil.accesoDual && (
                <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: VYNKA_BRAND + '33', borderRadius: 10, paddingHorizontal: 5, paddingVertical: 2 }}>
                  <Text style={{ color: VYNKA_BRAND, fontSize: 9 }}>DUAL</Text>
                </View>
              )}
              <View style={{ position: 'relative' }}>
                <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: tema.fondo, alignItems: 'center', justifyContent: 'center', marginBottom: 8, borderWidth: 1, borderColor: tema.border }}>
                  <Text style={{ fontSize: 35 }}>{perfil.emoji}</Text>
                </View>
                {estado.matches.includes(perfil.id) && (
                  <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: '#4CAF50', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 10 }}>💬</Text>
                  </View>
                )}
              </View>
              <Text style={{ color: tema.texto, fontWeight: 'bold', fontSize: 14 }}>{perfil.nombre}</Text>
              <Text style={{ color: tema.textoSec, fontSize: 12 }}>{perfil.edad} años</Text>
              <Text style={{ color: tema.textoSec, fontSize: 11 }}>📍 {perfil.km} km</Text>
              <View style={{ flexDirection: 'row', gap: 4, marginTop: 8 }}>
                <TouchableOpacity onPress={() => darLike(perfil)}
                  style={{ backgroundColor: estado.likes.includes(perfil.id) ? tema.card : tema.accion + '33', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
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

    const renderMensajes = () => (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: tema.textoSec, fontSize: 11, letterSpacing: 2, marginBottom: 12 }}>TUS CONVERSACIONES 💬</Text>
        {todosLosChats.map(nombre => {
          const esVynka = nombre === 'VYNKA';
          const perfil = perfilesPrueba.find(p => p.nombre === nombre);
          const msgs = estado.chats[nombre] || [];
          const ultimoMsg = msgs[msgs.length - 1];
          return (
            <TouchableOpacity key={nombre} onPress={() => setChatAbierto(nombre)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: tema.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: esVynka ? VYNKA_BRAND + '44' : tema.border }}>
              <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: esVynka ? VYNKA_BRAND + '22' : tema.fondo, borderWidth: 1, borderColor: esVynka ? VYNKA_BRAND : tema.border, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 26 }}>{esVynka ? '💫' : (perfil?.emoji || '👤')}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: esVynka ? VYNKA_BRAND : tema.texto, fontWeight: 'bold', fontSize: 15 }}>{nombre}</Text>
                <Text style={{ color: tema.textoSec, fontSize: 13 }} numberOfLines={1}>
                  {ultimoMsg ? (ultimoMsg.mio ? 'Vos: ' : '') + ultimoMsg.texto : esVynka ? 'Bienvenido/a a VYNKA ✨' : '🎉 ¡Match! Empezá la conversación'}
                </Text>
              </View>
              {esVynka && (
                <View style={{ backgroundColor: VYNKA_BRAND, borderRadius: 10, width: 8, height: 8 }} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );

    const renderTop = () => (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Burbujas historias */}
        {historiasGrupo.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: tema.textoSec, fontSize: 11, letterSpacing: 2 }}>HISTORIAS</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                {['Todas', ...etiquetasHistoria].map(et => (
                  <TouchableOpacity key={et} onPress={() => setFiltroEtiqueta(et)}
                    style={{ backgroundColor: filtroEtiqueta === et ? tema.accion + '33' : tema.card, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6, borderWidth: 1, borderColor: filtroEtiqueta === et ? tema.accion : tema.border }}>
                    <Text style={{ color: filtroEtiqueta === et ? tema.accion : tema.textoSec, fontSize: 11 }}>{et}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity style={{ alignItems: 'center', marginRight: 16 }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: tema.accion + '22', borderWidth: 2, borderColor: tema.accion, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                  <Text style={{ fontSize: 28 }}>➕</Text>
                </View>
                <Text style={{ color: tema.textoSec, fontSize: 11 }}>Tu historia</Text>
              </TouchableOpacity>
              {historiasGrupo.map(h => (
                <TouchableOpacity key={h.id} style={{ alignItems: 'center', marginRight: 16 }} onPress={() => setHistoriaViendo(h)}>
                  <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: tema.card, borderWidth: 2, borderColor: grupo === 'spark' ? SPARK.historias : ESENCIA.historias, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                    <Text style={{ fontSize: 28 }}>{h.emoji}</Text>
                  </View>
                  <Text style={{ color: tema.textoSec, fontSize: 11 }} numberOfLines={1}>{h.autor}</Text>
                  {h.etiqueta && <Text style={{ color: VYNKA_BRAND, fontSize: 9 }}>{h.etiqueta.split(' ')[0]}</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Publicar historia */}
        <View style={{ marginBottom: 16, backgroundColor: tema.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: tema.border }}>
          <Text style={{ color: tema.textoSec, fontSize: 13, marginBottom: 8 }}>📖 Historia del día</Text>
          <TextInput value={nuevaHistoria} onChangeText={setNuevaHistoria} placeholder="Contá algo..." placeholderTextColor={tema.textoSec}
            style={{ backgroundColor: tema.fondo, borderWidth: 1, borderColor: tema.border, borderRadius: 12, padding: 12, color: tema.texto, fontSize: 14, marginBottom: 8 }} multiline />

          <Text style={{ color: tema.textoSec, fontSize: 12, marginBottom: 8 }}>Etiqueta obligatoria:</Text>
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            {etiquetasHistoria.map(et => (
              <TouchableOpacity key={et} onPress={() => setEtiquetaSeleccionada(et)}
                style={{ backgroundColor: etiquetaSeleccionada === et ? tema.accion + '33' : tema.fondo, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: etiquetaSeleccionada === et ? tema.accion : tema.border }}>
                <Text style={{ color: etiquetaSeleccionada === et ? tema.accion : tema.textoSec, fontSize: 12 }}>{et}</Text>
              </TouchableOpacity>
            ))}
          </View>

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
              style={{ flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: tema.fondo, borderWidth: 1, borderColor: tema.border }}>
              <Text style={{ color: tema.textoSec, fontSize: 13 }}>📸 Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={publicarHistoria}
              style={{ flex: 2, borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: tema.accion }}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Publicar ✨</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Top perfiles */}
        <Text style={{ color: tema.textoSec, fontSize: 11, letterSpacing: 2, marginBottom: 12 }}>
          {grupo === 'spark' ? '🏆 MÁS LIKEADOS — SPARK' : '✨ DESTACADOS — ESENCIA'}
        </Text>

        {grupo === 'spark' ? (
          perfilesTopSpark.map((perfil, index) => {
            const totalCorazones = (perfil.corazones || 0) + (corazonesPerfiles[perfil.id] || 0);
            return (
              <TouchableOpacity key={perfil.id} onPress={() => verPerfil(perfil)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: tema.card, borderWidth: 1, borderColor: tema.border, borderRadius: 16, padding: 14, marginBottom: 10 }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : tema.fondo, alignItems: 'center', justifyContent: 'center', borderWidth: index >= 3 ? 1 : 0, borderColor: tema.border }}>
                  <Text style={{ color: index < 3 ? '#000' : tema.textoSec, fontWeight: 'bold', fontSize: 14 }}>{index + 1}</Text>
                </View>
                <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: tema.fondo, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: tema.border }}>
                  <Text style={{ fontSize: 24 }}>{perfil.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: tema.texto, fontWeight: 'bold', fontSize: 15 }}>{perfil.nombre}, {perfil.edad}</Text>
                  <Text style={{ color: tema.textoSec, fontSize: 12 }}>📍 {perfil.km} km</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 20 }}>❤️</Text>
                  <Text style={{ color: SPARK.corazon, fontWeight: 'bold', fontSize: 14 }}>{totalCorazones}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={{ alignItems: 'center', padding: 30, backgroundColor: tema.card, borderRadius: 16, borderWidth: 1, borderColor: ESENCIA.accion + '33' }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>✨</Text>
            <Text style={{ color: ESENCIA.accion, fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Esencia</Text>
            <Text style={{ color: tema.textoSec, textAlign: 'center', fontSize: 13 }}>El ranking es exclusivo de Spark</Text>
          </View>
        )}
      </ScrollView>
    );

    const renderSalidas = () => {
      const salidasOrdenadas = tabSalidas === 'ranking'
        ? [...salidasData].sort((a, b) => (b.estrellas + (estrelladas.includes(b.id) ? 1 : 0)) - (a.estrellas + (estrelladas.includes(a.id) ? 1 : 0)))
        : salidasData;
      return (
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', padding: 12, gap: 8 }}>
            {['todas', 'ranking'].map(t => (
              <TouchableOpacity key={t} onPress={() => setTabSalidas(t)}
                style={{ borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderColor: tabSalidas === t ? (t === 'ranking' ? '#FFD700' : tema.accion) : tema.border, backgroundColor: tabSalidas === t ? (t === 'ranking' ? '#FFD70022' : tema.accion + '22') : tema.card }}>
                <Text style={{ color: tabSalidas === t ? (t === 'ranking' ? '#FFD700' : tema.accion) : tema.textoSec, fontSize: 13 }}>{t === 'todas' ? '🎭 Todas' : '🏆 Ranking'}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0 }}>
            {salidasOrdenadas.map((pub, index) => (
              <View key={pub.id} style={{ backgroundColor: tema.card, borderWidth: 1, borderColor: pub.color + '33', borderRadius: 16, padding: 16, marginBottom: 12 }}>
                {tabSalidas === 'ranking' && (
                  <View style={{ position: 'absolute', top: 12, left: 12, width: 28, height: 28, borderRadius: 14, backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : tema.fondo, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 13 }}>{index + 1}</Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, marginLeft: tabSalidas === 'ranking' ? 36 : 0 }}>
                  <View style={{ backgroundColor: pub.color + '22', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ color: pub.color, fontSize: 12 }}>{pub.tipo}</Text>
                  </View>
                  <Text style={{ color: pub.dias <= 3 ? '#FF2D55' : tema.textoSec, fontSize: 11 }}>⏰ {pub.dias} días</Text>
                </View>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>{pub.emoji}</Text>
                <Text style={{ color: tema.texto, fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>{pub.titulo}</Text>
                <Text style={{ color: tema.textoSec, fontSize: 13, marginBottom: 12 }}>{pub.desc}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity onPress={() => setEstrelladas(estrelladas.includes(pub.id) ? estrelladas.filter(e => e !== pub.id) : [...estrelladas, pub.id])}
                    style={{ flex: 1, borderWidth: 1, borderRadius: 20, paddingVertical: 8, alignItems: 'center', borderColor: estrelladas.includes(pub.id) ? '#FFD700' : tema.border, backgroundColor: estrelladas.includes(pub.id) ? '#FFD70022' : tema.fondo }}>
                    <Text style={{ color: estrelladas.includes(pub.id) ? '#FFD700' : tema.textoSec, fontSize: 13 }}>⭐ {pub.estrellas + (estrelladas.includes(pub.id) ? 1 : 0)}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { if (misMatchesNombres.length === 0) { alert("Necesitás tener al menos un match"); return; } setMostrarEnviarCita(pub); }}
                    style={{ flex: 2, borderWidth: 1, borderRadius: 20, paddingVertical: 8, alignItems: 'center', borderColor: citaEnviada ? '#4CAF5044' : tema.accion + '44', backgroundColor: citaEnviada ? '#4CAF5022' : tema.accion + '22' }}>
                    <Text style={{ color: citaEnviada ? '#4CAF50' : tema.accion, fontSize: 13, fontWeight: 'bold' }}>{citaEnviada ? '✅ ¡Enviada!' : '🎯 Enviar como cita'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
          <Modal visible={!!mostrarEnviarCita} transparent animationType="slide">
            <View style={s.overlay}>
              <View style={[s.popup, { backgroundColor: tema.fondo, borderColor: tema.border }]}>
                <Text style={{ color: tema.texto, fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>🎯 Enviar como cita</Text>
                <Text style={{ color: tema.textoSec, fontSize: 13, marginBottom: 16 }}>¿A quién querés invitar?</Text>
                {misMatchesNombres.length === 0 ? (
                  <Text style={{ color: tema.textoSec, textAlign: 'center', marginBottom: 16 }}>No tenés matches todavía</Text>
                ) : (
                  <ScrollView style={{ width: '100%', maxHeight: 200 }}>
                    {misMatchesNombres.map(nombre => {
                      const perfil = perfilesPrueba.find(p => p.nombre === nombre);
                      return (
                        <TouchableOpacity key={nombre} onPress={() => enviarCita(mostrarEnviarCita, nombre)}
                          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: tema.card, borderRadius: 12, marginBottom: 8 }}>
                          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: tema.fondo, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 20 }}>{perfil?.emoji || '👤'}</Text>
                          </View>
                          <Text style={{ color: tema.texto, fontWeight: 'bold', fontSize: 15 }}>{nombre}</Text>
                          <Text style={{ color: tema.accion, marginLeft: 'auto' }}>Enviar →</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
                <TouchableOpacity onPress={() => setMostrarEnviarCita(null)} style={{ marginTop: 12 }}>
                  <Text style={{ color: tema.textoSec, fontSize: 14 }}>Cancelar</Text>
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
          <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: tema.card, borderWidth: 2, borderColor: tema.accion, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 45 }}>👤</Text>
          </View>
          <Text style={{ color: tema.texto, fontSize: 22, fontWeight: 'bold' }}>{form.nombre}</Text>
          <Text style={{ color: tema.textoSec, fontSize: 14 }}>{form.edad} años</Text>
          <Text style={{ color: tema.textoSec, fontSize: 12, marginTop: 4 }}>{sesion?.user?.email}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <View style={{ backgroundColor: tema.accion + '22', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: tema.accion + '44' }}>
              <Text style={{ color: tema.accion, fontSize: 14, fontWeight: 'bold' }}>{grupo === 'spark' ? '⚡ Spark' : '✨ Esencia'}</Text>
            </View>
            <TouchableOpacity onPress={() => setMostrarCambioGrupo(true)}
              style={{ backgroundColor: tema.card, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: tema.border }}>
              <Text style={{ color: tema.textoSec, fontSize: 12 }}>🔄 Cambiar grupo</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => setMostrarAccesoDual(true)}
            style={{ backgroundColor: VYNKA_BRAND + '22', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginTop: 10, borderWidth: 1, borderColor: VYNKA_BRAND + '44' }}>
            <Text style={{ color: VYNKA_BRAND, fontSize: 13 }}>⚡✨ Acceso Dual Premium</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMostrarQuienMeVio(true)}
            style={{ backgroundColor: tema.accion + '22', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginTop: 10, borderWidth: 1, borderColor: tema.accion + '44' }}>
            <Text style={{ color: tema.accion, fontSize: 13 }}>👁️ {quienMeVio.length} {quienMeVio.length === 1 ? 'persona vio' : 'personas vieron'} tu perfil — Ver quiénes</Text>
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: tema.card, borderWidth: 1, borderColor: tema.border, borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <Text style={{ color: tema.textoSec, fontSize: 12, marginBottom: 4 }}>ACTIVIDADES</Text>
          <Text style={{ color: tema.texto, fontSize: 14 }}>{form.actividadesElegidas.join(', ')}</Text>
        </View>
        <View style={{ backgroundColor: tema.card, borderWidth: 1, borderColor: tema.border, borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <Text style={{ color: tema.textoSec, fontSize: 12, marginBottom: 4 }}>BUSCA</Text>
          <Text style={{ color: tema.texto, fontSize: 14 }}>{busquedas.find(b => b.id === form.buscaPareja)?.label}</Text>
        </View>
        <View style={{ backgroundColor: tema.card, borderWidth: 1, borderColor: tema.border, borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <Text style={{ color: tema.textoSec, fontSize: 12, marginBottom: 4 }}>MATCHES</Text>
          <Text style={{ color: tema.texto, fontSize: 14 }}>{estado.matches.length} matches ❤️</Text>
        </View>

        <TouchableOpacity onPress={onCerrarSesion}
          style={{ borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: '#FF2D5511', borderWidth: 1, borderColor: '#FF2D5533', marginTop: 8 }}>
          <Text style={{ color: '#FF2D55', fontWeight: 'bold' }}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    );

    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: tema.fondo }}>
          <StatusBar style={esEsencia ? 'dark' : 'light'} />

          {/* Notificacion */}
          {notifVisto && (
            <Animated.View style={{ position: 'absolute', top: 60, left: 16, right: 16, backgroundColor: VYNKA_BRAND, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 100, opacity: notifAnim, transform: [{ translateY: notifAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }}>
              <Text style={{ fontSize: 20 }}>{notifVisto.emoji}</Text>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>👁️ {notifVisto.nombre} vio tu perfil</Text>
            </Animated.View>
          )}

          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: tema.border }}>
            <Text style={{ fontWeight: 'bold', fontSize: 22, letterSpacing: 2, color: VYNKA_BRAND }}>VYNKA</Text>
            <TouchableOpacity onPress={() => setMostrarCambioGrupo(true)}
              style={{ backgroundColor: tema.accion + '22', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: tema.accion + '44', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ color: tema.accion, fontSize: 13, fontWeight: 'bold' }}>{grupo === 'spark' ? '⚡ Spark' : '✨ Esencia'}</Text>
              <Text style={{ color: tema.textoSec, fontSize: 11 }}>🔄</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            {tabActivo === 'radar' && renderRadar()}
            {tabActivo === 'mensajes' && renderMensajes()}
            {tabActivo === 'salidas' && renderSalidas()}
            {tabActivo === 'top' && renderTop()}
            {tabActivo === 'perfil' && renderMiPerfil()}
          </View>

          {/* Nav */}
          <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: tema.border, backgroundColor: tema.fondo }}>
            {[
              { id: 'radar', emoji: '📡', label: 'Radar' },
              { id: 'mensajes', emoji: '💬', label: 'Mensajes' },
              { id: 'salidas', emoji: '🎭', label: 'Salidas' },
              { id: 'top', emoji: '🏆', label: 'Top' },
              { id: 'perfil', emoji: '👤', label: 'Perfil' },
            ].map(tab => (
              <TouchableOpacity key={tab.id} onPress={() => setTabActivo(tab.id)}
                style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderTopWidth: 2, borderTopColor: tabActivo === tab.id ? VYNKA_BRAND : 'transparent' }}>
                <Text style={{ fontSize: 20 }}>{tab.emoji}</Text>
                <Text style={{ color: tabActivo === tab.id ? VYNKA_BRAND : tema.textoSec, fontSize: 10, marginTop: 2 }}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Modal cambio grupo */}
          <Modal visible={mostrarCambioGrupo} transparent animationType="slide">
            <View style={s.overlay}>
              <View style={[s.popup, { backgroundColor: tema.fondo, borderColor: tema.border }]}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>🔄</Text>
                <Text style={{ color: tema.texto, fontWeight: 'bold', fontSize: 20, marginBottom: 8 }}>Cambiar de grupo</Text>
                <Text style={{ color: tema.textoSec, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>
                  Pasarías a {grupo === 'spark' ? '✨ Esencia' : '⚡ Spark'}
                </Text>
                <View style={{ backgroundColor: '#FFD70022', borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#FFD70044', width: '100%' }}>
                  <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 16, textAlign: 'center', marginBottom: 4 }}>🚧 Próximamente disponible</Text>
                  <Text style={{ color: tema.textoSec, fontSize: 13, textAlign: 'center' }}>Esta función será paga. Pronto disponible.</Text>
                </View>
                <TouchableOpacity onPress={() => setMostrarCambioGrupo(false)}
                  style={{ borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: VYNKA_BRAND, width: '100%' }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Entendido</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Modal acceso dual */}
          <Modal visible={mostrarAccesoDual} transparent animationType="slide">
            <View style={s.overlay}>
              <View style={[s.popup, { backgroundColor: tema.fondo, borderColor: VYNKA_BRAND + '44' }]}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>⚡✨</Text>
                <Text style={{ color: VYNKA_BRAND, fontWeight: 'bold', fontSize: 20, marginBottom: 8 }}>Acceso Dual Premium</Text>
                <Text style={{ color: tema.textoSec, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>
                  Aparecé en ambos grupos simultáneamente y aumentá tu visibilidad al doble
                </Text>
                <View style={{ backgroundColor: VYNKA_BRAND + '22', borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: VYNKA_BRAND + '44', width: '100%' }}>
                  <Text style={{ color: VYNKA_BRAND, fontWeight: 'bold', fontSize: 16, textAlign: 'center', marginBottom: 4 }}>🚧 Próximamente disponible</Text>
                  <Text style={{ color: tema.textoSec, fontSize: 13, textAlign: 'center' }}>Esta función premium estará disponible muy pronto.</Text>
                </View>
                <TouchableOpacity onPress={() => setMostrarAccesoDual(false)}
                  style={{ borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: VYNKA_BRAND, width: '100%' }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Entendido</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Match */}
          {matchNuevo && (
            <View style={s.overlay}>
              <View style={[s.popup, { backgroundColor: tema.fondo, borderColor: tema.accion }]}>
                <Text style={{ fontSize: 60, marginBottom: 12 }}>🎉</Text>
                <Text style={{ color: tema.accion, fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>¡Match!</Text>
                <Text style={{ color: tema.textoSec, marginBottom: 24 }}>Vos y {matchNuevo.nombre} se gustaron</Text>
                <TouchableOpacity onPress={() => { setChatAbierto(matchNuevo.nombre); setMatchNuevo(null); }}
                  style={{ borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: tema.accion, width: '100%', marginBottom: 8 }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>💬 Ir al chat</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setMatchNuevo(null)}>
                  <Text style={{ color: tema.textoSec, fontSize: 14 }}>Seguir viendo perfiles</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }
}

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
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000000CC', alignItems: 'center', justifyContent: 'center', padding: 24 },
  popup: { borderWidth: 1, borderRadius: 24, padding: 28, alignItems: 'center', width: '100%' },
});