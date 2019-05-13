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
        // add renderer to the global state storeå
        setState({ renderer })
    }
}