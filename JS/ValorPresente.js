// @ts-check

/**

* Calcula el Valor Presente Neto (VPN)
* @param {number} inversionInicial
* @param {number} tasa
* @param {Array<number>} flujos
* @param {number} [rescate] valor de rescate opcional
* @returns {number}
  */
  function ValorPresente(inversionInicial, tasa, flujos, rescate = 0) {

// Se inicia con la inversión inicial negativa
let vpn = -inversionInicial;

// Cantidad de periodos
let n = flujos.length;

for (let i = 0; i < n; i++) {


// Si es el último periodo y hay rescate, se suma
if (i === n - 1 && rescate > 0) {
  vpn += (flujos[i] + rescate) / Math.pow(1 + tasa, i + 1);
} else {
  vpn += flujos[i] / Math.pow(1 + tasa, i + 1);
}

}

return vpn;
}

export { ValorPresente };
