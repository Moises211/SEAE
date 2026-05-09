// @ts-check
import { CostoAnual } from './CostoAnual.js';
import { EvaluarAlternativas } from './EvaluarEntradas.js';
import { TasaRendimiento } from './TasaRendimiento.js';
import { ValorPresente } from './ValorPresente.js';

const validador = new EvaluarAlternativas();

/**
 * Genera una tabla editable para capturar flujos de caja.
 * Se llama usualmente cuando cambia el valor de 'n' o se selecciona el método.
 * @param {string} idAlt - ID de la alternativa (1 o 2).
 */
function generarTablaFlujos(idAlt) {
    const n = parseInt((/** @type {HTMLInputElement} */ (document.getElementById(`n${idAlt}`))).value) || 0;
    const contenedor = /** @type {HTMLElement} */ (document.getElementById(`contenedorTabla${idAlt}`));
    
    var html = `<table class="table table-sm table-dark table-bordered mt-3 text-center border-secondary shadow-sm">
                <thead style="background-color: var(--color1)"><tr><th>Periodo</th><th>Monto ($)</th></tr></thead><tbody>`;
    for (var i = 1; i <= n; i++) {
        html += `<tr><td class="align-middle fw-bold text-light">${i}</td><td><input type="number" class="form-control form-control-sm text-center flujo-input-${idAlt}" value="0"></td></tr>`;
    }
    html += `</tbody></table>`;
    contenedor.innerHTML = html;
}

function limpiarErrores() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.classList.remove('error-input');
    });
}

/**
 * Genera el HTML de las columnas según el número de alternativas seleccionado.
 */
function renderizarAlternativas() {
    const num = parseInt((/** @type {HTMLInputElement} */ (document.getElementById("numAlternativas"))).value);
    const contenedor = /** @type {HTMLElement} */ (document.getElementById("contenedorAlternativas"));
    contenedor.innerHTML = "";

    for (var i = 1; i <= num; i++) {
        const col = document.createElement("div");
        col.className = "card mb-4 border-primary-subtle shadow-sm mx-auto";
        col.id = `col${i}`;
        col.innerHTML = `
            <div class="card-header text-white d-flex justify-content-between align-items-center" 
                 onclick="toggleAlternativa('${i}')" style="cursor: pointer;">
                <h5 class="mb-0 fw-bold">Alternativa ${String.fromCharCode(64 + i)}</h5>
                <span class="h6 mb-0" id="icon${i}">[ - ]</span>
            </div>
            <div class="card-body">
                <div class="row g-3 justify-content-center text-center">
                    <div class="col-md-10">
                        <label class="form-label small fw-bold">Nombre de Alternativa</label>
                        <input type="text" id="nombre${i}" class="form-control border-primary-subtle text-center" placeholder="Ej: Máquina ${i}">
                    </div>
                    <div class="col-md-5">
                        <label class="form-label small fw-bold">Inversión Inicial ($)</label>
                        <input type="number" id="I${i}" class="form-control border-primary-subtle text-center" value="${10000 * i}">
                    </div>
                    <div class="col-md-5">
                        <label class="form-label small fw-bold">Valor de Rescate ($)</label>
                        <input type="number" id="S${i}" class="form-control border-primary-subtle text-center" value="2000">
                    </div>
                    <div class="solo-cae col-12">
                        <div class="row g-3 justify-content-center text-center">
                            <div class="col-md-5"><label class="form-label small fw-bold">Ingresos Anuales ($)</label><input type="number" id="R${i}" class="form-control border-primary-subtle text-center" value="5000"></div>
                            <div class="col-md-5"><label class="form-label small fw-bold">Egresos Anuales ($)</label><input type="number" id="E${i}" class="form-control border-primary-subtle text-center" value="1000"></div>
                        </div>
                    </div>
                    <div class="col-md-5 tasa-individual">
                        <label class="form-label small fw-bold">Tasa de Interés (i)</label>
                        <input type="number" id="i${i}" class="form-control border-primary-subtle text-center" step="0.01" value="0.10">
                    </div>
                    <div class="col-md-5">
                        <label class="form-label small fw-bold">Periodos (n)</label>
                        <input type="number" id="n${i}" class="form-control border-primary-subtle text-center" value="3" onchange="generarTablaFlujos('${i}')">
                    </div>
                    <div class="col-12 d-flex justify-content-center">
                        <div id="contenedorTabla${i}"></div>
                    </div>
                </div>
            </div>
        `;
        contenedor.appendChild(col);
        generarTablaFlujos(i.toString());
    }
    actualizarInterfazPorMetodo();
}

