// Memorama del Mundial
// Juego de memoria con 4 niveles, cronometro y top 10 en localStorage

// configuracion de cada nivel: cuantos pares y cuantas columnas
var niveles = {
    1: { pares: 4, columnas: 4 },
    2: { pares: 6, columnas: 4 },
    3: { pares: 8, columnas: 4 },
    4: { pares: 10, columnas: 5 }
};

// variables del juego
var nivelActual = 1;
var cartasVolteadas = [];
var paresEncontrados = 0;
var movimientos = 0;
var segundos = 0;
var cronometro = null;
var bloqueado = false;

// ------- funciones para cambiar de pantalla -------

function mostrarSeccion(id) {
    var secciones = document.querySelectorAll('.seccion');
    for (var i = 0; i < secciones.length; i++) {
        secciones[i].classList.add('oculto');
    }
    document.getElementById(id).classList.remove('oculto');
}

function volverMenu() {
    clearInterval(cronometro);
    mostrarSeccion('menu');
}

// ------- barajar las cartas (algoritmo Fisher-Yates) -------

function barajar(lista) {
    for (var i = lista.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temporal = lista[i];
        lista[i] = lista[j];
        lista[j] = temporal;
    }
    return lista;
}

// ------- iniciar el juego -------

function iniciarJuego(nivel) {
    nivelActual = nivel;
    paresEncontrados = 0;
    movimientos = 0;
    segundos = 0;
    cartasVolteadas = [];
    bloqueado = true; // bloqueado mientras se muestran las cartas
    clearInterval(cronometro);

    // elegir imagenes al azar (hay 10 en la carpeta img)
    var numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    barajar(numeros);
    var elegidas = numeros.slice(0, niveles[nivel].pares);

    // duplicar cada imagen para formar los pares y barajar el mazo
    var mazo = elegidas.concat(elegidas);
    barajar(mazo);

    // ajustar las columnas del tablero segun el nivel
    document.documentElement.style.setProperty('--columnas', niveles[nivel].columnas);

    // crear las cartas en el tablero
    var tablero = document.getElementById('tablero');
    tablero.innerHTML = '';
    for (var i = 0; i < mazo.length; i++) {
        var carta = document.createElement('div');
        carta.className = 'carta';
        carta.dataset.imagen = mazo[i];
        carta.innerHTML =
            '<div class="cara atras">❓</div>' +
            '<div class="cara adelante"><img src="assets/images/Ney' + mazo[i] + '.png" alt="jugador"></div>';
        carta.onclick = voltearCarta;
        tablero.appendChild(carta);
    }

    actualizarMarcador();
    document.getElementById('tiempo').textContent = 0;
    mostrarSeccion('juego');

    // mostrar las cartas 3 segundos para memorizarlas
    document.getElementById('mensaje').textContent = '¡Memoriza las cartas!';
    var todas = document.querySelectorAll('.carta');
    for (var i = 0; i < todas.length; i++) {
        todas[i].classList.add('volteada');
    }

    setTimeout(function () {
        var todas = document.querySelectorAll('.carta');
        for (var i = 0; i < todas.length; i++) {
            todas[i].classList.remove('volteada');
        }
        document.getElementById('mensaje').textContent = '';
        bloqueado = false;
        empezarCronometro();
    }, 3000);
}

// ------- cronometro -------

function empezarCronometro() {
    cronometro = setInterval(function () {
        segundos++;
        document.getElementById('tiempo').textContent = segundos;
    }, 1000);
}

// ------- logica de voltear cartas -------

function voltearCarta() {
    if (bloqueado) return;
    if (this.classList.contains('volteada') || this.classList.contains('encontrada')) return;

    this.classList.add('volteada');
    cartasVolteadas.push(this);

    // cuando hay dos cartas volteadas se comparan
    if (cartasVolteadas.length === 2) {
        movimientos++;
        actualizarMarcador();

        var carta1 = cartasVolteadas[0];
        var carta2 = cartasVolteadas[1];

        if (carta1.dataset.imagen === carta2.dataset.imagen) {
            // son iguales
            carta1.classList.add('encontrada');
            carta2.classList.add('encontrada');
            cartasVolteadas = [];
            paresEncontrados++;
            actualizarMarcador();

            // revisar si ya gano
            if (paresEncontrados === niveles[nivelActual].pares) {
                terminarJuego();
            }
        } else {
            // no son iguales, se voltean de nuevo
            bloqueado = true;
            setTimeout(function () {
                carta1.classList.remove('volteada');
                carta2.classList.remove('volteada');
                cartasVolteadas = [];
                bloqueado = false;
            }, 900);
        }
    }
}

function actualizarMarcador() {
    document.getElementById('nivel-actual').textContent = nivelActual;
    document.getElementById('movimientos').textContent = movimientos;
    document.getElementById('pares').textContent = paresEncontrados + '/' + niveles[nivelActual].pares;
}

// ------- fin del juego y puntuacion -------

function calcularPuntos() {
    // mas puntos por nivel mas alto, se resta por tiempo y movimientos
    var base = nivelActual * 500 + niveles[nivelActual].pares * 100;
    var puntos = base - (segundos * 2) - (movimientos * 5);
    if (puntos < 50) puntos = 50;
    return puntos;
}

function terminarJuego() {
    clearInterval(cronometro);
    var puntos = calcularPuntos();

    document.getElementById('puntos-finales').textContent = puntos;
    document.getElementById('puntaje').value = puntos;

    setTimeout(function () {
        mostrarSeccion('guardar');
        document.getElementById('nombre').focus();
    }, 800);
}

// ------- guardado en localStorage (sin base de datos) -------

function guardarPuntaje(evento) {
    evento.preventDefault();

    var nombre = document.getElementById('nombre').value.trim();
    if (nombre === '') return;

    var registro = {
        nombre: nombre,
        nivel: nivelActual,
        tiempo: segundos,
        puntos: Number(document.getElementById('puntaje').value)
    };

    // leer lo guardado, agregar el nuevo y dejar solo los 10 mejores
    var lista = JSON.parse(localStorage.getItem('mejoresPuntajes')) || [];
    lista.push(registro);
    lista.sort(function (a, b) { return b.puntos - a.puntos; });
    lista = lista.slice(0, 10);
    localStorage.setItem('mejoresPuntajes', JSON.stringify(lista));

    document.getElementById('formulario').reset();
    verPuntajes();
}

// ------- tabla de los 10 mejores -------

function verPuntajes() {
    var lista = JSON.parse(localStorage.getItem('mejoresPuntajes')) || [];
    var cuerpo = document.getElementById('cuerpo-tabla');
    cuerpo.innerHTML = '';

    if (lista.length === 0) {
        cuerpo.innerHTML = '<tr><td colspan="5">Todavía no hay puntajes guardados</td></tr>';
    } else {
        for (var i = 0; i < lista.length; i++) {
            var fila = document.createElement('tr');
            fila.innerHTML =
                '<td>' + (i + 1) + '</td>' +
                '<td>' + lista[i].nombre + '</td>' +
                '<td>' + lista[i].nivel + '</td>' +
                '<td>' + lista[i].tiempo + 's</td>' +
                '<td><b>' + lista[i].puntos + '</b></td>';
            cuerpo.appendChild(fila);
        }
    }

    mostrarSeccion('puntajes');
}

function borrarPuntajes() {
    if (confirm('¿Seguro que quieres borrar todos los puntajes?')) {
        localStorage.removeItem('mejoresPuntajes');
        verPuntajes();
    }
}
