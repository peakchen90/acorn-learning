import {reservedWords, keywords} from "./identifier.js"
import {types as tt} from "./tokentype.js"
import {lineBreak} from "./whitespace.js"
import {getOptions} from "./options.js"
import {wordsRegexp} from "./util.js"
import {SCOPE_TOP, SCOPE_FUNCTION, SCOPE_ASYNC, SCOPE_GENERATOR, SCOPE_SUPER, SCOPE_DIRECT_SUPER} from "./scopeflags.js"

export class Parser {
  constructor(options, input, startPos) {
    this.options = options = getOptions(options)
    this.sourceFile = options.sourceFile
    this.keywords = wordsRegexp(keywords[options.ecmaVersion >= 6 ? 6 : options.sourceType === "module" ? "5module" : 5])
    let reserved = ""
    if (options.allowReserved !== true) {
      for (let v = options.ecmaVersion;; v--)
        if (reserved = reservedWords[v]) break
      if (options.sourceType === "module") reserved += " await"
    }
    this.reservedWords = wordsRegexp(reserved)
    let reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict
    this.reservedWordsStrict = wordsRegexp(reservedStrict)
    this.reservedWordsStrictBind = wordsRegexp(reservedStrict + " " + reservedWords.strictBind)
    this.input = String(input)

    // Used to signal to callers of `readWord1` whether the word
    // contained any escape sequences. This is needed because words with
    // escape sequences must not be interpreted as keywords.
    // 用于向 `readWord1` 的调用者发出信号，告知该单词是否包含任何转义序列。这是必需的，因为带有转义序列的单词一定不能解释为关键字。
    this.containsEsc = false

    // Set up token state

    // The current position of the tokenizer in the input.
    if (startPos) {
      this.pos = startPos
      this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1
      this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length
    } else {
      this.pos = this.lineStart = 0
      this.curLine = 1
    }

    // Properties of the current token:  当前 token 的一些属性
    // Its type - 类型
    this.type = tt.eof
    // For tokens that include more information than their type, the value - 比类型包含更多信息
    this.value = null
    // Its start and end offset - 开始和结束位置
    this.start = this.end = this.pos
    // And, if locations are used, the {line, column} object
    // corresponding to those offsets 位置信息
    this.startLoc = this.endLoc = this.curPosition()

    // Position information for the previous token - 前一个 token 的位置信息
    this.lastTokEndLoc = this.lastTokStartLoc = null
    this.lastTokStart = this.lastTokEnd = this.pos

    // The context stack is used to superficially track syntactic
    // context to predict whether a regular expression is allowed in a
    // given position.
    // 上下文堆栈用于表面跟踪语法上下文，以预测在给定位置是否允许使用正常的表达式。
    this.context = this.initialContext()
    this.exprAllowed = true

    // Figure out if it's a module code. - 是否是模块代码
    this.inModule = options.sourceType === "module"
    this.strict = this.inModule || this.strictDirective(this.pos)

    // Used to signify the start of a potential arrow function
    // 用于表示潜在箭头函数的开始
    this.potentialArrowAt = -1

    // Positions to delayed-check that yield/await does not exist in default parameters.
    // 延迟检查位置上是否存在 yield/await
    this.yieldPos = this.awaitPos = this.awaitIdentPos = 0
    // Labels in scope. - 作用域内的 label（和 break 或 continue 语句一起使用）
    this.labels = []
    // Thus-far undefined exports. - 迄今未定义的导出
    this.undefinedExports = {}

    // If enabled, skip leading hashbang line.
    // 如果启用，请跳过哈希行开头（一般在 node 命令行常见）
    if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === "#!")
      this.skipLineComment(2)

    // Scope tracking for duplicate variable names (see scope.js)
    // 跟踪是否有重复的变量名
    this.scopeStack = []
    this.enterScope(SCOPE_TOP)

    // For RegExp validation - 正则表达式的验证状态
    this.regexpState = null
  }

  parse() {
    let node = this.options.program || this.startNode()
    this.nextToken()
    return this.parseTopLevel(node)
  }

  get inFunction() { return (this.currentVarScope().flags & SCOPE_FUNCTION) > 0 }
  get inGenerator() { return (this.currentVarScope().flags & SCOPE_GENERATOR) > 0 }
  get inAsync() { return (this.currentVarScope().flags & SCOPE_ASYNC) > 0 }
  get allowSuper() { return (this.currentThisScope().flags & SCOPE_SUPER) > 0 }
  get allowDirectSuper() { return (this.currentThisScope().flags & SCOPE_DIRECT_SUPER) > 0 }
  get treatFunctionsAsVar() { return this.treatFunctionsAsVarInScope(this.currentScope()) }
  get inNonArrowFunction() { return (this.currentThisScope().flags & SCOPE_FUNCTION) > 0 }

  static extend(...plugins) {
    let cls = this
    for (let i = 0; i < plugins.length; i++) cls = plugins[i](cls)
    return cls
  }

  static parse(input, options) {
    return new this(options, input).parse()
  }

  static parseExpressionAt(input, pos, options) {
    let parser = new this(options, input, pos)
    parser.nextToken()
    return parser.parseExpression()
  }

  static tokenizer(input, options) {
    return new this(options, input)
  }
}
