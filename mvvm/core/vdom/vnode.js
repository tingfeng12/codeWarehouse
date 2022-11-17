let number = 1;

export default class VNode {
    constructor(tag, elm, children, text, data, parent, nodeType) {
        this.tag = tag 
        this.elm = elm 
        this.children = children 
        this.text = text 
        this.data = data 
        this.parent = parent 
        this.nodeType = nodeType 
        this.env = {}
        this.instructions = null // 存放指令
        this.template = []
        this.number = number++
    }
}