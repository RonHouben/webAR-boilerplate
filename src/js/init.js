import * as THREE from 'three'
import { getState, setState } from './store'

export const init = {
    renderer() {
        // create new renderer object
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        })
        // set renderer color
        renderer.setClearColor(new THREE.Color('lightgrey'), 0)
        // set renderer size
        renderer.setSize(window.innerWidth, window.innerHeight)
        // add renderer to the DOM
        document.body.appendChild(renderer.domElement)
        // add renderer to the global state store
        setState({ renderer })
    },
    scene() {
        // create a new empty scene object
        const scene = new THREE.Scene()
        // change the name of the scene so it's easily recognizable
        scene.name = 'scene'
        // add scene to the global state store
        setState({ scene })
    },
    camera() {
        // create a new camera object
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000)
        // change the name of the camera so it's easily recognizable
        camera.name = 'camera'
        // add the camera to the scene
        const { scene } = getState()
        scene.add(camera)
    }
}