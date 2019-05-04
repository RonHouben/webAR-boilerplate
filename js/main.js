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

initialize()
animate()

function initialize() {
    raycaster = new THREE.Raycaster()
    mouse = new THREE.Vector2()
    scene = new THREE.Scene()

    // camera = new THREE.PerspectiveCamera()
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000)
    controls = new THREE.OrbitControls(camera)
    camera.position.set(0, 0, 1)
    camera.position.y = Math.PI / 1
    controls.update();

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
    // arToolkitSource = new THREEx.ArToolkitSource({
    //     sourceType: 'webcam',
    // })

    function onResize() {
        // arToolkitSource.onResizeElement()
        // arToolkitSource.copyElementSizeTo(renderer.domElement)
        // if (arToolkitContext.arController !== null) {
        //     arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
        // }
    }
    // initiate webcam
    // arToolkitSource.init(function onReady() {
    //     onResize()
    // })

    // handle resize event
    window.addEventListener('resize', function() {
        onResize()
    })

    ////////////////////////////////////////////////////////////
    // setup arToolkitContext
    ////////////////////////////////////////////////////////////
    // create atToolkitContext
    // arToolkitContext = new THREEx.ArToolkitContext({
    //     cameraParametersUrl: '../data/camera_para.dat',
    //     detectionMode: 'mono'
    // })

    // copy projection matrix to camera when initialization complete
    // arToolkitContext.init(function onCompleted() {
    //     camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix())
    // })

    ////////////////////////////////////////////////////////////
    // setup markerRoots
    ////////////////////////////////////////////////////////////
    // build markerControls
    markerRoot = new THREE.Group()
    scene.add(markerRoot)
    // let markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
    //     type: 'pattern', patternUrl: "../data/hiro.patt",
    // })


    ////////////////////////////////////////////////////////////
    // setup scene
    ////////////////////////////////////////////////////////////

    let loader = new THREE.GLTFLoader()

    let sceneGroup = new THREE.Group()
    markerRoot.add(sceneGroup)

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

    // SPHERE
    let sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32)
    let sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 })
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    sphere.name = 'sphere'
    sphere.position.set(1, -1, 0)
    sceneGroup.add(sphere)


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
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({ color: 0xFF5733, map: videoTexture, side: THREE.DoubleSide })
    )
    videoMesh.rotation.x = -Math.PI / 2
    videoMesh.name = 'videoMesh'

    videoGroup.add(videoMesh)
}

// update logic
function update() {
    // if (arToolkitSource.ready !== false)
    //     arToolkitContext.update(arToolkitSource.domElement)
}

// draw scene
function render() {
    renderer.render(scene, camera)
}

// run game loop (update, render, repeat)
function animate() {
    window.addEventListener('click', onClick, false)
    document.addEventListener('touchend', onTouch, false)

    requestAnimationFrame(animate)

    deltaTime = clock.getDelta()
    totalTime += deltaTime
    update()
    render()
}

function onClick(event) {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);
    // calculate objects intersecting the picking ray
    let intersects = raycaster.intersectObjects(scene.children, true);
    intersects.forEach(intersect => console.log(intersect))
    intersects.forEach(intersect => intersect.object.name == 'videoMesh' ? playPauseVideo(videoElement) : null)
    intersects.forEach(intersect => intersect.object.name == 'sphere' ? intersect.object.material.color.set(0xaff999) : null)
}

function onTouch(event) {
    event.preventDefault()
    mouse.x = (event.changedTouches[ 0 ].clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.changedTouches[ 0 ].clientY / window.innerHeight) * 2 + 1;

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);
    // calculate objects intersecting the picking ray
    let intersects = raycaster.intersectObjects(scene.children, true);
    intersects.forEach(intersect => console.log(intersect))
    intersects.forEach(intersect => intersect.object.name == 'videoMesh' ? playPauseVideo(videoElement) : null)
    intersects.forEach(intersect => intersect.object.name == 'sphere' ? intersect.object.material.color.set(0xaff999) : null)
}

function playPauseVideo(video) {
    if (video.paused)
        video.play();
    else
        video.pause();
}