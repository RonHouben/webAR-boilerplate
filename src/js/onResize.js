import { getState } from './store'

export const onResize = () => {
    const { enable_ar, camera, renderer, arToolkitSource } = getState()

    if (enable_ar) {
        // call the arToolkitSource.onResizeElement() function.
        arToolkitSource.onResizeElement()
        // copy the renderer.domElement size to the arToolkitSource
        // so the element is placed on top of the marker.
        arToolkitSource.copyElementSizeTo(renderer.domElement)
    } else {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()

        renderer.setSize(window.innerWidth, window.innerHeight)
    }
}