/**
 * Alterna la visibilidad del cuerpo de una alternativa.
 * @param {string} id
 */
function toggleAlternativa(id) {
    const col = document.getElementById(`col${id}`);
    const icon = document.getElementById(`icon${id}`);
    if (col && icon) {
        col.classList.toggle('minimized');
        icon.innerText = col.classList.contains('minimized') ? '[ + ]' : '[ - ]';
    }
}

/**
 * Ajusta la visibilidad de los campos según el método seleccionado.
 */
function actualizarInterfazPorMetodo() {
    const metodo = (/** @type {HTMLSelectElement} */ (document.getElementById("metodoSeleccionado"))).value;
    const camposCAE = document.querySelectorAll('.solo-cae');
    const num = parseInt((/** @type {HTMLInputElement} */ (document.getElementById("numAlternativas"))).value);
    const contenedorGlobalTMA = document.getElementById('contenedorGlobalTMA');
    const tasasIndividuales = document.querySelectorAll('.tasa-individual');

    // Manejo global de TMA para TIR
    if (metodo === "TIR") {
        if (contenedorGlobalTMA) contenedorGlobalTMA.style.display = 'flex';
        tasasIndividuales.forEach(el => (/** @type {HTMLElement} */(el)).style.display = 'none');
    } else {
        if (contenedorGlobalTMA) contenedorGlobalTMA.style.display = 'none';
        tasasIndividuales.forEach(el => (/** @type {HTMLElement} */(el)).style.display = 'flex');
    }

    if (metodo === "CAE") {
        camposCAE.forEach(el => (/** @type {HTMLElement} */(el)).style.display = 'block');
        for (var i = 1; i <= num; i++) {
            const tabla = document.getElementById(`contenedorTabla${i}`);
            if (tabla) tabla.style.display = 'none';
        }
    } else {
        camposCAE.forEach(el => (/** @type {HTMLElement} */(el)).style.display = 'none');
        for (var i = 1; i <= num; i++) {
            const tabla = document.getElementById(`contenedorTabla${i}`);
            if (tabla) tabla.style.display = 'block';
        }
    }
}

/**
 * Captura los datos de la interfaz y ejecuta la comparación de alternativas.
 */
