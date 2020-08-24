"use strict";

var acorn = require('../../dist/acorn');

var escodegen = require('escodegen');

var code = "\nconst abc = <div>{name}</div>\n";
var Parser = acorn.Parser.extend(require('./index')());
var ast = Parser.parse(code, {
  sourceType: 'module',
  locations: true
});
console.log(ast);