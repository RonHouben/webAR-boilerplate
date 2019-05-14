import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'

const validLoaders = [ 'GLTF', 'MTLL', 'OBJ', 'STL' ]

export const modelLoader = {
    createNewLoader: loader => {
        switch (loader.toLowerCase()) {
            case 'gltf':
                return new GLTFLoader()
            case 'mtl':
                return new MTLLoader()
            case 'obj':
                return new OBJLoader()
            case 'stl':
                return new STLLoader()
            default:
                return console.error(`You've choosen an unvalid loader!\n Please choose one of the following loaders:\n${ validLoaders.toString() }`)
        }
    },
    loaderOnProgress: model => console.info('3D model ' + (model.loaded / model.total * 100) + '% loaded'),
    loaderOnError: error => console.error('An error happened with loading the 3D model:\n', error)
}