// ============================
// ENLACE - Sistema de Match
// ============================

// Perfiles de usuarios
let usuario1 = {
    nombre: "Valentina",
    edad: 26,
    busca: "hombre",
    likes: [],
    matches: [],
    chatsDesbloqueados: []
}

let usuario2 = {
    nombre: "Carlos",
    edad: 32,
    busca: "mujer",
    likes: [],
    matches: [],
    chatsDesbloqueados: []
}

let usuario3 = {
    nombre: "Sofia",
    edad: 28,
    busca: "hombre",
    likes: [],
    matches: [],
    chatsDesbloqueados: []
}

// Función para dar like
function darLike(quienLikea, aQuien) {
    quienLikea.likes.push(aQuien.nombre)
    console.log(quienLikea.nombre + " le dio like a " + aQuien.nombre)

    // Verifica si hay match
    if (aQuien.likes.includes(quienLikea.nombre)) {
        console.log("🎉 MATCH! " + quienLikea.nombre + " y " + aQuien.nombre + " se gustaron!")
        quienLikea.matches.push(aQuien.nombre)
        aQuien.matches.push(quienLikea.nombre)
    }
}

// Función para desbloquear chat
function desbloquearChat(quienPaga, aQuien, saldo) {
    let costo = 100

    if (!quienPaga.matches.includes(aQuien.nombre)) {
        console.log("❌ No hay match con " + aQuien.nombre + ", no podés chatear")
        return saldo
    }

    if (quienPaga.chatsDesbloqueados.includes(aQuien.nombre)) {
        console.log("✅ Ya tenés el chat con " + aQuien.nombre + " desbloqueado")
        return saldo
    }

    if (saldo < costo) {
        console.log("❌ Saldo insuficiente. Necesitás $100")
        return saldo
    }

    saldo = saldo - costo
    quienPaga.chatsDesbloqueados.push(aQuien.nombre)
    console.log("💬 Chat con " + aQuien.nombre + " desbloqueado! Saldo restante: $" + saldo)
    return saldo
}

// ============================
// Simulamos la app funcionando
// ============================

console.log("=== SIMULACIÓN DE ENLACE ===")
console.log("")

// Los usuarios se dan likes
darLike(usuario1, usuario2)
darLike(usuario3, usuario2)
darLike(usuario2, usuario1)

console.log("")

// Valentina intenta desbloquear chats
let saldoValentina = 300
console.log("Saldo de Valentina: $" + saldoValentina)
console.log("")

saldoValentina = desbloquearChat(usuario1, usuario2, saldoValentina)
saldoValentina = desbloquearChat(usuario1, usuario3, saldoValentina)