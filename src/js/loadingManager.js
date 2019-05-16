import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'

const validLoaders = [ 'GLTF', 'MTLL', 'OBJ', 'STL' ]

export const loadingManager = {
    loadObject: async ({ url, loaderType }) => {
        // Create new object loader
        const loader = loadingManager.createNewLoader(loaderType)
        // load the object
        const object = await loader
            .load(url)
            .catch(loader.loaderOnError)
        // return the object
        return object
    },
    createNewLoader: loaderName => {
        switch (typeof loaderName === 'string' ? loaderName.toLowerCase() : typeof loaderName) {
            case 'gltf':
                return loadingManager.promisifyLoader(new GLTFLoader())
            case 'mtl':
                return loadingManager.promisifyLoader(new MTLLoader())
            case 'obj':
                return loadingManager.promisifyLoader(new OBJLoader())
            case 'stl':
                return loadingManager.promisifyLoader(new STLLoader())
            case 'object':
                return loadingManager.promisifyLoader(new loaderName)
            default:
                return console.error(`You've choosen an invalid loader!\n Please choose one of the following loaders:\n${ validLoaders.toString() }`)
        }
    },
    promisifyLoader: (classicLoader, onProgress) => {
        const promiseLoader = url => new Promise((resolve, reject) => classicLoader.load(url, resolve, onProgress, reject))

        return {
            originalLoader: classicLoader,
            load: promiseLoader,
        }
    },
    loaderOnProgress: model => console.info(`3D model ${ model.loaded / model.total * 100 }% loaded`),
    loaderOnError: error => console.error('An error happened with loading the object:\n', error)
}