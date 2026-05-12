import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, BackHandler, Image, FlatList, Modal, Animated } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import { useFonts, PlayfairDisplay_400Regular, PlayfairDisplay_700Bold, PlayfairDisplay_400Regular_Italic, PlayfairDisplay_700Bold_Italic } from '@expo-google-fonts/playfair-display';
import Auth from './Auth';
import { supabase } from './supabase';
import { guardarPerfil, obtenerPerfil, obtenerPerfiles, enviarMensajeReal, obtenerMensajes, suscribirMensajes, desuscribir, marcarLeidos, subirFoto, calcularDistanciaKm, publicarHistoriaDB, obtenerHistorias, publicarPostDB, obtenerPublicaciones, darLikePublicacion, quitarLikePublicacion, borrarPublicacion } from './supabaseService';
import * as Location from 'expo-location';

const registrarNotificaciones = async () => {};
const enviarNotificacionLocal = async () => {};
const escucharNotificaciones = () => ({ remove: () => {} });
const escucharRespuestaNotificacion = () => ({ remove: () => {} });
const SPARK = {
  fondo: '#0D0D12', accion: '#8A2BE2', accion2: '#FF007F', corazon: '#FF2D55',
  historias: '#00F5FF', texto: '#FFFFFF', textoSec: '#A0A0A0', card: '#1A1A24', border: '#2A2A3A',
};
const ESENCIA = {
  fondo: '#FDFCF8', accion: '#004D40', accion2: '#1A237E', corazon: '#C5A059',
  historias: '#E0E0E0', texto: '#1C1C1C', textoSec: '#5F6368', card: '#F0EFE9', border: '#E0DDD5',
};
const VYNKA_BRAND = '#FF5722';
const ADMIN_EMAIL = 'fernando.s.m.paz01@gmail.com';

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
const etiquetasBusqueda = ["💍 Algo Serio", "⚡ Algo Express", "🎭 Cita de Salida"];

const perfilesPrueba = [
  { id: 1, nombre: "Valentina", edad: 26, genero: "mujer", buscaPareja: "hombres", grupo: "spark", ciudad: "Buenos Aires", km: 1.2, actividades: ["🎬 Cine", "☕ Merienda", "🌿 Pasear"], emoji: "💜", bio: "Amo el café y los atardeceres 🌅", corazones: 45, accesoDual: false, etiqueta: "💍 Algo Serio" },
  { id: 2, nombre: "Carlos", edad: 31, genero: "hombre", buscaPareja: "mujeres", grupo: "spark", ciudad: "Buenos Aires", km: 2.5, actividades: ["🍽️ Cenar", "🎭 Teatro", "🏛️ Museo"], emoji: "💙", bio: "Músico de corazón 🎸", corazones: 38, accesoDual: false, etiqueta: "⚡ Algo Express" },
  { id: 3, nombre: "Sofia", edad: 28, genero: "mujer", buscaPareja: "mujeres", grupo: "spark", ciudad: "Buenos Aires", km: 3.1, actividades: ["🚴 Bicicleta", "🌸 Plaza", "☕ Merienda"], emoji: "🧡", bio: "Bailarina y amante de la naturaleza 🌿", corazones: 62, accesoDual: false, etiqueta: "🎭 Cita de Salida" },
  { id: 4, nombre: "Lucas", edad: 35, genero: "hombre", buscaPareja: "hombres", grupo: "spark", ciudad: "Buenos Aires", km: 0.8, actividades: ["🎬 Cine", "🍽️ Cenar", "🎭 Teatro"], emoji: "💚", bio: "Fotógrafo viajero 📷", corazones: 29, accesoDual: false, etiqueta: "⚡ Algo Express" },
  { id: 5, nombre: "Marina", edad: 40, genero: "mujer", buscaPareja: "ambos", grupo: "spark", ciudad: "Buenos Aires", km: 4.2, actividades: ["🌿 Pasear", "🏛️ Museo", "🎬 Cine"], emoji: "❤️", bio: "Artista en proceso ✨", corazones: 71, accesoDual: true, etiqueta: "💍 Algo Serio" },
  { id: 6, nombre: "Roberto", edad: 52, genero: "hombre", buscaPareja: "mujeres", grupo: "esencia", ciudad: "Buenos Aires", km: 1.8, actividades: ["🎬 Cine", "☕ Merienda", "🌿 Pasear"], emoji: "💛", bio: "Chef de fin de semana 🍕", corazones: 0, accesoDual: false, etiqueta: "💍 Algo Serio" },
  { id: 7, nombre: "Patricia", edad: 47, genero: "mujer", buscaPareja: "hombres", grupo: "esencia", ciudad: "Buenos Aires", km: 3.5, actividades: ["🎭 Teatro", "🍽️ Cenar", "🏛️ Museo"], emoji: "🩷", bio: "Amante del buen vino 🍷", corazones: 0, accesoDual: true, etiqueta: "🎭 Cita de Salida" },
];

const salidasData = [
  { id: 1, tipo: "🎬 Cine", titulo: "Estreno: Misión Imposible 8", desc: "Acción sin parar.", emoji: "🎬", dias: 14, estrellas: 47, color: "#8A2BE2" },
  { id: 2, tipo: "🍽️ Restaurante", titulo: "Promo cena para dos", desc: "Cena romántica con entrada y postre.", emoji: "🍽️", dias: 7, estrellas: 83, color: "#FF007F" },
  { id: 3, tipo: "🎭 Teatro", titulo: "Chicago — El Musical", desc: "El clásico de Broadway en Buenos Aires.", emoji: "🎭", dias: 25, estrellas: 124, color: "#00F5FF" },
  { id: 4, tipo: "🏛️ Museo", titulo: "Noche de Museos — MALBA", desc: "Entrada gratuita este sábado.", emoji: "🏛️", dias: 3, estrellas: 56, color: "#FF5722" },
  { id: 5, tipo: "🎪 Festival", titulo: "Festival de Jazz en el Parque", desc: "Tres días de música en vivo.", emoji: "🎪", dias: 10, estrellas: 91, color: "#C5A059" },
];

const historiasIniciales = [
  { id: 1, autorId: 1, autor: "Valentina", emoji: "💜", texto: "Hoy fui al parque 🌸", grupo: "spark", tipo: "texto" },
  { id: 2, autorId: 3, autor: "Sofia", emoji: "🧡", texto: "¡Fin de semana genial! 🎉", grupo: "spark", tipo: "texto" },
  { id: 3, autorId: 5, autor: "Marina", emoji: "❤️", texto: "Nueva expo en el MALBA 🎨", grupo: "spark", tipo: "texto" },
];

const publicacionesIniciales = [
  { id: 1, autor: "Valentina", emoji: "💜", texto: "¿Alguien quiere ir al cine este sábado? 🎬", likes: 24, meGusta: false, grupo: "spark", tiempo: "hace 2hs", timestamp: Date.now() - 7200000 },
  { id: 2, autor: "Lucas", emoji: "💚", texto: "Recomiendo el nuevo restaurante del centro 🍝", likes: 8, meGusta: false, grupo: "spark", tiempo: "hace 4hs", timestamp: Date.now() - 14400000 },
  { id: 3, autor: "Sofia", emoji: "🧡", texto: "Buscando planes para el finde 🌿", likes: 31, meGusta: false, grupo: "spark", tiempo: "hace 6hs", timestamp: Date.now() - 21600000 },
];

const mensajeBienvenida = [
  { id: 'w1', texto: "👋 ¡Bienvenido/a a VYNKA!\n\nSoy tu asistente de bienvenida.", mio: false, esVynka: true },
  { id: 'w2', texto: "📡 En el RADAR ves las personas cercanas. Tocá un perfil para verlo y dar like.", mio: false, esVynka: true },
  { id: 'w3', texto: "💬 Cuando dos personas se dan like, ¡es un MATCH! Ahí pueden chatear gratis.", mio: false, esVynka: true },
  { id: 'w4', texto: "🎭 En SALIDAS encontrás eventos y podés enviar invitaciones a tus matches.", mio: false, esVynka: true },
  { id: 'w5', texto: "🏆 En TOP ves los perfiles más queridos, historias y publicaciones.\n\n¡Que empiece la conexión! ✨", mio: false, esVynka: true },
];

const terminosTexto = `TÉRMINOS Y CONDICIONES DE VYNKA

Última actualización: Mayo 2025

1. ACEPTACIÓN
Al usar VYNKA aceptás estos términos. Si no estás de acuerdo, no uses la app.

2. EDAD MÍNIMA
Debes tener al menos 18 años para usar VYNKA. Nos reservamos el derecho de eliminar cuentas de menores.

3. CONDUCTA
- Está prohibido el acoso, insultos o amenazas
- No se permite contenido sexual explícito
- No se permiten perfiles falsos o spam
- No se permite contenido que involucre menores

4. PRIVACIDAD
Tus datos son almacenados de forma segura. No vendemos tu información a terceros.

5. MODERACIÓN
VYNKA puede eliminar contenido o cuentas que violen estas normas sin previo aviso.

6. RESPONSABILIDAD
VYNKA no es responsable por las interacciones entre usuarios. Usá la app con responsabilidad.

7. DENUNCIAS
Podés reportar comportamientos inapropiados desde cualquier perfil o chat.

8. CAMBIOS
Podemos modificar estos términos. Te notificaremos por email ante cambios importantes.`;

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

