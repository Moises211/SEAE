// @ts-check

class CostoAnual {
  /**
   * @param {string} nombre
   * @param {number} tasa
   * @param {number} n
   * @param {Object} [datos] - Datos opcionales para cálculo completo
   * @param {number} [vpn] - VPN opcional si ya se tiene calculado
   */
  constructor(nombre, tasa, n, datos, vpn) {
    this.nombre = nombre;
    this.tasa = tasa;
    this.n = n;
    this.datos = datos; // { inversion, rescate, ingresos, egresos }
    this.vpnPrecalculado = vpn;
  }

  /**
   * Convierte un valor presente en una anualidad equivalente (factor A/P).
   * @private
   */
  _factorAP() {
    return (this.tasa * Math.pow(1 + this.tasa, this.n)) / (Math.pow(1 + this.tasa, this.n) - 1);
  }

  /**
   * Convierte un valor futuro o rescate en una anualidad equivalente (factor A/F).
   * @private
   */
  _factorAF() {
    return this.tasa / (Math.pow(1 + this.tasa, this.n) - 1);
  }

  /**
   * Calcula el Valor Anual (VA) o Costo Anual Equivalente.
   * @returns {number}
   */
  calcularValorAnual() {
    if (this.vpnPrecalculado !== undefined && this.vpnPrecalculado !== null) {
      
      return this.vpnPrecalculado * this._factorAP();
    }

    
    const { inversion, rescate, ingresos, egresos } = this.datos;
    let RC = (inversion * this._factorAP()) - (rescate * this._factorAF());

    
    return ingresos - egresos - RC;
  }
}

export { CostoAnual };