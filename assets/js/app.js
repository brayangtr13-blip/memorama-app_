var images = [
    "assets/images/Ney1.png",
    "assets/images/Ney2.png",
    "assets/images/Ney3.png",
    "assets/images/Ney4.png",
    "assets/images/Ney5.png",
    "assets/images/Ney6.png",
    "assets/images/Ney7.png",
    "assets/images/Ney8.png",
    "assets/images/Ney9.png",
    "assets/images/Ney10.png"
];

var paresPorNivel = {
    octavos: 4,
    cuartos: 6,
    semifinal: 8,
    final: 10
};

var nivelActual = "octavos";
var juegoIniciado = false;

var firstCard = null;
var secondCard = null;
var canFlip = true;
var matches = 0;
var moves = 0;
var seconds = 0;
var timerRunning = false;
var timerInterval;
var paused = false;

function nuevoJuego() {
    var tablerodejuego = document.getElementById("tablerodejuego");
    tablerodejuego.innerHTML = "";

    var totalPares = paresPorNivel[nivelActual];

    var imagenesMezcladas = images.slice();
    imagenesMezcladas.sort(function () {
        return Math.random() - 0.5;
    });
    var elegidas = imagenesMezcladas.slice(0, totalPares);

    var cardImages = elegidas.concat(elegidas);

    cardImages.sort(function () {
        return Math.random() - 0.5;
    });

    if (totalPares === 10) {
        tablerodejuego.style.gridTemplateColumns = "repeat(5, 1fr)";
    } else {
        tablerodejuego.style.gridTemplateColumns = "repeat(4, 1fr)";
    }

    for (var i = 0; i < cardImages.length; i++) {
        var card = document.createElement("div");
        card.className = "card";
        card.innerHTML =  `
         <div class="card-front"><i class="fas fa-futbol"></i></div>
         <div class="card-back"><img src="${cardImages[i]}" alt=""></div>
        `;
        card.onclick = flipCard;
        card.dataset.image = cardImages[i];
        tablerodejuego.appendChild(card);
    }

    firstCard = null;
    secondCard = null;
    canFlip = true;
    matches = 0;
    moves  = 0;
    seconds = 0;
    timerRunning = false;
    paused = false;

    document.getElementById("btnPausa").innerHTML = '<i class="fas fa-pause"></i> PAUSAR';
    updateStats();
    clearInterval(timerInterval);
    document.getElementById("winModal").classList.remove("show");
}

function empezarNivel(evento) {
    evento.preventDefault();
    nivelActual = document.getElementById("nivelSelect").value;
    juegoIniciado = true;
    document.getElementById("mensajeInicio").style.display = "none";
    nuevoJuego();
}

function reiniciar() {
    if (!juegoIniciado) return;
    nuevoJuego();
}

    function flipCard() {
    if (paused) return;
    if (!canFlip) return;
    if (this.classList.contains("flipped")) return;
    if (this.classList.contains("matched")) return;

    if (!timerRunning) {
        startTimer();
    }

    this.classList.add("flipped");
    if (firstCard == null) {
        firstCard = this;
    } else {
        secondCard = this;
        canFlip = false;
        moves++;
        updateStats();
        checkMatch();
    }
}

function checkMatch() {
    var match = firstCard.dataset.image === secondCard.dataset.image;

    if (match) {
        setTimeout(() => {
            firstCard.classList.add("matched");
            secondCard.classList.add("matched");
            matches++;
            updateStats();
            resetCards();

            if (matches === paresPorNivel[nivelActual]) {
                endGame();
            }
        }, 500);
    } else {
        setTimeout(() => {
            firstCard.classList.remove("flipped");
            secondCard.classList.remove("flipped");
            resetCards();
        }, 1000);
    }
}

function resetCards () {
     firstCard = null;
     secondCard = null;
     canFlip = true;
}

function startTimer() {
    timerRunning = true;

    timerInterval = setInterval(() => {
        seconds++;
        updateStats();
    }, 1000);
}

function updateStats() {

    document.getElementById("movimientos").innerText = moves;
    document.getElementById("parejas").innerText = matches + "/" + paresPorNivel[nivelActual];


    var mins = Math.floor(seconds / 60);
    var secs = seconds % 60;


    if (mins < 10) mins = "0" + mins;
    if (secs < 10) secs = "0" + secs;


    document.getElementById('tiempo').textContent = mins + ':' + secs;
}


function calcularPuntos() {
    var puntos = 2000 - (seconds * 2) - (moves * 10);
    if (puntos < 100) {
        puntos = 100;
    }
    return puntos;
}

function endGame() {
    clearInterval(timerInterval);
    document.getElementById("finalMovimientos").innerText = moves;

    document.getElementById("finalTiempo").innerText = document.getElementById("tiempo").textContent;
    document.getElementById("finalPuntos").innerText = calcularPuntos();
    document.getElementById("winModal").classList.add("show");
}
function pausarJuego() {
    // solo se puede pausar si el juego ya empezo
    if (!timerRunning) return;

    var boton = document.getElementById("btnPausa");

    if (!paused) {
        // pausar: se detiene el reloj y se bloquean las cartas
        paused = true;
        clearInterval(timerInterval);
        boton.innerHTML = '<i class="fas fa-play"></i> REANUDAR';
    } else {
        // reanudar: el reloj sigue donde iba
        paused = false;
        timerInterval = setInterval(function () {
            seconds++;
            updateStats();
        }, 1000);
        boton.innerHTML = '<i class="fas fa-pause"></i> PAUSAR';
    } 
}

function guardarPuntaje(evento) {
    evento.preventDefault();

    var nombre = document.getElementById("nombreJugador").value.trim();
    if (nombre === "") return;

    var registro = {
        nombre: nombre,
        movimientos: moves,
        tiempo: document.getElementById("tiempo").textContent,
        puntos: calcularPuntos()
    };

    var lista = JSON.parse(localStorage.getItem("top10")) || [];

    lista.push(registro);
    lista.sort(function (a, b) {
        return b.puntos - a.puntos;
    });
    lista = lista.slice(0, 10);

    localStorage.setItem("top10", JSON.stringify(lista));

    document.getElementById("nombreJugador").value = "";
    document.getElementById("winModal").classList.remove("show");
    mostrarTop10();
}

function mostrarTop10() {
    var lista = JSON.parse(localStorage.getItem("top10")) || [];
    var cuerpo = document.getElementById("cuerpoTop10");
    cuerpo.innerHTML = "";

    if (lista.length === 0) {
        cuerpo.innerHTML = '<tr><td colspan="5">Todavía no hay puntajes guardados</td></tr>';
    } else {
        for (var i = 0; i < lista.length; i++) {
            var fila = document.createElement("tr");
            fila.innerHTML =
                "<td>" + (i + 1) + "</td>" +
                "<td>" + lista[i].nombre + "</td>" +
                "<td>" + lista[i].movimientos + "</td>" +
                "<td>" + lista[i].tiempo + "</td>" +
                "<td>" + lista[i].puntos + "</td>";
            cuerpo.appendChild(fila);
        }
    }

    document.getElementById("topModal").classList.add("show");
}

function cerrarTop10() {
    document.getElementById("topModal").classList.remove("show");
}

function borrarPuntajes() {
    if (confirm("¿Seguro que quieres borrar todos los puntajes?")) {
        localStorage.removeItem("top10");
        mostrarTop10();
    }
}
