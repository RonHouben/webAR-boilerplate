export const events = {
    addEventListeners: (enable_ar, camera, renderer, arToolkitSource, objectsClickActions, raycasterObject, scene) => {
        window.addEventListener('resize', () => events.onResize(enable_ar, camera, renderer, arToolkitSource))
        window.addEventListener('click', event => events.onClick(event, objectsClickActions, raycasterObject, scene, camera), false)
        // window.addEventListener('touchend', onTouch, false)
    },
    onResize: (enable_ar, camera, renderer, arToolkitSource) => {
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
    onClick: (event, objectsClickActions, raycasterObject, scene, camera) => {
        const { raycaster, mouse } = raycasterObject
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
        // if there's a intersect, loop over the oobjects with click actions
        if (closestIntersect) {
            objectsClickActions.forEach((object) => {
                if (object.objectName === closestIntersect.object.name) {
                    object.action(object.htmlElement || null)
                }
            })
        }
    }
}