async function CalcularAlternativas() {
    limpiarErrores();
    const metodo = (/** @type {HTMLSelectElement} */ (document.getElementById("metodoSeleccionado"))).value;
    const num = parseInt((/** @type {HTMLInputElement} */ (document.getElementById("numAlternativas"))).value);

    /**
     * @param {string} id
     */
    const obtenerDatos = (id) => {
        const inputTasa = metodo === "TIR" 
            ? /** @type {HTMLInputElement} */ (document.getElementById("tasaGlobalTMA"))
            : /** @type {HTMLInputElement} */ (document.getElementById(`i${id}`));
            
        return {
            I: parseFloat(/** @type {HTMLInputElement} */ (document.getElementById(`I${id}`)).value),
            S: parseFloat(/** @type {HTMLInputElement} */ (document.getElementById(`S${id}`)).value),
            R: parseFloat(/** @type {HTMLInputElement} */ (document.getElementById(`R${id}`)).value),
            E: parseFloat(/** @type {HTMLInputElement} */ (document.getElementById(`E${id}`)).value),
            i: parseFloat(inputTasa.value),
            n: parseInt(/** @type {HTMLInputElement} */ (document.getElementById(`n${id}`)).value)
        };
    };
    
    /** @param {string} id */
    const obtenerFlujos = (id) => {
        const inputs = document.querySelectorAll(`.flujo-input-${id}`);
        return Array.from(inputs).map(input => parseFloat((/** @type {HTMLInputElement} */ (input)).value));
    };

    /** 
     * Valida un objeto de datos financieros usando el evaluador.
     * @param {Record<string, number>} d 
     * @param {string} id 
     * @returns {boolean}
     */
    const esValido = (d, id) => {
        var valid = true;
        for (const [campo, valor] of Object.entries(d)) {
            // Evitar validar campos de Ingresos/Egresos si no es método CAE
            if (metodo !== "CAE" && (campo === "R" || campo === "E")) continue;

            const inputId = (campo === "i" && metodo === "TIR") ? "tasaGlobalTMA" : `${campo}${id}`;
            const element = document.getElementById(inputId);
            const resultado = validador.evaluarDatosNumericos(valor);

            if (!resultado.estado) {
                element?.classList.add("error-input");
                alert(`Error en Alternativa ${id} (${campo}): ${resultado.msg}`);
                valid = false;
            }
        }
        return valid;
    };

    /**
     * @param {number[]} flujos
     * @param {string} id
     */
    const validarFlujos = (flujos, id) => {
        const res = validador.evaluarArrayNumerico(flujos);
        if (!res.estado) {
            // @ts-ignore
            const inputs = document.querySelectorAll(`.flujo-input-${id}`);
            // @ts-ignore
            res.valor.forEach(err => {
                inputs[err.posicion - 1]?.classList.add("error-input");
            });
            // @ts-ignore
            const errores = res.valor.map(e => `Fila ${e.posicion}`).join(", ");
            alert(`Error en flujos de Alternativa ${id}: Valores inválidos en ${errores}`);
            return false;
        }
        if (flujos.length === 0 && (metodo === "VPN" || metodo === "TIR")) {
            alert(`La alternativa ${id} requiere flujos de caja en la tabla.`);
            return false;
        }
        return true;
    };

    /** @type {Array<{nombre: string, valor: number, datos: any, flujos: number[], tirData?: any}>} */
    var resultados = [];

    for (let i = 1; i <= num; i++) {
        const id = i.toString();
        const datos = obtenerDatos(id);
        if (!esValido(datos, id)) return;

        const nombre = validador.evaluarNombre(/** @type {HTMLInputElement} */ (document.getElementById(`nombre${id}`))?.value || "", i);
        var valorFinal = 0;
        var tirData = null;
        /** @type {number[]} */
        var flujosEvaluados = [];

        if (metodo === "CAE") {
            const obj = new CostoAnual(nombre, datos.I, datos.S, datos.R, datos.E, datos.i, datos.n);
            valorFinal = obj.calcularValorAnual();
            // Generar flujos netos para el gráfico de evolución en CAE
            flujosEvaluados = Array(datos.n).fill(datos.R - datos.E);
        } else {
            const flujos = obtenerFlujos(id);
            if (!validarFlujos(flujos, id)) return;
            flujosEvaluados = flujos;

            if (metodo === "VPN") {
                valorFinal = ValorPresente(datos.I, datos.i, flujos, datos.S);
            } else if (metodo === "TIR") {
                const tirObj = new TasaRendimiento(nombre, datos.I, flujos, datos.S, datos.i);
                const calc = await tirObj.calcularTasaInternaRendimiento();
                valorFinal = calc.tasaIRR * 100;
                tirData = calc;
            }
        }
        resultados.push({ nombre, valor: valorFinal, datos, flujos: flujosEvaluados, tirData });
    }

    // Limpiar y presentar resultados
    /** @type {HTMLElement} */ (document.getElementById("res1")).innerHTML = "";
    /** @type {HTMLElement} */ (document.getElementById("res2")).innerHTML = ""; // Usado como contenedor secundario
    
    resultados.forEach((res, idx) => {
        const p = document.createElement("p");
        var displayValue;

        if (metodo === "TIR") {
            // Validamos si el valor es demasiado bajo o 0 (indicativo de que no hubo cruce de signos en la TIR)
            displayValue = res.valor <= 0.01 
                ? "Valores demasiado bajos o no se cumplen los criterios de cálculo de la TIR" 
                : `${res.valor.toFixed(2)}%`;
        } else {
            displayValue = `$${res.valor.toFixed(2)}`;
        }

        p.innerText = `${metodo} ${res.nombre}: ${displayValue}`;

        const altContainer = document.createElement("div");
        altContainer.className = "mb-5 border-bottom border-secondary-subtle pb-4";
        altContainer.appendChild(p);

        const chartsWrapper = document.createElement("div");
        chartsWrapper.className = "charts-horizontal-container d-flex flex-wrap justify-content-center gap-4 p-3 rounded shadow-sm";

        // Columna para Gráfico de Evolución
        const evolCol = document.createElement("div");
        evolCol.className = "chart-item";
        
        const canvasEvolId = `chartEvol-${idx}`;
        const canvasEvol = document.createElement('canvas');
        canvasEvol.id = canvasEvolId;
        canvasEvol.style.maxHeight = "280px";
        
        const titEvol = document.createElement('h6');
        titEvol.className = "text-center text-light small mb-2";
        titEvol.innerText = `Evolución del VPN - ${res.nombre}`;
        
        evolCol.appendChild(titEvol);
        evolCol.appendChild(canvasEvol);
        chartsWrapper.appendChild(evolCol);
        
        // Columna para Gráfico de TIR
        var canvasTIRId = null;
        if (metodo === "TIR" && res.tirData && res.valor > 0.01) {
            const tirCol = document.createElement("div");
            tirCol.className = "chart-item";

            canvasTIRId = `chartTIR-${idx}`;
            const canvasTIR = document.createElement('canvas');
            canvasTIR.id = canvasTIRId;
            canvasTIR.style.maxHeight = "280px";
            
            const titTIR = document.createElement('h6');
            titTIR.className = "text-center text-light small mb-2";
            titTIR.innerText = `Interpolación Lineal - ${res.nombre}`;
            
            tirCol.appendChild(titTIR);
            tirCol.appendChild(canvasTIR);
            chartsWrapper.appendChild(tirCol);
        }

        altContainer.appendChild(chartsWrapper);
        /** @type {HTMLElement} */ (document.getElementById("res1")).appendChild(altContainer);

        // Dibujar gráficos
        dibujarGraficoEvolucion(canvasEvolId, res.datos, res.flujos);
        if (canvasTIRId) dibujarGraficoTIR(canvasTIRId, res.tirData);
    });

    // Determinar mejor opción
    const mejor = resultados.reduce((prev, current) => (prev.valor > current.valor) ? prev : current);
    const mejorElemento = /** @type {HTMLElement} */ (document.getElementById("mejor"));
    mejorElemento.innerText = `La mejor opción es: ${mejor.nombre}`;
}

