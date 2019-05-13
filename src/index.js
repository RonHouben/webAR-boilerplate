// set the use strict for accidental creation of global variables
"use strict"

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { getState, setState } from './js/store'
import { init } from './js/init'
import { onResize } from './js/onResize'

// The following configures wether to use AR or not
setState({ enable_ar: false })

initialise()
animate()

function initialise() {
    // initialize the renderer
    const renderer = init.renderer()
    // initialize the scene
    const scene = init.scene('scene')
    // initialize sceneGroup
    const sceneGroup = init.sceneGroup('sceneGroup', scene)
    // initialize the camera
    const camera = init.camera('camera', scene)
    // initialize the raycaster
    const raycaster = init.raycaster()

    setState({ renderer, scene, sceneGroup, camera, raycaster })
    // check if AR is enabled
    const { enable_ar } = getState()

    if (enable_ar) {
        // initialize arToolkitSource
        const arToolkitSource = init.arToolkitSource('webcam', enable_ar, camera, renderer, onResize)
        // initialize arToolkitContext
        const arToolkitContext = init.arToolkitContext(camera, 'src/assets/ar-markers/camera_para.dat', 'mono')
        // initialize arMarkerRoots
        const arMarkerRoot = init.arMarkerRoot('markerRoot', scene, sceneGroup)
        // initialize arMarkerControls
        const arMarkerControls = init.arMarkerControls(arToolkitContext, arMarkerRoot, 'pattern', 'src/assets/ar-markers/hiro.patt')
        setState({ arToolkitSource, arToolkitContext })
    } else {
        // initialize OrbitControls
        const orbitControls = init.orbitControls(camera)
    }

    // add eventlistener for window resizing & click/touch events
    addEventListeners()

    // Load a glTF resource
    let loader = new GLTFLoader()

    function loaderOnProgress(model) { console.info('gltf model ' + (model.loaded / model.total * 100) + '% loaded') }
    function loaderOnError(error) { console.error('An error happened with loading the gltf model:\n', error) }

    loader.load(
        'src/assets/3d-models/accenture-ar.gltf',
        function(group) {
            let logo = group.scene
            logo.scale.set(0.2, 0.2, 0.2)
            logo.rotation.x = -Math.PI / 2
            logo.position.z = - 0.8
            logo.castShadow = true
            logo.name = 'logo'
            sceneGroup.add(logo)
        },
        loaderOnProgress,
        loaderOnError
    )

    // create lighting
    const light = new THREE.PointLight(0xFFFFFF, 1, 100)
    light.position.set(0, 4, 0)
    light.castShadow = true
    sceneGroup.add(light)

    const lightSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.1),
        new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0
        })
    )
    lightSphere.position.copy(light.position)
    sceneGroup.add(lightSphere)

    const ambientLight = new THREE.AmbientLight(0x6F6666, 2)
    sceneGroup.add(ambientLight)


    // VIDEO
    const videoGroup = new THREE.Group()
    videoGroup.name = 'video'
    sceneGroup.add(videoGroup)

    //assuming you have created a HTML video element with id="video"
    const videoElement = document.getElementById('video')
    setState({ videoElement })

    const videoTexture = new THREE.VideoTexture(videoElement)
    videoTexture.minFilter = THREE.LinearFilter
    videoTexture.magFilter = THREE.LinearFilter
    videoTexture.format = THREE.RGBFormat

    // Make video mesh
    const videoMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.1, 0.1),
        new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.DoubleSide })
    )
    videoMesh.rotation.x = -Math.PI / 2
    videoMesh.name = 'videoMesh'

    videoGroup.add(videoMesh)
}

// function to add event listers
function addEventListeners() {
    const { enable_ar, camera, renderer, arToolkitSource } = getState()

    window.addEventListener('resize', () => onResize(enable_ar, camera, renderer, arToolkitSource))
    window.addEventListener('click', onClick, false)
    window.addEventListener('touchend', onTouch, false)
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

function onClick(event) {
    const { videoElement } = getState()
    const { raycaster, scene, camera } = getState()

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    raycaster.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    raycaster.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1

    // update the picking ray with the camera and mouse position
    raycaster.raycaster.setFromCamera(raycaster.mouse, camera)
    // calculate objects intersecting the picking ray
    const intersects = raycaster.raycaster.intersectObjects(scene.children, true)
    intersects.forEach(intersect => intersect.object.name == 'videoMesh' ? playPauseVideo(videoElement) : null)
}

function onTouch(event) {
    const { raycaster, scene, camera } = getState()

    raycaster.mouse.x = (event.changedTouches[ 0 ].clientX / window.innerWidth) * 2 - 1
    raycaster.mouse.y = -(event.changedTouches[ 0 ].clientY / window.innerHeight) * 2 + 1

    // update the picking ray with the camera and mouse position
    raycaster.raycaster.setFromCamera(raycaster.mouse, camera)
    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children, true)
    intersects.forEach(intersect => intersect.object.name == 'videoMesh' ? playPauseVideo(videoElement) : null)
}

function playPauseVideo(video) {
    if (video.paused)
        video.play()
    else
        video.pause()
}