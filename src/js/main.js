// set the use strict for accidental creation of global variables
"use strict"

import { init } from './init'
import { events } from './events'
import { video } from './video'
import { loadingManager } from './loadingManager'
import { typeChecker } from './typeChecker';

// the following configures wether to use AR or not
const ENABLE_AR = false
// execute the main function
main()

async function main() {
    // initialise everything
    const initializedScene = initializeScene()
    // build the scene - The await is necessary because of the async actions.
    // Otherwise animate will happen before all the objects are build.
    const buildedScene = await buildScene(initializedScene)

    const { camera, renderer, arToolkitSource, raycaster, mouse, scene, cacheDOM } = buildedScene
    // add event handling
    addEventHandling({ camera, renderer, arToolkitSource, raycaster, mouse, scene, cacheDOM })
    // Run animate loop
    animateScene(buildedScene)
}

function initializeScene() {
    const renderer = init.renderer()
    const scene = init.scene('scene')
    const sceneGroup = init.sceneGroup({ name: 'sceneGroup', scene })
    const camera = init.camera({ name: 'camera', scene })
    const { raycaster, mouse } = init.raycaster()

    if (ENABLE_AR) {
        const arToolkitSource = init.arToolkitSource({ sourceType: 'webcam', onReady: events.onResize })
        const arToolitContext = init.arToolkitContext({
            cameraParametersUrl: '../assets/ar-markers/camera_para.dat',
            detectionMode: 'mono'
        })
        const arMarkerRoot = init.arMarkerRoot('markerRoot')
        const arMarkerControls = init.arMarkerControls({
            type: 'pattern',
            patternUrl: '../assets/ar-markers/hiro.patt'
        })

        initializeScene = {
            ...initializeScene,
            arToolkitSource,
            arToolitContext,
            arMarkerRoot,
            arMarkerControls
        }
    } else {
        const orbitControls = init.orbitControls(camera)
        initializeScene = { ...initializeScene, orbitControls }
    }
    const cacheDOM = init.cacheDOMElementsByID([ 'video' ])

    const initializedScene = {
        renderer,
        scene,
        sceneGroup,
        camera,
        raycaster,
        mouse,
        cacheDOM,
    }

    return initializedScene
}

async function buildScene(initializedScene) {
    initializedScene = typeChecker('object', {}, 'initializedScene')(initializedScene)
    const buildedScene = { ...initializedScene }
    const { sceneGroup, cacheDOM } = buildedScene

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
    const videoElement = video.getVideoHTMLelementByID({ id: 'video', cacheDOM })
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
    // return updated scene
    return buildedScene
}

function addEventHandling({ camera, renderer, arToolkitSource, raycaster, mouse, scene, cacheDOM }) {
    camera = typeChecker('object', {}, 'camera')(camera)
    renderer = typeChecker('object', {}, 'renderer')(renderer)
    cacheDOM = typeChecker('array', [], 'cacheDOM')(cacheDOM)

    // EVENT HANDLING CONFIG
    const videoElement = video.getVideoHTMLelementByID({ id: 'video', cacheDOM })
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
        enable_ar: ENABLE_AR,
        camera,
        renderer,
        arToolkitSource,
        raycaster,
        mouse,
        scene
    }).addEventListeners()
}

// run game loop (update, render, repeat)
async function animateScene(buildedScene) {
    buildedScene = typeChecker('object', {}, 'buildedScene')(buildedScene)
    const { scene, arToolkitSource, arToolkitContext } = buildedScene
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

    requestAnimationFrame(() => animateScene(buildedScene))

    ENABLE_AR ? updateArToolkit({ arToolkitSource, arToolkitContext }) : null

    render(buildedScene)
}

// update logic
function updateArToolkit({ arToolkitSource, arToolkitContext }) {
    arToolkitSource = typeChecker('object', {}, 'arToolkitSource')(arToolkitSource)
    arToolkitContext = typeChecker('object', {}, 'arToolkitContext')(arToolkitContext)

    if (arToolkitSource.ready)
        arToolkitContext.update(arToolkitSource.domElement)
}

// draw scene
function render(buildedScene) {
    buildedScene = typeChecker('object', {}, 'buildedScene')(buildedScene)
    let { renderer, scene, camera } = buildedScene
    //type checking
    scene = typeChecker('object', {}, 'scene')(scene)
    renderer = typeChecker('object', {}, 'renderer')(renderer)
    camera = typeChecker('object', {}, 'camera')(camera)

    renderer.render(scene, camera)
}