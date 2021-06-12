const EquationError = require("./equationError");
const combinations = require("./combinations");

function log(...a) {
  console.log(...a);
}

class Parser {
  constructor(equation) {
    equation = equation.replace(" ", "");
    this.equation = equation;
    const sides = equation.split("=");
    this.leftSideEq = sides[0];
    this.rightSideEq = sides[1];

    this.leftSide = [];
    this.rightSide = [];

    this.termIdx = 0;
    this.termLen;
    this.coefficientTurn = 1;

    this.parse();
    this.tryCombinations();
  }

  parse() {
    let termLen = 0;
    this.leftSideEq.split("+").forEach((item) => {
      this.leftSide.push({
        coefficient: this.coefficientTurn, // Start with co-efficient of 1,
        elements: this.parseElements(item),
      });
      termLen++;
    });

    this.rightSideEq.split("+").forEach((item) => {
      this.rightSide.push({
        coefficient: this.coefficientTurn, // Start with co-efficient of 1,
        elements: this.parseElements(item),
      });
      termLen++;
    });

    this.termLen = termLen;
  }

  setCoefficient(termIdx, co) {
    if (termIdx < this.leftSide.length) {
      this.leftSide[termIdx].coefficient = co;
    } else {
      this.rightSide[termIdx - this.leftSide.length].coefficient = co;
    }
    return true;
  }

  parseElements(item) {
    let output = [];
    const regEx = /([A-Z][a-z]*)(\d*)/g;
    const generator = item.matchAll(regEx);
    for (let match of generator) {
      let [element, subscript] = match.slice(1);
      subscript = +subscript || 1;
      output.push({
        name: element,
        subscript,
      });
    }
    return output;
  }

  check() {
    try {
      this.leftSide.forEach((term) => {
        term.elements.forEach((element) => {
          let leftAtoms = this.leftSideAtoms(element.name);
          let rightAtoms = this.rightSideAtoms(element.name);

          if (leftAtoms !== rightAtoms) {
            throw new Error("Inbalance");
          }
        });
      });
      return true;
    } catch (err) {
      return false;
    }
  }

  tryCombinations() {
    let allCombinations = combinations(this.coefficientTurn, this.termLen);
    for (let comb of allCombinations) {
      for (let [idx, num] of comb.entries()) {
        this.setCoefficient(idx, num);
      }
      if (this.check()) {
        log(comb, "✅");
        return true;
      }
      log(comb, "❌");
    }
    this.coefficientTurn++;
    this.tryCombinations();
  }

  rightSideAtoms(elementName) {
    let elements = [];
    for (let term of this.rightSide) {
      for (let element of term.elements) {
        if (element.name === elementName) {
          elements.push([term.coefficient, element.subscript]);
        }
      }
    }

    if (elements.length) return elements.reduce((p, c) => c[0] * c[1] + p, 0);

    throw new EquationError(
      `Element "${elementName}" not present in right side of equation`
    );
  }

  leftSideAtoms(elementName) {
    let elements = [];
    for (let term of this.leftSide) {
      for (let element of term.elements) {
        if (element.name === elementName) {
          elements.push([term.coefficient, element.subscript]);
        }
      }
    }

    if (elements.length) return elements.reduce((p, c) => c[0] * c[1] + p, 0);

    throw new EquationError(
      `Element "${elementName}" not present in left side of equation`
    );
  }

  stringifyTerm(term) {
    let outputString = "";

    const { coefficient } = term;
    outputString += coefficient === 1 ? "" : coefficient;
    term.elements.forEach((element) => {
      let { name, subscript } = element;
      outputString += name;
      outputString += subscript === 1 ? "" : subscript;
    });
    return outputString;
  }

  stringifySide(side) {
    let terms = [];
    side.forEach((term) => {
      terms.push(this.stringifyTerm(term));
    });
    return terms.join(" + ");
  }

  result() {
    let outputString = this.stringifySide(this.leftSide);
    outputString += " = ";
    outputString += this.stringifySide(this.rightSide);
    return outputString;
  }
}

module.exports = Parser;
