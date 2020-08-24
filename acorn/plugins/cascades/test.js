const acorn = require('../../dist/acorn');
const escodegen = require('escodegen');
const transformCascades = require('./transform');

const code = `
const obj = {
  name: "",
  say() {
    console.log("Name:", this.name);
  }
}

obj
  ..name = "chen"
  ..say()
  ..name = "hello world"
  ..say()
`

const Parser = acorn.Parser.extend(
  require('./index')
)

const ast = Parser.parse(code, {
  sourceType: 'module',
  locations: true
});
transformCascades(ast);
const newCode = escodegen.generate(ast);

console.log('\n\n--------------- Transform Code -----------------\n')
console.log(newCode)

console.log('\n\n-------------- Execute Result --------------\n')
eval(newCode)
