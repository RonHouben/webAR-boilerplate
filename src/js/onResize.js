import { getState } from './store'

export const onResize = (enable_ar, camera, renderer, arToolkitSource) => {
    if (enable_ar) {
        // call the arToolkitSource.onResizeElement() function.
        arToolkitSource.onResizeElement()
        // copy the renderer.domElement size to the arToolkitSource
        // so the element is placed on top of the marker.
        arToolkitSource.copyElementSizeTo(renderer.domElement)
    } else {
        // change the aspect of the camera to the new window size.
        camera.aspect = window.innerWidth / window.innerHeight
        // update the camera's ProjectionMatrix
        camera.updateProjectionMatrix()
        // set the size of the renderer to the new window size
        renderer.setSize(window.innerWidth, window.innerHeight)
    }
}