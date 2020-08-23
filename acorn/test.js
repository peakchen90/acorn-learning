const acorn = require('./dist/acorn');

const code = `
const obj = {
  name: "",
  say() {
    console.log(this.name);
  }
}

obj
  ..name = "chen"
  ..say()
`

const Parser = acorn.Parser.extend(
  require('./plugins/cascades')
)

const ast = Parser.parse(code, {
  sourceType: 'module',
  locations: true
});

console.log(ast);
