// @ts-check

/**

* Calcula el Valor Presente Neto (VPN) de una alternativa económica.
*
* El VPN consiste en traer todos los flujos de caja futuros a valor presente
* utilizando una tasa de descuento, y restar la inversión inicial.
*
* @param {number} inversionInicial - Monto inicial invertido en el proyecto.
* @param {number} tasa - Tasa de descuento en formato decimal (ej: 0.1 = 10%).
* @param {Array<number>} flujos - Arreglo de flujos de caja por periodo.
* @param {number} [rescate=0] - Valor de rescate al final del proyecto (opcional).
* @returns {number} Valor presente neto del proyecto.
  */
  
function ValorPresente(inversionInicial, tasa, flujos, rescate = 0) {
  
  if (!Array.isArray(flujos) || flujos.length === 0) {
    throw new Error("Los flujos deben ser un arreglo valido");
  }

  // Inicializamos el VPN con la inversión inicial negativa
  let vpn = -inversionInicial;
  
  // Número total de periodos
  let n = flujos.length;

  // Recorremos cada flujo de caja
  for (let i = 0; i < n; i++) {


    // Si es el último periodo, se incluye el valor de rescate
    if (i === n - 1 && rescate > 0) {
      vpn += (flujos[i] + rescate) / Math.pow(1 + tasa, i + 1);
    } else {
      vpn += flujos[i] / Math.pow(1 + tasa, i + 1);
    }

  }

  return vpn;
}

export { ValorPresente };
