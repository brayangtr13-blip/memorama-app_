// storage.js
// guarda y lee los puntajes en el localStorage (sin base de datos)

function obtenerPuntajes() {
    var guardado = localStorage.getItem("top10");
    if (guardado) {
        return JSON.parse(guardado);
    }
    return [];
}

function guardarEnStorage(registro) {
    var lista = obtenerPuntajes();
    lista.push(registro);

    // ordenar de mayor a menor puntaje y dejar solo los 10 mejores
    lista.sort(function (a, b) {
        return b.puntos - a.puntos;
    });
    lista = lista.slice(0, 10);

    localStorage.setItem("top10", JSON.stringify(lista));
}

function borrarPuntajes() {
    if (confirm("¿Seguro que quieres borrar todos los puntajes?")) {
        localStorage.removeItem("top10");
        mostrarTop10();
    }
}