function Terminos({ onAceptar }) {
  const [leido, setLeido] = useState(false);
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D12' }}>
        <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#2A2A3A', alignItems: 'center' }}>
          <Text style={{ color: VYNKA_BRAND, fontSize: 24, fontWeight: 'bold', letterSpacing: 3 }}>VYNKA</Text>
          <Text style={{ color: '#A0A0A0', fontSize: 13, marginTop: 4 }}>Términos y Condiciones</Text>
        </View>
        <ScrollView style={{ flex: 1, padding: 20 }}
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 50) setLeido(true);
          }}
          scrollEventThrottle={16}>
          <Text style={{ color: '#ffffff', fontSize: 14, lineHeight: 22 }}>{terminosTexto}</Text>
          <View style={{ height: 40 }} />
        </ScrollView>
        <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: '#2A2A3A' }}>
          {!leido && <Text style={{ color: '#A0A0A0', fontSize: 12, textAlign: 'center', marginBottom: 10 }}>📖 Scrolleá hasta el final para aceptar</Text>}
          <TouchableOpacity onPress={leido ? onAceptar : null}
            style={{ backgroundColor: leido ? VYNKA_BRAND : '#ffffff22', borderRadius: 12, padding: 16, alignItems: 'center' }}>
            <Text style={{ color: leido ? '#fff' : '#ffffff55', fontWeight: 'bold', fontSize: 16 }}>
              {leido ? 'Acepto los términos ✓' : 'Leé los términos completos'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const IconMenu = ({ tipo, color, size = 22 }) => {
  switch (tipo) {
    case 'radar': return <Text style={{ fontSize: size, color }}>🏠</Text>;
    case 'mensajes': return <Text style={{ fontSize: size, color }}>💬</Text>;
    case 'salidas': return <Text style={{ fontSize: size, color }}>🎭</Text>;
    case 'historias': return <Text style={{ fontSize: size, color }}>📷</Text>;
    case 'perfil': return <Text style={{ fontSize: size, color }}>👤</Text>;
    default: return null;
  }
};

function MainApp({ sesion, onCerrarSesion }) {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular, PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular_Italic, PlayfairDisplay_700Bold_Italic
  });

  const [terminosAceptados, setTerminosAceptados] = useState(false);
  const [pantalla, setPantalla] = useState('inicio');
  const [tabActivo, setTabActivo] = useState('radar');
  const [tabPublicaciones, setTabPublicaciones] = useState('recientes');
  const [grupo, setGrupo] = useState(null);
  const [explorarTodos, setExplorarTodos] = useState(false);
  const [form, setForm] = useState({ nombre: "", edad: "", genero: "", actividadesElegidas: [], buscaPareja: "", etiquetaPerfil: "" });
  const [miPerfil, setMiPerfil] = useState({ fotos: [], descripcion: "", instagram: "", tiktok: "", twitter: "" });
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
  const [mostrarDenuncia, setMostrarDenuncia] = useState(null);
  const [mostrarEnviarCita, setMostrarEnviarCita] = useState(null);
  const [citaEnviada, setCitaEnviada] = useState(null);
  const [tabSalidas, setTabSalidas] = useState('todas');
  const [salidas, setSalidas] = useState(salidasData);
  const [historias, setHistorias] = useState(historiasIniciales);
  const [publicaciones, setPublicaciones] = useState(publicacionesIniciales);
  const [historiaViendo, setHistoriaViendo] = useState(null);
  const [nuevaHistoria, setNuevaHistoria] = useState("");
  const [mediaHistoria, setMediaHistoria] = useState(null);
  const [tipoMedia, setTipoMedia] = useState(null);
  const [nuevaPublicacion, setNuevaPublicacion] = useState("");
  const [corazonesPerfiles, setCorazonesPerfiles] = useState({});
  const [misCorazones, setMisCorazones] = useState([]);
  const [mostrarCambioGrupo, setMostrarCambioGrupo] = useState(false);
  const [mostrarAccesoDual, setMostrarAccesoDual] = useState(false);
  const [nuevaSalida, setNuevaSalida] = useState({ titulo: "", desc: "", tipo: "🎬 Cine", link: "", dias: "", foto: null });
  const [perfilesReales, setPerfilesReales] = useState([]);
  const [miUbicacion, setMiUbicacion] = useState(null);
  const notifAnim = useRef(new Animated.Value(0)).current;
  const canalMensajes = useRef(null);
  const notifSubscription = useRef(null);
  const notifRespuestaSubscription = useRef(null);

  const esAdmin = sesion?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const tema = grupo === 'spark' ? SPARK : ESENCIA;
  const estado = grupo === 'spark' ? estadoSpark : estadoEsencia;
  const setEstado = grupo === 'spark' ? setEstadoSpark : setEstadoEsencia;
  const esEsencia = grupo === 'esencia';
  const fuenteEsencia = 'PlayfairDisplay_400Regular_Italic';
  const fuenteEsenciaBold = 'PlayfairDisplay_700Bold_Italic';

  // TODOS LOS USEEFFECTS JUNTOS AL INICIO
  useEffect(() => {
    const backAction = () => {
      if (mostrarDenuncia) { setMostrarDenuncia(null); return true; }
      if (historiaViendo) { setHistoriaViendo(null); return true; }
      if (mostrarQuienMeVio) { setMostrarQuienMeVio(false); return true; }
      if (perfilViendo) { setPerfilViendo(null); return true; }
      if (chatAbierto) { setChatAbierto(null); return true; }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [chatAbierto, perfilViendo, mostrarQuienMeVio, historiaViendo, mostrarDenuncia]);

  useEffect(() => {
    if (notifVisto) {
      Animated.sequence([
        Animated.timing(notifAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(2500),
        Animated.timing(notifAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setNotifVisto(null));
    }
  }, [notifVisto]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const nuevaUbicacion = { lat: loc.coords.latitude, lng: loc.coords.longitude };
      setMiUbicacion(nuevaUbicacion);
      if (sesion?.user?.id) {
        await guardarPerfil(sesion.user.id, { ...form, grupo, lat: nuevaUbicacion.lat, lng: nuevaUbicacion.lng });
      }
    })();
  }, [pantalla]);

 useEffect(() => {
  if (sesion?.user?.id) {
    notifSubscription.current = { remove: () => {} };
    notifRespuestaSubscription.current = { remove: () => {} };
  }
  return () => {
    if (notifSubscription.current) notifSubscription.current.remove();
    if (notifRespuestaSubscription.current) notifRespuestaSubscription.current.remove();
  };
}, [sesion]);

  useEffect(() => {
    if (pantalla === 'main' && grupo && sesion?.user?.id) {
      cargarPerfiles();
      cargarMiPerfil();
      cargarHistoriasYPublicaciones();
    }
  }, [pantalla, grupo]);

  useEffect(() => {
    if (!chatAbierto || chatAbierto === 'VYNKA') return;
    const perfilDestino = perfilesReales.find(p => p.nombre === chatAbierto);
    if (!perfilDestino?.id) return;
    cargarMensajes(chatAbierto, perfilDestino.id);
    const canal = suscribirMensajes(sesion.user.id, perfilDestino.id, (nuevoMsg) => {
      setEstado(prev => ({
        ...prev,
        chats: {
          ...prev.chats,
          [chatAbierto]: [...(prev.chats[chatAbierto] || []), {
            id: nuevoMsg.id, texto: nuevoMsg.texto,
            mio: nuevoMsg.de_usuario === sesion.user.id,
          }]
        }
      }));
    });
    canalMensajes.current = canal;
    return () => { if (canalMensajes.current) desuscribir(canalMensajes.current); };
  }, [chatAbierto]);

  // TODAS LAS FUNCIONES
  const cargarPerfiles = async () => {
    const data = await obtenerPerfiles(grupo, sesion.user.id);
    if (data && data.length > 0) setPerfilesReales(data);
  };

  const cargarMiPerfil = async () => {
    const data = await obtenerPerfil(sesion.user.id);
    if (data) {
      setForm(prev => ({
        ...prev,
        nombre: data.nombre || prev.nombre,
        edad: data.edad?.toString() || prev.edad,
        genero: data.genero || prev.genero,
        buscaPareja: data.busca_pareja || prev.buscaPareja,
        etiquetaPerfil: data.etiqueta_perfil || prev.etiquetaPerfil,
        actividadesElegidas: data.actividades || prev.actividadesElegidas,
      }));
      if (data.bio) setMiPerfil(prev => ({ ...prev, descripcion: data.bio }));
    }
  };

  const cargarHistoriasYPublicaciones = async () => {
    const historiasDB = await obtenerHistorias(grupo);
    if (historiasDB && historiasDB.length > 0) {
      setHistorias(historiasDB.map(h => ({
        id: h.id, autorId: h.usuario_id, autor: h.autor, emoji: '⭐',
        texto: h.texto, media: h.media_url, tipoMedia: h.tipo_media,
        grupo: h.grupo, likes: h.likes, meGusta: false,
        mia: h.usuario_id === sesion.user.id,
      })));
    }
    const publicacionesDB = await obtenerPublicaciones(grupo);
    if (publicacionesDB && publicacionesDB.length > 0) {
      setPublicaciones(publicacionesDB.map(p => ({
        id: p.id, autor: p.autor, emoji: '⭐', texto: p.texto, likes: p.likes,
        meGusta: p.likes_publicaciones?.some(l => l.usuario_id === sesion.user.id) || false,
        grupo: p.grupo,
        tiempo: new Date(p.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date(p.created_at).getTime(),
        mia: p.usuario_id === sesion.user.id, usuarioId: p.usuario_id,
      })));
    }
  };

  const cargarMensajes = async (nombreChat, destinoId) => {
    const msgs = await obtenerMensajes(sesion.user.id, destinoId);
    if (msgs && msgs.length > 0) {
      setEstado(prev => ({
        ...prev,
        chats: {
          ...prev.chats,
          [nombreChat]: msgs.map(m => ({ id: m.id, texto: m.texto, mio: m.de_usuario === sesion.user.id }))
        }
      }));
      await marcarLeidos(destinoId, sesion.user.id);
    }
  };

  const determinarGrupo = (edad) => parseInt(edad) >= 45 ? 'esencia' : 'spark';
  const puedeRegistrarse = () => parseInt(form.edad) >= 18;
  const formularioCompleto = () => form.nombre && puedeRegistrarse() && form.genero && form.actividadesElegidas.length > 0 && form.buscaPareja && form.etiquetaPerfil;

  const toggleActividad = (act) => {
    if (form.actividadesElegidas.includes(act)) {
      setForm({ ...form, actividadesElegidas: form.actividadesElegidas.filter(a => a !== act) });
    } else if (form.actividadesElegidas.length < 3) {
      setForm({ ...form, actividadesElegidas: [...form.actividadesElegidas, act] });
    }
  };

  const cambiarGrupo = () => {
    if (esAdmin) {
      setGrupo(grupo === 'spark' ? 'esencia' : 'spark');
      setChatAbierto(null); setPerfilViendo(null); setTabActivo('radar');
    } else {
      setMostrarCambioGrupo(true);
    }
  };

  const darLike = (perfil) => {
    if (estado.likes.includes(perfil.id)) return;
    const nuevosLikes = [...estado.likes, perfil.id];
    let nuevosMatches = [...estado.matches];
    let nuevoMatch = null;
    if (perfil.id % 2 === 0) { nuevosMatches = [...nuevosMatches, perfil.id]; nuevoMatch = perfil; }
    setEstado({ ...estado, likes: nuevosLikes, matches: nuevosMatches });
    if (nuevoMatch) {
      setMatchNuevo(nuevoMatch);
    }
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

  const enviarMensaje = async () => {
    if (!textoMensaje.trim()) return;
    const texto = textoMensaje;
    setTextoMensaje("");
    const chatActual = estado.chats[chatAbierto] || [];
    const mensajeLocal = { id: Date.now(), texto, mio: true };
    setEstado(prev => ({ ...prev, chats: { ...prev.chats, [chatAbierto]: [...chatActual, mensajeLocal] } }));
    if (chatAbierto === 'VYNKA') return;
    const perfilDestino = perfilesReales.find(p => p.nombre === chatAbierto);
    if (perfilDestino?.id) await enviarMensajeReal(sesion.user.id, perfilDestino.id, texto);
  };

  const elegirMediaHistoria = async (tipo) => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) { alert("Necesitamos permiso"); return; }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: tipo === 'video' ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [4, 3], quality: 0.8, videoMaxDuration: 30,
    });
    if (!resultado.canceled) { setMediaHistoria(resultado.assets[0].uri); setTipoMedia(tipo); }
  };

  const publicarHistoria = async () => {
    if (!nuevaHistoria.trim() && !mediaHistoria) return;
    const yaPublico = historias.find(h => h.mia);
    if (yaPublico) { alert("Solo podés publicar 1 historia por día"); return; }
    const data = await publicarHistoriaDB(sesion.user.id, { autor: form.nombre, texto: nuevaHistoria, media: mediaHistoria, tipoMedia, grupo });
    if (data) {
      setHistorias(prev => [{ id: data.id, autorId: sesion.user.id, autor: form.nombre, emoji: '⭐', texto: nuevaHistoria, media: mediaHistoria, tipoMedia, grupo, likes: 0, meGusta: false, mia: true }, ...prev]);
      setNuevaHistoria(""); setMediaHistoria(null); setTipoMedia(null);
    } else alert("❌ Error publicando historia");
  };

  const publicarPost = async () => {
    if (!nuevaPublicacion.trim()) return;
    const yaPublico = publicaciones.find(p => p.mia);
    if (yaPublico) { alert("Solo podés publicar 1 post por día"); return; }
    const data = await publicarPostDB(sesion.user.id, { autor: form.nombre, texto: nuevaPublicacion, grupo });
    if (data) {
      setPublicaciones(prev => [{ id: data.id, autor: form.nombre, emoji: '⭐', texto: nuevaPublicacion, likes: 0, meGusta: false, grupo, tiempo: "ahora", timestamp: Date.now(), mia: true, usuarioId: sesion.user.id }, ...prev]);
      setNuevaPublicacion("");
    } else alert("❌ Error publicando");
  };

  const publicarSalida = () => {
    if (!nuevaSalida.titulo || !nuevaSalida.desc || !nuevaSalida.dias) { alert("Completá todos los campos"); return; }
    setSalidas([{ id: Date.now(), tipo: nuevaSalida.tipo, titulo: nuevaSalida.titulo, desc: nuevaSalida.desc, emoji: nuevaSalida.tipo.split(' ')[0], dias: parseInt(nuevaSalida.dias), estrellas: 0, color: VYNKA_BRAND, link: nuevaSalida.link, foto: nuevaSalida.foto }, ...salidas]);
    setNuevaSalida({ titulo: "", desc: "", tipo: "🎬 Cine", link: "", dias: "", foto: null });
    alert("✅ Salida publicada exitosamente");
  };

  const eliminarSalida = (id) => setSalidas(salidas.filter(s => s.id !== id));

  const agregarFotoPerfil = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) { alert("Necesitamos permiso"); return; }
    const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!resultado.canceled && miPerfil.fotos.length < 6) {
      const uri = resultado.assets[0].uri;
      const orden = miPerfil.fotos.length;
      alert("Subiendo foto...");
      const urlReal = await subirFoto(sesion.user.id, uri, orden);
      if (urlReal) { setMiPerfil(prev => ({ ...prev, fotos: [...prev.fotos, urlReal] })); alert("✅ Foto subida correctamente"); }
      else alert("❌ Error subiendo la foto");
    }
  };

  const elegirFotoSalida = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) { alert("Necesitamos permiso"); return; }
    const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [16, 9], quality: 0.8 });
    if (!resultado.canceled) setNuevaSalida(prev => ({ ...prev, foto: resultado.assets[0].uri }));
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
    if (explorarTodos) {
      if (!p.accesoDual && p.grupo !== grupo) return false;
      return sonCompatibles(form.genero, form.buscaPareja, p.genero, p.buscaPareja);
    }
    if (p.grupo !== grupo) return false;
    return sonCompatibles(form.genero, form.buscaPareja, p.genero, p.buscaPareja);
  });

  const perfilesTopSpark = [...perfilesPrueba.filter(p => p.grupo === 'spark')]
    .sort((a, b) => ((b.corazones || 0) + (corazonesPerfiles[b.id] || 0)) - ((a.corazones || 0) + (corazonesPerfiles[a.id] || 0)));

  const miPosicionTop = () => perfilesTopSpark.findIndex(p => p.nombre === form.nombre) + 1 || perfilesTopSpark.length + 1;
  const misCorazonesTotal = misCorazones.length;
  const historiasGrupo = historias.filter(h => h.grupo === grupo);
  const publicacionesGrupo = publicaciones.filter(p => p.grupo === grupo);
  const publicacionesRecientes = [...publicacionesGrupo].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  const publicacionesMasLikeadas = [...publicacionesGrupo].sort((a, b) => b.likes - a.likes);
