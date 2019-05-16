// set the use strict for accidental creation of global variables
"use strict"

import { getState, setState } from './store'
import { init } from './init'
import { events } from './events'
import { video } from './video'
import { loadingManager } from './loadingManager'

// the following configures wether to use AR or not
setState({ enable_ar: false })

main()

async function main() {
    // initialise everything
    initialise()
    // build the scene - The await is necessary because of the async actions.
    // Otherwise animate will happen before all the objects are build.
    await buildScene()
    // add event handling
    addEventHandling()
    // Run animate loop
    animateScene()
}

function initialise() {
    // initialize the renderer
    init.renderer()
    // initialize the scene
    init.scene('scene')
    // initialize sceneGroup
    init.sceneGroup('sceneGroup')
    // initialize the camera
    init.camera('camera')
    // initialize the raycaster
    init.raycaster()
    // check if AR is enabled
    const { enable_ar } = getState()

    if (enable_ar) {
        // initialize arToolkitSource
        init.arToolkitSource({ sourceType: 'webcam', onReady: events.onResize })
        // initialize arToolkitContext
        init.arToolkitContext({ cameraParametersUrl: '../assets/ar-markers/camera_para.dat', detectionMode: 'mono' })
        // initialize arMarkerRoots
        init.arMarkerRoot('markerRoot')
        // initialize arMarkerControls
        init.arMarkerControls({ type: 'pattern', patternUrl: '../assets/ar-markers/hiro.patt' })

    } else {
        // initialize OrbitControls
        init.orbitControls()
    }
    // cache DOM elements which need to be interacted with by ID
    init.cacheDOMElementsByID([ 'video' ])
}

async function buildScene() {
    const { sceneGroup } = getState()
    // load accenture logo
    const accentureLogo = await loadingManager.loadObject({ url: '../assets/3d-models/accenture-ar.gltf', loaderType: 'GLTF' })
    // configure accentureLogo
    accentureLogo.scene.name = 'accenture-log'
    accentureLogo.scene.scale.set(0.2, 0.2, 0.2)
    accentureLogo.scene.rotation.x = -Math.PI / 2
    accentureLogo.scene.position.z = - 0.8
    accentureLogo.scene.castShadow = true
    // add to sceneGroup
    sceneGroup.add(accentureLogo.scene)

    // create Lighting
    const ambientLight = new THREE.AmbientLight(0x6F6666, 2)
    const pointLight = new THREE.PointLight(0xFFFFFF, 1, 100)
    // configure Pointlight
    pointLight.position.set(0, 4, 0)
    pointLight.castShadow = true
    // add to sceneGroup
    sceneGroup.add(ambientLight)
    sceneGroup.add(pointLight)

    // create Video object
    const videoElement = video.getVideoHTMLelementByID('video')
    const videoTexture = new THREE.VideoTexture(videoElement)
    const videoMesh =
        new THREE.Mesh(
            new THREE.BoxGeometry(.16, .01, .09),
            new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.FrontSide })
        )
    // configure video object
    videoMesh.name = 'video'
    // add video to the sceneGroup
    sceneGroup.add(videoMesh)
}

function addEventHandling() {
    // EVENT HANDLING CONFIG
    const { enable_ar, camera, renderer, arToolkitSource, raycaster, mouse, scene } = getState()
    const videoElement = video.getVideoHTMLelementByID('video')
    // create an array of objects with their corresponding actions to add to the eventListeners
    const objectsClickActions = [
        {
            objectName: 'video',
            htmlElement: videoElement,
            action: video.playPause
        }
    ]
    // add eventlistener for window resizing & click/touch events
    events({
        objectsClickActions,
        enable_ar,
        camera,
        renderer,
        arToolkitSource,
        raycaster,
        mouse,
        scene
    }).addEventListeners()

}

// run game loop (update, render, repeat)
async function animateScene() {
    const { scene, enable_ar } = getState()

    const video = await scene.getObjectByName('video')

    let x = video.scale.x
    let y = video.scale.y
    let z = video.scale.z
    // Animate scaling of video
    if (x <= 10) {
        x += 0.1
        z += 0.1
        video.scale.set(x, y, z)
    }

    requestAnimationFrame(animateScene)

    enable_ar ? updateArToolkit() : null

    render()
}

// update logic
function updateArToolkit() {
    const { arToolkitSource, arToolkitContext } = getState()

    if (arToolkitSource.ready)
        arToolkitContext.update(arToolkitSource.domElement)

}

// draw scene
function render() {
    const { renderer, scene, camera } = getState()
    renderer.render(scene, camera)
}