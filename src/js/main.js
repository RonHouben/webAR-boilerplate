// set the use strict for accidental creation of global variables
"use strict"

import * as THREE from 'three'
import { getState, setState } from './store'
import { init } from './init'
import { events } from './events'
import { video } from './video'
import { modelLoader } from './3dModelLoader'

// the following configures wether to use AR or not
setState({ enable_ar: false })
// initialise everything
initialise()
// build the scene
buildScene()
// event handling
eventHandling()
// Run animate loop
animate()

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
        const { camera } = getState()
        init.orbitControls(camera)
    }
    // cache DOM elements which need to be interacted with by ID
    init.cacheDOMElementsByID([ 'video' ])
}

function buildScene() {
    // START BUILDING THE SCENE
    const { sceneGroup } = getState()

    // Create new 3D model loader
    const GLTFLoader = modelLoader.createNewLoader('GLTF')
    // Load a GLTF resource and add it to the sceneGroup
    GLTFLoader.load(
        '../assets/3d-models/accenture-ar.gltf',
        function(group) {
            const model = group.scene

            model.scale.set(0.2, 0.2, 0.2)
            model.rotation.x = -Math.PI / 2
            model.position.z = - 0.8
            model.castShadow = true
            model.name = 'accenture-logo'
            sceneGroup.add(model)
        },
        modelLoader.loaderOnProgress,
        modelLoader.loaderOnError
    )

    // create lighting
    const light = new THREE.PointLight(0xFFFFFF, 1, 100)
    light.position.set(0, 4, 0)
    light.castShadow = true
    sceneGroup.add(light)

    const ambientLight = new THREE.AmbientLight(0x6F6666, 2)
    sceneGroup.add(ambientLight)

    // VIDEO
    const videoElement = video.getVideoHTMLelementByID('video')
    const videoGroup = new THREE.Group()
    const videoTexture = new THREE.VideoTexture(videoElement)
    const videoMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.1, 0.1),
        new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.FrontSide })
    )
    videoGroup.name = 'video'
    videoMesh.name = 'videoMesh'
    videoGroup.add(videoMesh)
    sceneGroup.add(videoGroup)
}

function eventHandling() {
    // EVENT HANDLING CONFIG
    const videoElement = video.getVideoHTMLelementByID('video')
    // create an array of objects with their corresponding actions to add to the eventListeners
    const objectsClickActions = [
        {
            objectName: 'videoMesh',
            htmlElement: videoElement,
            action: video.playPauseVideo
        }
    ]
    // add eventlistener for window resizing & click/touch events
    events.addEventListeners(objectsClickActions)
}
// update logic
function update() {
    const { enable_ar, arToolkitSource, arToolkitContext } = getState()

    if (enable_ar === true) {
        if (arToolkitSource.ready !== false)
            arToolkitContext.update(arToolkitSource.domElement)
    }
}

// draw scene
function render() {
    const { renderer, scene, camera } = getState()

    renderer.render(scene, camera)
}

// run game loop (update, render, repeat)
function animate() {
    const { scene } = getState()

    let x = scene.getObjectByName('video').scale.x
    let y = scene.getObjectByName('video').scale.y
    let z = scene.getObjectByName('video').scale.z
    // Animate scaling of video
    if (x < 10 && z < 10) {
        x += 0.1
        z += 0.1
        scene.getObjectByName('video').scale.set(x, y, z)
    }

    requestAnimationFrame(animate)
    update()
    render()
}