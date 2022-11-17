import { initMixin } from './init.js'
import { rendertMixin } from './render.js'

function Due(options){
    this._init(options)
    if(this._created != null){
        this._created.call(this)
    }
    this._render()

}

initMixin(Due)
rendertMixin(Due)

export default Due