const { readFileSync } = require('fs');

class ServicoCalculoFatura{

  calcularCreditos(apre) {
    let creditos = 0
    creditos += Math.max(apre.audiencia - 30, 0);
    if (getPeca(apre).tipo === "comedia") 
      creditos += Math.floor(apre.audiencia / 5);
    return creditos
  }

  calcularTotalApresentacao(apre) {
    let total = 0;
    switch (getPeca(apre).tipo) {
    case "tragedia":
      total = 40000;
      if (apre.audiencia > 30) {
        total += 1000 * (apre.audiencia - 30);
      }
      break;
    case "comedia":
      total = 30000;
      if (apre.audiencia > 20) {
        total += 10000 + 500 * (apre.audiencia - 20);
      }
      total += 300 * apre.audiencia;
      break;
    default:
        throw new Error(`Peça desconhecia: ${getPeca(apre).tipo}`);
    }
    return total;
  }

  calcularTotalFatura(fatura) {
    let totalFatura = 0;
    for (let apre of fatura.apresentacoes) {
      totalFatura += this.calcularTotalApresentacao(apre);
    }
    return totalFatura;
  }

  calcularTotalCreditos(fatura) {
    let totalCreditos = 0;
    for (let apre of fatura.apresentacoes) {
      totalCreditos += this.calcularCreditos(apre);
    }
    return totalCreditos;
  }

}

function getPeca(apresentacao) {
    return pecas[apresentacao.id];
}

function formatarMoeda(valor) {
    return new Intl.NumberFormat("pt-BR",
      { style: "currency", currency: "BRL",
        minimumFractionDigits: 2 }).format(valor/100);
}

function gerarFaturaHTML(fatura) {
  let faturaHTML = '<html>\n'
  faturaHTML += `<p> Fatura ${fatura.cliente} </p>\n`;
  faturaHTML += '<ul>\n'
  for (let apre of fatura.apresentacoes) {
    faturaHTML += `<li>  ${getPeca(apre).nome}: ${formatarMoeda(calcularTotalApresentacao(apre))} (${apre.audiencia} assentos) </li>\n`;
  }
  faturaHTML += '</ul>\n'
  faturaHTML += `<p> Valor total: ${formatarMoeda(calcularTotalFatura(fatura))} </p>\n`;
  faturaHTML += `<p> Créditos acumulados: ${calcularTotalCreditos(fatura)} </p>\n`;
  faturaHTML += '</html>'
  return faturaHTML;
}

function gerarFaturaStr(fatura, calc) {
  let faturaStr = `Fatura ${fatura.cliente}\n`;
  for (let apre of fatura.apresentacoes) {
    faturaStr += `  ${getPeca(apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(apre))} (${apre.audiencia} assentos)\n`;
  }
  faturaStr += `Valor total: ${formatarMoeda(calc.calcularTotalFatura(fatura))}\n`;
  faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(fatura)} \n`;
  return faturaStr;
}

const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));
const calc = new ServicoCalculoFatura();
const faturaStr = gerarFaturaStr(faturas, calc);
console.log(faturaStr);
//const faturaHTML = gerarFaturaHTML(faturas);
//console.log(faturaHTML);
