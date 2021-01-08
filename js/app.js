import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'

import fragment from './shader/fragment.glsl'
import vertex from './shader/vertex.glsl'
import * as dat from 'dat.gui'
//import gsap as from 'gsap'
import matcap from '../img/matcap_solaris.png'

export default class Sketch {
    constructor(options) {
        this.scene = new THREE.Scene()

        this.stats = new Stats()
        document.body.appendChild(this.stats.dom)

        this.container = options.dom
        this.width = this.container.offsetWidth
        this.height = this.container.offsetHeight
        this.renderer = new THREE.WebGLRenderer({
            // antialias: true
        })
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(this.width, this.height)
        this.renderer.setClearColor(0xeeeeee, 1)
        this.renderer.physicallyCorrectLights = true
        this.renderer.outputEncoding = THREE.sRGBEncoding

        this.container.appendChild(this.renderer.domElement)

        // this.camera = new THREE.PerspectiveCamera(
        //     70,
        //     window.innerWidth / window.innerHeight,
        //     0.001,
        //     1000
        // )

        let frustumSize = 1
        // let aspect = window.innerWidth / window.innerHeight
        // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
        this.camera = new THREE.OrthographicCamera(frustumSize / -2, frustumSize / 2, frustumSize / 2, frustumSize / -2, -1000, 1000)
        this.camera.position.set(0, 0, 2)
        // this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.time = 0

        this.isPlaying = true

        this.mouseEvents()
        this.addObjects()
        this.resize()
        this.render()
        this.setupResize()

        this.settings();
    }

    mouseEvents() {
        this.mouse = new THREE.Vector2()
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.pageX / this.width - 0.5
            this.mouse.y = -e.pageY / this.height + 0.5
        })
    }

    settings() {
        this.settings = {
            progress: .2
        }
        this.gui = new dat.GUI()
        this.gui.add(this.settings, 'progress', 0, 1, 0.01)
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
                matcap: {
                    value: new THREE.TextureLoader().load(matcap)
                },
                resolution: {
                    type: 'v4',
                    value: new THREE.Vector4()
                },
                uvRate1: {
                    value: new THREE.Vector2(1, 1)
                }
            },
            // wireframe: true,
            // transparent: true,
            vertexShader: vertex,
            fragmentShader: fragment
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
        this.material.uniforms.mouse.value = this.mouse

        requestAnimationFrame(this.render.bind(this))
        this.renderer.render(this.scene, this.camera)

        this.stats.update()
    }
}

new Sketch({
    dom: document.getElementById('container')
})
