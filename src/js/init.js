import { getState, setState } from './store'
import * as THREE from 'three'
import { ArToolkitSource, ArToolkitContext, ArMarkerControls } from 'node-ar.js'
import OrbitControls from 'three-orbitcontrols'
import { typeChecker } from './typeChecker'

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
        // add to the global store
        setState({ renderer })
    },
    scene: name => {
        name = typeChecker('string', '', 'name')(name)
        // create a new empty scene object
        const scene = new THREE.Scene()
        // change the name of the scene so it's easily recognizable
        scene.name = name
        // add to the global store
        setState({ scene })
    },
    sceneGroup: name => {
        name = typeChecker('string', '', 'name')(name)

        const { scene } = getState()
        // create a new group
        const sceneGroup = new THREE.Group()
        // change the name of the scenegroup to make it easily recognizable
        sceneGroup.name = name
        // add to the scene
        scene.add(sceneGroup)
        // add to the global store
        setState({ sceneGroup })
    },
    camera: name => {
        name = typeChecker('string', '', 'name')(name)

        const { scene } = getState()
        // create a new camera object
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000)
        // change the name of the camera so it's easily recognizable
        camera.name = name
        // add the camera to the scene
        scene.add(camera)
        // add to the global store
        setState({ camera })
    },
    raycaster: () => {
        // create a new raycaster object
        const raycaster = new THREE.Raycaster()
        // create a new mouse object
        const mouse = new THREE.Vector2()
        // add to the global store
        setState({ raycaster, mouse })
    },
    arToolkitSource: ({ sourceType, onReady }) => {
        sourceType = typeChecker('string', '', 'sourceType')(sourceType)
        onReady = typeChecker('function', () => null, 'onReady')(onReady)

        const { enable_ar, camera, renderer } = getState()

        // create the arToolkitSource (webcam, img)
        const _artoolkitsource = ArToolkitSource(THREE)
        const arToolkitSource = new _artoolkitsource({ sourceType })

        // initiate the arToolkitSource
        arToolkitSource.init(() => onReady(enable_ar, camera, renderer, arToolkitSource), error => {
            console.log('The following error occured while initializing arToolkitSource:', error)
        })
        // add to the global store
        setState({ arToolkitSource })
    },
    arToolkitContext({ cameraParametersUrl, detectionMode }) {
        cameraParametersUrl = typeChecker('string', '', 'cameraParametersUrl')(cameraParametersUrl)
        detectionMode = typeChecker('string', '', 'detectionMode')(detectionMode)

        const { camera } = getState()
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
        // add to the global store
        setState({ arToolkitContext })
    },
    arMarkerRoot: name => {
        name = typeChecker('string', '', 'name')(name)

        const { scene, sceneGroup } = getState()
        // create a markerRoot group
        const markerRoot = new THREE.Group()
        // change the name to make it recognizable
        markerRoot.name = name
        // add the sceneGroup to the markerRoot
        markerRoot.add(sceneGroup)
        // add it to the scene
        scene.add(markerRoot)
        // add to the global store
        setState({ markerRoot })
    },
    arMarkerControls: ({ type, patternUrl }) => {
        type = typeChecker('string', '', 'type')(type)
        patternUrl = typeChecker('string', '', 'patternUrl')(patternUrl)

        const { arToolkitContext, markerRoot } = getState()
        // create ArMarkerControls
        new ArMarkerControls(arToolkitContext, markerRoot, {
            type: type, patternUrl: patternUrl
        })
    },
    orbitControls: () => {
        const { camera } = getState()
        // rotate the camera y position so the scene is seen from the front
        camera.position.y = Math.PI / 1
        // create a new OrbitControl object with camera as input
        const controls = new OrbitControls(camera)
        // update the controls
        controls.update()
    },
    cacheDOMElementsByID: elementIDs => {
        elementIDs = typeChecker('array', [], 'elementIDs')(elementIDs)

        const cacheDOM = elementIDs.map(element => {
            const html = document.getElementById(element)
            const tagName = html.tagName

            return {
                id: element,
                html,
                tagName
            }
        })
        // add to the global store
        setState({ cacheDOM })
    }
}
