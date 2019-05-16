import { getState, setState } from './store'
import { typeChecker } from './typeChecker';
import { type } from 'os';

export class events {
    constructor(objectsClickActions) {
        this.objectsClickActions = objectsClickActions

        this._onResize = () => {
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
        }
    }
    addEventListeners() {
        window.addEventListener('resize', this.onResize)
        window.addEventListener('click', event => events.onClick({ event, objectsClickActions }), false)
        window.addEventListener('touchend', event => events.onTouchend({ event, objectsClickActions }), false)
    }
}

export const bla = {
    addEventListeners: objectsClickActions => {
        objectsClickActions = typeChecker('array', [], 'objectsClickActions')(objectsClickActions)

        window.addEventListener('resize', events.onResize)
        window.addEventListener('click', event => events.onClick({ event, objectsClickActions }), false)
        window.addEventListener('touchend', event => events.onTouchend({ event, objectsClickActions }), false)
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
        event = typeChecker('object', {}, 'event')(event)
        objectsClickActions = typeChecker('object', {}, 'objectsClickActions')(objectsClickActions)

        const { mouse } = getState()
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
        // set the updated mouse object in the global state store
        setState({ mouse })
        // exectute object action:
        events.executeObjectAction(objectsClickActions)
    },
    onTouchend: ({ event, objectsClickActions }) => {
        event = typeChecker('object', {}, 'event')(event)
        objectsClickActions = typeChecker('object', {}, 'objectsClickActions')(objectsClickActions)

        const { mouse } = getState()

        mouse.x = (event.changedTouches[ 0 ].clientX / window.innerWidth) * 2 - 1
        mouse.y = -(event.changedTouches[ 0 ].clientY / window.innerHeight) * 2 + 1
        // set the updated mouse object in the global state store
        setState({ mouse })
        // exectute object action:
        events.executeObjectAction(objectsClickActions)
    },
    executeObjectAction: objectsClickActions => {
        objectsClickActions = typeChecker('object', {}, 'objectsClickActions')(objectsClickActions)

        const { raycaster, mouse, scene, camera } = getState()
        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera)
        // calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects(scene.children, true)
        // get closed intersect
        const closestIntersect = intersects[ 0 ]
        // if there's a intersect, loop over the objectsClickActions
        if (closestIntersect) {
            objectsClickActions.forEach(object => {
                // Check if the objects name equals the intersects name.
                if (object.objectName === closestIntersect.object.name) {
                    // execute the objects action. Use null as paramater when htmlElement is omitted.
                    try {
                        object.action(object.htmlElement || null)
                    }
                    catch (error) {
                        const suggestionMsg = () => console.error('\nMake sure you have an action defined for the following object in objectsClickActions:', object)
                        const subjectMsg = () => console.error('\nThis happened on the following object in objectsClickActions', object)

                        console.error(error)
                        !object.action ? suggestionMsg() : subjectMsg()
                    }
                }
            })
        }
    }
}