// @ts-check

/**
 * Dibuja la evolución del VPN a través de los periodos.
 * @param {string} canvasId 
 * @param {any} datos 
 * @param {number[]} flujos 
 */
export function dibujarGraficoEvolucion(canvasId, datos, flujos) {
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
 * Dibuja el gráfico de interpolación lineal para la TIR.
 * @param {string} canvasId 
 * @param {any} calc 
 */
export function dibujarGraficoTIR(canvasId, calc) {
    const ctx = /** @type {HTMLCanvasElement} */ (document.getElementById(canvasId));
    if (!ctx) return;
    
    const puntosCurva = [
        ...calc.tasaBaja.map((/**@type {any}*/p) => ({ x: p.tasa * 100, y: p.vpn })),
        ...[...calc.tasaAlta].reverse().map((p) => ({ x: p.tasa * 100, y: p.vpn }))
    ].sort((a, b) => a.x - b.x);

    const pLow = calc.tasaBaja[calc.tasaBaja.length - 1];
    const pHigh = calc.tasaAlta[calc.tasaAlta.length - 1];

    // @ts-ignore
    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                { label: 'Curva VPN Real', data: puntosCurva, showLine: true, borderColor: '#f0a818', backgroundColor: 'rgba(240, 168, 24, 0.05)', borderWidth: 2, tension: 0.3, pointRadius: 0 },
                { label: 'Triángulos de Interpolación', data: [{ x: pLow.tasa * 100, y: pLow.vpn }, { x: pHigh.tasa * 100, y: pLow.vpn }, { x: pHigh.tasa * 100, y: pHigh.vpn }], showLine: true, borderColor: 'rgba(255, 255, 255, 0.4)', backgroundColor: 'rgba(255, 255, 255, 0.05)', fill: true, pointRadius: 0 },
                { label: 'Interpolación Lineal', data: [{ x: pLow.tasa * 100, y: pLow.vpn }, { x: pHigh.tasa * 100, y: pHigh.vpn }], showLine: true, borderColor: '#dc3545', borderDash: [5, 5], pointRadius: 6, pointBackgroundColor: '#dc3545' },
                { label: 'TIR Calculada', data: [{ x: calc.tasaIRR * 100, y: 0 }], pointRadius: 10, pointBackgroundColor: '#ffffff', borderColor: '#7890a8', borderWidth: 3 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#ffffff', font: { size: 11 } } },
                tooltip: { callbacks: { label: (/**@type {any}*/context) => `VPN: $${context.parsed.y.toFixed(2)} (${context.parsed.x.toFixed(2)}%)` } }
            },
            scales: {
                x: { title: { display: true, text: 'Tasa de Interés (%)', color: '#cbd5e0' }, grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#cbd5e0' } },
                y: { title: { display: true, text: 'VPN ($)', color: '#cbd5e0' }, grid: { color: 'rgba(255, 255, 255, 0.1)', zeroLineColor: '#ffffff' }, ticks: { color: '#cbd5e0' } }
            }
        }
    });
}