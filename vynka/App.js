import { StatusBar } from 'expo-status-bar'; 
import { 
  StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, 
  BackHandler, Image, Modal, Animated, Dimensions, FlatList, Switch, 
  Platform, Alert,
} from 'react-native'; 
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'; 
import { useState, useEffect, useRef, useCallback } from 'react'; 
import * as ImagePicker from 'expo-image-picker'; 
import * as Notifications from 'expo-notifications'; 
import { LinearGradient } from 'expo-linear-gradient'; 
import { MapViewSafe as MapView, MarkerSafe as Marker, PROVIDER_GOOGLE_SAFE as PROVIDER_GOOGLE } from './MapaComponente';
import { useFonts, PlayfairDisplay_400Regular, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display'; 
import { CormorantGaramond_400Regular, CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond'; 
import { 
  IconMessage, IconCalendarEvent, IconPhoto, IconUser, 
  IconHeart, IconBan, IconAlertTriangle, IconMessageCircle, 
  IconSend, IconArrowLeft, IconX, IconRefresh, IconTrash, 
  IconPencil, IconStar, IconPlus, IconEye, IconMapPin, IconUsers, 
  IconEyeOff, IconFilter, IconAdjustments, 
} from '@tabler/icons-react-native'; 
import Auth from './Auth'; 
import { supabase } from './supabase'; 
import { 
  guardarPerfil, obtenerPerfil, obtenerPerfiles, 
  enviarMensajeReal, obtenerMensajes, suscribirMensajes, 
  desuscribir, marcarLeidos, subirFoto, calcularDistanciaKm, 
  publicarHistoriaDB, obtenerHistorias, publicarPostDB, obtenerPublicaciones, 
  darLikePublicacion, quitarLikePublicacion, borrarPublicacion, 
  darLikeReal, obtenerMisMatches, enviarDenuncia, suscribirMatches, 
} from './supabaseService'; 
import * as Location from 'expo-location';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_SIZE = (SCREEN_WIDTH - 48) / 3;

const SPARK = {
  fondo: '#0D0118', card: '#1A0030', border: '#2A1040',
  accion: '#7C3AED', cta: '#F97316', accion2: '#FF6BF8',
  texto: '#F5F0E8', textoSec: '#A08CC0', corazon: '#FF6BF8',
};
const ESENCIA = {
  fondo: '#F5F0E8', card: '#EDE8DC', border: '#D4B896',
  accion: '#2D4A3E', cta: '#2D4A3E', accion2: '#8B6914',
  navbar: '#1C2E26', bordeOscuro: '#0C1A12',
  texto: '#1C2E26', textoSec: '#A0845C', corazon: '#8B6914',
};
const VYNKA_BRAND = '#F97316';
const ADMIN_EMAIL = 'fernando.s.m.paz01@gmail.com';
const INFINITY_COLOR = '#7C3AED';
const ELITE_COLOR = '#8B6914';

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

const salidasData = [];

const mensajeBienvenida = (nombre) => ([
  { id: 'w1', texto: `👋 ¡Hola ${nombre || ''}! Bienvenido/a a VYNKA.`, mio: false, esVynka: true, esNotif: false },
  { id: 'w2', texto: "📍 En el RADAR ves personas cercanas en el mapa. Tocá un perfil para darle like.", mio: false, esVynka: true, esNotif: false },
  { id: 'w3', texto: "💬 Cuando dos personas se dan like mutuamente, ¡es un MATCH! Ahí pueden chatear.", mio: false, esVynka: true, esNotif: false },
  { id: 'w4', texto: "💎 Con Infinity o Elite tenés beneficios exclusivos: modo incógnito, mensajes ocultos y más.\n\n¡Que empiece la conexión! ✨", mio: false, esVynka: true, esNotif: false },
]);

const terminosTexto = `TÉRMINOS Y CONDICIONES DE VYNKA\n\nÚltima actualización: Mayo 2025\n\n1. ACEPTACIÓN\nAl usar VYNKA aceptás estos términos.\n\n2. EDAD MÍNIMA\nDebes tener al menos 18 años.\n\n3. CONDUCTA\n- Prohibido el acoso, insultos o amenazas\n- No se permite contenido sexual explícito\n- No se permiten perfiles falsos o spam\n\n4. PRIVACIDAD\nTus datos son almacenados de forma segura.\n\n5. MODERACIÓN\nVYNKA puede eliminar cuentas que violen estas normas.\n\n6. RESPONSABILIDAD\nVYNKA no es responsable por las interacciones entre usuarios.\n\n7. DENUNCIAS\nPodés reportar comportamientos inapropiados desde cualquier perfil.\n\n8. CAMBIOS\nPodemos modificar estos términos. Te notificaremos ante cambios importantes.`;

function sonCompatibles(miGenero, miBusqueda, otroGenero, otroBusqueda) {
  const esHombre = (g) => g === "hombre" || g === "hombre_trans";
  const esMujer = (g) => g === "mujer" || g === "mujer_trans";
  if (!miGenero || !miBusqueda || !otroGenero || !otroBusqueda) return true;
  if (miBusqueda === "ambos" || otroBusqueda === "ambos") return true;
  if (miBusqueda === "hombres" && esHombre(otroGenero) && (otroBusqueda === "mujeres" || otroBusqueda === "hombres")) return true;
  if (miBusqueda === "mujeres" && esMujer(otroGenero) && (otroBusqueda === "hombres" || otroBusqueda === "mujeres")) return true;
  return false;
}

const estadoInicial = { likes: [], matches: [], chats: {}, bloqueados: [] };

async function registrarNotificaciones() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return null;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'VYNKA', importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250], lightColor: '#7C3AED',
      });
    }
    return null;
  } catch (e) { console.log('Error notificaciones:', e); return null; }
}

async function enviarNotifLocal(titulo, cuerpo, data = {}) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title: titulo, body: cuerpo, data, sound: true },
      trigger: null,
    });
  } catch (e) {}
}

