import { getState } from './store'
import { video } from './video';

export const events = {
    addEventListeners: objectsClickActions => {
        window.addEventListener('resize', events.onResize)
        window.addEventListener('click', event => events.onClick({ event, objectsClickActions }), false)
        window.addEventListener('touchend', events.onTouch, false)
    },
    onResize: () => {
        const { enable_ar, camera, renderer, arToolkitSource } = getState()

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
    },
    onClick: ({ event, objectsClickActions }) => {
        const { raycaster, mouse, scene, camera } = getState()
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1

        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera)
        // calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects(scene.children, true)
        // handle the clicked objects
        const closestIntersect = intersects[ 0 ]
        // if there's a intersect, loop over the objectsClickActions
        if (closestIntersect) {
            objectsClickActions.forEach((object) => {
                // Check if the objects name equals the intersects name.
                if (object.objectName === closestIntersect.object.name) {
                    // execute the objects action. Use null as paramater when htmlElement is omitted.
                    object.action(object.htmlElement || null)
                }
            })
        }
    },
    onTouch: (event) => {
        const { raycaster, mouse, scene, camera, videoElement } = getState()

        mouse.x = (event.changedTouches[ 0 ].clientX / window.innerWidth) * 2 - 1
        mouse.y = -(event.changedTouches[ 0 ].clientY / window.innerHeight) * 2 + 1

        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera)
        // calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects(scene.children, true)

        intersects.forEach(intersect => intersect.object.name == 'videoMesh' ? playPauseVideo(videoElement) : null)
    }
}