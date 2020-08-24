
/**
 * 级联运算符符插件
 * @param Parser
 */
module.exports = function cascades(Parser) {
  const acorn = Parser.acorn
  const {TokenType, tokTypes: tt} = acorn

  const tokTypes = {
    cascades: new TokenType('..', {
      isLoop: true,
      beforeExpr: true,
    })
  }

  return class extends Parser {
    static get cascades() {
      return {
        tokTypes
      }
    }

    cascades_parseCascades(base, startPos, startLoc) {
      this.cascades_parsing = true
      const node = this.startNodeAt(startPos, startLoc)
      let lastPos
      node.object = base
      node.expressions = []
      while (this.type === tokTypes.cascades) {
        lastPos = this.pos;
        this.next()
        if (this.type === tokTypes.cascades) {
          this.raise(lastPos, 'Expected an expression, but got ``')
        }
        const expr = this.parseExpression()
        node.expressions.push(expr)
      }
      this.cascades_parsing = false
      return this.finishNode(node, 'CascadesExpression')
    }

    getTokenFromCode(code) {
      if (code === 46 && this.input.charCodeAt(this.pos + 1) === 46) {  // ..
        this.pos += 2
        return this.finishToken(tokTypes.cascades)
      }
      return super.getTokenFromCode(code)
    }

    parseSubscript(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained) {
      if (!this.cascades_parsing && this.type === tokTypes.cascades) {
        return this.cascades_parseCascades(base, startPos, startLoc)
      }
      return super.parseSubscript(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained)
    }

    updateContext(prevType) {
      return super.updateContext(prevType);
    }
  }
}
