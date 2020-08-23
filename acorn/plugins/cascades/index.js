/**
 * 级联操作符插件
 * @param Parser
 */
module.exports = function (Parser) {
  const acorn = Parser.acorn
  const {
    TokenType,
    tokTypes: tt
  } = acorn

  const tokTypes = {
    cascades: new TokenType('..', {
      isLoop: true,
      beforeExpr: true,
    })
  }

  // 插件相关的静态数据
  const cascades = {
    tokTypes
  }

  return class extends Parser {
    static get cascades() {
      return cascades
    }

    cascades_parseCascades() {
      this._cascadesDisabled = true
      const node = this.startNode()
      // TODO: object只当作标识符对待
      const objectNode = this.startNode()
      objectNode.name = this.value
      node.object = this.finishNode(objectNode, 'Identifier')
      node.expressions = []
      this.next()

      while (this.type === tokTypes.cascades) {
        this.next()
        const wrapper = this.startNode()
        wrapper.expression = this.parseExpression()
        node.expressions.push(this.finishNode(wrapper, 'CascadesExpression'))
      }

      this._cascadesDisabled = false
      return this.finishNode(node, 'Cascades')
    }

    getTokenFromCode(code) {
      if (code === 46 && this.input.charCodeAt(this.pos + 1) === 46) {  // ..
        this.pos += 2
        return this.finishToken(tokTypes.cascades)
      }
      return super.getTokenFromCode(code)
    }

    parseExprAtom(refDestructuringErrors) {
      if(!this._cascadesDisabled && this.type === tt.name) {
        this.skipSpace()
        if (this.input.charCodeAt(this.pos) === 46 && this.input.charCodeAt(this.pos + 1) === 46) {
          return this.cascades_parseCascades()
        }
      }
      return super.parseExprAtom(refDestructuringErrors)
    }
  }
}
