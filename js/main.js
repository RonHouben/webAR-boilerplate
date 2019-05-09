// set the use strict for accidentalt creation of global variables
"use strict"

import { getState, setState } from './Store.js'

setState({ enable_ar: false })

initialize()
animate()

function initialize() {
    const { enable_ar } = getState()
    const scene = new THREE.Scene()
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    scene.name = 'scene'
    // create a markerRoot group
    const markerRoot = new THREE.Group()
    markerRoot.name = 'markerRoot'
    scene.add(markerRoot)
    // setup the renderer and add it to the page
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    })
    setState({ scene, raycaster, mouse, renderer })
    renderer.setClearColor(new THREE.Color('lightgrey'), 0)
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    // setup the camera and add it to the scene
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000)
    camera.name = 'camera'
    scene.add(camera)

    // add eventlistener for window resizing & click/touch events
    addEventListeners()


    if (enable_ar === true) {
        /************************
         * setup arToolkitSource
         ***********************/
        // create the arToolkitSource (webcam, img)
        const arToolkitSource = new THREEx.ArToolkitSource({
            sourceType: 'webcam',
        })
        // initiate the arToolkitSource
        arToolkitSource.init(() => onResize())

        /*************************
         * setup arToolkitContext
         ************************/
        // create arToolkitContext
        const arToolkitContext = new THREEx.ArToolkitContext({
            cameraParametersUrl: '../data/camera_para.dat',
            detectionMode: 'mono'
        })
        // copy project matrix to camera when initialization is complete
        arToolkitContext.init(() =>
            scene.getObjectByName('camera').projectionMatrix.copy(arToolkitContext.getProjectionMatrix())
        )
        setState({ arToolkitSource, arToolkitContext })
        /********************
         * setup markerRoots
         *******************/
        // create ArMarkerControls
        new THREEx.ArMarkerControls(arToolkitContext, scene.getObjectByName('markerRoot'), {
            type: 'pattern', patternUrl: "../data/hiro.patt",
        })
    } else if (enable_ar === false) {
        scene.getObjectByName('camera').position.y = Math.PI / 1
        const controls = new THREE.OrbitControls(scene.getObjectByName('camera'))
        controls.update()
    }

    ////////////////////////////////////////////////////////////
    // setup scene
    ////////////////////////////////////////////////////////////

    let sceneGroup = new THREE.Group()
    scene.getObjectByName('markerRoot').add(sceneGroup)

    // Load a glTF resource
    let loader = new THREE.GLTFLoader()

    function loaderOnProgress(model) { console.log('gltf model ' + (model.loaded / model.total * 100) + '% loaded') }
    function loaderOnError(error) { console.error('An error happened with loading the gltf model:\n', error) }

    loader.load(
        '../models/accenture-ar.gltf',
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

    // log out the scene in JSON and object format for debugging
    console.info('scene.JSON:', scene.toJSON())
    console.info('scene object:', scene)
}

// function to add event listers
function addEventListeners() {
    window.addEventListener('resize', () => onResize())
    window.addEventListener('click', onClick, false)
    window.addEventListener('touchend', onTouch, false)
}

// Resize logic
function onResize() {
    const { enable_ar, scene, renderer, arToolkitSource, arToolkitContext } = getState()

    if (enable_ar === true) {
        arToolkitSource.onResizeElement()
        arToolkitSource.copyElementSizeTo(renderer.domElement)
        if (arToolkitContext.arController !== null) {
            arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
        }
    } else if (enable_ar === false) {
        scene.getObjectByName('camera').aspect = window.innerWidth / window.innerHeight
        scene.getObjectByName('camera').updateProjectionMatrix()

        renderer.setSize(window.innerWidth, window.innerHeight)
    }
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
    const { scene, renderer } = getState()

    renderer.render(scene, scene.getObjectByName('camera'))
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
    const { raycaster, mouse, scene } = getState()
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, scene.getObjectByName('camera'))
    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children, true)
    intersects.forEach(intersect => intersect.object.name == 'videoMesh' ? playPauseVideo(videoElement) : null)
}

function onTouch(event) {
    const { raycaster, mouse, scene } = getState()

    mouse.x = (event.changedTouches[ 0 ].clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.changedTouches[ 0 ].clientY / window.innerHeight) * 2 + 1

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, scene.getObjectByName('camera'))
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