/**
 * Dibuja la evolución del VPN a través de los periodos.
 * @param {string} canvasId 
 * @param {any} datos 
 * @param {number[]} flujos 
 */
function dibujarGraficoEvolucion(canvasId, datos, flujos) {
    const ctx = /** @type {HTMLCanvasElement} */ (document.getElementById(canvasId));
    if (!ctx) return;

    let acumulado = -datos.I;
    const puntos = [{ x: 0, y: acumulado }];

    flujos.forEach((f, i) => {
        let monto = f;
        if (i === flujos.length - 1) monto += datos.S;
        acumulado += monto / Math.pow(1 + datos.i, i + 1);
        puntos.push({ x: i + 1, y: parseFloat(acumulado.toFixed(2)) });
    });

    // @ts-ignore
    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'VPN Acumulado',
                data: puntos,
                borderColor: '#f0a818',
                backgroundColor: 'rgba(240, 168, 24, 0.1)',
                fill: true,
                tension: 0.1,
                pointRadius: 5,
                pointBackgroundColor: puntos.map(p => p.y >= 0 ? '#27ae60' : '#dc3545')
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                x: { type: 'linear', title: { display: true, text: 'Periodo (n)', color: '#cbd5e0' }, ticks: { stepSize: 1, color: '#cbd5e0' } },
                y: { title: { display: true, text: 'Valor ($)', color: '#cbd5e0' }, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#cbd5e0' } }
            }
        }
    });
}

