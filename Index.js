console.log("Hola, estoy programando ENLACE!")
// ============================
// ENLACE - Lógica de registro
// ============================

// Función para determinar el grupo por edad
function determinarGrupo(edad) {    if (edad >= 40) {        return "Grupo maduro (+40)"    } else if (edad >= 18) {        return "Grupo joven (18-40)"    } else {        return "No permitido, debes tener al menos 18 años"   }}
// Función para crear un perfil de usuario
function crearPerfil(nombre, edad, grupoElegido, actividades, buscaPareja) {
    let grupo = determinarGrupo(edad)
    let perfil = {
        nombre: nombre,
        edad: edad,
        grupoAutomatico: grupo,
        grupoDondeQuiereEstar: grupoElegido,
        actividadesFavoritas: actividades,
        buscaPareja: buscaPareja,
        tieneFoto: false,
        descripcion: "",
        gpsActivo: false,
        perfilesDesbloqueados: []
    }

    return perfil
}

// Función para mostrar el perfil armado
function mostrarPerfil(perfil) {
    console.log("============================")
    console.log("   PERFIL CREADO EN ENLACE  ")
    console.log("============================")
    console.log("Nombre: " + perfil.nombre)
    console.log("Edad: " + perfil.edad)
    console.log("Grupo: " + perfil.grupoAutomatico)
    console.log("Quiere estar en: " + perfil.grupoDondeQuiereEstar)
    console.log("Actividades favoritas: " + perfil.actividadesFavoritas.join(", "))
    console.log("Busca: " + perfil.buscaPareja)
    console.log("Foto subida: " + (perfil.tieneFoto ? "Sí" : "Pendiente"))
    console.log("GPS activo: " + (perfil.gpsActivo ? "Sí" : "No"))
    console.log("============================")
}

// ============================
// Creamos usuarios de prueba
// ============================

let usuario1 = crearPerfil(
    "Valentina",
    26,
    "Grupo joven",
    ["Cine", "Merienda", "Pasear en plaza"],
    "Busca hombre"
)

let usuario2 = crearPerfil(
    "Carlos",
    52,
    "Grupo maduro",
    ["Teatro", "Cenar", "Museo"],
    "Busca mujer"
)

let usuario3 = crearPerfil(
    "Camila",
    15,
    "Grupo joven",
    ["Cine", "Bicicleta", "Pasear"],
    "Busca mujer"
)

// Mostramos los perfiles
mostrarPerfil(usuario1)
mostrarPerfil(usuario2)
mostrarPerfil(usuario3)