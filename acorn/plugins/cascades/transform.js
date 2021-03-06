// 转换为标准的 ES
const walk = require('../../../acorn-walk/dist/walk')

function buildMemberExpression(object, property, computed = false) {
  return {
    type: "MemberExpression",
    object,
    property,
    computed
  }
}

module.exports = function transformCascades(ast) {
  walk.simple(ast, {
    CascadesExpression(node) {
      const object = node.object
      const expressions = node.expressions.map((expression) => {
        switch (expression.type) {
          case 'Identifier':
            return buildMemberExpression(object, expression)
          case 'MemberExpression':
            expression.object = buildMemberExpression(object, expression.object)
            return expression
          case 'AssignmentExpression':
          case 'BinaryExpression':
          case 'LogicalExpression':
            expression.left = buildMemberExpression(object, expression.left)
            return expression
          case 'UpdateExpression':
            expression.argument = buildMemberExpression(object, expression.argument)
            return expression
          case 'ConditionalExpression':
            expression.test = buildMemberExpression(object, expression.test)
            return expression
          case 'CallExpression':
            expression.callee = buildMemberExpression(object, expression.callee)
            return expression
          default:
            throw new SyntaxError('Unexpected Error')
        }
      })

      node.type = 'ExpressionStatement'
      node.expression = {
        type: 'SequenceExpression',
        expressions
      }
      delete node.object
    }
  }, {
    ...walk.base,
    CascadesExpression(node, state, c) {
      // base visitor
    }
  })
}