/**
 * Dibuja el gráfico de interpolación lineal (triángulos semejantes) para la TIR.
 * @param {string} canvasId 
 * @param {any} calc 
 */
function dibujarGraficoTIR(canvasId, calc) {
    const ctx = /** @type {HTMLCanvasElement} */ (document.getElementById(canvasId));
    if (!ctx) return;

    // Combinar puntos para la curva (ordenados por tasa para que la línea de la curva no se cruce)
    
    const puntosCurva = [
        ...calc.tasaBaja.map((/** @type {{tasa: number, vpn: number}} */ p) => ({ x: p.tasa * 100, y: p.vpn })),
        ...[...calc.tasaAlta].reverse().map((/** @type {{tasa: number, vpn: number}} */ p) => ({ x: p.tasa * 100, y: p.vpn }))
    ].sort((a, b) => a.x - b.x);

    // Los dos puntos exactos usados para la interpolación lineal (los más cercanos al eje X)
    const pLow = calc.tasaBaja[calc.tasaBaja.length - 1];
    const pHigh = calc.tasaAlta[calc.tasaAlta.length - 1];

    // @ts-ignore
    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Curva VPN Real',
                    data: puntosCurva,
                    showLine: true,
                    borderColor: '#f0a818',
                    backgroundColor: 'rgba(240, 168, 24, 0.05)',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 0
                },
                {
                    label: 'Triángulos de Interpolación',
                    data: [
                        { x: pLow.tasa * 100, y: pLow.vpn },
                        { x: pHigh.tasa * 100, y: pLow.vpn },
                        { x: pHigh.tasa * 100, y: pHigh.vpn }
                    ],
                    showLine: true,
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    fill: true,
                    pointRadius: 0
                },
                {
                    label: 'Interpolación Lineal',
                    data: [
                        { x: pLow.tasa * 100, y: pLow.vpn },
                        { x: pHigh.tasa * 100, y: pHigh.vpn }
                    ],
                    showLine: true,
                    borderColor: '#dc3545',
                    borderDash: [5, 5],
                    pointRadius: 6,
                    pointBackgroundColor: '#dc3545'
                },
                {
                    label: 'TIR Calculada',
                    data: [{ x: calc.tasaIRR * 100, y: 0 }],
                    pointRadius: 10,
                    pointBackgroundColor: '#ffffff',
                    borderColor: '#7890a8',
                    borderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#ffffff', font: { size: 11 } } },
                tooltip: {
                    callbacks: {
                        label: (/** @type {any} */ context) => `VPN: $${context.parsed.y.toFixed(2)} (${context.parsed.x.toFixed(2)}%)`
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Tasa de Interés (%)', color: '#cbd5e0' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#cbd5e0' }
                },
                y: {
                    title: { display: true, text: 'VPN ($)', color: '#cbd5e0' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)', zeroLineColor: '#ffffff' },
                    ticks: { color: '#cbd5e0' }
                }
            }
        }
    });
}

// Inicialización al cargar el documento
window.addEventListener('DOMContentLoaded', () => {
    renderizarAlternativas();
});

// Exponer funciones globalmente
/** @type {any} */
(window).CalcularAlternativas = CalcularAlternativas;
/** @type {any} */
(window).generarTablaFlujos = generarTablaFlujos;
/** @type {any} */
(window).actualizarInterfazPorMetodo = actualizarInterfazPorMetodo;
/** @type {any} */
(window).renderizarAlternativas = renderizarAlternativas;
/** @type {any} */
(window).toggleAlternativa = toggleAlternativa;

export { CalcularAlternativas, generarTablaFlujos, actualizarInterfazPorMetodo, renderizarAlternativas, toggleAlternativa };