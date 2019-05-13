import * as THREE from 'three'
import { ArToolkitSource, ArToolkitContext, ArMarkerControls } from 'node-ar.js'
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
        // add camera to the global state store
        setState({ camera })
        // add the camera to the scene
        const { scene } = getState()
        scene.add(camera)
    },
    raycaster() {
        // create a new raycaster object
        const raycaster = new THREE.Raycaster()
        // create a new mouse object
        const mouse = new THREE.Vector2()
        // add the raycaster and mouse to the global state
        setState({ raycaster, mouse })
    },
    arToolkitSource(sourceType, onReady) {
        // create the arToolkitSource (webcam, img)
        const _artoolkitsource = ArToolkitSource(THREE)
        const arToolkitSource = new _artoolkitsource({
            sourceType: sourceType,
        })
        // initiate the arToolkitSource
        arToolkitSource.init(() => onReady(), error => {
            console.log('The following error occured while initializing arToolkitSource:', error)
        })
        // add the arToolkitSource to the global state
        setState({ arToolkitSource })
    }
}