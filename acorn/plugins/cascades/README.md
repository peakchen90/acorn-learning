# cascades
Acorn 级联运算符插件

实现类似 [Dart 级联运算符](http://suo.im/5EjOjK) 功能

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
