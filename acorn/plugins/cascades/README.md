# cascades
Acorn 级联操作符插件

## 特性
```
const obj = {
  name: "",
  say() {
    console.log(this.name);
  }
}

obj
  ..name = "chen"
  ..say()

// => "chen"
```
