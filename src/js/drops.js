import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js'

import Sketch from './app'
import fragment from '../shaders/fragmentDrops.glsl'
import vertex from '../shaders/vertex.glsl'

import * as dat from 'dat.gui'
// import matcapBlue from '../img/metal-blue.jpg'
import matcapBlue from '../img/metal-blue-alpha.png'
import matcapGreen from '../img/metal-green.jpg'
import matcapBlack from '../img/metal-oil.jpg'

export default class Drops {
    constructor(options) {
        this.scene = new THREE.Scene()

        this.stats = new Stats()
        document.body.appendChild(this.stats.dom)

        this.container = options.dom
        this.fragment = options.fragment
        this.width = this.container.offsetWidth
        this.height = this.container.offsetHeight
        this.renderer = new THREE.WebGLRenderer({
            alpha: true
            // antialias: true
        })
        // this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setPixelRatio(1)
        this.renderer.setSize(this.width, this.height)
        this.renderer.setClearColor(0xeeeeee, 1)
        this.renderer.physicallyCorrectLights = true
        this.renderer.outputEncoding = THREE.sRGBEncoding

        this.container.appendChild(this.renderer.domElement)

        let frustumSize = 1
        this.camera = new THREE.OrthographicCamera(frustumSize / -2, frustumSize / 2, frustumSize / 2, frustumSize / -2, -1000, 1000)
        this.camera.position.set(0, 0, 2)
        this.time = 0

        this.isPlaying = true

        this.mouseEvents()
        this.addObjects()
        this.resize()
        this.render()
        this.setupResize()
        this.settings()
    }

    mouseEvents() {
        this.mouse = new THREE.Vector2()

        let pointerEventHandler = (pos) => {
            this.mouse.x = pos.x / this.width - 0.5
            this.mouse.y = -pos.y / this.height + 0.5
        }

        document.addEventListener('mousemove', function(e) {
            pointerEventHandler({
                x: e.screenX,
                y: e.screenY
            })
        }, false)

        ;['touchstart', 'touchmove'].forEach(event => {
            document.addEventListener(event, function(e) {
                // stop touch event
                e.stopPropagation()
                e.preventDefault()

                pointerEventHandler({
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY
                })
            }, {
                passive: false
            })
        })
    }

    settings() {
        this.settings = {
            progress: .2
        }
        // this.gui = new dat.GUI()
        // this.gui.add(this.settings, 'progress', 0, 1, 0.01)
    }

    setupResize() {
        window.addEventListener('resize', this.resize.bind(this))
    }

    resize() {
        this.width = this.container.offsetWidth
        this.height = this.container.offsetHeight
        this.renderer.setSize(this.width, this.height)
        this.camera.aspect = this.width / this.height
        this.camera.updateProjectionMatrix()

        this.imageAspect = 1
        let a1, a2
        if (this.height / this.width > this.imageAspect) {
            a1 = (this.width / this.height) * this.imageAspect
            a2 = 1
        } else {
            a1 = 1
            a2 = (this.height / this.width) / this.imageAspect
        }

        this.material.uniforms.resolution.value.x = this.width
        this.material.uniforms.resolution.value.y = this.height
        this.material.uniforms.resolution.value.z = a1
        this.material.uniforms.resolution.value.w = a2
    }

    addObjects() {
        this.material = new THREE.ShaderMaterial({
            extensions: {
                derivatives: '#extension GL_OES_standard_derivatives : enable'
            },
            side: THREE.DoubleSide,
            uniforms: {
                time: {
                    type: 'f',
                    value: 0
                },
                progress: {
                    value: 0
                },
                mouse: {
                    mouse: {
                        value: new THREE.Vector2(0, 0)
                    }
                },
                matcapBlue: {
                    value: new THREE.TextureLoader().load(matcapBlue)
                },
                matcapGreen: {
                    value: new THREE.TextureLoader().load(matcapGreen)
                },
                matcapBlack: {
                    value: new THREE.TextureLoader().load(matcapBlack)
                },
                resolution: {
                    type: 'v4',
                    value: new THREE.Vector4()
                },
                uvRate1: {
                    value: new THREE.Vector2(1, 1)
                }
            },
            vertexShader: vertex,
            fragmentShader: this.fragment
        })

        this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1)

        this.plane = new THREE.Mesh(this.geometry, this.material)
        this.scene.add(this.plane)
    }

    stop() {
        this.isPlaying = false
    }

    play() {
        if (!this.isPlaying) {
            this.render()
            this.isPlaying = true
        }
    }

    render() {
        if (!this.isPlaying) return
        this.time += 0.05
        this.material.uniforms.time.value = this.time
        this.material.uniforms.progress.value = this.settings.progress
        //this.material.uniforms.progress.value = Math.sin(this.time) / 2 + 0.5
        this.material.uniforms.mouse.value = this.mouse


        requestAnimationFrame(this.render.bind(this))
        this.renderer.render(this.scene, this.camera)

        this.stats.update()
    }
}




window.drops = new Drops({
    dom: document.getElementById('container'),
    fragment: fragment
})