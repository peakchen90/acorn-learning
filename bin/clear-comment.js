function clearComment(input) {
  let rows = input.trim().split(/\n/)
  rows = rows.map(row => row.replace(/^\s*\/\/\s*(.*?)\s*$/, '$1'))
  rows = rows.map(row => row ? row : '\n')
  return rows.join(' ');
}

const str = `
 // If the statement does not start with a statement keyword or a
    // brace, it's an ExpressionStatement or LabeledStatement. We
    // simply start parsing an expression, and afterwards, if the
    // next token is a colon and the expression was a simple
    // Identifier node, we switch to interpreting it as a label.
`

console.log(clearComment(str))
