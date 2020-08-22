# Acorn Parser 源码学习

## 原始仓库 README
[original-readme.md](./original-readme.md)

## 源码文件及用途

- `index.js`: 入口文件
- `expression.js`: 解析表达式
- `identifier.js`: 保留字、关键字、标识符相关
- `location.js`: 位置相关
- `locutil.js`: 位置相关的一些方法、类
- `lval.js`: 左值 (left value) 相关
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
acorn.parse(`
  var foo = "hello world";
`)
```


## 链接
[ASCII 码参考](https://baike.baidu.com/item/ASCII#3)
