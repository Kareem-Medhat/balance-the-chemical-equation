const EquationError = require("../errors/equationError");
const ImbalanceError = require("../errors/imbalanceError");
const combinations = require("./combinations");

function log(...a) {
  console.log(...a);
}

class Parser {
  constructor(equation) {
    if (equation.indexOf("->") === -1) throw new EquationError();
    equation = equation.replaceAll(/\s/g, "");

    this.equation = equation;
    const sides = equation.split("->");
    this.leftSideEq = sides[0];
    this.rightSideEq = sides[1];

    this.leftSide = [];
    this.rightSide = [];

    this.termLen;
    this.maxTerm = 1;
    this.attemptNum = 0;

    this.parse();
  }

  parse() {
    let termLen = 0;
    this.leftSideEq.split("+").forEach((item) => {
      let termRegex = /\d?(.+)/;
      this.leftSide.push({
        coefficient: this.maxTerm, // Start with co-efficient of 1,
        elements: this.parseElements(item),
        string: item.match(termRegex)[1],
      });
      termLen++;
    });

    this.rightSideEq.split("+").forEach((item) => {
      this.rightSide.push({
        coefficient: this.maxTerm, // Start with co-efficient of 1,
        elements: this.parseElements(item),
        string: item,
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

  /**
   * Parses compunds and elements
   * @param {string} item - Compound or element
   * @returns {array}
   */
  parseElements(item) {
    let output = [];
    let openBrackets = [];
    const regEx = /(?:([A-Z][a-z]*)(\d*))|(?:\(|\)(\d?))/g;

    const generator = item.matchAll(regEx);
    for (let match of generator) {
      let [all] = match;
      if (all === "(") {
        openBrackets.unshift([]);
      } else if (all.startsWith(")")) {
        let [subscript] = match.slice(3);
        openBrackets[0].forEach((parsed) => {
          let bracketOutput = {
            name: parsed.name,
            subscript: parsed.subscript * (+subscript || 1),
          };
          if (openBrackets[1]) {
            openBrackets[1].push(bracketOutput);
          } else {
            output.push(bracketOutput);
          }
        });
        openBrackets.shift();
      } else {
        let [element, subscript] = match.slice(1);
        subscript = +subscript || 1;

        let parsed = {
          name: element,
          subscript,
        };

        if (openBrackets[0]) {
          openBrackets[0].push(parsed);
        } else {
          output.push(parsed);
        }
      }
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
            throw new ImbalanceError();
          }
        });
      });
      return true;
    } catch (err) {
      return false;
    }
  }

  tryCombinations() {
    let allCombinations = combinations(this.maxTerm, this.termLen);
    for (let comb of allCombinations) {
      for (let [idx, num] of comb.entries()) {
        this.setCoefficient(idx, num);
      }
      if (this.check()) {
        log(comb, "✅", ` #${++this.attemptNum}`);
        return true;
      }
      log(comb, "❌", ` #${++this.attemptNum}`);
    }
    this.maxTerm++;
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
    outputString += term.string;
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
    return new Promise((resolve) => {
      this.tryCombinations();
      let outputString = this.stringifySide(this.leftSide);
      outputString += " -> ";
      outputString += this.stringifySide(this.rightSide);
      resolve(outputString);
    });
  }
}

module.exports = Parser;
