function ValorPresente(inversionInicial, tasa, flujos) {
  
  // Validaciones basicas
  if (!Array.isArray(flujos) || flujos.length === 0) {
    return "Error: Flujos invalidos";
  }

  if (tasa <= 0) {
    return "Error: Tasa invalida";
  }

  // Se inicia el valor presente neto (vpn) con la inversion negativa
  let  vpn = -inversionInicial;
  
  //Se recorren todos los flujos
  for (let t = 0; t < flujos.length; t++) {
    vpn += flujos[t] / Math.pow(1 + tasa, t + 1);
  }

  return vpn;
}

// Esta función conecta con el HTML ------------------------------------
function probarVPN() {

let inversion = Number(document.getElementById("inversion").value);
let tasa = Number(document.getElementById("tasa").value) / 100;

let flujosTexto = document.getElementById("flujos").value;
let flujos = flujosTexto.split(",").map(f => Number(f));

let resultado = ValorPresente(inversion, tasa, flujos);

document.getElementById("resultado").innerText = "VPN: " + resultado.toFixed(2);
}