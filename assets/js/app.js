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

// cuantas parejas tiene cada nivel
var paresPorNivel = {
    1: 4,
    2: 6,
    3: 8,
    4: 10
};

var nivelActual = 1;

var firstCard = null;
var secondCard = null;
var canFlip = true;
var matches = 0;
var moves = 0;
var seconds = 0;
var timerRunning = false;
var timerInterval;

// barajar con el algoritmo Fisher-Yates
function barajar(lista) {
    for (var i = lista.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = lista[i];
        lista[i] = lista[j];
        lista[j] = temp;
    }
    return lista;
}

function nuevoJuego() {
    var tablerodejuego = document.getElementById("tablerodejuego");
    tablerodejuego.innerHTML = "";

    // elegir las imagenes al azar segun el nivel
    var pares = paresPorNivel[nivelActual];
    var elegidas = barajar(images.slice()).slice(0, pares);

    // duplicar para formar las parejas y barajar el mazo
    var cardImages = barajar(elegidas.concat(elegidas));

    // acomodar las columnas del tablero segun la cantidad de cartas
    if (pares === 10) {
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
    matches = 0;
    moves  = 0;
    seconds = 0;
    timerRunning = false;

    updateStats();
    clearInterval(timerInterval);
    document.getElementById("winModal").classList.remove("show");

    // al repartir se muestran las cartas unos segundos para memorizarlas
    canFlip = false;
    var cartas = document.querySelectorAll(".card");
    for (var i = 0; i < cartas.length; i++) {
        cartas[i].classList.add("flipped");
    }

    setTimeout(function () {
        var cartas = document.querySelectorAll(".card");
        for (var i = 0; i < cartas.length; i++) {
            cartas[i].classList.remove("flipped");
        }
        canFlip = true;
    }, 3000);
}

// cambiar de nivel con los botones
function elegirNivel(nivel) {
    nivelActual = nivel;

    // marcar el boton del nivel elegido
    var botones = document.querySelectorAll(".btn-nivel");
    for (var i = 0; i < botones.length; i++) {
        botones[i].classList.remove("activo");
    }
    botones[nivel - 1].classList.add("activo");

    nuevoJuego();
}

function flipCard() {
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

// la puntuacion depende del nivel, el tiempo y los movimientos
function calcularPuntos() {
    var puntos = nivelActual * 500 + paresPorNivel[nivelActual] * 100 - seconds * 2 - moves * 5;
    if (puntos < 50) {
        puntos = 50;
    }
    return puntos;
}

function endGame() {
    clearInterval(timerInterval);
    var puntos = calcularPuntos();

    document.getElementById("finalMovimientos").innerText = moves;
    document.getElementById("finalTiempo").innerText = document.getElementById("tiempo").textContent;
    document.getElementById("finalPuntos").innerText = puntos;
    document.getElementById("puntajeFinal").value = puntos;

    document.getElementById("winModal").classList.add("show");
}

// formulario de guardado: jugador y puntuacion
function guardarPuntaje(evento) {
    evento.preventDefault();

    var nombre = document.getElementById("nombreJugador").value.trim();
    if (nombre === "") return;

    guardarEnStorage({
        nombre: nombre,
        nivel: nivelActual,
        tiempo: document.getElementById("tiempo").textContent,
        puntos: Number(document.getElementById("puntajeFinal").value)
    });

    document.getElementById("nombreJugador").value = "";
    document.getElementById("winModal").classList.remove("show");
    mostrarTop10();
}

nuevoJuego();




