import { mergeAttr } from "../util/ObjectUtil.js";
import VNode from "../vdom/vnode.js";
import { vforInit } from "./grammer/vfor.js";
import { vmodel } from "./grammer/vmodel.js";
import { checkVBind } from "./grammer/vbind.js";
import { prepareRender, getVNodeByTemplate, clearMap } from "./render.js";
import { checkVOn } from "./grammer/von.js";

export function initMount(Due) {
    Due.prototype.$mount = function(el){
        let vm = this;
        let rootDom = document.getElementById(el);
        mount(vm, rootDom)
    }
}

export function mount(vm, elm) {
    vm._vnode = constructVNode(vm, elm, null)
    prepareRender(vm,vm._vnode)
}

function constructVNode(vm, elm, parent){
    let vnode = analvsisAttr(vm, elm, parent);
    console.log(vnode)
    if( vnode == null){
        let children = []
        let text = getNodeText(elm);
        let data = null
        let nodeType = elm.nodeType
        let tag = elm.nodeName
        vnode = new VNode(tag, elm, children, text, data, parent, nodeType)
        if(elm.nodeType == 1 && elm.getAttribute("env")){
            vnode.env = mergeAttr(vnode.env, JSON.parse( elm.getAttribute("env")))
        }else {
            vnode.env = mergeAttr(vnode.env, parent ? parent.env : {})
        }
    }
    checkVBind(vm, vnode)
    checkVOn(vm, vnode)
    let childs = vnode.nodeType == 0 ? vnode.parent.elm.childNodes : vnode.elm.childNodes
    let len = vnode.nodeType == 0 ? vnode.parent.elm.childNodes.length : vnode.elm.childNodes.length
    for (let i=0;i<len;i++){
        let childNodes = constructVNode(vm, childs[i], vnode)
        if(childNodes instanceof VNode){
            vnode.children.push(childNodes)
        } else {
            vnode.children = vnode.children.concat(childNodes)
        }
    }
    return vnode
}

function getNodeText(elm) {
    if (elm.nodeType == 3){
        return elm.nodeValue
    } else {
        return ''
    }
}

function analvsisAttr(vm, elm, parent){
    if(elm.nodeType == 1){
        let attrNames = elm.getAttributeNames()
        console.log(elm.nodeName)
        if(attrNames.indexOf('v-for') > -1){
            console.log(elm)
            return vforInit(vm, elm.getAttribute("v-for"), elm, parent)
        }
        if(attrNames.indexOf('v-model') > -1){
            return vmodel(vm, elm, elm.getAttribute("v-model"))
        }

    }
}

export function rebuild(vm, template){
    let virtualNode = getVNodeByTemplate(template)
    for (let i = 0; i < virtualNode.length; i++) {
        virtualNode[i].parent.elm.innerHTML = ""
        virtualNode[i].parent.elm.appendChild(virtualNode[i].elm)
        let result = constructVNode(vm, virtualNode[i].elm, virtualNode[i].parent)
        virtualNode[i].parent.children = [result]
        clearMap()
        prepareRender(vm, vm._vnode)
    }
}