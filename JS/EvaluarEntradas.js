// @ts-check

class EvaluarAlternativas {

  /** 
  * @param {string} nombre
  * @param {number} [index]
  */
  evaluarNombre(nombre, index) {
    if (nombre === null || nombre.trim() === "") {
      return "Alternativa " + (index !== undefined ? index : "");
    }
    return nombre;
  }
  /**
   * @param {*} valor 
   * @param {boolean} [permitirNegativo=false]
   */
  evaluarDatosNumericos(valor, permitirNegativo = false) {
    if (Number.isNaN(valor)) {
      return {
        estado: false,
        msg: "Los valores ingresados deben ser numericos"
      }
    } else if (!permitirNegativo && valor < 0) {
      return {
        estado: false,
        msg: "El valor no puede ser negativo para este campo"
      }
    }
    return {
      estado: true,
      msg: ""
    }
  }

  /**
   * @param {Array<*>} valor;
   */
  evaluarArrayNumerico(valor) {
    var erroneos = [];

    for (let index = 0; index < valor.length; index++) {
      var estado = this.evaluarDatosNumericos(valor[index], true);
      
      if (!estado.estado) {
        erroneos.push({
          valor: valor[index],
          posicion: index + 1
        })
      }
    }
    
    if(erroneos.length === 0){
      return {
        valor: valor,
        estado: true
      };
    }else{
      return {
        valor: erroneos,
        estado: false
      };
    }
  }
}

export { EvaluarAlternativas  };
