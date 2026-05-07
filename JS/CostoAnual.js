// Convierte un valor presente en una anualidad equivalente (factor A/P).
function factorAP(i, n) {
    return (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
}

// Convierte un valor futuro o rescate en una anualidad equivalente (factor A/F).
function factorAF(i, n) {
    return i / (Math.pow(1 + i, n) - 1);
}

// Calcula el Valor Anual o CAE usando inversión, rescate, ingresos y egresos.
function CalcularCAE(I, S, R, E, i, n) {

    // Valida que los datos sean numéricos y mayores que cero.
    if (
        isNaN(I) || isNaN(S) || isNaN(R) || isNaN(E) ||
        isNaN(i) || isNaN(n) ||
        n <= 0 || i <= 0
    ) {
        alert("Ingrese valores válidos");
        return null;
    }

    // Calcula la recuperación anual de capital considerando rescate.
    let RC = (I * factorAP(i, n)) - (S * factorAF(i, n));

    // Calcula el valor anual equivalente del proyecto.
    let VA = R - E - RC;

    return VA;
}

// Compara dos alternativas y determina cuál tiene mejor valor anual.
function CalcularAlternativas() {

    // Obtiene datos financieros de la alternativa 1.
    let I1 = parseFloat(document.getElementById("I1").value);
    let S1 = parseFloat(document.getElementById("S1").value);
    let R1 = parseFloat(document.getElementById("R1").value);
    let E1 = parseFloat(document.getElementById("E1").value);
    let i1 = parseFloat(document.getElementById("i1").value);
    let n1 = parseInt(document.getElementById("n1").value);

    // Obtiene datos financieros de la alternativa 2.
    let I2 = parseFloat(document.getElementById("I2").value);
    let S2 = parseFloat(document.getElementById("S2").value);
    let R2 = parseFloat(document.getElementById("R2").value);
    let E2 = parseFloat(document.getElementById("E2").value);
    let i2 = parseFloat(document.getElementById("i2").value);
    let n2 = parseInt(document.getElementById("n2").value);

    // Calcula el VA/CAE de cada alternativa.
    let va1 = CalcularCAE(I1, S1, R1, E1, i1, n1);
    let va2 = CalcularCAE(I2, S2, R2, E2, i2, n2);

    // Muestra resultados formateados con dos decimales.
    document.getElementById("res1").innerText = "VA opción 1: $" + va1.toFixed(2);
    document.getElementById("res2").innerText = "VA opción 2: $" + va2.toFixed(2);

    // Selecciona la alternativa con mayor valor anual equivalente.
    if (va1 > va2) {
        document.getElementById("mejor").innerText = "La mejor opción es la 1";
    } else if (va2 > va1) {
        document.getElementById("mejor").innerText = "La mejor opción es la 2";
    } else {
        document.getElementById("mejor").innerText = "Las dos opciones son iguales";
    }
}