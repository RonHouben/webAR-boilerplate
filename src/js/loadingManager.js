import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { typeChecker } from './typeChecker';

const validLoaders = [ 'GLTF', 'MTLL', 'OBJ', 'STL' ]

export function loadingManager() {
    async function loadObject({ url, loaderType }) {
        url = typeChecker('string', '', 'url')(url)
        loaderType = typeChecker('string', '', 'loaderType')(loaderType)
        // Create new object loader
        const loader = createNewLoader(loaderType)
        // load the object
        const object = await loader
            .load(url)
            .catch(loaderOnError)
        // return the object
        return object
    }

    function createNewLoader(loaderName) {
        loaderName = typeChecker('string', '', 'loaderName')(loaderName)

        switch (typeof loaderName === 'string' ? loaderName.toLowerCase() : typeof loaderName) {
            case 'gltf':
                return promisifyLoader(new GLTFLoader(), loaderOnProgress)
            case 'mtl':
                return promisifyLoader(new MTLLoader(), loaderOnProgress)
            case 'obj':
                return promisifyLoader(new OBJLoader(), loaderOnProgress)
            case 'stl':
                return promisifyLoader(new STLLoader(), loaderOnProgress)
            case 'object':
                return promisifyLoader(new loaderName(), loaderOnProgress)
            default:
                return console.error(`You've choosen an invalid loader!\n Please choose one of the following loaders:\n${ validLoaders.toString() }`)
        }
    }

    function promisifyLoader(classicLoader, onProgress) {
        classicLoader = typeChecker('object', {}, 'classicLoader')(classicLoader)
        onProgress = typeChecker('function', () => null, 'onProgress')(onProgress)
        //TODO: Change promiseLoader to async/await
        const promiseLoader = url =>
            new Promise((resolve, reject) =>
                classicLoader.load(url, resolve, onProgress, reject)).catch(loaderOnError)

        return {
            originalLoader: classicLoader,
            load: promiseLoader,
        }
    }
    function loaderOnProgress(object) {
        object = typeChecker('object', {}, 'object')(object)
        console.info(`Object ${ object.loaded / object.total * 100 }% loaded`)
    }

    function loaderOnError(error) {
        error = typeChecker('object', {}, 'error')(error)
        console.error('An error happened with loading the object:\n', error)
    }

    return { loadObject }
}