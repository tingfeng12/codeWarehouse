import { mount } from './mount.js';
import { constructProxy} from './proxy.js'

let uid = 0;

export function initMixin(Due){
    Due.prototype._init = function(options){
        const vm = this;
        vm.uid = uid ++
        vm._isDue = true
        // 初始化 data  created methods computed el并挂载
        if(options && options.data){
            vm._data = constructProxy(vm, options.data, "")
        }
        if(options && options.created){
            vm._created = options.created
        }
        
        if(options && options.methods){
            vm._methods = options.methods
            for (const temp in options.methods) {
                vm[temp] = options.methods[temp]
            }
        }
        if(options && options.el){
            let rootDom = document.getElementById(options.el)
            mount(vm, rootDom)
        }
    }
}