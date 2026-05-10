// @ts-check

/**
 * Genera una tabla editable para capturar flujos de caja.
 * @param {string} idAlt - ID de la alternativa (1 o 2).
 */
export function generarTablaFlujos(idAlt) {
    const nInput = /** @type {HTMLInputElement} */ (document.getElementById(`n${idAlt}`));
    if (!nInput) return;
    
    const n = parseInt(nInput.value) || 0;
    const contenedor = /** @type {HTMLElement} */ (document.getElementById(`contenedorTabla${idAlt}`));
    
    let html = `<table class="table table-sm table-dark table-bordered mt-3 text-center border-secondary shadow-sm">
                <thead style="background-color: var(--color1)"><tr><th>Periodo</th><th>Monto ($)</th></tr></thead><tbody>`;
    for (let i = 1; i <= n; i++) {
        html += `<tr><td class="align-middle fw-bold text-light">${i}</td><td><input type="number" class="form-control form-control-sm text-center flujo-input-${idAlt}" value="0"></td></tr>`;
    }
    html += `</tbody></table>`;
    contenedor.innerHTML = html;
}

export function limpiarErrores() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.classList.remove('error-input');
    });
}


export function renderizarAlternativas() {
    const numInput = /** @type {HTMLInputElement} */ (document.getElementById("numAlternativas"));
    const num = parseInt(numInput.value);
    const contenedor = /** @type {HTMLElement} */ (document.getElementById("contenedorAlternativas"));
    contenedor.innerHTML = "";

    for (let i = 1; i <= num; i++) {
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
                    <div class="cae-especifico col-12 mb-2">
                        <div class="form-check form-switch d-flex justify-content-center align-items-center gap-2">
                            <input class="form-check-input" type="checkbox" id="modoVpnCae${i}" onchange="toggleModoCae('${i}')">
                            <label class="form-check-label small fw-bold text-info" for="modoVpnCae${i}">¿Calcular desde VPN pre-calculado?</label>
                        </div>
                    </div>
                    <div id="contenedorVpnCae${i}" class="col-md-10 cae-especifico" style="display: none;">
                        <label class="form-label small fw-bold text-info">VPN Pre-calculado ($)</label>
                        <input type="number" id="vpnInputCae${i}" class="form-control border-info text-center" value="0">
                    </div>
                    <div class="campos-operativos col-12">
                        <div id="camposBaseCae${i}" class="row g-3 justify-content-center text-center">
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
/**@param {any} id*/
export function toggleAlternativa(id) {
    const col = document.getElementById(`col${id}`);
    const icon = document.getElementById(`icon${id}`);
    if (col && icon) {
        col.classList.toggle('minimized');
        icon.innerText = col.classList.contains('minimized') ? '[ + ]' : '[ - ]';
    }
}

/**
 * Alterna entre el modo de ingreso de datos base o VPN pre-calculado en CAE.
 * @param {string} id 
 */
export function toggleModoCae(id) {
    const check = /** @type {HTMLInputElement} */ (document.getElementById(`modoVpnCae${id}`));
    const vpnDiv = document.getElementById(`contenedorVpnCae${id}`);
    const baseDiv = document.getElementById(`camposBaseCae${id}`);
    const invInput = document.getElementById(`I${id}`)?.parentElement;
    const resInput = document.getElementById(`S${id}`)?.parentElement;
    const nInput = document.getElementById(`n${id}`)?.parentElement;
    const tablaFlujos = document.getElementById(`contenedorTabla${id}`);

    const modoVpn = check.checked;
    if (vpnDiv) vpnDiv.style.display = modoVpn ? 'block' : 'none';
    if (baseDiv) baseDiv.style.display = modoVpn ? 'none' : 'flex';
    if (invInput) invInput.style.display = modoVpn ? 'none' : 'block';
    if (resInput) resInput.style.display = modoVpn ? 'none' : 'block';
    if (nInput) nInput.style.display = 'block';
    if (tablaFlujos) tablaFlujos.style.display = modoVpn ? 'none' : 'none'; // CAE siempre oculta tabla
}

export function actualizarInterfazPorMetodo() {
    const metodo = (/** @type {HTMLSelectElement} */ (document.getElementById("metodoSeleccionado"))).value;
    const camposOperativos = document.querySelectorAll('.campos-operativos');
    const caeEspecifico = document.querySelectorAll('.cae-especifico');
    const num = parseInt((/** @type {HTMLInputElement} */ (document.getElementById("numAlternativas"))).value);
    const contenedorGlobalTMA = document.getElementById('contenedorGlobalTMA');
    const tasasIndividuales = document.querySelectorAll('.tasa-individual');

    // Resetear visibilidad de campos base (I, S, n) por si veníamos de modo VPN en CAE
    for (let i = 1; i <= num; i++) {
        const inv = document.getElementById(`I${i}`)?.parentElement;
        const res = document.getElementById(`S${i}`)?.parentElement;
        const per = document.getElementById(`n${i}`)?.parentElement;
        if (inv) inv.style.display = 'block';
        if (res) res.style.display = 'block';
        if (per) per.style.display = 'block';
    }

    if (metodo === "TIR") {
        if (contenedorGlobalTMA) contenedorGlobalTMA.style.display = 'flex';
        tasasIndividuales.forEach(el => (/** @type {HTMLElement} */(el)).style.display = 'none');
    } else {
        if (contenedorGlobalTMA) contenedorGlobalTMA.style.display = 'none';
        tasasIndividuales.forEach(el => (/** @type {HTMLElement} */(el)).style.display = 'flex');
    }

    // Habilitar Ingresos/Egresos únicamente para CAE
    camposOperativos.forEach(el => (/** @type {HTMLElement} */(el)).style.display = (metodo === "CAE" ? 'block' : 'none'));

    // Habilitar controles avanzados de CAE solo en el método CAE
    caeEspecifico.forEach(el => (/** @type {HTMLElement} */(el)).style.display = (metodo === "CAE" ? 'block' : 'none'));
    
    // Si el método es CAE, asegurar que el estado inicial del campo VPN pre-calculado sea correcto
    if (metodo === "CAE") {
        for (let i = 1; i <= num; i++) {
            toggleModoCae(i.toString());
        }
    }
    
    for (let i = 1; i <= num; i++) {
        const tabla = document.getElementById(`contenedorTabla${i}`);
        if (tabla) {
            tabla.style.display = (metodo === "CAE" ? 'none' : 'block');
        }
    }
}

/**
 * Cambia el signo de los flujos de caja automáticamente según el modo seleccionado.
 */
export function actualizarTextoModo() {
    const check = /** @type {HTMLInputElement} */ (document.getElementById("tipoAnalisis"));
    const modoCostos = check ? check.checked : false;
    const texto = document.getElementById("modoTexto");
    
    if (texto) {
        texto.innerText = modoCostos ? "Costos (Egresos)" : "Ingresos";
        texto.style.color = modoCostos ? "#ff6b6b" : "#27ae60";
    }

    
    // Seleccionar flujos de tabla y campos de VPN pre-calculado para CAE
    const flujos = document.querySelectorAll('[class*="flujo-input-"], [id*="vpnInputCae"]');
    flujos.forEach(input => {
        const i = /** @type {HTMLInputElement} */ (input);
        let val = parseFloat(i.value) || 0;
        if (val === 0) return;
        
        // Forzar signo según el modo seleccionado
        i.value = (modoCostos ? -Math.abs(val) : Math.abs(val)).toString();
    });
}