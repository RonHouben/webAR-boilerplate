import { typeChecker } from './typeChecker';

export const events = function({
    objectsClickActions,
    enable_ar,
    camera,
    renderer,
    arToolkitSource,
    raycaster,
    mouse,
    scene
}) {
    // Typechecking of local state
    objectsClickActions = typeChecker('array', [], 'objectsClickActions')(objectsClickActions)
    enable_ar = typeChecker('boolean', null, 'enable_ar')(enable_ar)
    camera = typeChecker('object', {}, 'camera')(camera)
    renderer = typeChecker('object', {}, 'renderer')(renderer)
    raycaster = typeChecker('object', {}, 'raycaster')(raycaster)
    mouse = typeChecker('object', {}, 'mouse')(mouse)
    scene = typeChecker('object', {}, 'scene')(scene)
    // arToolkitSource only has to be checked when AR is enabled.
    // Because the arToolkitSource will not be created if AR isn't enabled.
    enable_ar ? arToolkitSource = typeChecker('object', {}, 'arToolkitSource')(arToolkitSource) : null

    function onResize() {
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
    function onClick() {
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
        // exectute object action:
        executeObjectAction()
    }
    function onTouchend() {
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        mouse.x = (event.changedTouches[ 0 ].clientX / window.innerWidth) * 2 - 1
        mouse.y = -(event.changedTouches[ 0 ].clientY / window.innerHeight) * 2 + 1
        // exectute object action:
        executeObjectAction()
    }
    function executeObjectAction() {
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

    return {
        addEventListeners() {
            //execute addEventListeners
            window.addEventListener('resize', onResize)
            window.addEventListener('click', event => onClick(event))
            window.addEventListener('touchend', event => onTouchend(event))
        }
    }
}