import { supabase } from './supabase';

// GUARDAR PERFIL
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

// OBTENER PERFIL
export const obtenerPerfil = async (userId) => {
  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
};

// OBTENER TODOS LOS PERFILES
export const obtenerPerfiles = async (grupo, excluirId) => {
  const { data, error } = await supabase
    .from('perfiles')
    .select('*, fotos_perfil(url, orden)')
    .eq('grupo', grupo)
    .neq('id', excluirId);
  if (error) return [];
  return data;
};

// SUBIR FOTO
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
      console.error('Error respuesta storage:', errorText);
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
// ENVIAR MENSAJE
export const enviarMensajeReal = async (deUsuario, aUsuario, texto) => {
  const { data, error } = await supabase
    .from('mensajes')
    .insert({ de_usuario: deUsuario, a_usuario: aUsuario, texto })
    .select()
    .single();
  if (error) { console.error('Error enviando mensaje:', error); return null; }
  return data;
};

// OBTENER MENSAJES ENTRE DOS USUARIOS
export const obtenerMensajes = async (usuario1, usuario2) => {
  const { data, error } = await supabase
    .from('mensajes')
    .select('*')
    .or(`and(de_usuario.eq.${usuario1},a_usuario.eq.${usuario2}),and(de_usuario.eq.${usuario2},a_usuario.eq.${usuario1})`)
    .order('created_at', { ascending: true });
  if (error) return [];
  return data;
};

// SUSCRIBIRSE A MENSAJES EN TIEMPO REAL
export const suscribirMensajes = (usuario1, usuario2, onNuevoMensaje) => {
  const canal = supabase
    .channel(`mensajes-${usuario1}-${usuario2}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'mensajes',
      filter: `a_usuario=eq.${usuario1}`,
    }, payload => onNuevoMensaje(payload.new))
    .subscribe();
  return canal;
};

// DESUSCRIBIRSE
export const desuscribir = (canal) => {
  supabase.removeChannel(canal);
};

// MARCAR MENSAJES COMO LEIDOS
export const marcarLeidos = async (deUsuario, aUsuario) => {
  await supabase
    .from('mensajes')
    .update({ leido: true })
    .eq('de_usuario', deUsuario)
    .eq('a_usuario', aUsuario)
    .eq('leido', false);
};