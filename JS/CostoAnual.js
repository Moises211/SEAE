function CalcularCAE(P, i, n) {
    if (P <= 0 || i <= 0 || n <= 0) {
        alert("Ingrese  solo valores válidos");
        return;
    }

    let factor = (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    return P * factor;
}

function CalcularAlternativas() {
    let P1 = parseFloat(document.getElementById("P1").value);
    let i1 = parseFloat(document.getElementById("i1").value);
    let n1 = parseInt(document.getElementById("n1").value);

    let P2 = parseFloat(document.getElementById("P2").value);
    let i2 = parseFloat(document.getElementById("i2").value);
    let n2 = parseInt(document.getElementById("n2").value);

    let cae1 = CalcularCAE(P1, i1, n1);
    let cae2 = CalcularCAE(P2, i2, n2);

    document.getElementById("res1").innerText = "CAE opción 1: $" + cae1.toFixed(2);
    document.getElementById("res2").innerText = "CAE opción 2: $" + cae2.toFixed(2);

    if (cae1 < cae2) {
        document.getElementById("mejor").innerText = "Mejor opción: Alternativa 1";
    } else if (cae2 < cae1) {
        document.getElementById("mejor").innerText = "Mejor opción: Alternativa 2";
    } else {
        document.getElementById("mejor").innerText = "Ambas son iguales";
    }
}