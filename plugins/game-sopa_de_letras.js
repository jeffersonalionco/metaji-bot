//CREADO POR @gata_dios

let fila, columna, sopaNube, sopaPalabra, sopaDir, userSP, cambioLetra, diamante = null
let intentos = 0
let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!userSP) {
        userSP = m.sender.split("@")[0]
        await conn.reply(m.chat, `*@${m.sender.split("@")[0]} registrado no jogo* ✅`, m, { mentions: [m.sender] })
    }

    async function generarSopaDeLetras() {
        const LADO = 16 // Si es alto o bajo, puede dar error, deja como esta
        let sopaDeLetras = new Array(LADO);

        for (let i = 0; i < LADO; i++) {
            sopaDeLetras[i] = new Array(LADO)
        }

        const PALABRAS = [
            "ALGORITMOS",
            "ANDROID",
            "ANIME",
            "ARQUITETO",
            "ARTE",
            "ASTRONOMIA",
            "AVATAR",
            "BIOLOGIA",
            "CARTOGRAFIA",
            "CINEMATICA",
            "CIENCIA",
            "CODIFICAR",
            "CRUCIGRAMA",
            "CRUZADINHA",
            "ECONOMIA",
            "EINSTEIN",
            "ENCICLOPEDIA",
            "ESTUDOS",
            "SUDOKU",
            "TECNOLOGIA",
            "TETRIS",
            "ZELDA",
            "TIKTOK",
            "TURING",
            "UNIVERSO",
            "VIDEOGAMES",
            "VIRUS",
            "WARCRAFT",
            "WHATSAPP",
            "XBOX",
            "YOGA",
            "YOUTUBE",
            "ANATOMIA",
            "ATLETISMO",
            "BACTERIA",
            "BOTANICA",
            "DANCA",
            "DETECCAO",
            "DRAGONBALL",
            "ELETRONICA",
            "ESPACO",
            "EVOLUCAO",
            "FANTASMAS",
            "FICCAO",
            "FOTOGRAFIA",
            "GEOGRAFIA",
            "GITHUB",
            "HISTORIA",
            "INOVACAO",
            "JARDINAGEM",
            "KARATE",
            "LINGUAGEM",
            "LITERATURA",
            "MAGIA",
            "MARVEL",
            "MATRIZES",
            "MUSICA",
            "NATACAO",
            "NEUROLOGIA",
            "NUMEROLOGIA",
            "POLITICA",
            "PIZZA",
            "CIENTISTA",
            "PROGRAMAR",
            "MATEMATICA",
        ]
        const PALABRA = PALABRAS[Math.floor(Math.random() * PALABRAS.length)]

        let filaInicial = Math.floor(Math.random() * LADO)
        let columnaInicial = Math.floor(Math.random() * LADO)
        const DIRECCIONES = ["horizontal", "vertical", "diagonalDerecha", "diagonalIzquierda"]
        const DIRECCION = DIRECCIONES[Math.floor(Math.random() * DIRECCIONES.length)]

        let palabraAgregada = false
        while (!palabraAgregada) {
            filaInicial = Math.floor(Math.random() * LADO)
            columnaInicial = Math.floor(Math.random() * LADO)

            // Algoritmo para garantizar la palabra 
            let palabraEntra = true;
            for (let i = 0; i < PALABRA.length; i++) {
                if (DIRECCION === "horizontal" && (columnaInicial + i >= LADO)) {
                    palabraEntra = false
                    break;
                } else if (DIRECCION === "vertical" && (filaInicial + i >= LADO)) {
                    palabraEntra = false
                    break;
                } else if (DIRECCION === "diagonalDerecha" && (filaInicial + i >= LADO || columnaInicial + i >= LADO)) {
                    palabraEntra = false
                    break;
                } else if (DIRECCION === "diagonalIzquierda" && (filaInicial + i >= LADO || columnaInicial - i < 0)) {
                    palabraEntra = false
                    break;
                }
            }

            // Si la palabra entra, agregar a la sopa de letras
            if (palabraEntra) {
                for (let i = 0; i < PALABRA.length; i++) {
                    if (DIRECCION === "horizontal") {
                        sopaDeLetras[filaInicial][columnaInicial + i] = PALABRA.charAt(i)
                    } else if (DIRECCION === "vertical") {
                        sopaDeLetras[filaInicial + i][columnaInicial] = PALABRA.charAt(i)
                    } else if (DIRECCION === "diagonalDerecha") {
                        sopaDeLetras[filaInicial + i][columnaInicial + i] = PALABRA.charAt(i)
                    } else {
                        sopaDeLetras[filaInicial + i][columnaInicial - i] = PALABRA.charAt(i)
                    }
                }
                palabraAgregada = true;
            }
        }

        // Diseño 
        const LETRAS_POSIBLES = "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓜⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ"
        const numerosUni = ["⓿", "❶", "❷", "❸", "❹", "❺", "❻", "❼", "❽", "❾", "❿", "⓫", "⓬", "⓭", "⓮", "⓯", "⓰", "⓱", "⓲", "⓳", "⓴"]
        let sopaDeLetrasConBordes = ""
        sopaDeLetrasConBordes += "     " + [...Array(LADO).keys()].map(num => numerosUni[num]).join(" ") + "\n"
        //sopaDeLetrasConBordes += "   *╭" + "┄".repeat(LADO) + '┄┄' + "╮*\n"

        for (let i = 0; i < LADO; i++) {
            let fila = numerosUni[i] + " "

            for (let j = 0; j < LADO; j++) {
                if (sopaDeLetras[i][j]) {
                    fila += sopaDeLetras[i][j] + " "
                } else {
                    let letraAleatoria = LETRAS_POSIBLES.charAt(Math.floor(Math.random() * LETRAS_POSIBLES.length))
                    fila += letraAleatoria + " "
                }
            }
            fila += ""
            sopaDeLetrasConBordes += fila + "\n"
        }
        //sopaDeLetrasConBordes += "   *╰" + "┄".repeat(LADO) + '┄┄' + "╯*"
        sopaDeLetrasConBordes = sopaDeLetrasConBordes.replace(/[a-zA-Z]/g, letra => LETRAS_POSIBLES[letra.charCodeAt() - 65] || letra)

        await m.reply(`🔠 *SOPA DE LETRAS* 🔠
*PALAVRA:* \`\`\`"${PALABRA}"\`\`\`
*Você tem 3 minutos para encontrar a resposta correta!!*

*Digite o número da linha e coluna onde começa a primeira letra*
da palavra. Você tem _${intentos}_ tentativas!!*

*EXEMPLO:*
❇️ \`\`\`${usedPrefix + command} 28\`\`\`
➡️ \`\`\`LINHA 2\`\`\`    ⬇️ \`\`\`COLUNA 8\`\`\``.trim())
        await m.reply(`🔠 *${PALABRA.split("").join(" ")}* 🔠\n\n` + sopaDeLetrasConBordes.trimEnd())
        fila = filaInicial
        columna = columnaInicial
        sopaNube = sopaDeLetrasConBordes
        sopaPalabra = PALABRA
        sopaDir = DIRECCION.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^./, str => str.toUpperCase())
    }

    // Condiciones del juego
    cambioLetra = sopaDir
    let tagUser = userSP + '@s.whatsapp.net'
    if (userSP != m.sender.split("@")[0]) {
        await conn.reply(m.chat, `*@${tagUser.split("@")[0]} está jogando Sopa de Letras no momento.*`, m, { mentions: [tagUser] })
        return
    }
    if (intentos === 0) {
        intentos = 3
        generarSopaDeLetras()
        resetUserSP(sopaDir)

        async function resetUserSP() {
            await new Promise((resolve) => setTimeout(resolve, 2 * 60 * 1000)) // 2 min
            if (intentos !== 0) {
                await conn.reply(m.chat, `*@${m.sender.split("@")[0]} você só tem 1 minuto!* 😨`, m, { mentions: [m.sender] })
            }
            await new Promise((resolve) => setTimeout(resolve, 3 * 60 * 1000)) // 3 min
            if (intentos !== 0) {
                await conn.reply(m.chat, `*@${m.sender.split("@")[0]} o tempo acabou!!* 😧\n\n*A palavra* _"${sopaPalabra}"_ *estava na direção* _${sopaDir}_, *na linha* _${fila}_ *e coluna* _${columna}_*`, m, { mentions: [m.sender] })
                fila = null, columna = null, sopaNube = null, sopaPalabra = null, sopaDir = null, userSP = null, cambioLetra = null
                intentos = 0
            }
        }
    } else {
        if (`${fila}${columna}` == text) {
            if (sopaPalabra.length <= 4) {
                diamante = 4
            } else if (sopaPalabra.length <= 8) {
                diamante = 8
            } else if (sopaPalabra.length <= 11) {
                diamante = 24
            } else {
                diamante = 32
            }
            global.db.data.users[m.sender].limit += diamante

            await m.reply(`\`\`\`🎊 Você ganhou ${diamante} ${rpgshop.emoticon('limit')}!!\`\`\`\n\n*Correto!! A palavra* _"${sopaPalabra}"_ *estava na direção* _${cambioLetra}_, *na linha* _${fila}_ *e coluna* _${columna}_*`)
            fila = null, columna = null, sopaNube = null, sopaPalabra = null, sopaDir = null, userSP = null, cambioLetra = null
            intentos = 0
            return
        } else {
            if (intentos === 1) {
                await m.reply(`🫡 *Você esgotou as tentativas!! A palavra* _"${sopaPalabra}"_ *estava na direção* _${cambioLetra}_, *na linha* _${fila}_ *e coluna* _${columna}_*`)
                fila = null, columna = null, sopaNube = null, sopaPalabra = null, sopaDir = null, userSP = null, cambioLetra = null
                intentos = 0
                return
            } else {
                intentos -= 1
                await m.reply(`😮‍💨 *Incorreto. Você ainda tem* _${intentos}_ *tentativas!!*${intentos === 1 ? '' : `\n*Palavra a encontrar:* \`\`\`${sopaPalabra}\`\`\``}\n\n${intentos === 1 ? `\`\`\`💡 Dica!!\`\`\`\n*A palavra* _${sopaPalabra}_ *está na direção* _"${cambioLetra}"_*\n\n` : ''}${sopaNube}`)
                return
            }
        }
    }
}

handler.command = /^(buscarpalabra|sopa|soup|wordsearch|wordfind|spdeletras|spletras|sppalabras|spalabras|spdepalabras)$/i
export default handler
