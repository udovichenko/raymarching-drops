import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js'

import fragment from './shader/fragment.glsl'
import vertex from './shader/vertex.glsl'
import * as dat from 'dat.gui'
import matcap0 from '../img/sasha.png'
import matcap1 from '../img/grey-gloss.png'
import matcap2 from '../img/green-red-medium.png'
import matcap3 from '../img/green-red-blur.png'
import matcap4 from '../img/red-metal.png'
import matcap5 from '../img/solaris.png'
import matcap6 from '../img/horizon.png'
import matcap7 from '../img/black-gloss.png'
import matcap8 from '../img/orange-metal.png'
import matcap9 from '../img/red-violet-plastic.png'
import matcap10 from '../img/yellow-violet-plastic.png'
import matcap11 from '../img/grey-metal.png'
import matcap12 from '../img/dark-violet.png'
import matcap13 from '../img/space-grey.png'
import matcap14 from '../img/steel.png'

export default class Sketch {
    activeMatcapId = 0
    activeMatcapId2 = 7
    matcaps = [
        matcap0,
        matcap1,
        matcap2,
        matcap3,
        matcap4,
        matcap5,
        matcap6,
        matcap7,
        matcap8,
        matcap9,
        matcap10,
        matcap11,
        matcap12,
        matcap13,
        matcap14,
    ]

    constructor(options) {
        this.scene = new THREE.Scene()

        this.stats = new Stats()
        document.body.appendChild(this.stats.dom)

        // this.matcaps.map(img => {
        //     img = new THREE.TextureLoader().load(img)
        //     return img
        // })

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

        let frustumSize = 1
        // let aspect = window.innerWidth / window.innerHeight
        // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
        this.camera = new THREE.OrthographicCamera(frustumSize / -2, frustumSize / 2, frustumSize / 2, frustumSize / -2, -1000, 1000)
        this.camera.position.set(0, 0, 2)
        // this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.time = 0

        this.isPlaying = true

        document.addEventListener('click', () => {
            this.activeMatcapId = (this.activeMatcapId !== this.matcaps.length - 1)
                ? this.activeMatcapId + 1
                : 0

            if (this.activeMatcapId2 > this.matcaps.length - 4) {
                this.activeMatcapId2 = this.matcaps.length % this.activeMatcapId2
            } else {
                this.activeMatcapId2++
            }

            this.material.uniforms.matcap.value = new THREE.TextureLoader().load(this.matcaps[this.activeMatcapId])
            this.material.uniforms.matcap2.value = new THREE.TextureLoader().load(this.matcaps[this.activeMatcapId2])
        })

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
                matcap: {
                    // value: new THREE.TextureLoader().load(matcap)
                    value: new THREE.TextureLoader().load(matcap0)
                },
                matcap2: {
                    // value: new THREE.TextureLoader().load(matcap)
                    value: new THREE.TextureLoader().load(matcap8)
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
        //this.material.uniforms.progress.value = Math.sin(this.time) / 2 + 0.5
        this.material.uniforms.mouse.value = this.mouse


        requestAnimationFrame(this.render.bind(this))
        this.renderer.render(this.scene, this.camera)

        this.stats.update()
    }
}

window.drops = new Sketch({
    dom: document.getElementById('container')
})
