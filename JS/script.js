// @ts-check
import { CostoAnual } from './CostoAnual.js';
import { EvaluarAlternativas } from './EvaluarEntradas.js';
import { Reporte } from './Reporte.js';
import { TasaRendimiento } from './TasaRendimiento.js';
import { ValorPresente } from './ValorPresente.js';
import * as UI from './UIController.js';
import * as Graphics from './Graficos.js';

const validador = new EvaluarAlternativas();
async function CalcularAlternativas() {
    UI.limpiarErrores();
    const metodo = (/** @type {HTMLSelectElement} */ (document.getElementById("metodoSeleccionado"))).value;
    const num = parseInt((/** @type {HTMLInputElement} */ (document.getElementById("numAlternativas"))).value);
    const modoCostos = /** @type {HTMLInputElement} */ (document.getElementById("tipoAnalisis"))?.checked || false;

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
            n: parseInt(/** @type {HTMLInputElement} */ (document.getElementById(`n${id}`)).value),
            usarVpn: (/** @type {HTMLInputElement} */ (document.getElementById(`modoVpnCae${id}`)))?.checked || false,
            vpnCae: parseFloat((/** @type {HTMLInputElement} */ (document.getElementById(`vpnInputCae${id}`)))?.value || "0")
        };
    };
    
    /** @param {string} id */
    const obtenerFlujos = (id) => {
        const inputs = document.querySelectorAll(`.flujo-input-${id}`);
        return Array.from(inputs).map(input => {
            let val = parseFloat((/** @type {HTMLInputElement} */ (input)).value) || 0;
                        
            if (modoCostos && val !== 0) return -Math.abs(val);
            return val;
        });
    };

    /** 
     * Valida un objeto de datos financieros usando el evaluador.
     * @param {Record<string, any>} d 
     * @param {string} id 
     * @returns {boolean}
     */
    const esValido = (d, id) => {
        var valid = true;
        for (const [campo, valor] of Object.entries(d)) {
            
            if (campo === "usarVpn") continue;
            if (campo === "vpnCae" && (metodo !== "CAE" || !d.usarVpn)) continue;

            // Validar campos de Ingresos/Egresos solo si es método CAE
            if (metodo !== "CAE" && (campo === "R" || campo === "E")) continue;

            // Si es CAE y usamos VPN precalculado, no validamos 
            if (metodo === "CAE" && d.usarVpn && ["I", "S", "R", "E"].includes(campo)) continue;

            let inputId;
            if (campo === "i" && metodo === "TIR") {
                inputId = "tasaGlobalTMA";
            } else if (campo === "vpnCae") {
                inputId = `vpnInputCae${id}`;
            } else {
                inputId = `${campo}${id}`;
            }

            const element = document.getElementById(inputId);
            
            // Permitir 0 en Rescate, Ingresos, Egresos y VPN precalculado. 
            // Inversión y N deben ser > 0.
            const puedeSerCero = ["S", "R", "E", "vpnCae"].includes(campo);
            
            const permitirNegativo = (campo === "vpnCae");
            
            const resultado = validador.evaluarDatosNumericos(valor, permitirNegativo);

            if (!resultado.estado || (!puedeSerCero && valor <= 0)) {
                element?.classList.add("error-input");
                alert(`Error en Alternativa ${id} (${campo}): El valor debe ser mayor a 0`);
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
            let obj;
            if (datos.usarVpn) {
                let vpnInput = datos.vpnCae;
                // Asegurar que el VPN sea tratado como negativo
                if (modoCostos && vpnInput > 0) vpnInput = -Math.abs(vpnInput);
                obj = new CostoAnual(nombre, datos.i, datos.n, undefined, vpnInput);
                flujosEvaluados = Array(datos.n).fill(0); // No hay flujos operativos conocidos
            } else {
                obj = new CostoAnual(nombre, datos.i, datos.n, { inversion: datos.I, rescate: datos.S, ingresos: datos.R, egresos: datos.E });
                let neto = datos.R - datos.E;
                // Asegurar que el flujo para el gráfico respete lo seleccionado
                if (modoCostos && neto !== 0) neto = -Math.abs(neto);
                flujosEvaluados = Array(datos.n).fill(neto);
            }
            valorFinal = obj.calcularValorAnual();
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

    
    const areaResultados = /** @type {HTMLElement} */ (document.querySelector(".resultado"));
    /** @type {HTMLElement} */ (document.getElementById("res1")).innerHTML = "";
    /** @type {HTMLElement} */ (document.getElementById("res2")).innerHTML = ""; 
    const mejorElemento = /** @type {HTMLElement} */ (document.getElementById("mejor"));
    mejorElemento.innerText = "";

    
    areaResultados.querySelectorAll('.conclusion-highlight, .report-btn-container').forEach(el => el.remove());
    
    resultados.forEach((res, idx) => {
        const p = document.createElement("p");
        var displayValue;

        if (metodo === "TIR") {
            
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
        Graphics.dibujarGraficoEvolucion(canvasEvolId, res.datos, res.flujos);
        if (canvasTIRId) Graphics.dibujarGraficoTIR(canvasTIRId, res.tirData);
    });

    // Determinar mejor opción y competidora más cercana
    const ordenados = [...resultados].sort((a, b) => b.valor - a.valor);
    const mejor = ordenados[0];
    const competidora = ordenados.length > 1 ? ordenados[1] : null;

    // Generar resumen textual (CAE, TIR, VPN)
    let resumenTexto = "";
    if (competidora) {        
        const formatoMoneda = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
        const diff = formatoMoneda.format(Math.abs(mejor.valor - competidora.valor));
        const vMejor = formatoMoneda.format(Math.abs(mejor.valor));
        const vComp = formatoMoneda.format(Math.abs(competidora.valor));

        if (metodo === "CAE") {
            resumenTexto = `Para obtener un punto de comparación uniforme, se transformaron los flujos de la ${competidora.nombre} en un Costo Anual Equivalente (CAE) de $${vComp} por periodo. Al comparar este pago periódico contra los $${vMejor} anuales de la ${mejor.nombre}, se determina que la opción que optimiza los recursos mediante un menor costo operativo anual es la ${mejor.nombre}, logrando un ahorro por periodo de $${diff} respecto a la alternativa competidora.`;
        } else if (metodo === "TIR") {
            resumenTexto = `Tras realizar el cálculo mediante el método de interpolación lineal, se determinó que la Tasa Interna de Rendimiento (TIR) de la ${competidora.nombre} es de ${vComp}%. Al contrastar esta rentabilidad contra el ${vMejor}% de la ${mejor.nombre}, se concluye que la alternativa más eficiente financieramente es la ${mejor.nombre}, ya que ofrece un rendimiento porcentual mayor por cada unidad de capital invertida, superando a la otra opción por un margen de ${diff}%.`;
        } else if (metodo === "VPN") {
            const aclaracion = mejor.valor < 0 ? " (menos negativo)" : "";
            resumenTexto = `En este caso, al proyectar los flujos de efectivo durante el periodo establecido, el Valor Presente Neto (VPN) de la ${competidora.nombre} es de $${vComp}. Al comparar este resultado contra los $${vMejor} de la ${mejor.nombre}, se determina que la alternativa que representa una mayor creación de valor (o menor desembolso dado que son costos) es la ${mejor.nombre}, dado que presenta un VPN superior${aclaracion} en comparación a la otra opción, con una diferencia de $${diff} en términos de valor presente.`;
        }

        if (resumenTexto) {
            resumenTexto += ` Alternativa que se debería elegir: ${mejor.nombre}.`;
        }
    }

    // Crear el contenedor de conclusión

    const boxConclusion = document.createElement("div");
    boxConclusion.className = "conclusion-highlight mt-4 mb-4 shadow-sm";
    boxConclusion.innerHTML = `
        <h2 class="h4 fw-bold text-uppercase mb-3" style="text-shadow: 0 0 10px var(--color1); color: #ffffff;">
            La mejor opción es: ${mejor.nombre}
        </h2>
        ${resumenTexto ? `<p class="mb-0 fst-italic" style="color: #cbd5e0; line-height: 1.6;">${resumenTexto}</p>` : ''}
    `;
    areaResultados.appendChild(boxConclusion);

    // botón para exportar a PDF
    const btnContenedor = document.createElement("div");
    btnContenedor.className = "text-center mb-2 report-btn-container";
    
    const btnReporte = document.createElement("button");
    btnReporte.className = "btn btn-primary px-5 py-2 fw-bold shadow-sm";
    btnReporte.style.border = "2px solid var(--color1)";
    btnReporte.innerHTML = 'Generar Reporte PDF Completo';
    btnReporte.onclick = () => {
        const generador = new Reporte(metodo, resultados, mejor, resumenTexto);
        generador.generarReportePDF();
    };
    
    btnContenedor.appendChild(btnReporte);
    areaResultados.appendChild(btnContenedor);
}

// Inicialización 
window.addEventListener('DOMContentLoaded', () => {
    UI.renderizarAlternativas();
});

// Exponer funciones globalmente
/** @type {any} */ (window).CalcularAlternativas = CalcularAlternativas;
/** @type {any} */ (window).generarTablaFlujos = UI.generarTablaFlujos;
/** @type {any} */ (window).actualizarInterfazPorMetodo = UI.actualizarInterfazPorMetodo;
/** @type {any} */ (window).renderizarAlternativas = UI.renderizarAlternativas;
/** @type {any} */ (window).toggleAlternativa = UI.toggleAlternativa;
/** @type {any} */ (window).actualizarTextoModo = UI.actualizarTextoModo;
/** @type {any} */ (window).toggleModoCae = UI.toggleModoCae;