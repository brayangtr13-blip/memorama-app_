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

var firstCard = null;
var secondCard = null;
var canFlip = true;
var matches = 0;
var moves = 0;
var seconds = 0;
var timerRunning = false;
var timerInterval;

function nuevoJuego() {
    var tablerodejuego = document.getElementById("tablerodejuego");
    tablerodejuego.innerHTML = "";

    var cardImages = images.concat(images);

    cardImages.sort(function () {
        return Math.random() - 0.5;
    });

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

    updateStats();
    clearInterval(timerInterval);
    document.getElementById("winModal").classList.remove("show");
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

            if (matches === 10) {
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
    document.getElementById("parejas").innerText = matches + "/10";


    var mins = Math.floor(seconds / 60);
    var secs = seconds % 60;


    if (mins < 10) mins = "0" + mins;
    if (secs < 10) secs = "0" + secs;


    document.getElementById('tiempo').textContent = mins + ':' + secs;
}

function endGame() {
    clearInterval(timerInterval);
    document.getElementById("finalMovimientos").innerText = moves;

    document.getElementById("finalTiempo").innerText = document.getElementById("tiempo").textContent;
    document.getElementById("winModal").classList.add("show");
}

nuevoJuego();
