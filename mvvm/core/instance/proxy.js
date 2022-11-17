import { rebuild } from './mount.js';
import { renderData } from './render.js'

const arrayProto = Array.prototype
function defArrayFunc(obj, func, namespace, vm) {
    Object.defineProperty(obj, func, {
        enumerable: true,
        configurable: true,
        value: function(...args){
            let original = arrayProto[func];
            const result = original.apply(this, args);
            rebuild(vm, getNameSpace(namespace, ""))
            renderData(vm, getNameSpace(namespace, ""))
            return result;
        }
    })
}

function proxyArr (vm, arr, namespace){
    let obj = {
        eleType: "Array",
        toString: function(){
            let result =""
            for(let i=0; i<arr.length;i++){
                result +=arr[i]+', '
            }
            return result.substring(0, result.length - 2)
        },
        push(){},
        pop(){},
        shift(){},
        unshift(){},
    }
    defArrayFunc.call(vm, obj, 'push', namespace, vm)
    defArrayFunc.call(vm, obj, 'pop', namespace, vm)
    defArrayFunc.call(vm, obj, 'shift', namespace, vm)
    defArrayFunc.call(vm, obj, 'unshift', namespace, vm)
    arr.__proto__ = obj
    return arr
}

function constructObjectProxy(vm, obj, namespace) {
    let proxyObj = {}
    for (let prop in obj){
        Object.defineProperty(proxyObj, prop, {
            configurable: true,
            get() {
                return obj[prop]
            },
            set: function(value){
                obj[prop] = value
                renderData(vm, getNameSpace(namespace, prop))
            }
        })
        Object.defineProperty(vm, prop, {
            configurable: true,
            get(){
                return obj[prop]
            },
            set: function(value){
                console.log( getNameSpace(namespace, prop))
                obj[prop] = value
                renderData(vm, getNameSpace(namespace, prop))
            }
        })
        if(obj[prop] instanceof Object){
            proxyObj[prop] = constructProxy(vm, obj[prop], getNameSpace(namespace, prop))
        }
    }
    return proxyObj
}

export function constructProxy(vm, obj, namespace) {
    let proxyObj = {}
    if (obj instanceof Array) {
        console.log(obj)
        proxyObj = new Array(obj.length)
        for (let i=0;i<proxyObj.length;i++){
            proxyObj[i] = constructProxy(vm, obj[i], namespace)
        }
        proxyObj = proxyArr(vm, obj, namespace)
    } else if (obj instanceof Object) {
        proxyObj = constructObjectProxy(vm, obj, namespace)
    } else {
        throw new Error('error')
    }
    return proxyObj
}

function getNameSpace(nowNameSpace, newProp){
    if(nowNameSpace == null || nowNameSpace == ""){
        return newProp
    }else if(newProp == null || newProp == ""){
        return nowNameSpace
    }else{
        return nowNameSpace+'.'+newProp
    }
}