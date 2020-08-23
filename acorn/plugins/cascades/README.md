# cascades
Acorn 级联运算符插件

实现类似 [Dart 级联运算符](https://www.dartcn.com/guides/language/language-tour#%E7%BA%A7%E8%81%94%E8%BF%90%E7%AE%97%E7%AC%A6-) 功能

## 语法特性
```js
const obj = {
  name: "",
  say() {
    console.log("Name:", this.name);
  }
}

obj
  ..name = "chen"
  ..say()
  ..name = "hello world"
  ..say()

// => "Name: chen"
// => "Name: hello world"
```

## 测试代码
[test.js](./test.js)
