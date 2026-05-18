import { supabase } from './supabase';

// ── PERFIL ────────────────────────────────────────────────────────────────────

export const guardarPerfil = async (userId, datos) => {
  const { error } = await supabase
    .from('perfiles')
    .upsert({
      id: userId,
      nombre: datos.nombre,
      edad: parseInt(datos.edad),
      genero: datos.genero,
      busca_pareja: datos.buscaPareja,
      grupo: datos.grupo,
      bio: datos.bio || '',
      actividades: datos.actividadesElegidas,
      etiqueta_perfil: datos.etiquetaPerfil,
      ciudad: datos.ciudad || 'Buenos Aires',
      lat: datos.lat || null,
      lng: datos.lng || null,
      updated_at: new Date().toISOString(),
    });
  if (error) console.error('Error guardando perfil:', error);
  return !error;
};

export const obtenerPerfil = async (userId) => {
  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
};

export const obtenerPerfiles = async (grupo, excluirId) => {
  const { data, error } = await supabase
    .from('perfiles')
    .select('*, fotos_perfil(url, orden)')
    .eq('grupo', grupo)
    .neq('id', excluirId);
  if (error) return [];
  return data;
};

// ── FOTOS ─────────────────────────────────────────────────────────────────────

export const subirFoto = async (userId, uri, orden) => {
  try {
    const ext = uri.split('.').pop().toLowerCase().replace('jpg', 'jpeg');
    const path = `${userId}/${Date.now()}.${ext}`;

    const formData = new FormData();
    formData.append('file', {
      uri: uri,
      name: `foto.${ext}`,
      type: `image/${ext}`,
    });

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const projectUrl = 'https://aywccfbopzmqcjldxels.supabase.co';

    const response = await fetch(`${projectUrl}/storage/v1/object/fotos/${path}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-upsert': 'true',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error storage:', errorText);
      return null;
    }

    const urlPublica = `${projectUrl}/storage/v1/object/public/fotos/${path}`;

    const { error: dbError } = await supabase
      .from('fotos_perfil')
      .insert({ usuario_id: userId, url: urlPublica, orden });

    if (dbError) console.error('Error guardando url foto:', dbError);
    return urlPublica;

  } catch (err) {
    console.error('Error subiendo foto:', err);
    return null;
  }
};

// ── LIKES Y MATCHES ───────────────────────────────────────────────────────────

// Dar like a un perfil — devuelve 'match' si es mutuo, 'like' si no
export const darLikeReal = async (deUsuario, aUsuario) => {
  try {
    // 1. Guardar el like
    const { error: likeError } = await supabase
      .from('likes')
      .insert({ de_usuario: deUsuario, para_usuario: aUsuario });

    if (likeError && likeError.code !== '23505') {
      // 23505 = unique violation, ya dio like antes
      console.error('Error dando like:', likeError);
      return 'error';
    }

    // 2. Verificar si la otra persona ya nos dio like (match mutuo)
    const { data: likeRecibido, error: checkError } = await supabase
      .from('likes')
      .select('id')
      .eq('de_usuario', aUsuario)
      .eq('para_usuario', deUsuario)
      .single();

    if (checkError || !likeRecibido) {
      // No hay like mutuo, solo guardamos el like
      return 'like';
    }

    // 3. ¡Hay match! Guardar en la tabla matches
    // Ordenamos los IDs para evitar duplicados (usuario1 siempre el menor)
    const [u1, u2] = [deUsuario, aUsuario].sort();
    const { error: matchError } = await supabase
      .from('matches')
      .insert({ usuario1: u1, usuario2: u2 })
      .select()
      .single();

    if (matchError && matchError.code !== '23505') {
      console.error('Error creando match:', matchError);
    }

    return 'match';

  } catch (err) {
    console.error('Error en darLikeReal:', err);
    return 'error';
  }
};

// Obtener todos los matches del usuario
export const obtenerMisMatches = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .or(`usuario1.eq.${userId},usuario2.eq.${userId}`);

    if (error) throw error;
    return data;
  } catch (e) {
    console.log('Error obteniendo matches:', e);
    return [];
  }
};

// Verificar si dos usuarios tienen match
export const verificarMatch = async (userId1, userId2) => {
  try {
    const [u1, u2] = [userId1, userId2].sort();
    const { data, error } = await supabase
      .from('matches')
      .select('id')
      .eq('usuario1', u1)
      .eq('usuario2', u2)
      .single();
    if (error) return false;
    return !!data;
  } catch {
    return false;
  }
};

// Suscribirse a nuevos matches en tiempo real
export const suscribirMatches = (userId, onNuevoMatch) => {
  const canal = supabase
    .channel(`matches-${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'matches',
      filter: `usuario1=eq.${userId}`,
    }, payload => onNuevoMatch(payload.new))
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'matches',
      filter: `usuario2=eq.${userId}`,
    }, payload => onNuevoMatch(payload.new))
    .subscribe();
  return canal;
};

// ── MENSAJES ──────────────────────────────────────────────────────────────────

export const enviarMensajeReal = async (deUsuario, aUsuario, texto) => {
  const { data, error } = await supabase
    .from('mensajes')
    .insert({ de_usuario: deUsuario, para_usuario: aUsuario, texto })
    .select()
    .single();
  if (error) { console.error('Error enviando mensaje:', error); return null; }
  return data;
};

