// @ts-check

class EvaluarAlternativas {

  /** 
  * @param {*} nombre     
  */
  evaluarNombre(nombre) {
    if (nombre === null || nombre.trim() === "") {
      return nombre = "alternativa " + nombre; //debe ingresarse por defecto 1, 2, 3..n si el usuario no pone nombree
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
    } else if (valor < 0) {
      return {
        estado: false,
        msg: "Los valores ingresados deben ser positivos"
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
        estado = this.evaluarDatosNumericos(Math.abs(valor[index]))
        if(estado.estado) continue;
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

export { TasaRendimiento };
