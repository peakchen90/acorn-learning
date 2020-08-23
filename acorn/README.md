# Acorn Parser 源码学习

## 原始仓库 README
[readme.md](./original-readme.md)

## 源码文件及用途

- `index.js`: 入口文件
- `expression.js`: 解析表达式
- `identifier.js`: 保留字、关键字、标识符相关
- `location.js`: 位置相关
- `locutil.js`: 位置相关的一些方法、类
- `lval.js`: 左值 (left value) 相关？
- `node.js`: AST 节点相关
- `options.js`: 解析器的选项
- `parseutil.js`: 解析器的一些常用工具方法
- `regexp.js`: 解析正则表达式相关
- `scope.js`: JS 词法作用域相关
- `scopeflags.js`: JS 词法作用域的一些标志
- `state.js`: 定义 Parser 类
- `statement.js`: 解析语句（解析从这里开始）
- `tokencontext.js`: Token 上下文
- `tokenize.js`: 解析为 Token 
- `tokentype.js`: 定义 Token 的各种类型
- `unicode-property-data.js`: 
- `util.js`: 一些工具方法
- `whitespace.js`: 空白符相关的判断、正则

## 执行流程

使用 acorn 解析如下示例代码：
```js
const code = `
  const foo = "hello world";
  export default foo;
`
const ast = acorn.parse(code)
```

### 初始化 Parser
执行 `Parser.parse()` ([state.js](./src/state.js)) 静态方法，实例化 Parser 类。Parser 类的原型上绑定了很多方法，分布在各个文件里，
方便互相调用。Parser 实例上也包含了很多常用的属性，如：关键字、保留字、输入的原始代码字符串、当前的位置信息、上下文信息等，同时也包含了一些 Token 相关的一些标志，方便解析时判断。  

### 前置准备

- [TokenType 列表](./src/tokentype.js) (以下一般会以 `tt.[type]` 来表示某一 Token 类型)
- 名词解释：
  - Token: 词法分析的结果，把字符识别成一个 Token 令牌
  - 语句 Statement: 语法分析的基本单元，会基于 Token，进行语法分析
  - 消费 Token：判断当前的 Token 类型是否是指定的类型，如果是，则移到下一个 Token，并返回 `true`, 否则返回 `false`

### 开始解析
解析时，会通过一个原型方法调用另一个原型方法，调用栈很深。为了方便理解，按照调用顺序依次说明每个方法的用途。

##### `this.parse()`
开始解析。先调用 `this.startNode()` 创建一个新节点，然后调用 `this.nextToken()` 读取移动到下一个 Token, 并调用 `this.parseTopLevel()` 开始解析顶层节点。

##### `this.startNode()` 

创建并返回一个新节点对象，包含初始位置信息。

#### 解析 Token（词法分析）

> 解析 Token 在 [src/tokenize.js 文件里](./src/tokenize.js)

##### `this.nextToken()`

读取单个 Token，并更新 Parser 对象上 token 相关的属性。这个方法里会判断字符是否结束，并有机会调用 `this.readToken()` 读取 Token.

##### `this.readToken()`

读取 Token, 如果首字符满足标识符，则调用 `this.readWord()` 解析整个单词，否则调用 `this.getTokenFromCode()` 作为操作符解析。这里要考虑转义符、字符码点超过 `0xffff` 等情况。`this.readWord()` 返回的单词会判断是否是关键字，然后来区分关键字 Token 和其他 `tt.name` Token.

#### 解析语句（语法分析）

> 以下方法针对不同类型的语句有不同的处理方法，下面仅以解析变量声明语句作为示例。 完整的不同类型的语句解析在 [src/statement.js 文件里](./src/statement.js)

##### `this.parseTopLevel()` 
解析包装顶层节点，正式进入到解析流程。这个方法会依次调用 `this.parseStatement()` 方法解析每一条语句（上面实例会调用2次该方法）。

##### `this.parseStatement()`
解析单条语句。解析一条语句时，通常都可以通过开头的关键字来识别。比如：开始 Token 如果是 `tt._do, ` 则调用 `this.parseDoStatement()` 当作 do 循环解析；开始 Token 如果是 `tt._if`,  则调用 `this.parseIfStatement()` 当作 if 语句解析。示例中，第一个 Token 是 `tt._const`, 则作为变量声明解析，调用 `this.parseVarStatement()` 方法。

##### `this.parseVarStatement()`

解析变量声明语句。移到下一个 Token (`tt._const` 的下一个，此时 Token 是 `tt._name` 且 `this.value = 'foo'`)，`this.parseVar()` 解析变量声明。

##### `this.parseVar()`

解析变量声明（可能有多条，如：`const a = 1, b = 2;`）。循环依次解析 Token，每遇到一个逗号(`,`)，会作为新的一个变量声明，直到不能遇到逗号后，循环结束。

1. 调用 `this.parseVarId()` 去解析变量名，会去检测是否涉及到解构，这里就不深入展开了。
2. 然后会消费一个等号 (`=`)。如果消费成功，则调用 `this.parseMaybeAssign()` 解析赋值语句；否则，变量初始化值为 `null`.
3. 然后如果遇到一个逗号(`,`)，消费它并进入下一个解析变量声明的流程中；否则，整个解析变量声明流程结束。

到这里，示例中的第一条语句（示例中的 `const foo = "hello world";`）已经解析完成。调用 `this.finishNode()` 方法完善节点的结束位置信息。紧接着，就开始解析下一条语句了（示例中的 `export default foo;`），跟解析变量声明类似。所有的语句都解析完成后，调用 `this.finishNode()` 方法完成 `Program` 节点。至此，解析流程就基本完成了。

#### 解析流程总结

acorn 是一边解析 Token，一边解析语句，由语法分析的需要去推动解析 Token。大致的调用流程如下：
![acorn解析流程图](https://wx1.sbimg.cn/2020/08/23/3ItQn.png)

> PS: 流程图片查看不了请 [访问国内CDN地址](https://wx1.sbimg.cn/2020/08/23/3ItQn.png)




## 链接
- [ASCII 码参考](https://baike.baidu.com/item/ASCII#3)























