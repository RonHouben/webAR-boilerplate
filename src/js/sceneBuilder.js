import { getState } from './store'
import { loader } from './loader'
import { video } from './video'

export const sceneBuilder = {
    load3DModel: ({ url, loaderType }) => {
        // Create new 3D model loader
        const modelLoader = loader.createNewLoader(loaderType)
        const model = modelLoader
            .load(url)
            .then(model => model.scene)
            .catch(loader.loaderOnError)

        return model
    },
    configModel: ({ model, options }) => {
        model.scale.set(0.2, 0.2, 0.2)
        model.rotation.x = -Math.PI / 2
        model.position.z = - 0.8
        model.castShadow = true

        return model
    },
    addModelToGroup: ({ model, group }) => {
        group.add(model)
    },
    build: () => {
        const { sceneGroup } = getState()
        // START BUILDING THE SCENE

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

}