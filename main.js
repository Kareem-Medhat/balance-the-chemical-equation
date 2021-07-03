#!/usr/bin/env node
const Parser = require("./src/parseEquation");
const process = require("process");

let parser = new Parser(process.argv[2]);

parser.result({
	isColored: true
}).then((result) => console.log(result));
