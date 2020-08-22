import {Parser} from "./state.js"
import {SourceLocation} from "./locutil.js"

export class Node {
  constructor(parser, pos, loc) {
    this.type = ""
    this.start = pos
    this.end = 0
    if (parser.options.locations)
      this.loc = new SourceLocation(parser, loc)
    if (parser.options.directSourceFile)
      this.sourceFile = parser.options.directSourceFile
    if (parser.options.ranges)
      this.range = [pos, 0]
  }
}

const pp = Parser.prototype

// Start an AST node, attaching a start offset.
// 开始一个 AST 节点，并附加一个开始位置

pp.startNode = function() {
  return new Node(this, this.start, this.startLoc)
}

pp.startNodeAt = function(pos, loc) {
  return new Node(this, pos, loc)
}

// Finish an AST node, adding `type` and `end` properties.
// 完成 AST 节点，添加 `type` and `end` 属性

function finishNodeAt(node, type, pos, loc) {
  node.type = type
  node.end = pos
  if (this.options.locations)
    node.loc.end = loc
  if (this.options.ranges)
    node.range[1] = pos
  return node
}

pp.finishNode = function(node, type) {
  return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc)
}

// Finish node at given position
// 在给定的位置完成 node 节点

pp.finishNodeAt = function(node, type, pos, loc) {
  return finishNodeAt.call(this, node, type, pos, loc)
}

pp.copyNode = function(node) {
  let newNode = new Node(this, node.start, this.startLoc)
  for (let prop in node) newNode[prop] = node[prop]
  return newNode
}