function Terminos({ onAceptar }) {
  const [leido, setLeido] = useState(false);
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: SPARK.fondo }}>
        <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: SPARK.border, alignItems: 'center' }}>
          <Image source={require('./assets/icon.png')} style={{ width: 60, height: 60, borderRadius: 14, marginBottom: 8 }} />
          <Text style={{ fontWeight: '900', fontSize: 22, letterSpacing: 4, color: VYNKA_BRAND }}>VYNKA</Text>
          <Text style={{ color: SPARK.textoSec, fontSize: 13, marginTop: 4 }}>Términos y Condiciones</Text>
        </View>
        <ScrollView style={{ flex: 1, padding: 20 }}
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 50) setLeido(true);
          }} scrollEventThrottle={16}>
          <Text style={{ color: SPARK.texto, fontSize: 14, lineHeight: 22 }}>{terminosTexto}</Text>
          <View style={{ height: 40 }} />
        </ScrollView>
        <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: SPARK.border }}>
          {!leido && <Text style={{ color: SPARK.textoSec, fontSize: 12, textAlign: 'center', marginBottom: 10 }}>📖 Scrolleá hasta el final para aceptar</Text>}
          <TouchableOpacity onPress={leido ? onAceptar : null} style={{ borderRadius: 12, overflow: 'hidden' }}>
            {leido ? (
              <LinearGradient colors={['#7C3AED', '#C026D3', '#F97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ padding: 16, alignItems: 'center', borderRadius: 12 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Acepto los términos ✓</Text>
              </LinearGradient>
            ) : (
              <View style={{ backgroundColor: SPARK.card, padding: 16, alignItems: 'center', borderRadius: 12 }}>
                <Text style={{ color: SPARK.textoSec, fontWeight: 'bold', fontSize: 16 }}>Leé los términos completos</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const IconMenu = ({ tipo, color, size = 26 }) => {
  switch (tipo) {
    case 'radar': return <IconMapPin size={size} color={color} strokeWidth={1.5} />;
    case 'mensajes': return <IconMessage size={size} color={color} strokeWidth={1.5} />;
    case 'salidas': return <IconCalendarEvent size={size} color={color} strokeWidth={1.5} />;
    case 'historias': return <IconPhoto size={size} color={color} strokeWidth={1.5} />;
    case 'perfil': return <IconUser size={size} color={color} strokeWidth={1.5} />;
    default: return null;
  }
};

const MarkerPerfil = ({ perfil, esPremium, esMatch, grupo, incognito }) => {
  const borderColor = esPremium ? (grupo === 'spark' ? INFINITY_COLOR : ELITE_COLOR)
    : esMatch ? '#4CAF50' : (grupo === 'spark' ? SPARK.accion : ESENCIA.accion);
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: 54, height: 54, borderRadius: 27, borderWidth: esPremium ? 3 : 2, borderColor, backgroundColor: grupo === 'spark' ? SPARK.card : ESENCIA.card, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', opacity: incognito ? 0.5 : 1 }}>
        {incognito ? (
          <Text style={{ fontSize: 26 }}>👻</Text>
        ) : perfil.foto ? (
          <Image source={{ uri: perfil.foto }} style={{ width: 50, height: 50, borderRadius: 25 }} />
        ) : (
          <Text style={{ fontSize: 26 }}>{perfil.emoji || '👤'}</Text>
        )}
        {esPremium && !incognito && (
          <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: grupo === 'spark' ? INFINITY_COLOR : ELITE_COLOR, borderRadius: 8, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 8, color: '#fff' }}>★</Text>
          </View>
        )}
      </View>
      <View style={{ width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: borderColor, marginTop: -1 }} />
      <Text style={{ color: grupo === 'spark' ? SPARK.texto : ESENCIA.texto, fontSize: 10, fontWeight: 'bold', marginTop: 2, backgroundColor: grupo === 'spark' ? SPARK.card + 'EE' : ESENCIA.card + 'EE', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 }}>
        {incognito ? '???' : perfil.nombre}
      </Text>
    </View>
  );
};

const TarjetaPerfilPremium = ({ perfil, onPress, esMiMatch, premiumColor, tema, grupo }) => (
  <TouchableOpacity onPress={() => onPress(perfil)}
    style={{ width: CARD_SIZE, marginBottom: 12, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: premiumColor + '88' }}>
    <View style={{ width: '100%', height: CARD_SIZE, backgroundColor: tema.card }}>
      {perfil.foto ? (
        <Image source={{ uri: perfil.foto }} style={{ width: '100%', height: '100%' }} />
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 36 }}>{perfil.emoji || '👤'}</Text>
        </View>
      )}
      <LinearGradient colors={['transparent', '#00000099']} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 6 }}>
        <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }} numberOfLines={1}>{perfil.nombre}</Text>
        <Text style={{ color: '#ffffff88', fontSize: 10 }}>{perfil.edad}a · {perfil.km ? perfil.km + 'km' : '?'}</Text>
      </LinearGradient>
      <View style={{ position: 'absolute', top: 4, right: 4, backgroundColor: premiumColor, borderRadius: 8, paddingHorizontal: 4, paddingVertical: 2 }}>
        <Text style={{ color: '#fff', fontSize: 8, fontWeight: 'bold' }}>{grupo === 'spark' ? '💎' : '👑'}</Text>
      </View>
      {esMiMatch && (
        <View style={{ position: 'absolute', top: 4, left: 4, backgroundColor: '#4CAF50', borderRadius: 8, paddingHorizontal: 4, paddingVertical: 2 }}>
          <Text style={{ color: '#fff', fontSize: 8 }}>💚</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

// ── MAIN APP ──────────────────────────────────────────────────────────────────
function MainApp({ sesion, onCerrarSesion }) {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular, PlayfairDisplay_700Bold,
    CormorantGaramond_400Regular, CormorantGaramond_600SemiBold,
  });

  const [terminosAceptados, setTerminosAceptados] = useState(false);
  const [pantalla, setPantalla] = useState('cargando');
  const [tabActivo, setTabActivo] = useState('radar');
  const [tabPublicaciones, setTabPublicaciones] = useState('recientes');
  const [tabRadar, setTabRadar] = useState('todos');
  const [tabSalidas, setTabSalidas] = useState('todas');
  const [grupo, setGrupo] = useState(null);
  const [explorarTodos, setExplorarTodos] = useState(false);
  const [form, setForm] = useState({ nombre: "", edad: "", genero: "", actividadesElegidas: [], buscaPareja: "", etiquetaPerfil: "" });
  const [miPerfil, setMiPerfil] = useState({ fotos: [], descripcion: "", instagram: "", tiktok: "", twitter: "", esPremium: false });
  const [estadoSpark, setEstadoSpark] = useState({ ...estadoInicial });
  const [estadoEsencia, setEstadoEsencia] = useState({ ...estadoInicial });
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
  const [citasEnviadas, setCitasEnviadas] = useState([]);
  const [salidas, setSalidas] = useState(salidasData);
  const [historias, setHistorias] = useState([]);
  const [publicaciones, setPublicaciones] = useState([]);
  const [historiaViendo, setHistoriaViendo] = useState(null);
  const [nuevaPublicacion, setNuevaPublicacion] = useState("");
  const [fotoPublicacion, setFotoPublicacion] = useState(null);
  const [corazonesPerfiles, setCorazonesPerfiles] = useState({});
  const [misCorazones, setMisCorazones] = useState([]);
  const [mostrarCambioGrupo, setMostrarCambioGrupo] = useState(false);
  const [mostrarPremium, setMostrarPremium] = useState(false);
  const [nuevaSalida, setNuevaSalida] = useState({ titulo: "", desc: "", tipo: "🎬 Cine", link: "", dias: "" });
  const [perfilesReales, setPerfilesReales] = useState([]);
  const [miUbicacion, setMiUbicacion] = useState(null);
  const [mensajesVistos, setMensajesVistos] = useState(false);
  const [visitasVistas, setVisitasVistas] = useState(false);
  const [perfilSeleccionadoMapa, setPerfilSeleccionadoMapa] = useState(null);
  const [matchesIds, setMatchesIds] = useState([]);
  const [notifLike, setNotifLike] = useState(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtroEdadMin, setFiltroEdadMin] = useState('18');
  const [filtroEdadMax, setFiltroEdadMax] = useState('99');
  const [filtroDistanciaMax, setFiltroDistanciaMax] = useState('50');
  const [modoIncognito, setModoIncognito] = useState(false);
  const [chatsOcultos, setChatsOcultos] = useState([]);
  const [mostrarMensajesOcultos, setMostrarMensajesOcultos] = useState(false);
  const [mostrarSubirHistoria, setMostrarSubirHistoria] = useState(false);
  const [textoHistoria, setTextoHistoria] = useState('');
  const [mediaHistoria, setMediaHistoria] = useState(null);

  const notifAnim = useRef(new Animated.Value(0)).current;
  const notifLikeAnim = useRef(new Animated.Value(0)).current;
  const canalMensajes = useRef(null);
  const canalMatches = useRef(null);
  const mapRef = useRef(null);

  const esAdmin = sesion?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const tema = grupo === 'spark' ? SPARK : ESENCIA;
  const estado = grupo === 'spark' ? estadoSpark : estadoEsencia;
  const setEstado = grupo === 'spark' ? setEstadoSpark : setEstadoEsencia;
  const esEsencia = grupo === 'esencia';
  const gradienteSpark = ['#7C3AED', '#C026D3'];
  const gradienteEsencia = ['#2D4A3E', '#8B6914'];
  const gradienteActual = esEsencia ? gradienteEsencia : gradienteSpark;
  const premiumLabel = grupo === 'spark' ? 'Infinity' : 'Elite';
  const premiumColor = grupo === 'spark' ? INFINITY_COLOR : ELITE_COLOR;
  const premiumGradiente = grupo === 'spark' ? ['#7C3AED', '#FF6BF8'] : ['#8B6914', '#D4B896'];
  const esPremium = miPerfil.esPremium || false;
  const [historiaIndex, setHistoriaIndex] = useState(0);
const progresoHistoria = useRef(new Animated.Value(0)).current;
const timerHistoria = useRef(null);

  useEffect(() => {
    if (!sesion?.user?.id) return;
    const cargarPerfilInicial = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const data = await Promise.race([
          obtenerPerfil(sesion.user.id),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000))
        ]);
        if (data && data.nombre && data.grupo) {
          setForm({
            nombre: data.nombre || '',
            edad: data.edad?.toString() || '',
            genero: data.genero || '',
            buscaPareja: data.busca_pareja || '',
            etiquetaPerfil: data.etiqueta_perfil || '',
            actividadesElegidas: data.actividades || [],
          });
          if (data.bio) setMiPerfil(prev => ({ ...prev, descripcion: data.bio, esPremium: data.premium || false }));
          else setMiPerfil(prev => ({ ...prev, esPremium: data.premium || false }));
          setGrupo(data.grupo);
          const bienvenida = mensajeBienvenida(data.nombre);
          setEstadoSpark(prev => ({ ...prev, chats: { 'VYNKA': bienvenida } }));
          setEstadoEsencia(prev => ({ ...prev, chats: { 'VYNKA': bienvenida } }));
          setTimeout(() => setPantalla('main'), 200);
        } else {
          setPantalla('inicio');
        }
      } catch (e) {
        console.log('Error cargando perfil:', e);
        setPantalla('inicio');
      }
    };
    cargarPerfilInicial();
  }, [sesion]);

  useEffect(() => {
    registrarNotificaciones();
    const sub = Notifications.addNotificationReceivedListener(() => {});
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (mostrarDenuncia) { setMostrarDenuncia(null); return true; }
      if (mostrarFiltros) { setMostrarFiltros(false); return true; }
      if (historiaViendo) { setHistoriaViendo(null); return true; }
      if (mostrarQuienMeVio) { setMostrarQuienMeVio(false); return true; }
      if (perfilViendo) { setPerfilViendo(null); return true; }
      if (chatAbierto) { setChatAbierto(null); return true; }
      return false;
    };
    const handler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => handler.remove();
  }, [chatAbierto, perfilViendo, mostrarQuienMeVio, historiaViendo, mostrarDenuncia, mostrarFiltros]);

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
    if (notifLike) {
      Animated.sequence([
        Animated.timing(notifLikeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(3000),
        Animated.timing(notifLikeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setNotifLike(null));
    }
  }, [notifLike]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Promise.race([
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
        ]);
        const nuevaUbicacion = { lat: loc.coords.latitude, lng: loc.coords.longitude };
        setMiUbicacion(nuevaUbicacion);
        if (sesion?.user?.id && form.nombre) {
          await guardarPerfil(sesion.user.id, { ...form, grupo, lat: nuevaUbicacion.lat, lng: nuevaUbicacion.lng });
        }
      } catch (e) { console.log('Error ubicación:', e); }
    })();
  }, [pantalla]);

  useEffect(() => {
    if (!sesion?.user?.id) return;
    let canal, canalLikes;
    try {
      canal = suscribirMatches(sesion.user.id, async (nuevoMatch) => {
        try {
          const otroId = nuevoMatch.usuario1 === sesion.user.id ? nuevoMatch.usuario2 : nuevoMatch.usuario1;
          const { data: otroPerfil } = await supabase.from('perfiles').select('*').eq('id', otroId).single();
          if (otroPerfil) {
            const nombreOtro = otroPerfil.nombre || 'alguien';
            setMatchNuevo({ nombre: nombreOtro, emoji: '💫', id: otroId });
            setMatchesIds(prev => [...prev, otroId]);
            await enviarNotifLocal('🎉 ¡Nuevo Match!', `Vos y ${nombreOtro} se gustaron mutuamente`);
            const msgMatch = { id: `match-${Date.now()}`, texto: `🎉 ¡Han hecho MATCH con ${nombreOtro}! Ahora pueden chatear.`, mio: false, esVynka: true, esNotif: true };
            const setter = otroPerfil.grupo === 'spark' ? setEstadoSpark : setEstadoEsencia;
            setter(prev => ({ ...prev, matches: [...(prev.matches || []), otroId], chats: { ...prev.chats, 'VYNKA': [...(prev.chats['VYNKA'] || []), msgMatch], [nombreOtro]: prev.chats[nombreOtro] || [] } }));
          }
        } catch (e) { console.log('Error match:', e); }
      });
      canalMatches.current = canal;
    } catch (e) {}

    try {
      canalLikes = supabase
        .channel(`likes-${sesion.user.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'likes', filter: `para_usuario=eq.${sesion.user.id}` },
          async (payload) => {
            try {
              const { data: quienLike } = await supabase.from('perfiles').select('nombre').eq('id', payload.new.de_usuario).single();
              if (quienLike) {
                setNotifLike({ nombre: quienLike.nombre });
                await enviarNotifLocal('❤️ Nuevo like', `¡${quienLike.nombre} te dio like!`);
                const msgLike = { id: `like-${Date.now()}`, texto: `❤️ ¡${quienLike.nombre} te dio like! Si vos también le das like, ¡será un match!`, mio: false, esVynka: true, esNotif: true };
                setEstadoSpark(prev => ({ ...prev, chats: { ...prev.chats, 'VYNKA': [...(prev.chats['VYNKA'] || []), msgLike] } }));
                setEstadoEsencia(prev => ({ ...prev, chats: { ...prev.chats, 'VYNKA': [...(prev.chats['VYNKA'] || []), msgLike] } }));
              }
            } catch (e) {}
          })
        .subscribe();
    } catch (e) {}

    return () => {
      try { if (canalMatches.current) desuscribir(canalMatches.current); } catch (e) {}
      try { if (canalLikes) supabase.removeChannel(canalLikes); } catch (e) {}
    };
  }, [sesion]);

  useEffect(() => {
    if (pantalla === 'main' && grupo && sesion?.user?.id) {
      cargarPerfiles();
      cargarMiPerfil();
      cargarHistoriasYPublicaciones();
      cargarMatchesReales();
    }
  }, [pantalla, grupo]);

  useEffect(() => {
    if (!chatAbierto || chatAbierto === 'VYNKA') return;
    const perfilDestino = perfilesReales.find(p => p.nombre === chatAbierto);
    if (!perfilDestino?.id) return;
    cargarMensajes(chatAbierto, perfilDestino.id);
    try {
      const canal = suscribirMensajes(sesion.user.id, perfilDestino.id, async (nuevoMsg) => {
        setEstado(prev => ({ ...prev, chats: { ...prev.chats, [chatAbierto]: [...(prev.chats[chatAbierto] || []), { id: nuevoMsg.id, texto: nuevoMsg.texto, mio: nuevoMsg.de_usuario === sesion.user.id }] } }));
        await enviarNotifLocal(`💬 ${chatAbierto}`, nuevoMsg.texto);
      });
      canalMensajes.current = canal;
    } catch (e) {}
    return () => { try { if (canalMensajes.current) desuscribir(canalMensajes.current); } catch (e) {} };
  }, [chatAbierto]);

  const cargarPerfiles = async () => {
    try {
      const data = await obtenerPerfiles(grupo, sesion.user.id);
      if (data && data.length > 0) {
        const mapeados = data.map(p => ({
          ...p,
          foto: p.fotos_perfil?.[0]?.url || null,
          emoji: p.emoji || '👤',
          km: p.lat && miUbicacion ? calcularDistanciaKm(miUbicacion.lat, miUbicacion.lng, p.lat, p.lng) : null,
          premium: p.premium || false,
          incognito: p.incognito || false,
        }));
        setPerfilesReales(mapeados);
      }
    } catch (e) { console.log('Error cargando perfiles:', e); }
  };

  const cargarMiPerfil = async () => {
    try {
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
        setMiPerfil(prev => ({
          ...prev,
          descripcion: data.bio || prev.descripcion,
          esPremium: data.premium || false,
        }));
        if (data.fotos_perfil?.length > 0) {
          setMiPerfil(prev => ({ ...prev, fotos: data.fotos_perfil.map(f => f.url) }));
        }
      }
    } catch (e) { console.log('Error cargando mi perfil:', e); }
  };

  const cargarMatchesReales = async () => {
    try {
      const matches = await obtenerMisMatches(sesion.user.id);
      if (matches && matches.length > 0) {
        const ids = matches.map(m => m.usuario1 === sesion.user.id ? m.usuario2 : m.usuario1);
        setMatchesIds(ids);
        setEstado(prev => ({ ...prev, matches: ids }));
        const chatsNuevos = {};
        for (const match of matches) {
          const otroId = match.usuario1 === sesion.user.id ? match.usuario2 : match.usuario1;
          const otroPerfil = perfilesReales.find(p => p.id === otroId);
          if (otroPerfil) chatsNuevos[otroPerfil.nombre] = chatsNuevos[otroPerfil.nombre] || [];
        }
        setEstado(prev => ({ ...prev, chats: { ...prev.chats, ...chatsNuevos } }));
      }
    } catch (e) {}
  };

  const cargarHistoriasYPublicaciones = async () => {
    try {
      const historiasDB = await obtenerHistorias(grupo);
      if (historiasDB?.length > 0) {
        const ahora = Date.now();
        const validas = historiasDB.filter(h => {
          const creada = new Date(h.created_at).getTime();
          const duracion = h.es_premium ? 24 * 3600000 : 12 * 3600000;
          return ahora - creada < duracion;
        });
        validas.sort((a, b) => (b.es_premium ? 1 : 0) - (a.es_premium ? 1 : 0));
        setHistorias(validas.map(h => ({
          id: h.id, autorId: h.usuario_id, autor: h.autor, emoji: '⭐',
          texto: h.texto, media: h.media_url, tipoMedia: h.tipo_media,
          grupo: h.grupo, likes: h.likes || 0, meGusta: false,
          mia: h.usuario_id === sesion.user.id, esPremium: h.es_premium || false,
        })));
      }
      const publicacionesDB = await obtenerPublicaciones(grupo);
      if (publicacionesDB?.length > 0) {
        const ahora = Date.now();
        const validas = publicacionesDB.filter(p => {
          const creada = new Date(p.created_at).getTime();
          return ahora - creada < 24 * 3600000;
        });
        validas.sort((a, b) => (b.es_premium ? 1 : 0) - (a.es_premium ? 1 : 0));
        setPublicaciones(validas.map(p => ({
          id: p.id, autor: p.autor, autorId: p.usuario_id, emoji: '⭐',
          texto: p.texto, foto: p.foto_url || null, likes: p.likes,
          meGusta: p.likes_publicaciones?.some(l => l.usuario_id === sesion.user.id) || false,
          grupo: p.grupo, tiempo: new Date(p.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
          timestamp: new Date(p.created_at).getTime(),
          mia: p.usuario_id === sesion.user.id, esPremium: p.es_premium || false,
        })));
      }
    } catch (e) { console.log('Error historias/publicaciones:', e); }
  };

  const cargarMensajes = async (nombreChat, destinoId) => {
    try {
      const msgs = await obtenerMensajes(sesion.user.id, destinoId);
      if (msgs?.length > 0) {
        setEstado(prev => ({ ...prev, chats: { ...prev.chats, [nombreChat]: msgs.map(m => ({ id: m.id, texto: m.texto, mio: m.de_usuario === sesion.user.id })) } }));
        await marcarLeidos(destinoId, sesion.user.id);
      }
    } catch (e) {}
  };

  const determinarGrupo = (edad) => parseInt(edad) >= 45 ? 'esencia' : 'spark';
  const puedeRegistrarse = () => parseInt(form.edad) >= 18;
  const formularioCompleto = () => form.nombre && puedeRegistrarse() && form.genero && form.actividadesElegidas.length > 0 && form.buscaPareja && form.etiquetaPerfil;
  const toggleActividad = (act) => {
    if (form.actividadesElegidas.includes(act)) setForm({ ...form, actividadesElegidas: form.actividadesElegidas.filter(a => a !== act) });
    else if (form.actividadesElegidas.length < 3) setForm({ ...form, actividadesElegidas: [...form.actividadesElegidas, act] });
  };
  const cambiarGrupo = () => {
    if (esAdmin) { setGrupo(grupo === 'spark' ? 'esencia' : 'spark'); setChatAbierto(null); setPerfilViendo(null); setTabActivo('radar'); }
    else setMostrarCambioGrupo(true);
  };

  const darLike = async (perfil) => {
    try {
      if ((estado.likes || []).includes(perfil.id)) return;
      setEstado(prev => ({ ...prev, likes: [...(prev.likes || []), perfil.id] }));
      const resultado = await darLikeReal(sesion.user.id, perfil.id);
      if (resultado === 'match') {
        const nombreOtro = perfil.nombre;
        setMatchNuevo({ nombre: nombreOtro, emoji: perfil.emoji || '💫', id: perfil.id });
        setMatchesIds(prev => [...prev, perfil.id]);
        await enviarNotifLocal('🎉 ¡Match!', `¡Vos y ${nombreOtro} hicieron match!`);
        const msgMatch = { id: `match-${Date.now()}`, texto: `🎉 ¡Han hecho MATCH con ${nombreOtro}! Ahora pueden chatear.`, mio: false, esVynka: true, esNotif: true };
        setEstado(prev => ({ ...prev, matches: [...(prev.matches || []), perfil.id], chats: { ...prev.chats, 'VYNKA': [...(prev.chats['VYNKA'] || []), msgMatch], [nombreOtro]: prev.chats[nombreOtro] || [] } }));
      }
    } catch (e) {}
  };

  const darCorazon = (perfilId) => {
    if (misCorazones.includes(perfilId)) return;
    setMisCorazones([...misCorazones, perfilId]);
    setCorazonesPerfiles(prev => ({ ...prev, [perfilId]: (prev[perfilId] || 0) + 1 }));
  };

  const bloquear = (perfil) => {
    const id = perfil.id || perfil;
    setEstado({ ...estado, bloqueados: [...(estado.bloqueados || []), id], matches: (estado.matches || []).filter(m => m !== id), likes: (estado.likes || []).filter(l => l !== id) });
    setChatAbierto(null); setPerfilViendo(null); setConfirmBloqueo(null);
  };

  const verPerfil = (perfil) => {
    if (perfil.incognito) {
      alert(`🔒 ${perfil.nombre || 'Este perfil'} está en modo incógnito.\nSolicitud enviada para ver su perfil.`);
      return;
    }
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
    setEstado(prev => ({ ...prev, chats: { ...prev.chats, [chatAbierto]: [...chatActual, { id: Date.now(), texto, mio: true }] } }));
    if (chatAbierto === 'VYNKA') return;
    try {
      const perfilDestino = perfilesReales.find(p => p.nombre === chatAbierto);
      if (perfilDestino?.id) await enviarMensajeReal(sesion.user.id, perfilDestino.id, texto);
    } catch (e) {}
  };

  const publicarPost = async () => {
    if (!nuevaPublicacion.trim() && !fotoPublicacion) return;
    const yaPublico = publicaciones.filter(p => p.mia);
    const limitePublicaciones = esPremium ? 5 : 1;
    if (yaPublico.length >= limitePublicaciones) {
      alert(esPremium ? "Llegaste al límite de 5 publicaciones por día" : "Solo podés publicar 1 post por día. ¡Obtené premium para publicar más!");
      return;
    }
    try {
      let fotoUrl = null;
      if (fotoPublicacion) fotoUrl = await subirFoto(sesion.user.id, fotoPublicacion, Date.now());
      const data = await publicarPostDB(sesion.user.id, { autor: form.nombre, texto: nuevaPublicacion, grupo, foto_url: fotoUrl, es_premium: esPremium });
      if (data) {
        setPublicaciones(prev => [{ id: data.id, autor: form.nombre, autorId: sesion.user.id, emoji: '⭐', texto: nuevaPublicacion, foto: fotoUrl, likes: 0, meGusta: false, grupo, tiempo: "ahora", timestamp: Date.now(), mia: true, esPremium }, ...prev]);
        setNuevaPublicacion(""); setFotoPublicacion(null);
      } else alert("❌ Error publicando");
    } catch (e) { alert("❌ Error publicando"); }
  };

  const elegirFotoPublicacion = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) { alert("Necesitamos permiso"); return; }
    const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!resultado.canceled) setFotoPublicacion(resultado.assets[0].uri);
  };

  const publicarHistoria = async () => {
    if (!textoHistoria.trim() && !mediaHistoria) { alert("Escribí algo o elegí una foto/video"); return; }
    const misHistorias = historias.filter(h => h.mia);
    const limiteHistorias = esPremium ? 5 : 1;
    if (misHistorias.length >= limiteHistorias) {
      alert(esPremium ? "Llegaste al límite de historias por día" : "Solo podés subir 1 historia por día. ¡Obtené premium para más!");
      return;
    }
    try {
      const data = await publicarHistoriaDB(sesion.user.id, { autor: form.nombre, texto: textoHistoria, media: mediaHistoria, tipoMedia: 'foto', grupo, es_premium: esPremium });
      if (data) {
        setHistorias(prev => [{ id: data.id, autorId: sesion.user.id, autor: form.nombre, emoji: '⭐', texto: textoHistoria, media: mediaHistoria, grupo, likes: 0, meGusta: false, mia: true, esPremium }, ...prev]);
        setTextoHistoria(''); setMediaHistoria(null); setMostrarSubirHistoria(false);
      }
    } catch (e) { alert("❌ Error subiendo historia"); }
  };

  const elegirMediaParaHistoria = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) { alert("Necesitamos permiso"); return; }
    const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [9, 16], quality: 0.8 });
    if (!resultado.canceled) setMediaHistoria(resultado.assets[0].uri);
  };

  const publicarSalida = () => {
    if (!nuevaSalida.titulo || !nuevaSalida.desc || !nuevaSalida.dias) { alert("Completá todos los campos"); return; }
    setSalidas([{ id: Date.now(), tipo: nuevaSalida.tipo, titulo: nuevaSalida.titulo, desc: nuevaSalida.desc, emoji: nuevaSalida.tipo.split(' ')[0], dias: parseInt(nuevaSalida.dias), estrellas: 0, color: VYNKA_BRAND, link: nuevaSalida.link }, ...salidas]);
    setNuevaSalida({ titulo: "", desc: "", tipo: "🎬 Cine", link: "", dias: "" });
    alert("✅ Salida publicada");
  };

  const agregarFotoPerfil = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) { alert("Necesitamos permiso"); return; }
    const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!resultado.canceled && miPerfil.fotos.length < 9) {
      const uri = resultado.assets[0].uri;
      alert("Subiendo foto...");
      try {
        const urlReal = await subirFoto(sesion.user.id, uri, miPerfil.fotos.length);
        if (urlReal) { setMiPerfil(prev => ({ ...prev, fotos: [...prev.fotos, urlReal] })); alert("✅ Foto subida"); }
        else alert("❌ Error subiendo foto");
      } catch (e) { alert("❌ Error subiendo foto"); }
    }
  };

  const enviarCita = (salida, contacto) => {
    const chatActual = estado.chats[contacto] || [];
    const msg = { id: Date.now(), texto: `🎯 Te invito a una cita:\n${salida.emoji} ${salida.titulo}\n📍 ¡Qué te parece?`, mio: true, esCita: true };
    setEstado({ ...estado, chats: { ...estado.chats, [contacto]: [...chatActual, msg] } });
    setMostrarEnviarCita(null);
    setCitasEnviadas(prev => [...prev, salida.id]);
    setTimeout(() => setCitasEnviadas(prev => prev.filter(id => id !== salida.id)), 2000);
  };

  const ocultarChat = (nombre) => {
    if (!esPremium) { setMostrarPremium(true); return; }
    setChatsOcultos(prev => prev.includes(nombre) ? prev.filter(c => c !== nombre) : [...prev, nombre]);
  };

  const misMatchesNombres = perfilesReales.filter(p => (estado.matches || []).includes(p.id)).map(p => p.nombre);
  const todosLosChats = ['VYNKA', ...misMatchesNombres];
  const chatsVisibles = mostrarMensajesOcultos ? todosLosChats : todosLosChats.filter(n => !chatsOcultos.includes(n));

  const perfilesFiltrados = perfilesReales.filter(p => {
    if ((estado.bloqueados || []).includes(p.id)) return false;
    if (tabRadar === 'infinity' || tabRadar === 'elite') return p.premium;
    if (explorarTodos) return true;
    const ok = sonCompatibles(form.genero, form.buscaPareja, p.genero, p.busca_pareja);
    if (!ok) return false;
    const edadMin = parseInt(filtroEdadMin) || 18;
    const edadMax = parseInt(filtroEdadMax) || 99;
    if (p.edad < edadMin || p.edad > edadMax) return false;
    const distMax = parseFloat(filtroDistanciaMax) || 50;
    if (p.km && parseFloat(p.km) > distMax) return false;
    return true;
  });

  const perfilesOrdenados = [...perfilesFiltrados].sort((a, b) => {
    if (a.premium && !b.premium) return -1;
    if (!a.premium && b.premium) return 1;
    return (parseFloat(a.km) || 999) - (parseFloat(b.km) || 999);
  });

  const perfilesPremiumFiltrados = perfilesOrdenados.filter(p => p.premium)
    .sort((a, b) => (parseFloat(a.km) || 999) - (parseFloat(b.km) || 999));

  const historiasGrupo = historias.filter(h => h.grupo === grupo);
  const publicacionesGrupo = publicaciones.filter(p => p.grupo === grupo);
  const publicacionesRecientes = [...publicacionesGrupo].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  const publicacionesMasLikeadas = [...publicacionesGrupo].sort((a, b) => b.likes - a.likes);
  const perfilesTopSpark = [...perfilesReales.filter(p => p.grupo === 'spark')].sort((a, b) => ((b.corazones || 0) + (corazonesPerfiles[b.id] || 0)) - ((a.corazones || 0) + (corazonesPerfiles[a.id] || 0)));

  const contarMensajesNuevos = () => {
    try {
      const chats = estado?.chats || {};
      let count = 0;
      for (const nombre in chats) {
        if (chatsOcultos.includes(nombre) && !mostrarMensajesOcultos) continue;
        const msgs = chats[nombre];
        if (msgs?.length > 0 && !msgs[msgs.length - 1].mio) count++;
      }
      return count;
    } catch { return 0; }
  };
  const mensajesNuevos = mensajesVistos ? 0 : contarMensajesNuevos();
  const visitasNuevas = visitasVistas ? 0 : quienMeVio.length;

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
            <TouchableOpacity key={m} onPress={() => setMotivoElegido(m)} style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 6, width: '100%', borderColor: motivoElegido === m ? '#FF2D55' : tema.border, backgroundColor: motivoElegido === m ? '#FF2D5522' : tema.card }}>
              <Text style={{ color: motivoElegido === m ? '#FF2D55' : tema.texto, fontSize: 14 }}>{m}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={async () => {
            if (!motivoElegido) { alert('Elegí un motivo'); return; }
            await enviarDenuncia(sesion.user.id, mostrarDenuncia?.nombre || 'desconocido', motivoElegido);
            alert('✅ Denuncia enviada.'); setMostrarDenuncia(null);
          }} style={{ borderRadius: 12, overflow: 'hidden', width: '100%', marginTop: 8 }}>
            <LinearGradient colors={['#FF2D55', '#FF6B6B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 12, alignItems: 'center', borderRadius: 12 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Enviar denuncia</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMostrarDenuncia(null)} style={{ marginTop: 10 }}>
            <Text style={{ color: tema.textoSec, fontSize: 14 }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const ModalPremium = () => (
    <Modal visible={mostrarPremium} transparent animationType="slide">
      <View style={st.overlay}>
        <View style={[st.popup, { backgroundColor: tema.fondo, borderColor: premiumColor + '66', overflow: 'hidden' }]}>
          <LinearGradient colors={premiumGradiente} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6 }} />
          <Text style={{ fontSize: 48, marginBottom: 8, marginTop: 8 }}>{grupo === 'spark' ? '💎' : '👑'}</Text>
          <Text style={{ color: premiumColor, fontWeight: 'bold', fontSize: 24, marginBottom: 4, letterSpacing: 2 }}>{premiumLabel.toUpperCase()}</Text>
          <Text style={{ color: tema.textoSec, fontSize: 13, textAlign: 'center', marginBottom: 16 }}>{grupo === 'spark' ? 'El nivel más exclusivo de Spark' : 'La distinción más alta de Esencia'}</Text>
          {[
            { icono: '📍', texto: 'Aparecés primero en el radar' },
            { icono: '👻', texto: 'Modo incógnito: foto borrosa y solicitud para ver tu perfil' },
            { icono: '🔒', texto: 'Ocultar conversaciones que no querés mostrar' },
            { icono: '📸', texto: 'Hasta 5 publicaciones y 5 historias por día' },
            { icono: '⭐', texto: 'Historias de 24hs (normales duran 12hs)' },
            { icono: '🎯', texto: 'Filtro exclusivo: solo ves otros premium' },
            { icono: '👁️', texto: 'Ves quién vio tu perfil en tiempo real' },
          ].map((b, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8, width: '100%' }}>
              <Text style={{ fontSize: 18 }}>{b.icono}</Text>
              <Text style={{ color: tema.texto, fontSize: 13, flex: 1 }}>{b.texto}</Text>
            </View>
          ))}
          <View style={{ backgroundColor: premiumColor + '22', borderRadius: 12, padding: 12, marginVertical: 14, borderWidth: 1, borderColor: premiumColor + '44', width: '100%' }}>
            <Text style={{ color: premiumColor, fontWeight: 'bold', fontSize: 16, textAlign: 'center', marginBottom: 2 }}>🚧 Próximamente</Text>
            <Text style={{ color: tema.textoSec, fontSize: 12, textAlign: 'center' }}>Estamos preparando los planes. ¡Muy pronto!</Text>
          </View>
          <TouchableOpacity onPress={() => setMostrarPremium(false)} style={{ borderRadius: 12, overflow: 'hidden', width: '100%' }}>
            <LinearGradient colors={premiumGradiente} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 14, alignItems: 'center', borderRadius: 12 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Entendido</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // ── SPLASH ──────────────────────────────────────────────────────────────────
  if (!fontsLoaded || pantalla === 'cargando') {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: SPARK.fondo, alignItems: 'center', justifyContent: 'center' }}>
          <StatusBar style="light" />
          <Image source={require('./assets/icon.png')} style={{ width: 120, height: 120, borderRadius: 28, marginBottom: 24 }} />
          <Text style={{ fontWeight: '900', fontSize: 42, letterSpacing: 8, color: VYNKA_BRAND, marginBottom: 12 }}>VYNKA</Text>
          <Text style={{ color: SPARK.textoSec, fontSize: 14, marginBottom: 48 }}>donde los vínculos comienzan</Text>
          <View style={{ width: 200, height: 3, backgroundColor: SPARK.card, borderRadius: 2, overflow: 'hidden' }}>
            <LinearGradient colors={['#7C3AED', '#C026D3', '#F97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: '100%', width: '70%', borderRadius: 2 }} />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (!terminosAceptados) return <Terminos onAceptar={() => setTerminosAceptados(true)} />;

  // ── INICIO ──────────────────────────────────────────────────────────────────
  if (pantalla === 'inicio') {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={[st.container, { backgroundColor: SPARK.fondo }]}>
          <StatusBar style="light" />
          <Image source={require('./assets/icon.png')} style={{ width: 100, height: 100, borderRadius: 24, marginBottom: 20 }} />
          <Text style={{ fontWeight: '900', fontSize: 36, letterSpacing: 6, color: VYNKA_BRAND, marginBottom: 8 }}>VYNKA</Text>
          <Text style={{ color: SPARK.textoSec, fontSize: 14, marginBottom: 48 }}>donde los vínculos comienzan</Text>
          <TouchableOpacity onPress={() => setPantalla('grupos')} style={{ borderRadius: 16, overflow: 'hidden' }}>
            <LinearGradient colors={['#7C3AED', '#C026D3', '#F97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 16, paddingHorizontal: 48, borderRadius: 16 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17, textAlign: 'center' }}>Comenzar ✨</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={onCerrarSesion} style={{ marginTop: 24 }}>
            <Text style={{ color: SPARK.textoSec + '88', fontSize: 12 }}>Cerrar sesión</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // ── GRUPOS ──────────────────────────────────────────────────────────────────
  if (pantalla === 'grupos') {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: SPARK.fondo }}>
          <StatusBar style="light" />
          <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
            <Image source={require('./assets/icon.png')} style={{ width: 80, height: 80, borderRadius: 20, marginBottom: 16 }} />
            <Text style={{ color: SPARK.textoSec, fontSize: 12, letterSpacing: 3, marginBottom: 12 }}>BIENVENIDO/A</Text>
            <Text style={{ color: SPARK.texto, fontSize: 26, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>¿Cuál es tu mundo?</Text>
            <Text style={{ color: SPARK.textoSec, fontSize: 13, marginBottom: 32, textAlign: 'center' }}>Tu grupo se asigna automáticamente por edad</Text>
            <TouchableOpacity style={{ borderRadius: 20, overflow: 'hidden', width: '100%', marginBottom: 16 }} onPress={() => { setGrupo('spark'); setPantalla('registro'); }}>
              <LinearGradient colors={['#1A0030', '#2A1040']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderWidth: 1, borderColor: SPARK.accion + '66', borderRadius: 20, padding: 24 }}>
                <Image source={require('./assets/logo-spark.png')} style={{ width: 60, height: 60, marginBottom: 8, resizeMode: 'contain' }} />
                <Text style={{ color: SPARK.accion, fontSize: 22, fontWeight: 'bold', marginBottom: 4 }}>Spark</Text>
                <Text style={{ color: SPARK.textoSec, fontSize: 13, marginBottom: 8 }}>Menores de 45 años · Energía y aventura</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 14 }}>💎</Text>
                  <Text style={{ color: INFINITY_COLOR, fontSize: 12, fontWeight: 'bold' }}>Infinity para miembros premium</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={{ borderRadius: 20, overflow: 'hidden', width: '100%' }} onPress={() => { setGrupo('esencia'); setPantalla('registro'); }}>
              <LinearGradient colors={['#EDE8DC', '#F5F0E8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderWidth: 1, borderColor: ESENCIA.accion + '66', borderRadius: 20, padding: 24 }}>
                <Image source={require('./assets/logo-esencia.png')} style={{ width: 60, height: 60, marginBottom: 8, resizeMode: 'contain' }} />
                <Text style={{ color: ESENCIA.accion, fontSize: 22, fontWeight: 'bold', marginBottom: 4 }}>Esencia</Text>
                <Text style={{ color: ESENCIA.textoSec, fontSize: 13, marginBottom: 8 }}>45 años o más · Madurez y profundidad</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 14 }}>👑</Text>
                  <Text style={{ color: ELITE_COLOR, fontSize: 12, fontWeight: 'bold' }}>Elite para miembros premium</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // ── REGISTRO ────────────────────────────────────────────────────────────────
  if (pantalla === 'registro') {
    const grupoSugerido = form.edad ? determinarGrupo(form.edad) : grupo;
    const colorReg = grupoSugerido === 'spark' ? SPARK.accion : ESENCIA.accion;
    const fondoReg = grupoSugerido === 'spark' ? SPARK.fondo : ESENCIA.fondo;
    const textoReg = grupoSugerido === 'spark' ? SPARK.texto : ESENCIA.texto;
    const textoSecReg = grupoSugerido === 'spark' ? SPARK.textoSec : ESENCIA.textoSec;
    const cardReg = grupoSugerido === 'spark' ? SPARK.card : ESENCIA.card;
    const borderReg = grupoSugerido === 'spark' ? SPARK.border : ESENCIA.border;
    const gradReg = grupoSugerido === 'spark' ? gradienteSpark : gradienteEsencia;
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: fondoReg }}>
          <StatusBar style={grupoSugerido === 'spark' ? 'light' : 'dark'} />
          <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
            <TouchableOpacity onPress={() => setPantalla('grupos')} style={{ marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <IconArrowLeft size={20} color={colorReg} strokeWidth={1.5} />
              <Text style={{ color: colorReg, fontSize: 16 }}>Volver</Text>
            </TouchableOpacity>
            <Text style={{ color: colorReg, fontSize: 12, letterSpacing: 2, marginBottom: 4 }}>{grupoSugerido === 'spark' ? '⚡ SPARK' : '✨ ESENCIA'}</Text>
            <Text style={{ color: textoReg, fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>Creá tu perfil</Text>
            <Text style={{ color: textoSecReg, fontSize: 13, marginBottom: 8 }}>Tu nombre</Text>
            <TextInput value={form.nombre} onChangeText={t => setForm({ ...form, nombre: t })} placeholder="¿Cómo te llaman?" placeholderTextColor={textoSecReg} style={{ backgroundColor: cardReg, borderWidth: 1, borderColor: borderReg, borderRadius: 12, padding: 12, color: textoReg, fontSize: 14, marginBottom: 16 }} />
            <Text style={{ color: textoSecReg, fontSize: 13, marginBottom: 8 }}>Tu edad</Text>
            <TextInput value={form.edad} onChangeText={t => { setForm({ ...form, edad: t }); if (parseInt(t) >= 18) setGrupo(determinarGrupo(t)); }} placeholder="¿Cuántos años tenés?" placeholderTextColor={textoSecReg} keyboardType="numeric" style={{ backgroundColor: cardReg, borderWidth: 1, borderColor: borderReg, borderRadius: 12, padding: 12, color: textoReg, fontSize: 14, marginBottom: 8 }} />
            {form.edad !== "" && parseInt(form.edad) < 18 && <Text style={{ color: '#FF2D55', fontSize: 12, marginBottom: 8 }}>❌ Debes tener al menos 18 años</Text>}
            {form.edad !== "" && parseInt(form.edad) >= 18 && (
              <View style={{ backgroundColor: colorReg + '22', borderRadius: 10, padding: 10, marginBottom: 16, borderWidth: 1, borderColor: colorReg + '44' }}>
                <Text style={{ color: colorReg, fontSize: 13 }}>✅ Grupo: {grupoSugerido === 'spark' ? '⚡ Spark' : '✨ Esencia'}</Text>
              </View>
            )}
            <Text style={{ color: textoSecReg, fontSize: 13, marginBottom: 12 }}>¿Cómo te identificás?</Text>
            {generos.map(g => (
              <TouchableOpacity key={g.id} onPress={() => setForm({ ...form, genero: g.id })} style={{ borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8, borderColor: form.genero === g.id ? colorReg : borderReg, backgroundColor: form.genero === g.id ? colorReg + '22' : cardReg }}>
                <Text style={{ color: form.genero === g.id ? colorReg : textoReg, fontSize: 15 }}>{g.emoji} {g.label}</Text>
              </TouchableOpacity>
            ))}
            <Text style={{ color: textoSecReg, fontSize: 13, marginBottom: 8 }}>Actividades favoritas <Text style={{ opacity: 0.6 }}>(hasta 3)</Text></Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {actividades.map(act => (
                <TouchableOpacity key={act} onPress={() => toggleActividad(act)} style={{ borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, borderColor: form.actividadesElegidas.includes(act) ? colorReg : borderReg, backgroundColor: form.actividadesElegidas.includes(act) ? colorReg + '22' : cardReg }}>
                  <Text style={{ color: form.actividadesElegidas.includes(act) ? colorReg : textoReg, fontSize: 13 }}>{act}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ color: textoSecReg, fontSize: 13, marginBottom: 8 }}>¿A quién buscás?</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {busquedas.map(op => (
                <TouchableOpacity key={op.id} onPress={() => setForm({ ...form, buscaPareja: op.id })} style={{ flex: 1, borderWidth: 1, borderRadius: 12, padding: 10, alignItems: 'center', borderColor: form.buscaPareja === op.id ? colorReg : borderReg, backgroundColor: form.buscaPareja === op.id ? colorReg + '22' : cardReg }}>
                  <Text style={{ fontSize: 20 }}>{op.emoji}</Text>
                  <Text style={{ color: form.buscaPareja === op.id ? colorReg : textoReg, fontSize: 13 }}>{op.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ color: textoSecReg, fontSize: 13, marginBottom: 8 }}>¿Qué buscás en VYNKA?</Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {etiquetasBusqueda.map(et => (
                <TouchableOpacity key={et} onPress={() => setForm({ ...form, etiquetaPerfil: et })} style={{ borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, borderColor: form.etiquetaPerfil === et ? colorReg : borderReg, backgroundColor: form.etiquetaPerfil === et ? colorReg + '22' : cardReg }}>
                  <Text style={{ color: form.etiquetaPerfil === et ? colorReg : textoReg, fontSize: 13 }}>{et}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={async () => {
              if (formularioCompleto()) {
                try {
                  const bienvenida = mensajeBienvenida(form.nombre);
                  setEstadoSpark(prev => ({ ...prev, chats: { 'VYNKA': bienvenida } }));
                  setEstadoEsencia(prev => ({ ...prev, chats: { 'VYNKA': bienvenida } }));
                  await guardarPerfil(sesion.user.id, { ...form, grupo, ciudad: 'Buenos Aires', lat: miUbicacion?.lat || null, lng: miUbicacion?.lng || null });
                  setPantalla('main');
                } catch (e) { setPantalla('main'); }
              }
            }} style={{ borderRadius: 12, overflow: 'hidden' }}>
              {formularioCompleto() ? (
                <LinearGradient colors={gradReg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 14, alignItems: 'center', borderRadius: 12 }}>
                  <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>Crear mi perfil ✨</Text>
                </LinearGradient>
              ) : (
                <View style={{ paddingVertical: 14, alignItems: 'center', backgroundColor: '#ffffff22', borderRadius: 12 }}>
                  <Text style={{ color: '#ffffff55', fontSize: 15, fontWeight: 'bold' }}>Crear mi perfil ✨</Text>
                </View>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // ── VER PERFIL ──────────────────────────────────────────────────────────────
  if (perfilViendo) {
    const tieneMatch = (estado.matches || []).includes(perfilViendo.id);
    const dioLike = (estado.likes || []).includes(perfilViendo.id);
    const totalCorazones = (perfilViendo.corazones || 0) + (corazonesPerfiles[perfilViendo.id] || 0);
    const temaP = perfilViendo.grupo === 'spark' ? SPARK : ESENCIA;
    const gradP = perfilViendo.grupo === 'spark' ? gradienteSpark : gradienteEsencia;
    const esPremiumP = perfilViendo.premium;
    const premiumColorP = perfilViendo.grupo === 'spark' ? INFINITY_COLOR : ELITE_COLOR;
    const premiumLabelP = perfilViendo.grupo === 'spark' ? 'Infinity' : 'Elite';
    const fotosPerfilViendo = perfilViendo.fotos_perfil?.map(f => f.url) || (perfilViendo.foto ? [perfilViendo.foto] : []);
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: temaP.fondo }}>
          <StatusBar style={perfilViendo.grupo === 'spark' ? 'light' : 'dark'} />
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: temaP.border }}>
            <TouchableOpacity onPress={() => setPerfilViendo(null)} style={{ marginRight: 12 }}>
              <IconArrowLeft size={22} color={temaP.accion} strokeWidth={1.5} />
            </TouchableOpacity>
            <Text style={{ color: temaP.texto, fontWeight: 'bold', fontSize: 18, flex: 1 }}>Perfil</Text>
            <TouchableOpacity onPress={() => setMostrarDenuncia(perfilViendo)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <IconAlertTriangle size={14} color="#FF2D55" strokeWidth={1.5} />
              <Text style={{ color: '#FF2D55', fontSize: 13 }}>Denunciar</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={{ alignItems: 'center', paddingTop: 24, paddingBottom: 16 }}>
              <TouchableOpacity onPress={() => {
  const historiaActiva = historias.find(h => h.autorId === perfilViendo.id);
  if (historiaActiva && perfilViendo.foto) {
    Alert.alert(
      perfilViendo.nombre,
      '¿Qué querés ver?',
      [
        { text: '📸 Foto de perfil', onPress: () => setHistoriaViendo({ media: perfilViendo.foto, autor: perfilViendo.nombre, texto: '', likes: 0, meGusta: false }) },
        { text: '⚡ Historia', onPress: () => setHistoriaViendo(historiaActiva) },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  } else if (perfilViendo.foto) {
    setHistoriaViendo({ media: perfilViendo.foto, autor: perfilViendo.nombre, texto: '', likes: 0, meGusta: false });
  }
}}>
                <View style={{ width: 110, height: 110, borderRadius: 55, padding: 3, shadowColor: esPremiumP ? premiumColorP : temaP.accion, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 10, elevation: 8 }}>
                  <LinearGradient colors={esPremiumP ? (perfilViendo.grupo === 'spark' ? ['#7C3AED', '#FF6BF8'] : ['#8B6914', '#D4B896']) : gradP} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 104, height: 104, borderRadius: 52, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ width: 98, height: 98, borderRadius: 49, backgroundColor: temaP.card, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {perfilViendo.foto ? <Image source={{ uri: perfilViendo.foto }} style={{ width: 98, height: 98 }} /> : <Text style={{ fontSize: 50 }}>{perfilViendo.emoji || '👤'}</Text>}
                    </View>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
              {esPremiumP && (
                <View style={{ borderRadius: 20, overflow: 'hidden', marginTop: 8 }}>
                  <LinearGradient colors={perfilViendo.grupo === 'spark' ? ['#7C3AED', '#FF6BF8'] : ['#8B6914', '#D4B896']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={{ color: '#fff', fontSize: 12 }}>{perfilViendo.grupo === 'spark' ? '💎' : '👑'}</Text>
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{premiumLabelP}</Text>
                  </LinearGradient>
                </View>
              )}
              <Text style={{ color: temaP.texto, fontSize: 24, fontWeight: 'bold', marginTop: 10 }}>{perfilViendo.nombre}, {perfilViendo.edad}</Text>
              <Text style={{ color: temaP.textoSec, fontSize: 14, marginTop: 4 }}>
                📍 {miUbicacion && perfilViendo.lat ? calcularDistanciaKm(miUbicacion.lat, miUbicacion.lng, perfilViendo.lat, perfilViendo.lng) + ' km' : 'Cerca'} · {perfilViendo.ciudad || 'Buenos Aires'}
              </Text>
              {perfilViendo.etiqueta_perfil && (
                <View style={{ backgroundColor: temaP.accion + '22', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginTop: 8, borderWidth: 1, borderColor: temaP.accion + '44' }}>
                  <Text style={{ color: temaP.accion, fontSize: 13, fontWeight: 'bold' }}>{perfilViendo.etiqueta_perfil}</Text>
                </View>
              )}
            </View>

            {perfilViendo.bio ? (
              <View style={{ backgroundColor: temaP.card, borderWidth: 1, borderColor: temaP.border, borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 16 }}>
                <Text style={{ color: temaP.textoSec, fontSize: 11, letterSpacing: 2, marginBottom: 6 }}>DESCRIPCIÓN</Text>
                <Text style={{ color: temaP.texto, fontSize: 14, lineHeight: 20 }}>{perfilViendo.bio}</Text>
              </View>
            ) : null}

            {fotosPerfilViendo.length > 0 && (
              <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
                <Text style={{ color: temaP.textoSec, fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>FOTOS</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 3 }}>
                  {fotosPerfilViendo.slice(0, 9).map((foto, index) => (
                    <TouchableOpacity key={index} onPress={() => setHistoriaViendo({ media: foto, autor: perfilViendo.nombre, texto: '', likes: 0, meGusta: false })}
                      style={{ width: (SCREEN_WIDTH - 32 - 6) / 3, height: (SCREEN_WIDTH - 32 - 6) / 3 }}>
                      <Image source={{ uri: foto }} style={{ width: '100%', height: '100%' }} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
              {perfilViendo.grupo === 'spark' && (
                <TouchableOpacity onPress={() => darCorazon(perfilViendo.id)}
                  style={{ backgroundColor: misCorazones.includes(perfilViendo.id) ? temaP.corazon + '33' : temaP.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: misCorazones.includes(perfilViendo.id) ? temaP.corazon : temaP.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <IconHeart size={20} color={misCorazones.includes(perfilViendo.id) ? temaP.corazon : temaP.textoSec} strokeWidth={1.5} fill="transparent" />
                  <Text style={{ color: misCorazones.includes(perfilViendo.id) ? temaP.corazon : temaP.textoSec, fontWeight: 'bold', fontSize: 16 }}>{totalCorazones} corazones</Text>
                </TouchableOpacity>
              )}
            </View>

            {(perfilViendo.instagram || perfilViendo.tiktok || perfilViendo.twitter) && (
              <View style={{ backgroundColor: temaP.card, borderWidth: 1, borderColor: temaP.border, borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 16 }}>
                <Text style={{ color: temaP.textoSec, fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>REDES</Text>
                {perfilViendo.instagram && <Text style={{ color: temaP.texto, fontSize: 14, marginBottom: 4 }}>📸 {perfilViendo.instagram}</Text>}
                {perfilViendo.tiktok && <Text style={{ color: temaP.texto, fontSize: 14, marginBottom: 4 }}>🎵 {perfilViendo.tiktok}</Text>}
                {perfilViendo.twitter && <Text style={{ color: temaP.texto, fontSize: 14 }}>🐦 {perfilViendo.twitter}</Text>}
              </View>
            )}

            <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
              {tieneMatch ? (
                <TouchableOpacity onPress={() => { setChatAbierto(perfilViendo.nombre); setPerfilViendo(null); }} style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 8 }}>
                  <LinearGradient colors={['#4CAF50', '#2E7D32']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, borderRadius: 12 }}>
                    <IconMessageCircle size={18} color="#fff" strokeWidth={1.5} />
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>Chatear</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <View style={{ backgroundColor: temaP.accion + '11', borderColor: temaP.accion + '33', borderWidth: 1, borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 32, marginBottom: 8 }}>🔒</Text>
                  <Text style={{ color: temaP.texto, fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>Para chatear con {perfilViendo.nombre}</Text>
                  <Text style={{ color: temaP.textoSec, fontSize: 13, marginBottom: 12, textAlign: 'center' }}>Primero hacé match dando like</Text>
                  <TouchableOpacity onPress={() => darLike(perfilViendo)} style={{ borderRadius: 12, overflow: 'hidden' }}>
                    {dioLike ? (
                      <View style={{ paddingVertical: 12, paddingHorizontal: 24, backgroundColor: temaP.card, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <IconHeart size={16} color={temaP.textoSec} strokeWidth={1.5} fill={temaP.textoSec} />
                        <Text style={{ color: temaP.textoSec, fontWeight: 'bold' }}>Like enviado</Text>
                      </View>
                    ) : (
                      <LinearGradient colors={gradP} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <IconHeart size={16} color="#fff" strokeWidth={1.5} />
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Dar like</Text>
                      </LinearGradient>
                    )}
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity onPress={() => setConfirmBloqueo(perfilViendo)} style={{ borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: '#FF2D5511', borderWidth: 1, borderColor: '#FF2D5533', flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
                <IconBan size={16} color="#FF2D55" strokeWidth={1.5} />
                <Text style={{ color: '#FF2D55' }}>Bloquear</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          {mostrarDenuncia && <ModalDenuncia />}
          {confirmBloqueo && (
            <View style={st.overlay}>
              <View style={[st.popup, { backgroundColor: temaP.fondo, borderColor: temaP.border }]}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>🚫</Text>
                <Text style={{ color: temaP.texto, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>¿Bloquear a {confirmBloqueo.nombre}?</Text>
                <Text style={{ color: temaP.textoSec, fontSize: 13, marginBottom: 24, textAlign: 'center' }}>No se podrán ver ni contactar.</Text>
                <TouchableOpacity onPress={() => bloquear(confirmBloqueo)} style={{ borderRadius: 12, overflow: 'hidden', width: '100%', marginBottom: 8 }}>
                  <LinearGradient colors={['#FF2D55', '#FF6B6B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 14, alignItems: 'center', borderRadius: 12 }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Sí, bloquear</Text>
                  </LinearGradient>
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

  // ── CHAT ────────────────────────────────────────────────────────────────────
  if (chatAbierto) {
    const esVynka = chatAbierto === 'VYNKA';
    const perfilChat = perfilesReales.find(p => p.nombre === chatAbierto);
    const mensajesChat = estado.chats?.[chatAbierto] || [];
    const estaOculto = chatsOcultos.includes(chatAbierto);
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: tema.fondo }}>
          <StatusBar style={esEsencia ? 'dark' : 'light'} />
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: tema.border }}>
            <TouchableOpacity onPress={() => setChatAbierto(null)} style={{ marginRight: 12 }}>
              <IconArrowLeft size={22} color={tema.accion} strokeWidth={1.5} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { if (perfilChat) verPerfil(perfilChat); }} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }} disabled={esVynka}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: esVynka ? VYNKA_BRAND + '33' : tema.card, borderWidth: 1, borderColor: esVynka ? VYNKA_BRAND : tema.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {esVynka ? <Image source={require('./assets/icon.png')} style={{ width: 30, height: 30, borderRadius: 6 }} /> : perfilChat?.foto ? <Image source={{ uri: perfilChat.foto }} style={{ width: 36, height: 36 }} /> : <Text style={{ fontSize: 18 }}>{perfilChat?.emoji || '👤'}</Text>}
              </View>
              <View>
                <Text style={{ color: esVynka ? VYNKA_BRAND : tema.texto, fontWeight: 'bold', fontSize: 16 }}>{chatAbierto}</Text>
                {!esVynka && <Text style={{ color: tema.accion, fontSize: 11 }}>Tocá para ver perfil 👁️</Text>}
                {esVynka && <Text style={{ color: VYNKA_BRAND, fontSize: 11 }}>Asistente VYNKA ✓</Text>}
              </View>
            </TouchableOpacity>
            {!esVynka && (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {esPremium && (
                  <TouchableOpacity onPress={() => ocultarChat(chatAbierto)}>
                    {estaOculto ? <IconEye size={20} color={tema.accion} strokeWidth={1.5} /> : <IconEyeOff size={20} color={tema.textoSec} strokeWidth={1.5} />}
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setMostrarDenuncia({ nombre: chatAbierto })}><IconAlertTriangle size={20} color="#FF2D55" strokeWidth={1.5} /></TouchableOpacity>
                <TouchableOpacity onPress={() => setConfirmBloqueo({ nombre: chatAbierto, id: perfilChat?.id })}><IconBan size={20} color="#FF2D55" strokeWidth={1.5} /></TouchableOpacity>
              </View>
            )}
          </View>
          <ScrollView style={{ flex: 1, padding: 16 }}>
            {mensajesChat.map(msg => (
              <TouchableOpacity
                key={msg.id}
                activeOpacity={0.8}
                onLongPress={() => {
                  if (msg.mio && !msg.esVynka) {
                    Alert.alert('Eliminar mensaje', '¿Querés eliminar este mensaje?', [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'Eliminar', style: 'destructive', onPress: () => {
                        setEstado(prev => ({ ...prev, chats: { ...prev.chats, [chatAbierto]: (prev.chats[chatAbierto] || []).filter(m => m.id !== msg.id) } }));
                      }}
                    ]);
                  }
                }}
                style={{ alignItems: msg.mio ? 'flex-end' : 'flex-start', marginBottom: 10 }}
              >
                {msg.esVynka && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Image source={require('./assets/icon.png')} style={{ width: 18, height: 18, borderRadius: 4 }} />
                    <Text style={{ color: VYNKA_BRAND, fontSize: 11, fontWeight: 'bold' }}>VYNKA</Text>
                    {msg.esNotif && <View style={{ backgroundColor: VYNKA_BRAND + '33', borderRadius: 6, paddingHorizontal: 4, paddingVertical: 1 }}><Text style={{ color: VYNKA_BRAND, fontSize: 9 }}>NOTIF</Text></View>}
                  </View>
                )}
                <View style={{ backgroundColor: msg.esNotif ? VYNKA_BRAND + '22' : msg.esVynka ? VYNKA_BRAND + '15' : msg.esCita ? tema.accion + '33' : msg.mio ? tema.accion : tema.card, borderRadius: 16, padding: 12, maxWidth: '85%', borderWidth: msg.esNotif || msg.esVynka || msg.esCita ? 1 : 0, borderColor: msg.esNotif ? VYNKA_BRAND + '88' : msg.esVynka ? VYNKA_BRAND + '44' : msg.esCita ? tema.accion : 'transparent' }}>
                  <Text style={{ color: msg.mio && !msg.esCita && !msg.esVynka ? '#fff' : tema.texto, fontSize: 14 }}>{msg.texto}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {!esVynka && (
            <View style={{ flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: tema.border, gap: 8 }}>
              <TextInput value={textoMensaje} onChangeText={setTextoMensaje} placeholder="Escribí un mensaje..." placeholderTextColor={tema.textoSec} style={{ flex: 1, backgroundColor: tema.card, borderWidth: 1, borderColor: tema.border, borderRadius: 12, padding: 12, color: tema.texto, fontSize: 14 }} />
              <TouchableOpacity onPress={enviarMensaje} style={{ borderRadius: 12, overflow: 'hidden' }}>
                <LinearGradient colors={textoMensaje.trim() ? gradienteActual : [tema.card, tema.card]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                  <IconSend size={18} color={textoMensaje.trim() ? '#fff' : tema.textoSec} strokeWidth={1.5} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
          {mostrarDenuncia && <ModalDenuncia />}
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // ── HISTORIA VIENDO ─────────────────────────────────────────────────────────
  if (historiaViendo) {
    const historiasDisponibles = grupo === 'spark' 
      ? [...historias.filter(h => h.esPremium), ...historias.filter(h => !h.esPremium)]
      : [];
    
    const indiceActual = historiasDisponibles.findIndex(h => h.id === historiaViendo.id);
    const totalHistorias = historiasDisponibles.length;

    const avanzarHistoria = () => {
      progresoHistoria.stopAnimation();
      progresoHistoria.setValue(0);
      if (indiceActual < totalHistorias - 1) {
        setHistoriaViendo(historiasDisponibles[indiceActual + 1]);
      } else {
        setHistoriaViendo(null);
      }
    };

    const iniciarTimer = () => {
      progresoHistoria.setValue(0);
      Animated.timing(progresoHistoria, {
        toValue: 1,
        duration: 15000,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) avanzarHistoria();
      });
    };

    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
          <StatusBar style="light" />

          {/* Barras de progreso */}
          <View style={{ flexDirection: 'row', gap: 4, margin: 16, marginBottom: 8 }}>
            {historiasDisponibles.map((h, index) => (
              <View key={h.id} style={{ flex: 1, height: 3, backgroundColor: '#ffffff33', borderRadius: 2, overflow: 'hidden' }}>
                {index < indiceActual ? (
                  <View style={{ height: '100%', width: '100%', backgroundColor: '#fff', borderRadius: 2 }} />
                ) : index === indiceActual ? (
                  <Animated.View style={{ height: '100%', backgroundColor: '#fff', borderRadius: 2, width: progresoHistoria.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
                ) : null}
              </View>
            ))}
          </View>

          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 }}>
            <TouchableOpacity onPress={() => {
              const perfil = perfilesReales.find(p => p.nombre === historiaViendo.autor);
              if (perfil) { progresoHistoria.stopAnimation(); setHistoriaViendo(null); verPerfil(perfil); }
            }} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#ffffff44' }}>
                {perfilesReales.find(p => p.nombre === historiaViendo.autor)?.foto 
                  ? <Image source={{ uri: perfilesReales.find(p => p.nombre === historiaViendo.autor).foto }} style={{ width: 32, height: 32 }} />
                  : <View style={{ flex: 1, backgroundColor: SPARK.card, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 16 }}>👤</Text></View>
                }
              </View>
              <View>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>{historiaViendo.autor}</Text>
                <Text style={{ color: VYNKA_BRAND, fontSize: 11 }}>Ver perfil →</Text>
              </View>
            </TouchableOpacity>
            {historiaViendo.esPremium && (
              <View style={{ backgroundColor: premiumColor + '33', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, marginRight: 8 }}>
                <Text style={{ color: premiumColor, fontSize: 10, fontWeight: 'bold' }}>💎 Infinity</Text>
              </View>
            )}
            <TouchableOpacity onPress={() => { progresoHistoria.stopAnimation(); setHistoriaViendo(null); }}>
              <IconX size={26} color="#fff" strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

          {/* Contenido — toque izquierdo retrocede, derecho avanza */}
          <View style={{ flex: 1 }}>
            <Animated.View style={{ flex: 1 }} onLayout={() => iniciarTimer()}>
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                {historiaViendo.media 
                  ? <Image source={{ uri: historiaViendo.media }} style={{ width: '100%', height: 420, borderRadius: 16, marginBottom: 16 }} resizeMode="cover" /> 
                  : null
                }
                {historiaViendo.texto 
                  ? <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 16 }}>{historiaViendo.texto}</Text> 
                  : null
                }
              </View>
            </Animated.View>

            {/* Zonas táctiles izquierda/derecha */}
            <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '40%' }}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                progresoHistoria.stopAnimation();
                progresoHistoria.setValue(0);
                if (indiceActual > 0) {
                  setHistoriaViendo(historiasDisponibles[indiceActual - 1]);
                }
              }} />
            </View>
            <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '40%' }}>
              <TouchableOpacity style={{ flex: 1 }} onPress={avanzarHistoria} />
            </View>
          </View>

          {/* Botones abajo */}
          <View style={{ flexDirection: 'row', gap: 12, padding: 16 }}>
            <TouchableOpacity onPress={() => {
              setHistorias(historias.map(x => x.id === historiaViendo.id ? { ...x, meGusta: !x.meGusta, likes: x.meGusta ? x.likes - 1 : x.likes + 1 } : x));
              setHistoriaViendo(prev => ({ ...prev, meGusta: !prev.meGusta, likes: prev.meGusta ? prev.likes - 1 : prev.likes + 1 }));
            }} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ffffff22', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 }}>
              <IconHeart size={18} color={historiaViendo.meGusta ? '#FF6BF8' : '#fff'} strokeWidth={1.5} fill={historiaViendo.meGusta ? '#FF6BF8' : 'transparent'} />
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>{historiaViendo.likes || 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              const perfil = perfilesReales.find(p => p.nombre === historiaViendo.autor);
              if (perfil) darLike(perfil);
              progresoHistoria.stopAnimation();
              setHistoriaViendo(null);
            }} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#7C3AED88', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 }}>
              <IconHeart size={18} color="#fff" strokeWidth={1.5} />
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Dar like al perfil</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }
  // ── QUIEN ME VIO ────────────────────────────────────────────────────────────
  if (mostrarQuienMeVio) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: tema.fondo }}>
          <StatusBar style={esEsencia ? 'dark' : 'light'} />
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: tema.border }}>
            <TouchableOpacity onPress={() => setMostrarQuienMeVio(false)} style={{ marginRight: 12 }}>
              <IconArrowLeft size={22} color={tema.accion} strokeWidth={1.5} />
            </TouchableOpacity>
            <Text style={{ color: tema.texto, fontWeight: 'bold', fontSize: 18 }}>👁️ Quién vio tu perfil</Text>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {quienMeVio.length === 0 ? (
              <View style={{ alignItems: 'center', padding: 40 }}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>👀</Text>
                <Text style={{ color: tema.textoSec }}>Nadie vio tu perfil todavía</Text>
              </View>
            ) : quienMeVio.map(perfil => (
              <TouchableOpacity key={perfil.id} onPress={() => { setMostrarQuienMeVio(false); verPerfil(perfil); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: tema.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: tema.border }}>
                <View style={{ width: 50, height: 50, borderRadius: 25, overflow: 'hidden', backgroundColor: tema.fondo, alignItems: 'center', justifyContent: 'center' }}>
                  {perfil.foto ? <Image source={{ uri: perfil.foto }} style={{ width: 50, height: 50 }} /> : <Text style={{ fontSize: 24 }}>{perfil.emoji || '👤'}</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: tema.texto, fontWeight: 'bold', fontSize: 15 }}>{perfil.nombre}, {perfil.edad}</Text>
                  <Text style={{ color: tema.textoSec, fontSize: 12 }}>📍 {perfil.km} km</Text>
                </View>
                <Text style={{ color: tema.accion, fontSize: 12 }}>Ver →</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // ── MAIN ────────────────────────────────────────────────────────────────────
  if (pantalla === 'main') {

    // ── RENDER RADAR ──────────────────────────────────────────────────────────
    const renderRadar = () => {
      const regionInicial = miUbicacion
        ? { latitude: miUbicacion.lat, longitude: miUbicacion.lng, latitudeDelta: 0.05, longitudeDelta: 0.05 }
        : { latitude: -34.6037, longitude: -58.3816, latitudeDelta: 0.05, longitudeDelta: 0.05 };
      const esPremiumTab = tabRadar === 'infinity' || tabRadar === 'elite';

      return (
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, gap: 8, backgroundColor: tema.fondo, borderBottomWidth: 1, borderBottomColor: tema.border }}>
            {[
              { id: 'todos', label: 'Todos', icono: '🌍', premium: false },
              { id: grupo === 'spark' ? 'infinity' : 'elite', label: premiumLabel, icono: grupo === 'spark' ? '💎' : '👑', premium: true },
            ].map(tab => (
              <TouchableOpacity key={tab.id} onPress={() => setTabRadar(tab.id)} style={{ borderRadius: 20, overflow: 'hidden', flex: 1 }}>
                {tabRadar === tab.id ? (
                  <LinearGradient colors={tab.premium ? premiumGradiente : gradienteActual} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 9, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 4, borderRadius: 20 }}>
                    <Text style={{ fontSize: 14 }}>{tab.icono}</Text>
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>{tab.label}</Text>
                    {tab.premium && <View style={{ backgroundColor: '#ffffff33', borderRadius: 8, paddingHorizontal: 4, paddingVertical: 1 }}><Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>PRO</Text></View>}
                  </LinearGradient>
                ) : (
                  <View style={{ paddingVertical: 9, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 4, borderRadius: 20, borderWidth: 1, borderColor: tab.premium ? premiumColor + '66' : tema.border, backgroundColor: tab.premium ? premiumColor + '11' : tema.card }}>
                    <Text style={{ fontSize: 14 }}>{tab.icono}</Text>
                    <Text style={{ color: tab.premium ? premiumColor : tema.textoSec, fontSize: 13, fontWeight: tab.premium ? 'bold' : 'normal' }}>{tab.label}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
            {!esPremiumTab && (
              <TouchableOpacity onPress={() => setMostrarFiltros(true)} style={{ borderRadius: 20, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: tema.border, backgroundColor: tema.card, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <IconAdjustments size={16} color={tema.textoSec} strokeWidth={1.5} />
              </TouchableOpacity>
            )}
          </View>

          {esPremiumTab ? (
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <Text style={{ color: premiumColor, fontWeight: 'bold', fontSize: 14, marginBottom: 4 }}>
                {grupo === 'spark' ? '💎 Usuarios Infinity' : '👑 Usuarios Elite'} · ordenados por cercanía
              </Text>
              <Text style={{ color: tema.textoSec, fontSize: 12, marginBottom: 16 }}>
                {perfilesPremiumFiltrados.length} usuarios premium cerca
              </Text>
              {perfilesPremiumFiltrados.length === 0 ? (
                <View style={{ alignItems: 'center', padding: 40 }}>
                  <Text style={{ fontSize: 50, marginBottom: 16 }}>{grupo === 'spark' ? '💎' : '👑'}</Text>
                  <Text style={{ color: premiumColor, fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>{premiumLabel}</Text>
                  <Text style={{ color: tema.textoSec, fontSize: 14, textAlign: 'center', marginBottom: 24 }}>Todavía no hay usuarios {premiumLabel} cerca</Text>
                  <TouchableOpacity onPress={() => setMostrarPremium(true)} style={{ borderRadius: 20, overflow: 'hidden' }}>
                    <LinearGradient colors={premiumGradiente} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20 }}>
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>Obtener {premiumLabel}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-start' }}>
                  {perfilesPremiumFiltrados.map(perfil => (
                    <TarjetaPerfilPremium key={perfil.id} perfil={perfil} onPress={verPerfil} esMiMatch={(estado.matches || []).includes(perfil.id)} premiumColor={premiumColor} tema={tema} grupo={grupo} />
                  ))}
                </View>
              )}
            </ScrollView>
          ) : (
            <View style={{ flex: 1, position: 'relative' }}>
              <MapView ref={mapRef} provider={PROVIDER_GOOGLE} style={{ flex: 1 }} initialRegion={regionInicial}
                showsUserLocation={true} showsMyLocationButton={true}
                customMapStyle={esEsencia ? [] : darkMapStyle}>
                {perfilesOrdenados.map(perfil => (
                  perfil.lat && perfil.lng ? (
                    <Marker key={perfil.id} coordinate={{ latitude: perfil.lat, longitude: perfil.lng }}
                      onPress={() => setPerfilSeleccionadoMapa(perfil)} tracksViewChanges={false}>
                      <MarkerPerfil perfil={perfil} esPremium={perfil.premium} esMatch={(estado.matches || []).includes(perfil.id)} grupo={grupo} incognito={perfil.incognito} />
                    </Marker>
                  ) : null
                ))}
              </MapView>

              {perfilSeleccionadoMapa && (
                <View style={{ position: 'absolute', bottom: 20, left: 16, right: 16 }}>
                  <View style={{ backgroundColor: tema.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: perfilSeleccionadoMapa.premium ? premiumColor : tema.border, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 10 }}>
                    <TouchableOpacity onPress={() => setPerfilSeleccionadoMapa(null)} style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
                      <IconX size={18} color={tema.textoSec} strokeWidth={1.5} />
                    </TouchableOpacity>
                    <View style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: perfilSeleccionadoMapa.premium ? premiumColor : tema.accion, overflow: 'hidden' }}>
                      {perfilSeleccionadoMapa.incognito ? (
                        <View style={{ flex: 1, backgroundColor: tema.card, alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 28 }}>👻</Text>
                        </View>
                      ) : perfilSeleccionadoMapa.foto ? (
                        <Image source={{ uri: perfilSeleccionadoMapa.foto }} style={{ width: 64, height: 64 }} />
                      ) : (
                        <View style={{ width: 64, height: 64, backgroundColor: tema.fondo, alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 32 }}>{perfilSeleccionadoMapa.emoji || '👤'}</Text>
                        </View>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: tema.texto, fontWeight: 'bold', fontSize: 16 }}>
                        {perfilSeleccionadoMapa.incognito ? '???' : perfilSeleccionadoMapa.nombre}, {perfilSeleccionadoMapa.edad}
                      </Text>
                      <Text style={{ color: tema.textoSec, fontSize: 12 }}>📍 {perfilSeleccionadoMapa.km} km</Text>
                      {perfilSeleccionadoMapa.premium && <Text style={{ color: premiumColor, fontSize: 11, fontWeight: 'bold' }}>{grupo === 'spark' ? '💎 Infinity' : '👑 Elite'}</Text>}
                    </View>
                    <View style={{ flexDirection: 'column', gap: 8 }}>
                      <TouchableOpacity onPress={() => { setPerfilSeleccionadoMapa(null); verPerfil(perfilSeleccionadoMapa); }} style={{ borderRadius: 12, overflow: 'hidden' }}>
                        <LinearGradient colors={gradienteActual} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 }}>
                          <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Ver</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { darLike(perfilSeleccionadoMapa); setPerfilSeleccionadoMapa(null); }} style={{ borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: tema.accion + '22', borderWidth: 1, borderColor: tema.accion + '44', alignItems: 'center' }}>
                        <IconHeart size={16} color={(estado.likes || []).includes(perfilSeleccionadoMapa.id) ? tema.accion : tema.textoSec} strokeWidth={1.5} fill={(estado.likes || []).includes(perfilSeleccionadoMapa.id) ? tema.accion : 'transparent'} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              <TouchableOpacity onPress={() => setExplorarTodos(!explorarTodos)} style={{ position: 'absolute', top: 12, right: 12, borderRadius: 20, overflow: 'hidden' }}>
                <LinearGradient colors={explorarTodos ? gradienteActual : [tema.card, tema.card]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <IconUsers size={16} color={explorarTodos ? '#fff' : tema.textoSec} strokeWidth={1.5} />
                  <Text style={{ color: explorarTodos ? '#fff' : tema.textoSec, fontSize: 12, fontWeight: 'bold' }}>{explorarTodos ? 'Todos' : 'Mi grupo'}</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: tema.card + 'EE', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: tema.border }}>
                <Text style={{ color: tema.texto, fontSize: 12, fontWeight: 'bold' }}>{perfilesOrdenados.filter(p => p.lat && p.lng).length} cerca</Text>
              </View>
            </View>
          )}

          <Modal visible={mostrarFiltros} transparent animationType="slide">
            <View style={st.overlay}>
              <View style={[st.popup, { backgroundColor: tema.fondo, borderColor: tema.border }]}>
                <Text style={{ color: tema.texto, fontWeight: 'bold', fontSize: 20, marginBottom: 20 }}>🎛️ Filtros</Text>
                <Text style={{ color: tema.textoSec, fontSize: 13, marginBottom: 8 }}>Edad — de {filtroEdadMin} a {filtroEdadMax} años</Text>
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: tema.textoSec, fontSize: 11, marginBottom: 4 }}>Mínima</Text>
                    <TextInput value={filtroEdadMin} onChangeText={setFiltroEdadMin} keyboardType="numeric" style={{ backgroundColor: tema.card, borderWidth: 1, borderColor: tema.border, borderRadius: 10, padding: 10, color: tema.texto, fontSize: 14, textAlign: 'center' }} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: tema.textoSec, fontSize: 11, marginBottom: 4 }}>Máxima</Text>
                    <TextInput value={filtroEdadMax} onChangeText={setFiltroEdadMax} keyboardType="numeric" style={{ backgroundColor: tema.card, borderWidth: 1, borderColor: tema.border, borderRadius: 10, padding: 10, color: tema.texto, fontSize: 14, textAlign: 'center' }} />
                  </View>
                </View>
                <Text style={{ color: tema.textoSec, fontSize: 13, marginBottom: 8 }}>Distancia máxima: {filtroDistanciaMax} km</Text>
                <TextInput value={filtroDistanciaMax} onChangeText={setFiltroDistanciaMax} keyboardType="numeric" placeholder="ej: 10" placeholderTextColor={tema.textoSec} style={{ backgroundColor: tema.card, borderWidth: 1, borderColor: tema.border, borderRadius: 10, padding: 10, color: tema.texto, fontSize: 14, marginBottom: 20 }} />
                <TouchableOpacity onPress={() => setMostrarFiltros(false)} style={{ borderRadius: 12, overflow: 'hidden', width: '100%', marginBottom: 8 }}>
                  <LinearGradient colors={gradienteActual} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 14, alignItems: 'center', borderRadius: 12 }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Aplicar filtros</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setFiltroEdadMin('18'); setFiltroEdadMax('99'); setFiltroDistanciaMax('50'); setMostrarFiltros(false); }}>
                  <Text style={{ color: tema.textoSec, fontSize: 14 }}>Limpiar filtros</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      );
    };

    // ── RENDER MENSAJES ───────────────────────────────────────────────────────
    const renderMensajes = () => (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ color: tema.textoSec, fontSize: 11, letterSpacing: 2 }}>TUS CONVERSACIONES 💬</Text>
          {esPremium && chatsOcultos.length > 0 && (
            <TouchableOpacity onPress={() => setMostrarMensajesOcultos(!mostrarMensajesOcultos)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: premiumColor + '22', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 }}>
              {mostrarMensajesOcultos ? <IconEye size={14} color={premiumColor} strokeWidth={1.5} /> : <IconEyeOff size={14} color={premiumColor} strokeWidth={1.5} />}
              <Text style={{ color: premiumColor, fontSize: 12, fontWeight: 'bold' }}>{mostrarMensajesOcultos ? 'Ocultar' : `Ver ocultos (${chatsOcultos.length})`}</Text>
            </TouchableOpacity>
          )}
        </View>
        {chatsVisibles.map(nombre => {
          const esVynka = nombre === 'VYNKA';
          const perfil = perfilesReales.find(p => p.nombre === nombre);
          const msgs = estado.chats?.[nombre] || [];
          const ultimoMsg = msgs[msgs.length - 1];
          const tieneNoLeido = ultimoMsg && !ultimoMsg.mio;
          const estaOculto = chatsOcultos.includes(nombre);
          return (
            <TouchableOpacity key={nombre} onPress={() => setChatAbierto(nombre)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: estaOculto ? premiumColor + '11' : tema.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: estaOculto ? premiumColor + '44' : esVynka ? VYNKA_BRAND + '44' : tema.border }}>
              <View style={{ position: 'relative' }}>
                <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: esVynka ? VYNKA_BRAND + '22' : tema.fondo, borderWidth: 1, borderColor: esVynka ? VYNKA_BRAND : tema.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {esVynka ? <Image source={require('./assets/icon.png')} style={{ width: 40, height: 40, borderRadius: 8 }} /> : perfil?.foto ? <Image source={{ uri: perfil.foto }} style={{ width: 54, height: 54 }} /> : <Text style={{ fontSize: 26 }}>{perfil?.emoji || '👤'}</Text>}
                </View>
                {tieneNoLeido && <View style={{ position: 'absolute', top: -2, right: -2, backgroundColor: VYNKA_BRAND, borderRadius: 8, width: 14, height: 14 }} />}
                {estaOculto && <View style={{ position: 'absolute', bottom: -2, right: -2, backgroundColor: premiumColor, borderRadius: 8, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 8, color: '#fff' }}>🔒</Text></View>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: esVynka ? VYNKA_BRAND : tema.texto, fontWeight: 'bold', fontSize: 15 }}>{esVynka ? 'VYNKA' : nombre}</Text>
                <Text style={{ color: tieneNoLeido ? tema.texto : tema.textoSec, fontSize: 13, fontWeight: tieneNoLeido ? 'bold' : 'normal' }} numberOfLines={1}>
                  {ultimoMsg ? (ultimoMsg.mio ? 'Vos: ' : '') + ultimoMsg.texto : esVynka ? 'Notificaciones y bienvenida ✨' : '🎉 ¡Match! Empezá a chatear'}
                </Text>
              </View>
              {esVynka && <View style={{ backgroundColor: VYNKA_BRAND, borderRadius: 10, width: 8, height: 8 }} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );

    // ── RENDER TOP/PUBLICACIONES ──────────────────────────────────────────────
    const renderTop = () => (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {grupo === 'spark' && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: tema.textoSec, fontSize: 11, letterSpacing: 2, marginBottom: 12 }}>HISTORIAS ⚡</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity style={{ alignItems: 'center', marginRight: 16 }} onPress={() => setMostrarSubirHistoria(true)}>
                <View style={{ width: 68, height: 68, borderRadius: 34, padding: 2, marginBottom: 6 }}>
                  <LinearGradient colors={gradienteActual} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: tema.card, alignItems: 'center', justifyContent: 'center' }}>
                      <IconPlus size={28} color={tema.accion} strokeWidth={1.5} />
                    </View>
                  </LinearGradient>
                </View>
                <Text style={{ color: tema.accion, fontSize: 11, fontWeight: 'bold' }}>Tu historia</Text>
                {esPremium && <Text style={{ color: premiumColor, fontSize: 9 }}>hasta 5/día</Text>}
              </TouchableOpacity>
              {[...historiasGrupo.filter(h => h.esPremium), ...historiasGrupo.filter(h => !h.esPremium)].map(h => (
                <View key={h.id} style={{ alignItems: 'center', marginRight: 16 }}>
                  <TouchableOpacity onPress={() => setHistoriaViendo(h)}>
                    <View style={{ width: 68, height: 68, borderRadius: 34, padding: 2, marginBottom: 6, shadowColor: h.esPremium ? premiumColor : '#7C3AED', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 6, elevation: 8 }}>
                      <LinearGradient colors={h.esPremium ? premiumGradiente : ['#7C3AED', '#FF6BF8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: tema.card, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {h.media ? <Image source={{ uri: h.media }} style={{ width: 58, height: 58 }} /> : <Text style={{ fontSize: 28 }}>{h.emoji}</Text>}
                        </View>
                      </LinearGradient>
                    </View>
                  </TouchableOpacity>
                  <Text style={{ color: tema.textoSec, fontSize: 11 }} numberOfLines={1}>{h.autor}</Text>
                  {h.esPremium && <Text style={{ color: premiumColor, fontSize: 9, fontWeight: 'bold' }}>💎</Text>}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <IconHeart size={11} color={h.meGusta ? SPARK.corazon : tema.textoSec} strokeWidth={1.5} fill={h.meGusta ? SPARK.corazon : 'transparent'} />
                    <Text style={{ color: h.meGusta ? SPARK.corazon : tema.textoSec, fontSize: 11 }}>{h.likes || 0}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <Modal visible={mostrarSubirHistoria} transparent animationType="slide">
          <View style={st.overlay}>
            <View style={[st.popup, { backgroundColor: tema.fondo, borderColor: tema.border }]}>
              <Text style={{ color: tema.texto, fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>📸 Nueva historia</Text>
              {esPremium && (
                <View style={{ backgroundColor: premiumColor + '22', borderRadius: 10, padding: 8, marginBottom: 12, borderWidth: 1, borderColor: premiumColor + '44' }}>
                  <Text style={{ color: premiumColor, fontSize: 12, textAlign: 'center' }}>{grupo === 'spark' ? '💎' : '👑'} Tu historia durará 24hs y aparecerá primero</Text>
                </View>
              )}
              {!esPremium && <Text style={{ color: tema.textoSec, fontSize: 12, marginBottom: 12, textAlign: 'center' }}>Tu historia durará 12hs · 1 por día</Text>}
              {mediaHistoria && <Image source={{ uri: mediaHistoria }} style={{ width: '100%', height: 160, borderRadius: 12, marginBottom: 10 }} />}
              <TouchableOpacity onPress={elegirMediaParaHistoria} style={{ borderWidth: 1, borderColor: tema.border, borderRadius: 10, padding: 10, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconPhoto size={18} color={tema.textoSec} strokeWidth={1.5} />
                <Text style={{ color: tema.textoSec }}>{mediaHistoria ? 'Cambiar foto' : 'Elegir foto'}</Text>
              </TouchableOpacity>
              <TextInput value={textoHistoria} onChangeText={setTextoHistoria} placeholder="¿Qué querés compartir?" placeholderTextColor={tema.textoSec} multiline
                style={{ backgroundColor: tema.card, borderWidth: 1, borderColor: tema.border, borderRadius: 10, padding: 10, color: tema.texto, fontSize: 14, marginBottom: 16, minHeight: 80 }} />
              <TouchableOpacity onPress={publicarHistoria} style={{ borderRadius: 12, overflow: 'hidden', width: '100%', marginBottom: 8 }}>
                <LinearGradient colors={gradienteActual} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 14, alignItems: 'center', borderRadius: 12 }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Publicar historia</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setMostrarSubirHistoria(false); setTextoHistoria(''); setMediaHistoria(null); }}>
                <Text style={{ color: tema.textoSec, fontSize: 14 }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={{ backgroundColor: tema.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: tema.border, marginBottom: 16 }}>
          <Text style={{ color: tema.textoSec, fontSize: 13, marginBottom: 8 }}>📝 ¿Qué querés compartir?</Text>
          <TextInput value={nuevaPublicacion} onChangeText={setNuevaPublicacion} placeholder="Escribí algo..." placeholderTextColor={tema.textoSec}
            style={{ backgroundColor: tema.fondo, borderWidth: 1, borderColor: tema.border, borderRadius: 12, padding: 12, color: tema.texto, fontSize: 14, marginBottom: 10 }} multiline />
          {fotoPublicacion && (
            <View style={{ position: 'relative', marginBottom: 10 }}>
              <Image source={{ uri: fotoPublicacion }} style={{ width: '100%', height: 160, borderRadius: 12 }} />
              <TouchableOpacity onPress={() => setFotoPublicacion(null)} style={{ position: 'absolute', top: 6, right: 6, backgroundColor: '#FF2D55', borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
                <IconX size={14} color="#fff" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          )}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={elegirFotoPublicacion} style={{ flex: 1, borderWidth: 1, borderColor: tema.border, borderRadius: 10, padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: tema.fondo }}>
              <IconPhoto size={16} color={tema.textoSec} strokeWidth={1.5} />
              <Text style={{ color: tema.textoSec, fontSize: 13 }}>Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={publicarPost} style={{ flex: 2, borderRadius: 10, overflow: 'hidden' }}>
              <LinearGradient colors={gradienteActual} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6, borderRadius: 10 }}>
                <IconPencil size={16} color="#fff" strokeWidth={1.5} />
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Publicar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          {esPremium ? (
            <Text style={{ color: premiumColor, fontSize: 11, marginTop: 6, textAlign: 'center' }}>{grupo === 'spark' ? '💎' : '👑'} Podés publicar hasta 5 por día · duran 24hs</Text>
          ) : (
            <Text style={{ color: tema.textoSec, fontSize: 11, marginTop: 6, textAlign: 'center' }}>1 publicación por día · dura 24hs</Text>
          )}
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {['recientes', 'likeadas'].map(t => (
            <TouchableOpacity key={t} onPress={() => setTabPublicaciones(t)} style={{ flex: 1, borderRadius: 20, overflow: 'hidden' }}>
              {tabPublicaciones === t ? (
                <LinearGradient colors={gradienteActual} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 9, alignItems: 'center', borderRadius: 20 }}>
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>{t === 'recientes' ? '🕐 Recientes' : '🔥 Más likeadas'}</Text>
                </LinearGradient>
              ) : (
                <View style={{ paddingVertical: 9, alignItems: 'center', borderWidth: 1, borderColor: tema.border, borderRadius: 20, backgroundColor: tema.card }}>
                  <Text style={{ color: tema.textoSec, fontSize: 13 }}>{t === 'recientes' ? '🕐 Recientes' : '🔥 Más likeadas'}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {(tabPublicaciones === 'recientes' ? publicacionesRecientes : publicacionesMasLikeadas).map(pub => {
          const perfilAutor = perfilesReales.find(p => p.nombre === pub.autor);
          return (
            <View key={pub.id} style={{ backgroundColor: tema.card, borderWidth: 1, borderColor: pub.esPremium ? premiumColor + '44' : tema.border, borderRadius: 16, padding: 16, marginBottom: 12 }}>
              {pub.esPremium && (
                <View style={{ backgroundColor: premiumColor + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8 }}>
                  <Text style={{ color: premiumColor, fontSize: 11, fontWeight: 'bold' }}>{grupo === 'spark' ? '💎 Infinity' : '👑 Elite'}</Text>
                </View>
              )}
              <TouchableOpacity onPress={() => { if (perfilAutor && !pub.mia) verPerfil(perfilAutor); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }} disabled={pub.mia || !perfilAutor}>
                <View style={{ width: 40, height: 40, borderRadius: 20, overflow: 'hidden', backgroundColor: tema.fondo, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: tema.border }}>
                  {perfilAutor?.foto ? <Image source={{ uri: perfilAutor.foto }} style={{ width: 40, height: 40 }} /> : <Text style={{ fontSize: 20 }}>{pub.emoji}</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: pub.mia ? tema.accion : tema.texto, fontWeight: 'bold' }}>{pub.autor}{!pub.mia && perfilAutor ? <Text style={{ color: tema.accion, fontSize: 11 }}> → ver perfil</Text> : null}</Text>
                  <Text style={{ color: tema.textoSec, fontSize: 11 }}>{pub.tiempo} · ⏰ 24hs</Text>
                </View>
              </TouchableOpacity>
              {pub.texto ? <Text style={{ color: tema.texto, fontSize: 14, marginBottom: pub.foto ? 10 : 12, lineHeight: 20 }}>{pub.texto}</Text> : null}
              {pub.foto && <Image source={{ uri: pub.foto }} style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 12 }} />}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity onPress={() => {
                  setPublicaciones(prev => prev.map(p => p.id === pub.id ? { ...p, meGusta: !p.meGusta, likes: p.meGusta ? p.likes - 1 : p.likes + 1 } : p));
                  if (pub.meGusta) quitarLikePublicacion(sesion.user.id, pub.id).catch(() => {});
                  else darLikePublicacion(sesion.user.id, pub.id).catch(() => {});
                }} style={{ borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderColor: pub.meGusta ? tema.accion : tema.border, backgroundColor: pub.meGusta ? tema.accion + '22' : tema.fondo, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <IconHeart size={14} color={pub.meGusta ? tema.accion : tema.textoSec} strokeWidth={1.5} fill={pub.meGusta ? tema.accion : 'transparent'} />
                  <Text style={{ color: pub.meGusta ? tema.accion : tema.textoSec, fontSize: 13 }}>{pub.likes}</Text>
                </TouchableOpacity>
                {pub.mia && (
                  <TouchableOpacity onPress={async () => { await borrarPublicacion(pub.id); setPublicaciones(publicaciones.filter(p => p.id !== pub.id)); }} style={{ borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderColor: '#FF2D5533', backgroundColor: '#FF2D5511', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <IconTrash size={14} color="#FF2D55" strokeWidth={1.5} />
                    <Text style={{ color: '#FF2D55', fontSize: 13 }}>Borrar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}

        {grupo === 'spark' && perfilesTopSpark.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ color: tema.textoSec, fontSize: 11, letterSpacing: 2, marginBottom: 12 }}>🏆 TOP — MÁS LIKEADOS</Text>
            {perfilesTopSpark.slice(0, 10).map((perfil, index) => {
              const totalCorazones = (perfil.corazones || 0) + (corazonesPerfiles[perfil.id] || 0);
              return (
                <TouchableOpacity key={perfil.id} onPress={() => verPerfil(perfil)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: tema.card, borderWidth: 1, borderColor: index === 0 ? '#FFD70044' : tema.border, borderRadius: 16, padding: 14, marginBottom: 10 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : tema.fondo, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: index < 3 ? '#000' : tema.textoSec, fontWeight: 'bold', fontSize: 14 }}>#{index + 1}</Text>
                  </View>
                  <View style={{ width: 50, height: 50, borderRadius: 25, overflow: 'hidden', backgroundColor: tema.fondo, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: perfil.premium ? INFINITY_COLOR : tema.border }}>
                    {perfil.foto ? <Image source={{ uri: perfil.foto }} style={{ width: 50, height: 50 }} /> : <Text style={{ fontSize: 24 }}>{perfil.emoji || '👤'}</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: tema.texto, fontWeight: 'bold', fontSize: 15 }}>{perfil.nombre}, {perfil.edad}</Text>
                    <Text style={{ color: tema.textoSec, fontSize: 12 }}>📍 {perfil.km} km</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <IconHeart size={18} color={SPARK.corazon} strokeWidth={1.5} fill={SPARK.corazon} />
                    <Text style={{ color: SPARK.corazon, fontWeight: 'bold', fontSize: 14 }}>{totalCorazones}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    );
    // ── RENDER SALIDAS ────────────────────────────────────────────────────────
    const renderSalidas = () => {
      const salidasOrdenadas = tabSalidas === 'ranking' ? [...salidas].sort((a, b) => (b.estrellas + (estrelladas.includes(b.id) ? 1 : 0)) - (a.estrellas + (estrelladas.includes(a.id) ? 1 : 0))) : salidas;
      return (
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', padding: 12, gap: 8 }}>
            {['todas', 'ranking'].map(t => (
              <TouchableOpacity key={t} onPress={() => setTabSalidas(t)} style={{ borderRadius: 20, overflow: 'hidden' }}>
                {tabSalidas === t ? (
                  <LinearGradient colors={t === 'ranking' ? ['#FFD700', '#FFA500'] : gradienteActual} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 }}>
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>{t === 'todas' ? '🎭 Todas' : '🏆 Ranking'}</Text>
                  </LinearGradient>
                ) : (
                  <View style={{ paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderRadius: 20, borderColor: tema.border, backgroundColor: tema.card }}>
                    <Text style={{ color: tema.textoSec, fontSize: 13 }}>{t === 'todas' ? '🎭 Todas' : '🏆 Ranking'}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0 }}>
            {esAdmin && (
              <View style={{ backgroundColor: VYNKA_BRAND + '22', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 2, borderColor: VYNKA_BRAND + '66' }}>
                <Text style={{ color: VYNKA_BRAND, fontWeight: 'bold', fontSize: 15, marginBottom: 12 }}>🔐 Admin — Nueva Salida</Text>
                <TextInput value={nuevaSalida.titulo} onChangeText={t => setNuevaSalida(prev => ({ ...prev, titulo: t }))} placeholder="Título *" placeholderTextColor={tema.textoSec} style={{ backgroundColor: tema.fondo, borderWidth: 1, borderColor: tema.border, borderRadius: 10, padding: 10, color: tema.texto, fontSize: 14, marginBottom: 8 }} />
                <TextInput value={nuevaSalida.desc} onChangeText={t => setNuevaSalida(prev => ({ ...prev, desc: t }))} placeholder="Descripción *" placeholderTextColor={tema.textoSec} multiline style={{ backgroundColor: tema.fondo, borderWidth: 1, borderColor: tema.border, borderRadius: 10, padding: 10, color: tema.texto, fontSize: 14, marginBottom: 8 }} />
                <TextInput value={nuevaSalida.dias} onChangeText={t => setNuevaSalida(prev => ({ ...prev, dias: t }))} placeholder="Días que dura *" placeholderTextColor={tema.textoSec} keyboardType="numeric" style={{ backgroundColor: tema.fondo, borderWidth: 1, borderColor: tema.border, borderRadius: 10, padding: 10, color: tema.texto, fontSize: 14, marginBottom: 8 }} />
                <TouchableOpacity onPress={publicarSalida} style={{ borderRadius: 10, overflow: 'hidden' }}>
                  <LinearGradient colors={[VYNKA_BRAND, '#C026D3']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ padding: 12, alignItems: 'center', borderRadius: 10 }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Publicar evento</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
            {salidasOrdenadas.map((pub) => (
              <View key={pub.id} style={{ backgroundColor: tema.card, borderWidth: 1, borderColor: pub.color + '33', borderRadius: 16, padding: 16, marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                  <View style={{ backgroundColor: pub.color + '22', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ color: pub.color, fontSize: 12 }}>{pub.tipo}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <Text style={{ color: pub.dias <= 3 ? '#FF2D55' : tema.textoSec, fontSize: 11 }}>⏰ {pub.dias} días</Text>
                    {esAdmin && <TouchableOpacity onPress={() => setSalidas(salidas.filter(s => s.id !== pub.id))}><IconTrash size={16} color="#FF2D55" strokeWidth={1.5} /></TouchableOpacity>}
                  </View>
                </View>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>{pub.emoji}</Text>
                <Text style={{ color: tema.texto, fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>{pub.titulo}</Text>
                <Text style={{ color: tema.textoSec, fontSize: 13, marginBottom: 12 }}>{pub.desc}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity onPress={() => setEstrelladas(estrelladas.includes(pub.id) ? estrelladas.filter(e => e !== pub.id) : [...estrelladas, pub.id])} style={{ flex: 1, borderWidth: 1, borderRadius: 20, paddingVertical: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 4, borderColor: estrelladas.includes(pub.id) ? '#FFD700' : tema.border, backgroundColor: estrelladas.includes(pub.id) ? '#FFD70022' : tema.fondo }}>
                    <IconStar size={14} color={estrelladas.includes(pub.id) ? '#FFD700' : tema.textoSec} strokeWidth={1.5} fill={estrelladas.includes(pub.id) ? '#FFD700' : 'transparent'} />
                    <Text style={{ color: estrelladas.includes(pub.id) ? '#FFD700' : tema.textoSec, fontSize: 13 }}>{pub.estrellas + (estrelladas.includes(pub.id) ? 1 : 0)}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { if (misMatchesNombres.length === 0) { alert("Necesitás tener al menos un match"); return; } setMostrarEnviarCita(pub); }} style={{ flex: 2, borderWidth: 1, borderRadius: 20, paddingVertical: 8, alignItems: 'center', borderColor: citasEnviadas.includes(pub.id) ? '#4CAF5044' : tema.accion + '44', backgroundColor: citasEnviadas.includes(pub.id) ? '#4CAF5022' : tema.accion + '22' }}>
                    <Text style={{ color: citasEnviadas.includes(pub.id) ? '#4CAF50' : tema.accion, fontSize: 13, fontWeight: 'bold' }}>{citasEnviadas.includes(pub.id) ? '✅ ¡Enviada!' : '🎯 Enviar como cita'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
          <Modal visible={!!mostrarEnviarCita} transparent animationType="slide">
            <View style={st.overlay}>
              <View style={[st.popup, { backgroundColor: tema.fondo, borderColor: tema.border }]}>
                <Text style={{ color: tema.texto, fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>🎯 Enviar como cita</Text>
                <Text style={{ color: tema.textoSec, fontSize: 13, marginBottom: 16 }}>¿A quién querés invitar?</Text>
                {misMatchesNombres.length === 0 ? (
                  <Text style={{ color: tema.textoSec, textAlign: 'center', marginBottom: 16 }}>No tenés matches todavía</Text>
                ) : (
                  <ScrollView style={{ width: '100%', maxHeight: 200 }}>
                    {misMatchesNombres.map(nombre => {
                      const perfil = perfilesReales.find(p => p.nombre === nombre);
                      return (
                        <TouchableOpacity key={nombre} onPress={() => enviarCita(mostrarEnviarCita, nombre)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: tema.card, borderRadius: 12, marginBottom: 8 }}>
                          <View style={{ width: 40, height: 40, borderRadius: 20, overflow: 'hidden', backgroundColor: tema.fondo, alignItems: 'center', justifyContent: 'center' }}>
                            {perfil?.foto ? <Image source={{ uri: perfil.foto }} style={{ width: 40, height: 40 }} /> : <Text style={{ fontSize: 20 }}>{perfil?.emoji || '👤'}</Text>}
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

    // ── RENDER MI PERFIL ──────────────────────────────────────────────────────
    const renderMiPerfil = () => (
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ alignItems: 'center', paddingTop: 24, paddingBottom: 16 }}>
          <TouchableOpacity onPress={agregarFotoPerfil}>
            <View style={{ width: 110, height: 110, borderRadius: 55, padding: 3 }}>
              <LinearGradient colors={gradienteActual} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 104, height: 104, borderRadius: 52, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: 98, height: 98, borderRadius: 49, backgroundColor: tema.card, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {miPerfil.fotos.length > 0 ? <Image source={{ uri: miPerfil.fotos[0] }} style={{ width: 98, height: 98 }} /> : <IconUser size={40} color={tema.textoSec} strokeWidth={1} />}
                </View>
              </LinearGradient>
            </View>
            <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: tema.accion, borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
              <IconPencil size={14} color="#fff" strokeWidth={1.5} />
            </View>
          </TouchableOpacity>
          <Text style={{ color: tema.texto, fontSize: 22, fontWeight: 'bold', marginTop: 12 }}>{form.nombre}</Text>
          <Text style={{ color: tema.textoSec, fontSize: 14, marginTop: 4 }}>{form.edad} años</Text>
          {form.etiquetaPerfil && (
            <View style={{ backgroundColor: tema.accion + '22', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginTop: 8, borderWidth: 1, borderColor: tema.accion + '44' }}>
              <Text style={{ color: tema.accion, fontSize: 13, fontWeight: 'bold' }}>{form.etiquetaPerfil}</Text>
            </View>
          )}
          {esPremium && (
            <View style={{ borderRadius: 16, overflow: 'hidden', marginTop: 8 }}>
              <LinearGradient colors={premiumGradiente} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingHorizontal: 14, paddingVertical: 5, borderRadius: 16 }}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{grupo === 'spark' ? '💎 Infinity' : '👑 Elite'} · Premium</Text>
              </LinearGradient>
            </View>
          )}
          {esAdmin && <Text style={{ color: VYNKA_BRAND, fontSize: 12, marginTop: 4, fontWeight: 'bold' }}>🔐 Administrador</Text>}
        </View>

        <View style={{ backgroundColor: tema.card, borderWidth: 1, borderColor: tema.border, borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 16 }}>
          <Text style={{ color: tema.textoSec, fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>MI DESCRIPCIÓN</Text>
          <TextInput value={miPerfil.descripcion} onChangeText={t => setMiPerfil(prev => ({ ...prev, descripcion: t }))}
            onBlur={async () => { try { await guardarPerfil(sesion.user.id, { ...form, grupo, bio: miPerfil.descripcion, lat: miUbicacion?.lat || null, lng: miUbicacion?.lng || null }); } catch (e) {} }}
            placeholder="Contá algo sobre vos..." placeholderTextColor={tema.textoSec} multiline maxLength={300} style={{ color: tema.texto, fontSize: 14, lineHeight: 20 }} />
          <Text style={{ color: tema.textoSec, fontSize: 11, textAlign: 'right', marginTop: 4 }}>{miPerfil.descripcion.length}/300</Text>
        </View>

        <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
          <Text style={{ color: tema.textoSec, fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>MIS FOTOS</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 3 }}>
            {miPerfil.fotos.map((foto, index) => (
              <View key={index} style={{ width: (SCREEN_WIDTH - 32 - 6) / 3, height: (SCREEN_WIDTH - 32 - 6) / 3, position: 'relative' }}>
                <Image source={{ uri: foto }} style={{ width: '100%', height: '100%' }} />
                <TouchableOpacity onPress={() => setMiPerfil(prev => ({ ...prev, fotos: prev.fotos.filter((_, i) => i !== index) }))}
                  style={{ position: 'absolute', top: 4, right: 4, backgroundColor: '#FF2D55', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                  <IconX size={12} color="#fff" strokeWidth={2} />
                </TouchableOpacity>
                {index === 0 && (
                  <View style={{ position: 'absolute', bottom: 4, left: 4, backgroundColor: VYNKA_BRAND + 'CC', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ color: '#fff', fontSize: 9 }}>Principal</Text>
                  </View>
                )}
              </View>
            ))}
            {miPerfil.fotos.length < 9 && (
              <TouchableOpacity onPress={agregarFotoPerfil}
                style={{ width: (SCREEN_WIDTH - 32 - 6) / 3, height: (SCREEN_WIDTH - 32 - 6) / 3, backgroundColor: tema.card, borderWidth: 2, borderColor: tema.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' }}>
                <IconPlus size={28} color={tema.textoSec} strokeWidth={1.5} />
                <Text style={{ color: tema.textoSec, fontSize: 10 }}>Foto</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
          {grupo === 'spark' && (() => {
            const misCorazonesTotal = misCorazones.length;
            const perfilesConMio = [...perfilesTopSpark, { id: sesion?.user?.id, corazones: misCorazonesTotal }];
            const ordenados = perfilesConMio.sort((a, b) =>
              ((b.corazones || 0) + (corazonesPerfiles[b.id] || 0)) -
              ((a.corazones || 0) + (corazonesPerfiles[a.id] || 0))
            );
            const posicion = ordenados.findIndex(p => p.id === sesion?.user?.id) + 1;
            const colorTop = posicion === 1 ? '#FFD700' : posicion === 2 ? '#C0C0C0' : posicion === 3 ? '#CD7F32' : SPARK.accion;
            const medallaTop = posicion === 1 ? '🥇' : posicion === 2 ? '🥈' : posicion === 3 ? '🥉' : '🏅';
            return (
              <View style={{ backgroundColor: colorTop + '22', borderRadius: 16, padding: 14, alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: colorTop + '44', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                <Text style={{ fontSize: 24 }}>{medallaTop}</Text>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: colorTop, fontWeight: 'bold', fontSize: 20 }}>#{posicion}</Text>
                  <Text style={{ color: tema.textoSec, fontSize: 11 }}>en corazones</Text>
                </View>
                <IconHeart size={20} color={colorTop} strokeWidth={1.5} fill="transparent" />
              </View>
            );
          })()}
          <View style={{ backgroundColor: tema.corazon + '22', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: tema.corazon + '44' }}>
            <IconHeart size={24} color={tema.corazon} strokeWidth={1.5} fill="transparent" />
            <Text style={{ color: tema.corazon, fontWeight: 'bold', fontSize: 20, marginTop: 4 }}>{misCorazones.length}</Text>
            <Text style={{ color: tema.textoSec, fontSize: 11 }}>Corazones recibidos</Text>
          </View>
        </View>

        <View style={{ backgroundColor: tema.card, borderWidth: 1, borderColor: tema.border, borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 16 }}>
          <Text style={{ color: tema.textoSec, fontSize: 11, letterSpacing: 2, marginBottom: 12 }}>REDES SOCIALES</Text>
          {[{ key: 'instagram', label: '📸 Instagram', placeholder: '@tuusuario' }, { key: 'tiktok', label: '🎵 TikTok', placeholder: '@tuusuario' }, { key: 'twitter', label: '🐦 X (Twitter)', placeholder: '@tuusuario' }].map(red => (
            <View key={red.key} style={{ marginBottom: 10 }}>
              <Text style={{ color: tema.textoSec, fontSize: 12, marginBottom: 4 }}>{red.label}</Text>
              <TextInput value={miPerfil[red.key]} onChangeText={t => setMiPerfil(prev => ({ ...prev, [red.key]: t }))} placeholder={red.placeholder} placeholderTextColor={tema.textoSec} style={{ backgroundColor: tema.fondo, borderWidth: 1, borderColor: tema.border, borderRadius: 10, padding: 10, color: tema.texto, fontSize: 14 }} />
            </View>
          ))}
        </View>

        <View style={{ paddingHorizontal: 16, marginBottom: 16, gap: 10 }}>
          <TouchableOpacity onPress={() => { setMostrarQuienMeVio(true); setVisitasVistas(true); setQuienMeVio([]); }}
            style={{ backgroundColor: tema.accion + '22', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: tema.accion + '44', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <IconEye size={18} color={tema.accion} strokeWidth={1.5} />
            <Text style={{ color: tema.accion, fontSize: 14, fontWeight: 'bold' }}>
              {quienMeVio.length} {quienMeVio.length === 1 ? 'persona vio' : 'personas vieron'} tu perfil
            </Text>
          </TouchableOpacity>

          {esPremium && (
            <View style={{ backgroundColor: premiumColor + '11', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: premiumColor + '33' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 20 }}>👻</Text>
                  <View>
                    <Text style={{ color: premiumColor, fontWeight: 'bold', fontSize: 14 }}>Modo Incógnito</Text>
                    <Text style={{ color: tema.textoSec, fontSize: 11 }}>Foto borrosa · Solicitud para ver perfil</Text>
                  </View>
                </View>
                <Switch value={modoIncognito} onValueChange={setModoIncognito} trackColor={{ false: tema.border, true: premiumColor }} thumbColor={modoIncognito ? '#fff' : tema.textoSec} />
              </View>
            </View>
          )}

          {esPremium && (
            <View style={{ backgroundColor: premiumColor + '11', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: premiumColor + '33' }}>
              <Text style={{ color: premiumColor, fontWeight: 'bold', fontSize: 14, marginBottom: 10 }}>
                🔒 Chats ocultos {chatsOcultos.length > 0 ? `(${chatsOcultos.length})` : ''}
              </Text>
              {chatsOcultos.length === 0 ? (
                <Text style={{ color: tema.textoSec, fontSize: 13 }}>No tenés chats ocultos</Text>
              ) : (
                chatsOcultos.map(nombre => {
                  const perfil = perfilesReales.find(p => p.nombre === nombre);
                  return (
                    <TouchableOpacity key={nombre} onPress={() => setChatAbierto(nombre)}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: tema.card, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: premiumColor + '33' }}>
                      <View style={{ width: 40, height: 40, borderRadius: 20, overflow: 'hidden', backgroundColor: tema.fondo, alignItems: 'center', justifyContent: 'center' }}>
                        {perfil?.foto ? <Image source={{ uri: perfil.foto }} style={{ width: 40, height: 40 }} /> : <Text style={{ fontSize: 20 }}>{perfil?.emoji || '👤'}</Text>}
                      </View>
                      <Text style={{ color: tema.texto, fontWeight: 'bold', flex: 1 }}>{nombre}</Text>
                      <TouchableOpacity onPress={() => ocultarChat(nombre)}>
                        <Text style={{ color: '#FF2D55', fontSize: 12 }}>Mostrar</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          )}

          <TouchableOpacity onPress={() => setMostrarPremium(true)} style={{ borderRadius: 16, overflow: 'hidden' }}>
            <LinearGradient colors={premiumGradiente} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6, borderRadius: 16 }}>
              <Text style={{ fontSize: 16 }}>{grupo === 'spark' ? '💎' : '👑'}</Text>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>{esPremium ? `Renovar ${premiumLabel}` : `Obtener ${premiumLabel}`}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {esAdmin && (
            <TouchableOpacity onPress={async () => {
              try {
                const { data } = await supabase.from('denuncias').select('*').eq('revisada', false).order('created_at', { ascending: false });
                if (!data || data.length === 0) { alert('✅ No hay denuncias pendientes'); return; }
                const lista = data.map(d => `• ${d.denunciado_nombre}: ${d.motivo}`).join('\n');
                alert(`🚨 Denuncias (${data.length}):\n\n${lista}`);
              } catch (e) { alert('Error cargando denuncias'); }
            }} style={{ borderRadius: 16, overflow: 'hidden' }}>
              <LinearGradient colors={[VYNKA_BRAND, '#C026D3']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 14, alignItems: 'center', borderRadius: 16 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>🚨 Ver denuncias</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={onCerrarSesion} style={{ borderRadius: 16, paddingVertical: 14, alignItems: 'center', backgroundColor: '#FF2D5511', borderWidth: 1, borderColor: '#FF2D5533' }}>
            <Text style={{ color: '#FF2D55', fontWeight: 'bold' }}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );

    // ── RENDER PRINCIPAL ──────────────────────────────────────────────────────
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: tema.fondo }}>
          <StatusBar style={esEsencia ? 'dark' : 'light'} />

          {notifVisto && (
            <Animated.View style={{ position: 'absolute', top: 60, left: 16, right: 16, borderRadius: 12, zIndex: 100, overflow: 'hidden', opacity: notifAnim, transform: [{ translateY: notifAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }}>
              <LinearGradient colors={['#7C3AED', '#F97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12 }}>
                <IconEye size={16} color="#fff" strokeWidth={1.5} />
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>{notifVisto.nombre} vio tu perfil 👁️</Text>
              </LinearGradient>
            </Animated.View>
          )}

          {notifLike && (
            <Animated.View style={{ position: 'absolute', top: notifVisto ? 110 : 60, left: 16, right: 16, borderRadius: 12, zIndex: 100, overflow: 'hidden', opacity: notifLikeAnim, transform: [{ translateY: notifLikeAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }}>
              <LinearGradient colors={['#FF6BF8', '#7C3AED']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12 }}>
                <IconHeart size={16} color="#fff" strokeWidth={1.5} fill="#fff" />
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>¡{notifLike.nombre} te dio like! ❤️</Text>
              </LinearGradient>
            </Animated.View>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: tema.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Image source={grupo === 'spark' ? require('./assets/logo-spark.png') : require('./assets/logo-esencia.png')} style={{ width: 32, height: 32, borderRadius: 8 }} />
              <Text style={{ fontWeight: '900', fontSize: 22, letterSpacing: 3, color: VYNKA_BRAND }}>VYNKA</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {esPremium && modoIncognito && (
                <View style={{ backgroundColor: premiumColor + '22', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 12 }}>👻</Text>
                  <Text style={{ color: premiumColor, fontSize: 11, fontWeight: 'bold' }}>Incógnito</Text>
                </View>
              )}
              <TouchableOpacity onPress={cambiarGrupo} style={{ borderRadius: 20, overflow: 'hidden' }}>
                <LinearGradient colors={gradienteActual} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingHorizontal: 14, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20 }}>
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>{grupo === 'spark' ? '⚡ Spark' : '✨ Esencia'}</Text>
                  <IconRefresh size={14} color="#fff" strokeWidth={1.5} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            {tabActivo === 'radar' && renderRadar()}
            {tabActivo === 'mensajes' && renderMensajes()}
            {tabActivo === 'salidas' && renderSalidas()}
            {tabActivo === 'top' && renderTop()}
            {tabActivo === 'perfil' && renderMiPerfil()}
          </View>

          <View style={{ flexDirection: 'row', backgroundColor: esEsencia ? ESENCIA.navbar : SPARK.card, borderTopWidth: 1, borderTopColor: esEsencia ? ESENCIA.bordeOscuro : SPARK.border, paddingHorizontal: 4, paddingBottom: 4 }}>
            {[
              { id: 'radar', icono: 'radar', badge: 0 },
              { id: 'mensajes', icono: 'mensajes', badge: mensajesNuevos },
              { id: 'salidas', icono: 'salidas', badge: 0 },
              { id: 'top', icono: 'historias', badge: 0 },
              { id: 'perfil', icono: 'perfil', badge: visitasNuevas },
            ].map(tab => {
              const activo = tabActivo === tab.id;
              return (
                <TouchableOpacity key={tab.id} onPress={() => { setTabActivo(tab.id); if (tab.id === 'mensajes') setMensajesVistos(true); if (tab.id === 'perfil') setVisitasVistas(true); }}
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderTopWidth: activo ? 2 : 0, borderTopColor: tema.accion, backgroundColor: activo ? tema.accion + '15' : 'transparent' }}>
                  <View style={{ position: 'relative' }}>
                    <IconMenu tipo={tab.icono} color={activo ? tema.accion : tema.textoSec} size={26} />
                    <BadgeNotif count={tab.badge} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <Modal visible={mostrarCambioGrupo} transparent animationType="slide">
            <View style={st.overlay}>
              <View style={[st.popup, { backgroundColor: tema.fondo, borderColor: tema.border }]}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>🔄</Text>
                <Text style={{ color: tema.texto, fontWeight: 'bold', fontSize: 20, marginBottom: 8 }}>Cambiar de grupo</Text>
                <View style={{ backgroundColor: '#FFD70022', borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#FFD70044', width: '100%' }}>
                  <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 16, textAlign: 'center', marginBottom: 4 }}>🚧 Próximamente</Text>
                  <Text style={{ color: tema.textoSec, fontSize: 13, textAlign: 'center' }}>Esta función será paga.</Text>
                </View>
                <TouchableOpacity onPress={() => setMostrarCambioGrupo(false)} style={{ borderRadius: 12, overflow: 'hidden', width: '100%' }}>
                  <LinearGradient colors={[VYNKA_BRAND, '#C026D3']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 14, alignItems: 'center', borderRadius: 12 }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Entendido</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {matchNuevo && (
            <View style={st.overlay}>
              <View style={[st.popup, { backgroundColor: tema.fondo, borderColor: tema.accion }]}>
                <Text style={{ fontSize: 60, marginBottom: 12 }}>🎉</Text>
                <Text style={{ color: tema.accion, fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>¡Han hecho Match!</Text>
                <Text style={{ color: tema.textoSec, marginBottom: 8 }}>Vos y {matchNuevo.nombre} se gustaron mutuamente</Text>
                <Text style={{ color: tema.textoSec, fontSize: 13, marginBottom: 24, textAlign: 'center' }}>Ya podés empezar a chatear</Text>
                <TouchableOpacity onPress={() => { setChatAbierto(matchNuevo.nombre); setMatchNuevo(null); setTabActivo('mensajes'); }} style={{ borderRadius: 12, overflow: 'hidden', width: '100%', marginBottom: 8 }}>
                  <LinearGradient colors={gradienteActual} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, borderRadius: 12 }}>
                    <IconMessageCircle size={18} color="#fff" strokeWidth={1.5} />
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Ir al chat</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setMatchNuevo(null)}>
                  <Text style={{ color: tema.textoSec, fontSize: 14 }}>Seguir explorando</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {mostrarDenuncia && <ModalDenuncia />}
          <ModalPremium />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return null;
}

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0D0118' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#A08CC0' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0D0118' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1A0030' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#2A1040' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2A1040' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#050010' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1A0030' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0D0118' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1A0030' }] },
];

export default function App() {
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session);
      setTimeout(() => setCargando(false), 2000);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSesion(session));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (cargando) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: SPARK.fondo, alignItems: 'center', justifyContent: 'center' }}>
          <StatusBar style="light" />
          <Image source={require('./assets/icon.png')} style={{ width: 120, height: 120, borderRadius: 28, marginBottom: 24 }} />
          <Text style={{ fontWeight: '900', fontSize: 42, letterSpacing: 8, color: VYNKA_BRAND, marginBottom: 12 }}>VYNKA</Text>
          <Text style={{ color: SPARK.textoSec, fontSize: 14, marginBottom: 48 }}>donde los vínculos comienzan</Text>
          <View style={{ width: 200, height: 3, backgroundColor: SPARK.card, borderRadius: 2, overflow: 'hidden' }}>
            <LinearGradient colors={['#7C3AED', '#C026D3', '#F97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: '100%', width: '70%', borderRadius: 2 }} />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  const cerrarSesion = async () => { await supabase.auth.signOut(); setSesion(null); };

  if (!sesion) {
    return <Auth onLogin={() => supabase.auth.getSession().then(({ data: { session } }) => setSesion(session))} />;
  }

  return <MainApp sesion={sesion} onCerrarSesion={cerrarSesion} />;
}

const st = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000000CC', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 200 },
  popup: { borderWidth: 1, borderRadius: 24, padding: 28, alignItems: 'center', width: '100%', maxHeight: '90%' },
});