const mensajesNuevos = tabActivo === 'mensajes' ? 0 : Object.keys(estado.chats).filter(k => {
  const msgs = estado.chats[k];
  return msgs && msgs.length > 0 && !msgs[msgs.length - 1].mio;
}).length;
  const visitasNuevas = tabActivo === 'perfil' ? 0 : quienMeVio.length;

  const BadgeNotif = ({ count }) => count > 0 ? (
    <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: VYNKA_BRAND, borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
      <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{count > 99 ? '99+' : count}</Text>
    </View>
  ) : null;

  const ModalDenuncia = () => {
    const motivos = ['🚨 Acoso o insultos', '📸 Foto falsa o inapropiada', '👶 Posible menor de edad', '🤖 Perfil falso o spam', '⚠️ Otro'];
    const [motivoElegido, setMotivoElegido] = useState('');
    return (
      <View style={st.overlay}>
        <View style={[st.popup, { backgroundColor: tema.fondo, borderColor: '#FF2D55' }]}>
          <Text style={{ fontSize: 36, marginBottom: 8 }}>🚨</Text>
          <Text style={{ color: tema.texto, fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>Denunciar</Text>
          <Text style={{ color: tema.textoSec, fontSize: 13, marginBottom: 16, textAlign: 'center' }}>¿Por qué denunciás a {mostrarDenuncia?.nombre}?</Text>
          {motivos.map(m => (
            <TouchableOpacity key={m} onPress={() => setMotivoElegido(m)}
              style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 6, width: '100%', borderColor: motivoElegido === m ? '#FF2D55' : tema.border, backgroundColor: motivoElegido === m ? '#FF2D5522' : tema.card }}>
              <Text style={{ color: motivoElegido === m ? '#FF2D55' : tema.texto, fontSize: 14 }}>{m}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => { if (motivoElegido) { alert('✅ Denuncia enviada.'); setMostrarDenuncia(null); } else alert('Elegí un motivo'); }}
            style={{ borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: '#FF2D55', width: '100%', marginTop: 8 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Enviar denuncia</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMostrarDenuncia(null)} style={{ marginTop: 10 }}>
            <Text style={{ color: tema.textoSec, fontSize: 14 }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!fontsLoaded) return null;
  if (!terminosAceptados) return <Terminos onAceptar={() => setTerminosAceptados(true)} />;

  if (pantalla === 'inicio') {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={[st.container, { backgroundColor: '#0D0D12' }]}>
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
              <Text style={{ color: '#004D40', fontSize: 22, fontFamily: fuenteEsenciaBold, marginBottom: 6 }}>Esencia</Text>
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

  if (pantalla === 'registro') {
    const grupoSugerido = form.edad ? determinarGrupo(form.edad) : grupo;
    const colorReg = grupoSugerido === 'spark' ? '#8A2BE2' : '#004D40';
    const fondoReg = grupoSugerido === 'spark' ? '#0D0D12' : '#FDFCF8';
    const textoReg = grupoSugerido === 'spark' ? '#fff' : '#1C1C1C';
    const textoSecReg = grupoSugerido === 'spark' ? '#A0A0A0' : '#5F6368';
    const cardReg = grupoSugerido === 'spark' ? '#1A1A24' : '#F0EFE9';
    const borderReg = grupoSugerido === 'spark' ? '#2A2A3A' : '#E0DDD5';
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: fondoReg }}>
          <StatusBar style={grupoSugerido === 'spark' ? 'light' : 'dark'} />
          <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
            <TouchableOpacity onPress={() => setPantalla('grupos')} style={{ marginBottom: 20 }}>
              <Text style={{ color: colorReg, fontSize: 16 }}>← Volver</Text>
            </TouchableOpacity>
            <Text style={{ color: colorReg, fontSize: 12, letterSpacing: 2, marginBottom: 4 }}>{grupoSugerido === 'spark' ? '⚡ SPARK' : '✨ ESENCIA'}</Text>
            <Text style={{ color: textoReg, fontSize: 24, fontWeight: 'bold', marginBottom: 24, fontFamily: grupoSugerido === 'esencia' ? fuenteEsenciaBold : undefined }}>Creá tu perfil</Text>
            <Text style={{ color: textoSecReg, fontSize: 13, marginBottom: 8 }}>Tu nombre</Text>
            <TextInput value={form.nombre} onChangeText={t => setForm({ ...form, nombre: t })} placeholder="¿Cómo te llaman?" placeholderTextColor={textoSecReg}
              style={{ backgroundColor: cardReg, borderWidth: 1, borderColor: borderReg, borderRadius: 12, padding: 12, color: textoReg, fontSize: 14, marginBottom: 16 }} />
            <Text style={{ color: textoSecReg, fontSize: 13, marginBottom: 8 }}>Tu edad</Text>
            <TextInput value={form.edad} onChangeText={t => { setForm({ ...form, edad: t }); if (parseInt(t) >= 18) setGrupo(determinarGrupo(t)); }}
              placeholder="¿Cuántos años tenés?" placeholderTextColor={textoSecReg} keyboardType="numeric"
              style={{ backgroundColor: cardReg, borderWidth: 1, borderColor: borderReg, borderRadius: 12, padding: 12, color: textoReg, fontSize: 14, marginBottom: 8 }} />
            {form.edad !== "" && parseInt(form.edad) < 18 && <Text style={{ color: '#FF2D55', fontSize: 12, marginBottom: 8 }}>❌ Debes tener al menos 18 años</Text>}
            {form.edad !== "" && parseInt(form.edad) >= 18 && (
              <View style={{ backgroundColor: colorReg + '22', borderRadius: 10, padding: 10, marginBottom: 16, borderWidth: 1, borderColor: colorReg + '44' }}>
                <Text style={{ color: colorReg, fontSize: 13 }}>✅ Grupo: {grupoSugerido === 'spark' ? '⚡ Spark' : '✨ Esencia'}</Text>
              </View>
            )}
            <Text style={{ color: textoSecReg, fontSize: 13, marginBottom: 12 }}>¿Cómo te identificás?</Text>
            {generos.map(g => (
              <TouchableOpacity key={g.id} onPress={() => setForm({ ...form, genero: g.id })}
                style={{ borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8, borderColor: form.genero === g.id ? colorReg : borderReg, backgroundColor: form.genero === g.id ? colorReg + '22' : cardReg }}>
                <Text style={{ color: form.genero === g.id ? colorReg : textoReg, fontSize: 15 }}>{g.emoji} {g.label}</Text>
              </TouchableOpacity>
            ))}
            <Text style={{ color: textoSecReg, fontSize: 13, marginBottom: 8 }}>Actividades favoritas <Text style={{ opacity: 0.6 }}>(hasta 3)</Text></Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {actividades.map(act => (
                <TouchableOpacity key={act} onPress={() => toggleActividad(act)}
                  style={{ borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, borderColor: form.actividadesElegidas.includes(act) ? colorReg : borderReg, backgroundColor: form.actividadesElegidas.includes(act) ? colorReg + '22' : cardReg }}>
                  <Text style={{ color: form.actividadesElegidas.includes(act) ? colorReg : textoReg, fontSize: 13 }}>{act}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ color: textoSecReg, fontSize: 13, marginBottom: 8 }}>¿A quién buscás?</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {busquedas.map(op => (
                <TouchableOpacity key={op.id} onPress={() => setForm({ ...form, buscaPareja: op.id })}
                  style={{ flex: 1, borderWidth: 1, borderRadius: 12, padding: 10, alignItems: 'center', borderColor: form.buscaPareja === op.id ? colorReg : borderReg, backgroundColor: form.buscaPareja === op.id ? colorReg + '22' : cardReg }}>
                  <Text style={{ fontSize: 20 }}>{op.emoji}</Text>
                  <Text style={{ color: form.buscaPareja === op.id ? colorReg : textoReg, fontSize: 13 }}>{op.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ color: textoSecReg, fontSize: 13, marginBottom: 8 }}>¿Qué buscás en VYNKA?</Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {etiquetasBusqueda.map(et => (
                <TouchableOpacity key={et} onPress={() => setForm({ ...form, etiquetaPerfil: et })}
                  style={{ borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, borderColor: form.etiquetaPerfil === et ? colorReg : borderReg, backgroundColor: form.etiquetaPerfil === et ? colorReg + '22' : cardReg }}>
                  <Text style={{ color: form.etiquetaPerfil === et ? colorReg : textoReg, fontSize: 13 }}>{et}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={async () => {
              if (formularioCompleto()) {
                await guardarPerfil(sesion.user.id, { ...form, grupo, ciudad: 'Buenos Aires', lat: miUbicacion?.lat || null, lng: miUbicacion?.lng || null });
                setPantalla('main');
              }
            }} style={{ borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: formularioCompleto() ? colorReg : '#ffffff22' }}>
              <Text style={{ color: formularioCompleto() ? '#fff' : '#ffffff55', fontSize: 15, fontWeight: 'bold' }}>Crear mi perfil ✨</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

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
            <Text style={{ color: temaP.texto, fontWeight: 'bold', fontSize: 18, fontFamily: perfilViendo.grupo === 'esencia' ? fuenteEsenciaBold : undefined }}>Perfil</Text>
            <View style={{ marginLeft: 'auto' }}>
              <TouchableOpacity onPress={() => setMostrarDenuncia(perfilViendo)}>
                <Text style={{ color: '#FF2D55', fontSize: 13 }}>🚨 Denunciar</Text>
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: temaP.card, borderWidth: 2, borderColor: temaP.accion, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 50 }}>{perfilViendo.emoji}</Text>
              </View>
              <Text style={{ color: temaP.texto, fontSize: 24, fontWeight: 'bold', fontFamily: perfilViendo.grupo === 'esencia' ? fuenteEsenciaBold : undefined }}>{perfilViendo.nombre}, {perfilViendo.edad}</Text>
              <Text style={{ color: temaP.textoSec, fontSize: 14, marginTop: 4 }}>
                📍 {miUbicacion && perfilViendo.lat ? calcularDistanciaKm(miUbicacion.lat, miUbicacion.lng, perfilViendo.lat, perfilViendo.lng) + ' km' : 'Cerca'} · {perfilViendo.ciudad || 'Buenos Aires'}
              </Text>
              {perfilViendo.etiqueta && (
                <View style={{ backgroundColor: temaP.accion + '22', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginTop: 8, borderWidth: 1, borderColor: temaP.accion + '44' }}>
                  <Text style={{ color: temaP.accion, fontSize: 13, fontWeight: 'bold' }}>{perfilViendo.etiqueta}</Text>
                </View>
              )}
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
                <Text style={{ color: temaP.texto, fontSize: 14, fontFamily: perfilViendo.grupo === 'esencia' ? fuenteEsencia : undefined }}>{perfilViendo.bio}</Text>
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
          {mostrarDenuncia && <ModalDenuncia />}
          {confirmBloqueo && (
            <View style={st.overlay}>
              <View style={[st.popup, { backgroundColor: temaP.fondo, borderColor: temaP.border }]}>
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
                <Text style={{ color: esVynka ? VYNKA_BRAND : tema.texto, fontWeight: 'bold', fontSize: 16, fontFamily: esEsencia && !esVynka ? fuenteEsenciaBold : undefined }}>{chatAbierto}</Text>
                {!esVynka && <Text style={{ color: tema.accion, fontSize: 11 }}>Tocá para ver perfil 👁️</Text>}
                {esVynka && <Text style={{ color: VYNKA_BRAND, fontSize: 11 }}>Asistente oficial ✓</Text>}
              </View>
            </TouchableOpacity>
            {!esVynka && (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity onPress={() => setMostrarDenuncia({ nombre: chatAbierto })}>
                  <Text style={{ color: '#FF2D55', fontSize: 13 }}>🚨</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setConfirmBloqueo({ nombre: chatAbierto, id: perfilChat?.id })}>
                  <Text style={{ color: '#FF2D55', fontSize: 13 }}>🚫</Text>
                </TouchableOpacity>
              </View>
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
                <View style={{ backgroundColor: msg.esVynka ? VYNKA_BRAND + '22' : msg.esCita ? tema.accion + '33' : msg.mio ? tema.accion : tema.card, borderRadius: 16, padding: 12, maxWidth: '82%', borderWidth: msg.esVynka || msg.esCita ? 1 : 0, borderColor: msg.esVynka ? VYNKA_BRAND + '66' : msg.esCita ? tema.accion : 'transparent' }}>
                  <Text style={{ color: msg.mio && !msg.esCita && !msg.esVynka ? '#fff' : tema.texto, fontSize: 14, fontFamily: esEsencia ? fuenteEsencia : undefined }}>{msg.texto}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          {!esVynka && (
            <View style={{ flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: tema.border, gap: 8 }}>
              <TextInput value={textoMensaje} onChangeText={setTextoMensaje} placeholder="Escribí un mensaje..." placeholderTextColor={tema.textoSec}
                style={{ flex: 1, backgroundColor: tema.card, borderWidth: 1, borderColor: tema.border, borderRadius: 12, padding: 12, color: tema.texto, fontSize: 14 }} />
              <TouchableOpacity onPress={enviarMensaje}
                style={{ borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: textoMensaje.trim() ? tema.accion : tema.card }}>
                <Text style={{ color: textoMensaje.trim() ? '#fff' : tema.textoSec, fontWeight: 'bold' }}>➤</Text>
              </TouchableOpacity>
            </View>
          )}
          {mostrarDenuncia && <ModalDenuncia />}
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

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
            <TouchableOpacity onPress={() => {
  const perfil = perfilesPrueba.find(p => p.nombre === historiaViendo.autor);
  if (perfil) { setHistoriaViendo(null); setPerfilViendo(perfil); }
}}>
  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20, marginBottom: 4 }}>{historiaViendo.autor}</Text>
  <Text style={{ color: VYNKA_BRAND, fontSize: 12, textAlign: 'center', marginBottom: 12 }}>Ver perfil →</Text>
</TouchableOpacity>
            {historiaViendo.tipoMedia === 'video' && historiaViendo.media ? (
              <Video source={{ uri: historiaViendo.media }} style={{ width: '100%', height: 300, borderRadius: 16, marginBottom: 16 }} useNativeControls resizeMode="contain" shouldPlay />
            ) : historiaViendo.media ? (
              <Image source={{ uri: historiaViendo.media }} style={{ width: '100%', height: 300, borderRadius: 16, marginBottom: 16 }} />
            ) : null}
            {historiaViendo.texto ? <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center' }}>{historiaViendo.texto}</Text> : null}
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (mostrarQuienMeVio) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: tema.fondo }}>
          <StatusBar style={esEsencia ? 'dark' : 'light'} />
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: tema.border }}>
            <TouchableOpacity onPress={() => setMostrarQuienMeVio(false)}>
              <Text style={{ color: tema.accion, fontSize: 20, marginRight: 12 }}>←</Text>
            </TouchableOpacity>
            <Text style={{ color: tema.texto, fontWeight: 'bold', fontSize: 18, fontFamily: esEsencia ? fuenteEsenciaBold : undefined }}>👁️ Quién vio tu perfil</Text>
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
                  <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: tema.fondo, alignItems: 'center', justifyContent: 'center' }}>
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

  if (pantalla === 'main') {
    const tiposEventos = ["🎬 Cine", "🍽️ Restaurante", "🎭 Teatro", "🏛️ Museo", "🎪 Festival", "🎵 Música", "🏃 Deporte"];

    const renderRadar = () => (
      <View style={{ flex: 1 }}>
        <View style={{ padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: tema.textoSec, fontSize: 11, letterSpacing: 2 }}>
            {miUbicacion ? 'CERCA DE TI 📍' : 'ACTIVÁ TU UBICACIÓN 📍'}
          </Text>
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
              style={{ flex: 1, margin: 6, backgroundColor: tema.card, borderWidth: 1, borderColor: estado.matches.includes(perfil.id) ? '#4CAF5044' : perfil.accesoDual && perfil.grupo !== grupo ? VYNKA_BRAND + '44' : tema.border, borderRadius: 16, padding: 12, alignItems: 'center' }}>
              {perfil.accesoDual && perfil.grupo !== grupo && (
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
              <Text style={{ color: tema.textoSec, fontSize: 11 }}>
                📍 {miUbicacion && perfil.lat ? calcularDistanciaKm(miUbicacion.lat, miUbicacion.lng, perfil.lat, perfil.lng) + ' km' : perfil.km + ' km'}
              </Text>
              {perfil.etiqueta && (
                <View style={{ backgroundColor: tema.accion + '22', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4 }}>
                  <Text style={{ color: tema.accion, fontSize: 9 }}>{perfil.etiqueta}</Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', gap: 4, marginTop: 6 }}>
                <TouchableOpacity onPress={() => darLike(perfil)}
                  style={{ backgroundColor: estado.likes.includes(perfil.id) ? tema.card : tema.accion + '33', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: tema.border }}>
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
        <Text style={{ color: tema.textoSec, fontSize: 11, letterSpacing: 2, marginBottom: 12, fontFamily: esEsencia ? fuenteEsencia : undefined }}>TUS CONVERSACIONES 💬</Text>
        {todosLosChats.map(nombre => {
          const esVynka = nombre === 'VYNKA';
          const perfil = perfilesPrueba.find(p => p.nombre === nombre);
          const msgs = estado.chats[nombre] || [];
          const ultimoMsg = msgs[msgs.length - 1];
          const tieneNoLeido = ultimoMsg && !ultimoMsg.mio;
          return (
            <TouchableOpacity key={nombre} onPress={() => setChatAbierto(nombre)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: tema.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: esVynka ? VYNKA_BRAND + '44' : tema.border }}>
              <View style={{ position: 'relative' }}>
                <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: esVynka ? VYNKA_BRAND + '22' : tema.fondo, borderWidth: 1, borderColor: esVynka ? VYNKA_BRAND : tema.border, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 26 }}>{esVynka ? '💫' : (perfil?.emoji || '👤')}</Text>
                </View>
                {tieneNoLeido && <View style={{ position: 'absolute', top: -2, right: -2, backgroundColor: VYNKA_BRAND, borderRadius: 8, width: 14, height: 14 }} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: esVynka ? VYNKA_BRAND : tema.texto, fontWeight: 'bold', fontSize: 15, fontFamily: esEsencia && !esVynka ? fuenteEsenciaBold : undefined }}>{nombre}</Text>
                <Text style={{ color: tieneNoLeido ? tema.texto : tema.textoSec, fontSize: 13, fontWeight: tieneNoLeido ? 'bold' : 'normal' }} numberOfLines={1}>
                  {ultimoMsg ? (ultimoMsg.mio ? 'Vos: ' : '') + ultimoMsg.texto : esVynka ? 'Bienvenido/a a VYNKA ✨' : '🎉 ¡Match!'}
                </Text>
              </View>
              {esVynka && <View style={{ backgroundColor: VYNKA_BRAND, borderRadius: 10, width: 8, height: 8 }} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );

    const renderTop = () => (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {grupo === 'spark' && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: tema.textoSec, fontSize: 11, letterSpacing: 2, marginBottom: 12 }}>HISTORIAS 📖</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity style={{ alignItems: 'center', marginRight: 16 }} onPress={() => elegirMediaHistoria('foto')}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: tema.accion + '22', borderWidth: 2, borderColor: tema.accion, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                  <Text style={{ fontSize: 28 }}>➕</Text>
                </View>
                <Text style={{ color: tema.accion, fontSize: 11, fontWeight: 'bold' }}>Tu historia</Text>
              </TouchableOpacity>
              {historiasGrupo.map(h => (
  <View key={h.id} style={{ alignItems: 'center', marginRight: 16 }}>
    <TouchableOpacity onPress={() => setHistoriaViendo(h)}>
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: tema.card, borderWidth: 2, borderColor: SPARK.historias, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
        {h.tipoMedia === 'video' ? <Text style={{ fontSize: 28 }}>🎥</Text> : <Text style={{ fontSize: 28 }}>{h.emoji}</Text>}
      </View>
    </TouchableOpacity>
    <Text style={{ color: tema.textoSec, fontSize: 11 }} numberOfLines={1}>{h.autor}</Text>
    <TouchableOpacity onPress={() => setHistorias(historias.map(x => x.id === h.id ? { ...x, meGusta: !x.meGusta, likes: x.meGusta ? x.likes - 1 : x.likes + 1 } : x))}>
      <Text style={{ color: h.meGusta ? SPARK.corazon : tema.textoSec, fontSize: 11 }}>❤️ {h.likes || 0}</Text>
    </TouchableOpacity>
  </View>
))}
            </ScrollView>
          </View>
        )}

        <View style={{ backgroundColor: tema.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: tema.border, marginBottom: 16 }}>
          <Text style={{ color: tema.textoSec, fontSize: 13, marginBottom: 8, fontFamily: esEsencia ? fuenteEsencia : undefined }}>📝 ¿Qué querés compartir?</Text>
          <TextInput value={nuevaPublicacion} onChangeText={setNuevaPublicacion} placeholder="Escribí algo..." placeholderTextColor={tema.textoSec}
            style={{ backgroundColor: tema.fondo, borderWidth: 1, borderColor: tema.border, borderRadius: 12, padding: 12, color: tema.texto, fontSize: 14, marginBottom: 10 }} multiline />
          <TouchableOpacity onPress={publicarPost} style={{ borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: tema.accion }}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Publicar 📝</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {['recientes', 'likeadas'].map(t => (
            <TouchableOpacity key={t} onPress={() => setTabPublicaciones(t)}
              style={{ flex: 1, borderWidth: 1, borderRadius: 20, paddingVertical: 7, alignItems: 'center', borderColor: tabPublicaciones === t ? tema.accion : tema.border, backgroundColor: tabPublicaciones === t ? tema.accion + '22' : tema.card }}>
              <Text style={{ color: tabPublicaciones === t ? tema.accion : tema.textoSec, fontSize: 13, fontWeight: tabPublicaciones === t ? 'bold' : 'normal', fontFamily: esEsencia ? fuenteEsencia : undefined }}>
                {t === 'recientes' ? '🕐 Recientes' : '🔥 Más likeadas'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {(tabPublicaciones === 'recientes' ? publicacionesRecientes : publicacionesMasLikeadas).map(pub => (
          <View key={pub.id} style={{ backgroundColor: tema.card, borderWidth: 1, borderColor: tema.border, borderRadius: 16, padding: 16, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: tema.fondo, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: tema.border }}>
                <Text style={{ fontSize: 20 }}>{pub.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: pub.mia ? tema.accion : tema.texto, fontWeight: 'bold', fontFamily: esEsencia ? fuenteEsenciaBold : undefined }}>{pub.autor}</Text>
                <Text style={{ color: tema.textoSec, fontSize: 11 }}>{pub.tiempo}</Text>
              </View>
              {tabPublicaciones === 'likeadas' && (
                <View style={{ backgroundColor: SPARK.corazon + '22', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: SPARK.corazon + '44' }}>
                  <Text style={{ color: SPARK.corazon, fontWeight: 'bold', fontSize: 12 }}>🔥 {pub.likes}</Text>
                </View>
              )}
            </View>
            <Text style={{ color: tema.texto, fontSize: 14, marginBottom: 12, lineHeight: 20, fontFamily: esEsencia ? fuenteEsencia : undefined }}>{pub.texto}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={async () => {
                if (pub.meGusta) await quitarLikePublicacion(sesion.user.id, pub.id);
                else await darLikePublicacion(sesion.user.id, pub.id);
                setPublicaciones(publicaciones.map(p => p.id === pub.id ? { ...p, meGusta: !p.meGusta, likes: p.meGusta ? p.likes - 1 : p.likes + 1 } : p));
              }} style={{ borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderColor: pub.meGusta ? tema.accion : tema.border, backgroundColor: pub.meGusta ? tema.accion + '22' : tema.fondo }}>
                <Text style={{ color: pub.meGusta ? tema.accion : tema.textoSec, fontSize: 13 }}>❤️ {pub.likes}</Text>
              </TouchableOpacity>
              {pub.mia && (
                <TouchableOpacity onPress={async () => { await borrarPublicacion(pub.id); setPublicaciones(publicaciones.filter(p => p.id !== pub.id)); }}
                  style={{ borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderColor: '#FF2D5533', backgroundColor: '#FF2D5511' }}>
                  <Text style={{ color: '#FF2D55', fontSize: 13 }}>🗑️ Borrar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {grupo === 'spark' && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ color: tema.textoSec, fontSize: 11, letterSpacing: 2, marginBottom: 12 }}>🏆 TOP 1000 — MÁS LIKEADOS</Text>
            {perfilesTopSpark.map((perfil, index) => {
              const totalCorazones = (perfil.corazones || 0) + (corazonesPerfiles[perfil.id] || 0);
              return (
                <TouchableOpacity key={perfil.id} onPress={() => verPerfil(perfil)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: tema.card, borderWidth: 1, borderColor: index === 0 ? '#FFD70044' : tema.border, borderRadius: 16, padding: 14, marginBottom: 10 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : tema.fondo, alignItems: 'center', justifyContent: 'center', borderWidth: index >= 3 ? 1 : 0, borderColor: tema.border }}>
                    <Text style={{ color: index < 3 ? '#000' : tema.textoSec, fontWeight: 'bold', fontSize: 14 }}>#{index + 1}</Text>
                  </View>
                  <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: tema.fondo, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: tema.border }}>
                    <Text style={{ fontSize: 24 }}>{perfil.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: tema.texto, fontWeight: 'bold', fontSize: 15 }}>{perfil.nombre}, {perfil.edad}</Text>
                    <Text style={{ color: tema.textoSec, fontSize: 12 }}>📍 {perfil.km} km</Text>
                    {perfil.etiqueta && <Text style={{ color: tema.accion, fontSize: 11 }}>{perfil.etiqueta}</Text>}
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 18 }}>❤️</Text>
                    <Text style={{ color: SPARK.corazon, fontWeight: 'bold', fontSize: 14 }}>{totalCorazones}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    );

    const renderSalidas = () => {
      const salidasOrdenadas = tabSalidas === 'ranking'
        ? [...salidas].sort((a, b) => (b.estrellas + (estrelladas.includes(b.id) ? 1 : 0)) - (a.estrellas + (estrelladas.includes(a.id) ? 1 : 0)))
        : salidas;
      return (
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', padding: 12, gap: 8 }}>
            {['todas', 'ranking'].map(t => (
              <TouchableOpacity key={t} onPress={() => setTabSalidas(t)}
                style={{ borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderColor: tabSalidas === t ? (t === 'ranking' ? '#FFD700' : tema.accion) : tema.border, backgroundColor: tabSalidas === t ? (t === 'ranking' ? '#FFD70022' : tema.accion + '22') : tema.card }}>
                <Text style={{ color: tabSalidas === t ? (t === 'ranking' ? '#FFD700' : tema.accion) : tema.textoSec, fontSize: 13, fontFamily: esEsencia ? fuenteEsencia : undefined }}>{t === 'todas' ? '🎭 Todas' : '🏆 Ranking'}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0 }}>
            {esAdmin && (
              <View style={{ backgroundColor: VYNKA_BRAND + '22', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 2, borderColor: VYNKA_BRAND + '66' }}>
                <Text style={{ color: VYNKA_BRAND, fontWeight: 'bold', fontSize: 15, marginBottom: 12 }}>🔐 Panel Admin — Nueva Salida</Text>
                <Text style={{ color: tema.textoSec, fontSize: 12, marginBottom: 6 }}>Tipo de evento</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                  {tiposEventos.map(t => (
                    <TouchableOpacity key={t} onPress={() => setNuevaSalida(prev => ({ ...prev, tipo: t }))}
                      style={{ backgroundColor: nuevaSalida.tipo === t ? VYNKA_BRAND + '33' : tema.card, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6, borderWidth: 1, borderColor: nuevaSalida.tipo === t ? VYNKA_BRAND : tema.border }}>
                      <Text style={{ color: nuevaSalida.tipo === t ? VYNKA_BRAND : tema.textoSec, fontSize: 13 }}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TextInput value={nuevaSalida.titulo} onChangeText={t => setNuevaSalida(prev => ({ ...prev, titulo: t }))} placeholder="Título del evento *" placeholderTextColor={tema.textoSec}
                  style={{ backgroundColor: tema.fondo, borderWidth: 1, borderColor: tema.border, borderRadius: 10, padding: 10, color: tema.texto, fontSize: 14, marginBottom: 8 }} />
                <TextInput value={nuevaSalida.desc} onChangeText={t => setNuevaSalida(prev => ({ ...prev, desc: t }))} placeholder="Descripción *" placeholderTextColor={tema.textoSec} multiline
                  style={{ backgroundColor: tema.fondo, borderWidth: 1, borderColor: tema.border, borderRadius: 10, padding: 10, color: tema.texto, fontSize: 14, marginBottom: 8 }} />
                <TextInput value={nuevaSalida.link} onChangeText={t => setNuevaSalida(prev => ({ ...prev, link: t }))} placeholder="Link (opcional)" placeholderTextColor={tema.textoSec}
                  style={{ backgroundColor: tema.fondo, borderWidth: 1, borderColor: tema.border, borderRadius: 10, padding: 10, color: tema.texto, fontSize: 14, marginBottom: 8 }} />
                <TextInput value={nuevaSalida.dias} onChangeText={t => setNuevaSalida(prev => ({ ...prev, dias: t }))} placeholder="Días que dura *" placeholderTextColor={tema.textoSec} keyboardType="numeric"
                  style={{ backgroundColor: tema.fondo, borderWidth: 1, borderColor: tema.border, borderRadius: 10, padding: 10, color: tema.texto, fontSize: 14, marginBottom: 8 }} />
                {nuevaSalida.foto && (
                  <View style={{ position: 'relative', marginBottom: 8 }}>
                    <Image source={{ uri: nuevaSalida.foto }} style={{ width: '100%', height: 160, borderRadius: 10 }} />
                    <TouchableOpacity onPress={() => setNuevaSalida(prev => ({ ...prev, foto: null }))}
                      style={{ position: 'absolute', top: 6, right: 6, backgroundColor: '#000000AA', borderRadius: 14, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#fff' }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <TouchableOpacity onPress={elegirFotoSalida}
                  style={{ borderRadius: 10, paddingVertical: 10, alignItems: 'center', backgroundColor: tema.fondo, borderWidth: 1, borderColor: tema.border, marginBottom: 8 }}>
                  <Text style={{ color: tema.textoSec, fontSize: 13 }}>📸 Agregar foto al evento</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={publicarSalida} style={{ backgroundColor: VYNKA_BRAND, borderRadius: 10, padding: 12, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Publicar evento</Text>
                </TouchableOpacity>
              </View>
            )}
            {salidasOrdenadas.map((pub, index) => (
              <View key={pub.id} style={{ backgroundColor: tema.card, borderWidth: 1, borderColor: pub.color + '33', borderRadius: 16, padding: 16, marginBottom: 12 }}>
                {tabSalidas === 'ranking' && (
                  <View style={{ position: 'absolute', top: 12, left: 12, width: 28, height: 28, borderRadius: 14, backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : tema.fondo, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: index < 3 ? '#000' : tema.textoSec, fontWeight: 'bold', fontSize: 13 }}>{index + 1}</Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, marginLeft: tabSalidas === 'ranking' ? 36 : 0 }}>
                  <View style={{ backgroundColor: pub.color + '22', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ color: pub.color, fontSize: 12 }}>{pub.tipo}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <Text style={{ color: pub.dias <= 3 ? '#FF2D55' : tema.textoSec, fontSize: 11 }}>⏰ {pub.dias} días</Text>
                    {esAdmin && (
                      <TouchableOpacity onPress={() => eliminarSalida(pub.id)}>
                        <Text style={{ color: '#FF2D55', fontSize: 13 }}>🗑️</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                {pub.foto && <Image source={{ uri: pub.foto }} style={{ width: '100%', height: 160, borderRadius: 12, marginBottom: 10 }} />}
                <Text style={{ fontSize: 32, marginBottom: 8 }}>{pub.emoji}</Text>
                <Text style={{ color: tema.texto, fontWeight: 'bold', fontSize: 16, marginBottom: 6, fontFamily: esEsencia ? fuenteEsenciaBold : undefined }}>{pub.titulo}</Text>
                <Text style={{ color: tema.textoSec, fontSize: 13, marginBottom: 12, fontFamily: esEsencia ? fuenteEsencia : undefined }}>{pub.desc}</Text>
                {pub.link ? <Text style={{ color: tema.accion, fontSize: 12, marginBottom: 10 }}>🔗 {pub.link}</Text> : null}
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
            <View style={st.overlay}>
              <View style={[st.popup, { backgroundColor: tema.fondo, borderColor: tema.border }]}>
                <Text style={{ color: tema.texto, fontWeight: 'bold', fontSize: 18, marginBottom: 4, fontFamily: esEsencia ? fuenteEsenciaBold : undefined }}>🎯 Enviar como cita</Text>
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
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: tema.textoSec, fontSize: 12, letterSpacing: 2, marginBottom: 12, fontFamily: esEsencia ? fuenteEsencia : undefined }}>MIS FOTOS</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {miPerfil.fotos.map((foto, index) => (
              <View key={index} style={{ position: 'relative' }}>
                <Image source={{ uri: foto }} style={{ width: 90, height: 90, borderRadius: 12 }} />
                <TouchableOpacity onPress={() => setMiPerfil(prev => ({ ...prev, fotos: prev.fotos.filter((_, i) => i !== index) }))}
                  style={{ position: 'absolute', top: -6, right: -6, backgroundColor: '#FF2D55', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontSize: 12 }}>✕</Text>
                </TouchableOpacity>
                {index === 0 && (
                  <View style={{ position: 'absolute', bottom: 4, left: 4, backgroundColor: VYNKA_BRAND + 'CC', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ color: '#fff', fontSize: 9 }}>Principal</Text>
                  </View>
                )}
              </View>
            ))}
            {miPerfil.fotos.length < 6 && (
              <TouchableOpacity onPress={agregarFotoPerfil}
                style={{ width: 90, height: 90, borderRadius: 12, backgroundColor: tema.card, borderWidth: 2, borderColor: tema.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 28, color: tema.textoSec }}>+</Text>
                <Text style={{ color: tema.textoSec, fontSize: 10 }}>Foto</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: tema.card, borderWidth: 2, borderColor: tema.accion, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            {miPerfil.fotos.length > 0 ? (
              <Image source={{ uri: miPerfil.fotos[0] }} style={{ width: 76, height: 76, borderRadius: 38 }} />
            ) : (
              <Text style={{ fontSize: 40 }}>👤</Text>
            )}
          </View>
          <Text style={{ color: tema.texto, fontSize: 22, fontWeight: 'bold', fontFamily: esEsencia ? fuenteEsenciaBold : undefined }}>{form.nombre}</Text>
          <Text style={{ color: tema.textoSec, fontSize: 14 }}>{form.edad} años</Text>
          <Text style={{ color: tema.textoSec, fontSize: 12, marginTop: 4 }}>{sesion?.user?.email}</Text>
          {esAdmin && <Text style={{ color: VYNKA_BRAND, fontSize: 12, marginTop: 4, fontWeight: 'bold' }}>🔐 Administrador</Text>}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <View style={{ backgroundColor: tema.accion + '22', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: tema.accion + '44' }}>
              <Text style={{ color: tema.accion, fontSize: 14, fontWeight: 'bold', fontFamily: esEsencia ? fuenteEsenciaBold : undefined }}>{grupo === 'spark' ? '⚡ Spark' : '✨ Esencia'}</Text>
            </View>
            <TouchableOpacity onPress={cambiarGrupo}
              style={{ backgroundColor: tema.card, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: tema.border }}>
              <Text style={{ color: tema.textoSec, fontSize: 12 }}>🔄 Cambiar grupo</Text>
            </TouchableOpacity>
          </View>
          {grupo === 'spark' && (
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <View style={{ backgroundColor: SPARK.corazon + '22', borderRadius: 16, padding: 14, alignItems: 'center', flex: 1, borderWidth: 1, borderColor: SPARK.corazon + '44' }}>
                <Text style={{ fontSize: 24 }}>❤️</Text>
                <Text style={{ color: SPARK.corazon, fontWeight: 'bold', fontSize: 20 }}>{misCorazonesTotal}</Text>
                <Text style={{ color: tema.textoSec, fontSize: 11 }}>Corazones</Text>
              </View>
              <View style={{ backgroundColor: '#FFD70022', borderRadius: 16, padding: 14, alignItems: 'center', flex: 1, borderWidth: 1, borderColor: '#FFD70044' }}>
                <Text style={{ fontSize: 24 }}>🏆</Text>
                <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 20 }}>#{miPosicionTop()}</Text>
                <Text style={{ color: tema.textoSec, fontSize: 11 }}>Top semanal</Text>
              </View>
            </View>
          )}
          <TouchableOpacity onPress={() => setMostrarQuienMeVio(true)}
            style={{ backgroundColor: tema.accion + '22', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginTop: 12, borderWidth: 1, borderColor: tema.accion + '44' }}>
            <Text style={{ color: tema.accion, fontSize: 13, fontFamily: esEsencia ? fuenteEsencia : undefined }}>👁️ {quienMeVio.length} {quienMeVio.length === 1 ? 'persona vio' : 'personas vieron'} tu perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMostrarAccesoDual(true)}
            style={{ backgroundColor: VYNKA_BRAND + '22', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginTop: 10, borderWidth: 1, borderColor: VYNKA_BRAND + '44' }}>
            <Text style={{ color: VYNKA_BRAND, fontSize: 13 }}>⚡✨ Acceso Dual Premium</Text>
          </TouchableOpacity>
        </View>
        <View style={{ backgroundColor: tema.card, borderWidth: 1, borderColor: tema.border, borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <Text style={{ color: tema.textoSec, fontSize: 12, marginBottom: 8, fontFamily: esEsencia ? fuenteEsencia : undefined }}>MI DESCRIPCIÓN</Text>
          <TextInput value={miPerfil.descripcion} onChangeText={t => setMiPerfil(prev => ({ ...prev, descripcion: t }))}
            onBlur={async () => { await guardarPerfil(sesion.user.id, { ...form, grupo, bio: miPerfil.descripcion, lat: miUbicacion?.lat || null, lng: miUbicacion?.lng || null }); }}
            placeholder="Contá algo sobre vos..." placeholderTextColor={tema.textoSec} multiline maxLength={300}
            style={{ color: tema.texto, fontSize: 14, lineHeight: 20, fontFamily: esEsencia ? fuenteEsencia : undefined }} />
          <Text style={{ color: tema.textoSec, fontSize: 11, textAlign: 'right', marginTop: 4 }}>{miPerfil.descripcion.length}/300</Text>
        </View>
        <View style={{ backgroundColor: tema.card, borderWidth: 1, borderColor: tema.border, borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <Text style={{ color: tema.textoSec, fontSize: 12, marginBottom: 12, fontFamily: esEsencia ? fuenteEsencia : undefined }}>REDES SOCIALES</Text>
          {[
            { key: 'instagram', label: '📸 Instagram', placeholder: '@tuusuario' },
            { key: 'tiktok', label: '🎵 TikTok', placeholder: '@tuusuario' },
            { key: 'twitter', label: '🐦 X (Twitter)', placeholder: '@tuusuario' },
          ].map(red => (
            <View key={red.key} style={{ marginBottom: 10 }}>
              <Text style={{ color: tema.textoSec, fontSize: 12, marginBottom: 4 }}>{red.label}</Text>
              <TextInput value={miPerfil[red.key]} onChangeText={t => setMiPerfil(prev => ({ ...prev, [red.key]: t }))}
                placeholder={red.placeholder} placeholderTextColor={tema.textoSec}
                style={{ backgroundColor: tema.fondo, borderWidth: 1, borderColor: tema.border, borderRadius: 10, padding: 10, color: tema.texto, fontSize: 14 }} />
            </View>
          ))}
        </View>
        <View style={{ backgroundColor: tema.card, borderWidth: 1, borderColor: tema.border, borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <Text style={{ color: tema.textoSec, fontSize: 12, marginBottom: 4, fontFamily: esEsencia ? fuenteEsencia : undefined }}>ACTIVIDADES</Text>
          <Text style={{ color: tema.texto, fontSize: 14, fontFamily: esEsencia ? fuenteEsencia : undefined }}>{form.actividadesElegidas.join(', ')}</Text>
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
          {notifVisto && (
            <Animated.View style={{ position: 'absolute', top: 60, left: 16, right: 16, backgroundColor: VYNKA_BRAND, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 100, opacity: notifAnim, transform: [{ translateY: notifAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }}>
              <Text style={{ fontSize: 20 }}>{notifVisto.emoji}</Text>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>👁️ {notifVisto.nombre} vio tu perfil</Text>
            </Animated.View>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: tema.border }}>
            <Text style={{ fontWeight: 'bold', fontSize: 22, letterSpacing: 2, color: VYNKA_BRAND }}>VYNKA</Text>
            <TouchableOpacity onPress={cambiarGrupo}
              style={{ backgroundColor: tema.accion + '22', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: tema.accion + '44', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ color: tema.accion, fontSize: 13, fontWeight: 'bold', fontFamily: esEsencia ? fuenteEsenciaBold : undefined }}>{grupo === 'spark' ? '⚡ Spark' : '✨ Esencia'}</Text>
              <Text style={{ color: tema.textoSec, fontSize: 11 }}>🔄</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            {tabActivo === 'radar' && renderRadar()}
                        {tabActivo === 'mensajes' && (() => {  
                          // Limpiar mensajes no leídos al abrir  return renderMensajes();
                        })()}
            {tabActivo === 'salidas' && renderSalidas()}
            {tabActivo === 'top' && renderTop()}
            {tabActivo === 'perfil' && renderMiPerfil()}
          </View>
          <View style={{ flexDirection: 'row', backgroundColor: esEsencia ? '#E8EDE8' : '#1A1A24', borderTopWidth: 1, borderTopColor: esEsencia ? '#004D4033' : '#8A2BE233', paddingHorizontal: 8, paddingVertical: 6, gap: 6 }}>
            {[
              { id: 'radar', label: 'Inicio', icono: 'radar', badge: 0 },
              { id: 'mensajes', label: 'Mensajes', icono: 'mensajes', badge: mensajesNuevos },
              { id: 'salidas', label: 'Salidas', icono: 'salidas', badge: 0 },
              { id: 'top', label: 'Historias', icono: 'historias', badge: 0 },
              { id: 'perfil', label: 'Perfil', icono: 'perfil', badge: visitasNuevas },
            ].map(tab => {
              const activo = tabActivo === tab.id;
              return (
                <TouchableOpacity key={tab.id} onPress={() => setTabActivo(tab.id)}
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 12, borderWidth: 1.5, borderColor: activo ? tema.accion : (esEsencia ? '#004D4033' : '#8A2BE233'), backgroundColor: activo ? tema.accion + '22' : (esEsencia ? '#FDFCF8' : '#0D0D12') }}>
                  <View style={{ position: 'relative', marginBottom: 3 }}>
                    <IconMenu tipo={tab.icono} color={activo ? tema.accion : tema.textoSec} size={20} />
                    <BadgeNotif count={tab.badge} />
                  </View>
                  <Text style={{ color: activo ? tema.accion : tema.textoSec, fontSize: 9, fontWeight: activo ? 'bold' : 'normal', fontFamily: esEsencia ? fuenteEsencia : undefined, textAlign: 'center' }}>{tab.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Modal visible={mostrarCambioGrupo} transparent animationType="slide">
            <View style={st.overlay}>
              <View style={[st.popup, { backgroundColor: tema.fondo, borderColor: tema.border }]}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>🔄</Text>
                <Text style={{ color: tema.texto, fontWeight: 'bold', fontSize: 20, marginBottom: 8, fontFamily: esEsencia ? fuenteEsenciaBold : undefined }}>Cambiar de grupo</Text>
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
          <Modal visible={mostrarAccesoDual} transparent animationType="slide">
            <View style={st.overlay}>
              <View style={[st.popup, { backgroundColor: tema.fondo, borderColor: VYNKA_BRAND + '44' }]}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>⚡✨</Text>
                <Text style={{ color: VYNKA_BRAND, fontWeight: 'bold', fontSize: 20, marginBottom: 8 }}>Acceso Dual Premium</Text>
                <Text style={{ color: tema.textoSec, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>Aparecé en ambos grupos y duplicá tu visibilidad</Text>
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
          {matchNuevo && (
            <View style={st.overlay}>
              <View style={[st.popup, { backgroundColor: tema.fondo, borderColor: tema.accion }]}>
                <Text style={{ fontSize: 60, marginBottom: 12 }}>🎉</Text>
                <Text style={{ color: tema.accion, fontSize: 24, fontWeight: 'bold', marginBottom: 8, fontFamily: esEsencia ? fuenteEsenciaBold : undefined }}>¡Match!</Text>
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
          {mostrarDenuncia && <ModalDenuncia />}
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

const st = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000000CC', alignItems: 'center', justifyContent: 'center', padding: 24 },
  popup: { borderWidth: 1, borderRadius: 24, padding: 28, alignItems: 'center', width: '100%' },
});