import Sketch from './app'
import fragment from '../shaders/fragmentSmooth.glsl'

window.drops = new Sketch({
    dom: document.getElementById('container'),
    fragment: fragment
})