let WINDOW_WIDTH = window.innerWidth
let WINDOW_HEIGHT = window.innerHeight

let scene, camera, renderer, clock, deltaTime, totalTime
let arToolkitSource, arToolkitContext
let markerRoot
let material, mesh
let light

initialize()
animate()

function initialize() {
    scene = new THREE.Scene()

    camera = new THREE.Camera()
    scene.add(camera)

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    })
    renderer.setClearColor(new THREE.Color('lightgrey'), 0)
    renderer.setSize(WINDOW_WIDTH, WINDOW_HEIGHT)
    document.body.appendChild(renderer.domElement)

    clock = new THREE.Clock()
    deltaTime = 0
    totalTime = 0

    ////////////////////////////////////////////////////////////
    // setup arToolkitSource
    ////////////////////////////////////////////////////////////
    arToolkitSource = new THREEx.ArToolkitSource({
        sourceType: 'webcam',
    })

    function onResize() {
        arToolkitSource.onResizeElement()
        arToolkitSource.copyElementSizeTo(renderer.domElement)
        if (arToolkitContext.arController !== null) {
            arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
        }
    }
    // initiate webcam
    arToolkitSource.init(function onReady() {
        onResize()
    })

    // handle resize event
    window.addEventListener('resize', function() {
        onResize()
    })

    ////////////////////////////////////////////////////////////
    // setup arToolkitContext
    ////////////////////////////////////////////////////////////
    // create atToolkitContext
    arToolkitContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: '../data/camera_para.dat',
        detectionMode: 'mono'
    })

    // copy projection matrix to camera when initialization complete
    arToolkitContext.init(function onCompleted() {
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    });

    ////////////////////////////////////////////////////////////
    // setup markerRoots
    ////////////////////////////////////////////////////////////
    // build markerControls
    markerRoot = new THREE.Group()
    scene.add(markerRoot)
    let markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
        type: 'pattern', patternUrl: "../data/hiro.patt",
    })

    ////////////////////////////////////////////////////////////
    // setup scene
    ////////////////////////////////////////////////////////////
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    let loader = new THREE.GLTFLoader()

    let sceneGroup = new THREE.Group()
    markerRoot.add(sceneGroup)

    // add floor for shadows
    let floorGeometry = new THREE.PlaneGeometry(20, 20)
    let floorMaterial = new THREE.ShadowMaterial()
    floorMaterial.opacity = 0.3
    let floorMesh = new THREE.Mesh(floorGeometry, floorMaterial)
    floorMesh.rotation.x = -Math.PI / 2
    floorMesh.receiveShadow = true
    sceneGroup.add(floorMesh)

    function onProgress(xhr) { console.log((xhr.loaded / xhr.total * 100) + '% loaded') }
    function onError(xhr) { console.log('An error happened') }

    // Load a glTF resource
    loader.load(
        '../models/accenture-ar.gltf',
        function(group) {
            logo = group.scene
            logo.scale.set(0.2, 0.2, 0.2)
            logo.rotation.x = -Math.PI / 2
            logo.position.z = - 0.8
            logo.castShadow = true
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

    let videoGroup = new THREE.Group()
    sceneGroup.add(videoGroup)

    //assuming you have created a HTML video element with id="video"
    let videoElement = document.getElementById('video')

    let videoTexture = new THREE.VideoTexture(videoElement)
    videoTexture.minFilter = THREE.LinearFilter
    videoTexture.magFilter = THREE.LinearFilter
    videoTexture.format = THREE.RGBFormat

    // Make video mesh
    let videoMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1),
        new THREE.MeshBasicMaterial({ color: 0xFFFFFF, map: videoTexture })
    )
    videoMesh.rotation.x = -Math.PI / 2

    videoGroup.add(videoMesh)
}

// update logic
function update() {
    if (arToolkitSource.ready !== false)
        arToolkitContext.update(arToolkitSource.domElement)
}

// draw scene
function render() {
    renderer.render(scene, camera)
}

// run game loop (update, render, repeat)
function animate() {
    requestAnimationFrame(animate)
    deltaTime = clock.getDelta()
    totalTime += deltaTime
    update()
    render()
}