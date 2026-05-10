// @ts-check

/**

* Calcula el Valor Presente Neto (VPN) de una alternativa económica.
*
* El VPN consiste en traer todos los flujos de caja futuros a valor presente
* utilizando una tasa de descuento, y restar la inversión inicial.
*
* @param {number} inversionInicial  Monto inicial invertido en la alternativa.
* @param {number} tasa Taasa de descuento en formato decimal 
* @param {Array<number>} flujos  Arreglo de flujos de caja por periodo.
* @param {number} [rescate=0]   (opcional).
* @returns {number} Valor presente neto de la alternativa.
  */

function ValorPresente(inversionInicial, tasa, flujos, rescate = 0) {

  if (!Array.isArray(flujos) || flujos.length === 0) {
    throw new Error("Los flujos deben ser un arreglo valido");
  }

  
  var vpn = -inversionInicial;

  
  var n = flujos.length;

  
  for (var i = 0; i < n; i++) {


    // Si es el último periodo, se incluye el valor de rescate (soporta 0 y negativos)
    if (i === n - 1 && rescate !== 0) {
      vpn += (flujos[i] + rescate) / Math.pow(1 + tasa, i + 1);
    } else {
      vpn += flujos[i] / Math.pow(1 + tasa, i + 1);
    }

  }

  return vpn;
}

export { ValorPresente };
