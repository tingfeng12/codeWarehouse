import { getValue } from "../util/ObjectUtil.js"

let template2Vnode = new Map()
let vnode2Template = new Map()

export function rendertMixin (Due){
    Due.prototype._render = function(){
        renderNode(this, this._vnode)
    }
}

export function renderData(vm, data){
    let vnodes = template2Vnode.get(data)
    if(vnodes){
        for (let i = 0; i < vnodes.length; i++) {
            renderNode(vm, vnodes[i])
        }
    }
}

export function renderNode(vm, vnode){
    if(vnode.nodeType == 3){
        let templates = vnode2Template.get(vnode)
        if(templates){
            let result = vnode.text
            for(let i=0;i<templates.length;i++){
                let templateValue = getTemplateValue([vm._data, vnode.env], templates[i])
                if( templateValue){
                    result = result.replace(`{{${templates[i]}}}`, templateValue)
                }
            }
            vnode.elm.nodeValue = result
        }
    } else if( vnode.nodeType == 1 && vnode.tag =="INPUT"){
        let templates = vnode2Template.get(vnode)
        if(templates){
            console.log(templates)
            for (let i = 0; i < templates.length; i++) {
                let templateValue = getTemplateValue([vm._data, vnode.env], templates[i])
                console.log(templateValue);
                if(templateValue){
                    vnode.elm.value = templateValue
                }
            }
        }
    } else {
        for(let i=0;i<vnode.children.length;i++){
            renderNode(vm,vnode.children[i])
        }
    }
}

export function prepareRender(vm, vnode){
    if(vnode == null) {
        return 
    }
    if(vnode.nodeType == 3){
        analysisTemplateString(vnode)
    }
    if( vnode.nodeType == 0){
        setTemplate2Vnode(vnode.data, vnode)
        setVnode2Template(vnode.data, vnode)
    }
    analysisAttr(vm, vnode)
    for (let i=0;i<vnode.children.length;i++){
        prepareRender(vm, vnode.children[i])
    }
}

function analysisTemplateString(vnode){
    let templateStringList = vnode.text.match(/{{[a-zA-Z0-9_.]+}}/g)
    for(let i=0; templateStringList && i<templateStringList.length;i++){
        setTemplate2Vnode(templateStringList[i], vnode)
        setVnode2Template(templateStringList[i], vnode)
    }
}

function setTemplate2Vnode(template,vnode){
    let templateName = getTemplateName(template)
    let vnodeSet = template2Vnode.get(templateName)
    if(vnodeSet){
        vnodeSet.push(vnode)
    }else{
        template2Vnode.set(templateName, [vnode])
    }
}

function setVnode2Template(template,vnode){
    let templateSet = vnode2Template.get(vnode)
    if(templateSet){
        templateSet.push(getTemplateName(template))
    }else{
        vnode2Template.set(vnode, [getTemplateName(template)])
    }
}

function getTemplateName(template){
    if(template.substring(0, 2)=="{{" && template.substring(template.length - 2,template.length) == "}}" ){
        return template.substring(2,template.length - 2)
    }else {
        return template
    }
}

export function getTemplate2Vnode(){
    return template2Vnode
}
export function getVnode2Template(){
    return vnode2Template
}

function getTemplateValue(objs, templateName){
    for(let i=0;i<objs.length;i++){
        let temp = getValue(objs[i], templateName)
        if(temp != null){
            return temp;
        }
    }
    return null
}

function analysisAttr(vm, vnode){
    if(vnode.nodeType != 1){
        return
    }
    let attrNames = vnode.elm.getAttributeNames();
    if(attrNames.indexOf('v-model') > -1){
        setTemplate2Vnode(vnode.elm.getAttribute("v-model"), vnode)
        setVnode2Template(vnode.elm.getAttribute("v-model"), vnode)
    }
}

export function getVNodeByTemplate(template){
    return template2Vnode.get(template)
}
export function clearMap(){
    template2Vnode.clear()
    vnode2Template.clear()
}