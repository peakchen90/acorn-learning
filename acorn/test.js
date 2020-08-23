const acorn = require('./dist/acorn');

const code = `
  const foo = "hello world";
  export default foo;
`

const ast = acorn.parse(code, {
  sourceType: 'module',
  locations: true
});

console.log(ast);
