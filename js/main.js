let WINDOW_WIDTH = window.innerWidth
let WINDOW_HEIGHT = window.innerHeight

let scene, camera, renderer, clock, deltaTime, totalTime, raycaster, mouse
let arToolkitSource, arToolkitContext
let markerRoot
let material, mesh
let light
let videoElement
let controls
let sphere

const ENABLE_AR = false

initialize()
animate()

function initialize() {
    raycaster = new THREE.Raycaster()
    mouse = new THREE.Vector2()
    scene = new THREE.Scene()
    scene.name = 'scene'
    // create a markerRoot group
    markerRoot = new THREE.Group()
    markerRoot.name = 'markerRoot'
    scene.add(markerRoot)

    // setup the renderer and add it to the page
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    })
    renderer.setClearColor(new THREE.Color('lightgrey'), 0)
    renderer.setSize(WINDOW_WIDTH, WINDOW_HEIGHT)
    document.body.appendChild(renderer.domElement)

    // setup the camera and add it to the scene
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000)
    scene.add(camera)

    // setup the clock
    clock = new THREE.Clock()
    deltaTime = 0
    totalTime = 0

    // add eventlistener for window resizing & click/touch events
    window.addEventListener('resize', () => onResize())
    window.addEventListener('click', onClick, false)
    window.addEventListener('touchend', onTouch, false)

    if (ENABLE_AR === true) {
        /************************
         * setup arToolkitSource
         ***********************/
        // create the arToolkitSource (webcam, img)
        arToolkitSource = new THREEx.ArToolkitSource({
            sourceType: 'webcam',
        })
        // initiate the arToolkitSource
        arToolkitSource.init(() => onResize())

        /*************************
         * setup arToolkitContext
         ************************/
        // create arToolkitContext
        arToolkitContext = new THREEx.ArToolkitContext({
            cameraParametersUrl: '../data/camera_para.dat',
            detectionMode: 'mono'
        })
        // copy project matrix to camera when initialization is complete
        arToolkitContext.init(() =>
            camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix())
        )

        /********************
         * setup markerRoots
         *******************/
        // create ArMarkerControls
        new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
            type: 'pattern', patternUrl: "../data/hiro.patt",
        })
    } else if (ENABLE_AR === false) {
        camera.position.set(0, 0, 1)
        camera.position.y = Math.PI / 1
        controls = new THREE.OrbitControls(camera)
        controls.update()
    }

    ////////////////////////////////////////////////////////////
    // setup scene
    ////////////////////////////////////////////////////////////

    let sceneGroup = new THREE.Group()
    scene.getObjectByName('markerRoot').add(sceneGroup)

    // Load a glTF resource
    let loader = new THREE.GLTFLoader()

    function onProgress(gltfModel) { console.log((gltfModel.loaded / gltfModel.total * 100) + '% loaded') }
    function onError() { console.log('An error happened') }

    loader.load(
        '../models/accenture-ar.gltf',
        function(group) {
            logo = group.scene
            logo.scale.set(0.2, 0.2, 0.2)
            logo.rotation.x = -Math.PI / 2
            logo.position.z = - 0.8
            logo.castShadow = true
            logo.name = 'logo'
            sceneGroup.add(logo)
        },
        onProgress,
        onError
    )

    // create lighting
    light = new THREE.PointLight(0xFFFFFF, 1, 100)
    light.position.set(0, 4, 0)
    light.castShadow = true
    sceneGroup.add(light)

    let lightSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.1),
        new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0
        })
    )
    lightSphere.position.copy(light.position)
    sceneGroup.add(lightSphere)

    let ambientLight = new THREE.AmbientLight(0x6F6666, 2)
    sceneGroup.add(ambientLight)


    // VIDEO
    let videoGroup = new THREE.Group()
    videoGroup.name = 'video'
    sceneGroup.add(videoGroup)

    //assuming you have created a HTML video element with id="video"
    videoElement = document.getElementById('video')

    let videoTexture = new THREE.VideoTexture(videoElement)
    videoTexture.minFilter = THREE.LinearFilter
    videoTexture.magFilter = THREE.LinearFilter
    videoTexture.format = THREE.RGBFormat

    // Make video mesh
    let videoMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.1, 0.1),
        new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.DoubleSide })
    )
    videoMesh.rotation.x = -Math.PI / 2
    videoMesh.name = 'videoMesh'

    videoGroup.add(videoMesh)
}

// Resize logic
function onResize() {
    if (ENABLE_AR === true) {
        arToolkitSource.onResizeElement()
        arToolkitSource.copyElementSizeTo(renderer.domElement)
        if (arToolkitContext.arController !== null) {
            arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
        }
    } else {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()

        renderer.setSize(window.innerWidth, window.innerHeight)
    }
}

// update logic
function update() {
    if (ENABLE_AR === true) {
        if (arToolkitSource.ready !== false)
            arToolkitContext.update(arToolkitSource.domElement)
    }
}

// draw scene
function render() {
    renderer.render(scene, camera)
}

// run game loop (update, render, repeat)
function animate() {

    let x = scene.getObjectByName('video').scale.x
    let y = scene.getObjectByName('video').scale.y
    let z = scene.getObjectByName('video').scale.z
    // Animate scaling of video
    if (x < 150 && z < 150) {
        x += 0.1
        z += 0.1
        scene.getObjectByName('video').scale.set(x, y, z)
    }

    requestAnimationFrame(animate)

    deltaTime = clock.getDelta()
    totalTime += deltaTime
    update()
    render()
}

function onClick(event) {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera)
    // calculate objects intersecting the picking ray
    let intersects = raycaster.intersectObjects(scene.children, true)
    intersects.forEach(intersect => intersect.object.name == 'videoMesh' ? playPauseVideo(videoElement) : null)
}

function onTouch(event) {
    mouse.x = (event.changedTouches[ 0 ].clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.changedTouches[ 0 ].clientY / window.innerHeight) * 2 + 1

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera)
    // calculate objects intersecting the picking ray
    let intersects = raycaster.intersectObjects(scene.children, true)
    intersects.forEach(intersect => intersect.object.name == 'videoMesh' ? playPauseVideo(videoElement) : null)
}

function playPauseVideo(video) {
    if (video.paused)
        video.play()
    else
        video.pause()
}