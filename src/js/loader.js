import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'

const validLoaders = [ 'GLTF', 'MTLL', 'OBJ', 'STL' ]

export const loader = {
    createNewLoader: loaderName => {
        switch (typeof loaderName === 'string' ? loaderName.toLowerCase() : typeof loaderName) {
            case 'gltf':
                return loader.promisifyLoader(new GLTFLoader())
            case 'mtl':
                return loader.promisifyLoader(new MTLLoader())
            case 'obj':
                return loader.promisifyLoader(new OBJLoader())
            case 'stl':
                return loader.promisifyLoader(new STLLoader())
            case 'object':
                return loader.promisifyLoader(new loaderName)
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
    loaderOnProgress: model => console.info('3D model ' + (model.loaded / model.total * 100) + '% loaded'),
    loaderOnError: error => console.error('An error happened with loading the 3D model:\n', error)
}