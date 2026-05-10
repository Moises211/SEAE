// @ts-check
class TasaRendimiento {
  /**
   * @param {*} nombre
   * @param {number} inversionInicial
   * @param {Array<number>} flujos
   * @param {number} rescate 
   * @param {number} tasaMA 
   */
  constructor(nombre, inversionInicial, flujos, rescate, tasaMA) {
    this.nombre = nombre;
    this.inversionInicial = inversionInicial;
    this.flujos = flujos;
    this.rescate = rescate || 0;
    this.n = flujos.length;
    this.tasaMA = tasaMA;
  }
  /** @param {number} tasa */
  calcularValorPresenteNeto(tasa) {
    var p = -this.inversionInicial;
    var vpn = 0;
    for (let i = 0; i < this.n; i++) {
      if (i === this.n - 1 && this.rescate !== 0) {
        vpn += (this.flujos[i] + this.rescate) / Math.pow(1 + tasa, i + 1);
        continue;
      }

      vpn += this.flujos[i] / Math.pow(1 + tasa, i + 1);
    }
    vpn += p;
    return vpn;
  }
  /** @param {number} tasa */
  async calcularTasasBaja(tasa) {
    var tasaBaja = [];
    var vpnPos = 0;
    while (tasa < 1) {
      tasa += 0.01;
      var vpn = this.calcularValorPresenteNeto(tasa);
      if (vpn < 0) break;
      vpnPos = vpn;
      tasaBaja.push({ tasa: parseFloat(tasa.toFixed(4)), vpn });
    }
    return { tasaBaja, vpnPos };
  }
  /** @param {number} tasa */
  async calcularTasasAlta(tasa) {
    var tasaAlta = [];
    var vpnNeg = 0;
    while (tasa > 0) {
      tasa -= 0.01;
      var vpn = this.calcularValorPresenteNeto(tasa);
      if (vpn > 0) break;
      vpnNeg = vpn;
      tasaAlta.push({ tasa: parseFloat(tasa.toFixed(4)), vpn });
    }
    return { tasaAlta, vpnNeg };
  }

  async calcularTasaInternaRendimiento() {
    const tasa = 1;
    let proceso = [];
    let { tasaBaja, vpnPos } = await this.calcularTasasBaja(tasa - 1);
    let { tasaAlta, vpnNeg } = await this.calcularTasasAlta(tasa);

    let tasaIRR = 0;
    
    
    const tArrayBajo = tasaBaja.length > 0 ? tasaBaja[tasaBaja.length - 1].tasa : 0;
    const tArrayAlto = tasaAlta.length > 0 ? tasaAlta[tasaAlta.length - 1].tasa : 1;
    const divisor = vpnPos - vpnNeg;

    if (divisor !== 0 && tasaBaja.length > 0 && tasaAlta.length > 0) {
        tasaIRR = vpnPos / divisor;
        proceso.push(tasaIRR);
        tasaIRR *= (tArrayAlto - tArrayBajo);
        proceso.push(tasaIRR);
        tasaIRR += tArrayBajo;
        proceso.push(tasaIRR);
    } else {
        
        tasaIRR = (tasaBaja.length === 0) ? 0 : 1;
        proceso.push(0, 0, tasaIRR);
    }

    console.log("la tasa es", tasaIRR);
    var aceptable = await this.calculoAlternativa(tasaIRR);
    var alternativa = {
      nombre : this.nombre,
      tasaIRR: tasaIRR,
      aceptable: aceptable,
      proceso: proceso, //para mostrar paso a paso
      tasaBaja: tasaBaja, //para mostrar en grafico?
      tasaAlta: tasaAlta, //para mostrar en grafico?
    }
    return alternativa;
  }
  /** @param {number} tasaIRR */
  async calculoAlternativa(tasaIRR) {
    if(tasaIRR >= this.tasaMA) return true;
    else return false;        
  }
}

export { TasaRendimiento };
