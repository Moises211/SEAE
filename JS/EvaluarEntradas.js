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
   */
  evaluarDatosNumericos(valor) {
    if (Number.isNaN(valor)) {
      return {
        estado: false,
        msg: "Los valores ingresados deben ser numericos"
      }
    } else if (valor <= 0) {
      return {
        estado: false,
        msg: "Los valores ingresados deben ser mayores a 0"
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
      var estado = this.evaluarDatosNumericos(valor[index]);
      
      if (!estado.estado) {
        erroneos.push({
          valor: valor[index],
          posicion: index + 1
        })
      }
    }
    //Si no se encontraron erroneos entonces devuelve el array original y true,
    /*
    Esto debe hacerse validando la tabla editable con el array que devuelva de los tr de esta en cada alternativa 
    para cada flujo.
    */
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
