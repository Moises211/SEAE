// @ts-check

class CostoAnual {
  /**
   * @param {string} nombre
   * @param {number} inversion
   * @param {number} rescate
   * @param {number} ingresos
   * @param {number} egresos
   * @param {number} tasa
   * @param {number} n
   */
  constructor(nombre, inversion, rescate, ingresos, egresos, tasa, n) {
    this.nombre = nombre;
    this.inversion = inversion;
    this.rescate = rescate;
    this.ingresos = ingresos;
    this.egresos = egresos;
    this.tasa = tasa;
    this.n = n;
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
    // Calcula la recuperación anual de capital (RC) considerando el valor de rescate.
    let RC = (this.inversion * this._factorAP()) - (this.rescate * this._factorAF());

    // Calcula el valor anual equivalente neto (Ingresos - Egresos - Recuperación de Capital).
    return this.ingresos - this.egresos - RC;
  }
}

export { CostoAnual };
