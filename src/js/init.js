import * as THREE from 'three'
import { ArToolkitSource, ArToolkitContext, ArMarkerControls } from 'node-ar.js'
import OrbitControls from 'three-orbitcontrols'

export const init = {
    renderer: () => {
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
        // return renderer
        return renderer
    },
    scene: name => {
        // create a new empty scene object
        const scene = new THREE.Scene()
        // change the name of the scene so it's easily recognizable
        scene.name = name
        // return scene
        return scene
    },
    sceneGroup: (name, scene) => {
        // create a new group
        const sceneGroup = new THREE.Group()
        // change the name of the scenegroup to make it easily recognizable
        sceneGroup.name = name
        // add to the scene
        scene.add(sceneGroup)
        // return sceneGroup
        return sceneGroup
    },
    camera: (name, scene) => {
        // create a new camera object
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000)
        // change the name of the camera so it's easily recognizable
        camera.name = name
        // add the camera to the scene
        scene.add(camera)
        // return camera
        return camera
    },
    raycaster: () => {
        // create a new raycaster object
        const raycaster = new THREE.Raycaster()
        // create a new mouse object
        const mouse = new THREE.Vector2()
        // add the raycaster and mouse to the global state
        return { raycaster, mouse }
    },
    arToolkitSource: (sourceType, enable_ar, camera, renderer, onReady) => {
        // create the arToolkitSource (webcam, img)
        const _artoolkitsource = ArToolkitSource(THREE)
        const arToolkitSource = new _artoolkitsource({
            sourceType: sourceType,
        })

        // initiate the arToolkitSource
        arToolkitSource.init(() => onReady(enable_ar, camera, renderer, arToolkitSource), error => {
            console.log('The following error occured while initializing arToolkitSource:', error)
        })
        // return arToolkitSource
        return arToolkitSource
    },
    arToolkitContext: (camera, cameraParametersUrl, detectionMode) => {
        // create new arToolkitContext object
        const arToolkitContext = new ArToolkitContext({
            cameraParametersUrl: cameraParametersUrl,
            detectionMode: detectionMode
        })
        // initialize the arToolkitContext and copy the projection matrix to camera
        // when initialization is complete
        arToolkitContext.init(() =>
            camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix())
        )
        // return arToolkitContext
        return arToolkitContext
    },
    arMarkerRoot: (name, scene, sceneGroup) => {
        // create a markerRoot group
        const markerRoot = new THREE.Group()
        // change the name to make it recognizable
        markerRoot.name = name
        // add the sceneGroup to the markerRoot
        markerRoot.add(sceneGroup)
        // add it to the scene
        scene.add(markerRoot)
        // return markerRoot
        return markerRoot
    },
    arMarkerControls: (arToolkitContext, markerRoot, type, patternUrl) => {
        // create and return ArMarkerControls
        return new ArMarkerControls(arToolkitContext, markerRoot, {
            type: type, patternUrl: patternUrl
        })
    },
    orbitControls: (camera) => {
        // rotate the camera y position so the scene is seen from the front
        camera.position.y = Math.PI / 1
        // create a new OrbitControl object with camera as input
        const controls = new OrbitControls(camera)
        // update the controls
        controls.update()
        // return orbitControls
        return controls
    },
    cacheDOMElementsByID: (elementIDs) => {
        return elementIDs.map((element) => {
            const html = document.getElementById(element)
            const tagName = html.tagName

            return {
                id: element,
                html,
                tagName
            }
        })
    }
}
