// components.js
// arma la tabla del top 10 y la muestra en su modal

function mostrarTop10() {
    var lista = obtenerPuntajes();
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
                "<td>" + lista[i].nivel + "</td>" +
                "<td>" + lista[i].tiempo + "</td>" +
                "<td><b>" + lista[i].puntos + "</b></td>";
            cuerpo.appendChild(fila);
        }
    }

    document.getElementById("topModal").classList.add("show");
}

function cerrarTop10() {
    document.getElementById("topModal").classList.remove("show");
}