export const obtenerMensajes = async (usuario1, usuario2) => {
  const { data, error } = await supabase
    .from('mensajes')
    .select('*')
    .or(`and(de_usuario.eq.${usuario1},para_usuario.eq.${usuario2}),and(de_usuario.eq.${usuario2},para_usuario.eq.${usuario1})`)
    .order('created_at', { ascending: true });
  if (error) { console.error('Error obteniendo mensajes:', error); return []; }
  return data;
};

export const suscribirMensajes = (usuario1, usuario2, onNuevoMensaje) => {
  const canal = supabase
    .channel(`mensajes-${usuario1}-${usuario2}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'mensajes',
      filter: `para_usuario=eq.${usuario1}`,
    }, payload => onNuevoMensaje(payload.new))
    .subscribe();
  return canal;
};

export const desuscribir = (canal) => {
  supabase.removeChannel(canal);
};

export const marcarLeidos = async (deUsuario, aUsuario) => {
  await supabase
    .from('mensajes')
    .update({ leido: true })
    .eq('de_usuario', deUsuario)
    .eq('para_usuario', aUsuario)
    .eq('leido', false);
};

// ── DISTANCIA ─────────────────────────────────────────────────────────────────

export const calcularDistanciaKm = (lat1, lng1, lat2, lng2) => {
  if (!lat1 || !lng1 || !lat2 || !lng2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

// ── HISTORIAS ─────────────────────────────────────────────────────────────────

export const publicarHistoriaDB = async (userId, datos) => {
  try {
    let mediaUrl = null;
    if (datos.media) {
      const ext = datos.media.split('.').pop().toLowerCase().replace('jpg', 'jpeg');
      const path = `${userId}/historias/${Date.now()}.${ext}`;
      const formData = new FormData();
      formData.append('file', {
        uri: datos.media,
        name: `historia.${ext}`,
        type: `image/${ext}`,
      });
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `https://aywccfbopzmqcjldxels.supabase.co/storage/v1/object/fotos/${path}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'x-upsert': 'true',
          },
          body: formData,
        }
      );
      if (response.ok) {
        mediaUrl = `https://aywccfbopzmqcjldxels.supabase.co/storage/v1/object/public/fotos/${path}`;
      }
    }

    const { data, error } = await supabase
      .from('historias')
      .insert({
        usuario_id: userId,
        autor: datos.autor,
        texto: datos.texto || null,
        media_url: mediaUrl,
        tipo_media: datos.tipoMedia || null,
        grupo: datos.grupo,
      })
      .select()
      .single();

    if (error) { console.error('Error publicando historia:', error); return null; }
    return data;
  } catch (err) {
    console.error('Error publicando historia:', err);
    return null;
  }
};

export const obtenerHistorias = async (grupo) => {
  const hace24hs = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('historias')
    .select('*')
    .eq('grupo', grupo)
    .gte('created_at', hace24hs)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data;
};

export const borrarHistoria = async (historiaId) => {
  const { error } = await supabase
    .from('historias')
    .delete()
    .eq('id', historiaId);
  return !error;
};

// ── PUBLICACIONES ─────────────────────────────────────────────────────────────

export const publicarPostDB = async (userId, datos) => {
  try {
    const { data, error } = await supabase
      .from('publicaciones')
      .insert({
        usuario_id: userId,
        autor: datos.autor,
        texto: datos.texto,
        grupo: datos.grupo,
      })
      .select()
      .single();
    if (error) { console.error('Error publicando post:', error); return null; }
    return data;
  } catch (err) {
    console.error('Error publicando post:', err);
    return null;
  }
};

export const obtenerPublicaciones = async (grupo) => {
  const { data, error } = await supabase
    .from('publicaciones')
    .select('*, likes_publicaciones(usuario_id)')
    .eq('grupo', grupo)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data;
};

export const darLikePublicacion = async (userId, publicacionId) => {
  const { error } = await supabase
    .from('likes_publicaciones')
    .insert({ usuario_id: userId, publicacion_id: publicacionId });
  if (!error) {
    await supabase.rpc('incrementar_likes', { pub_id: publicacionId });
  }
  return !error;
};

export const quitarLikePublicacion = async (userId, publicacionId) => {
  const { error } = await supabase
    .from('likes_publicaciones')
    .delete()
    .eq('usuario_id', userId)
    .eq('publicacion_id', publicacionId);
  if (!error) {
    await supabase.rpc('decrementar_likes', { pub_id: publicacionId });
  }
  return !error;
};

export const borrarPublicacion = async (publicacionId) => {
  const { error } = await supabase
    .from('publicaciones')
    .delete()
    .eq('id', publicacionId);
  return !error;
};

// ── DENUNCIAS ─────────────────────────────────────────────────────────────────

export const enviarDenuncia = async (denunciante, denunciado, motivo) => {
  try {
    const { error } = await supabase
      .from('denuncias')
      .insert({
        denunciante_id: denunciante,
        denunciado_nombre: denunciado,
        motivo: motivo,
        created_at: new Date().toISOString(),
      });
    if (error) console.error('Error guardando denuncia:', error);
    return !error;
  } catch (e) {
    console.error('Error:', e);
    return false;
  }
};

// ── VERIFICACIÓN ──────────────────────────────────────────────────────────────

export const verificarFotoSegura = async (uri) => {
  try {
    return true;
  } catch (e) {
    console.error('Error verificando foto:', e);
    return true;
  }
};