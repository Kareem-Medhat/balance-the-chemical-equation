const Parser = require("./src/parseEquation");
const process = require("process");

let parser = new Parser(process.argv[2]);

console.log(parser.result());
