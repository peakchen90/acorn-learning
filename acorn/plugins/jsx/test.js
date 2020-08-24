const acorn = require('../../dist/acorn');
const escodegen = require('escodegen');

const code = `
const abc = <div>{name}</div>
`

const Parser = acorn.Parser.extend(
  require('./index')()
)

const ast = Parser.parse(code, {
  sourceType: 'module',
  locations: true
})

console.log(ast)
