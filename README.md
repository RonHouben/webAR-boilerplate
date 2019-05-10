# webAR-boilerplate - Work In Progress
This project is still very much in draft phase and heavily in progress.\
The purpose of the project is to create a boilerplate project for creating webAR applications.

## Code structure
The code is structured in the following way:
- **index.html**:\
This is the index file which will serve as an entry point for the main index.js file.
- **/src/index.js**:\
This is the main JavaScript file which serves as an entry point for the application and rest of the code.
This file contains the following logic:\
&nbsp;&nbsp;&nbsp;&nbsp; - initialise: setting up the scene, initialising AR, etc\
&nbsp;&nbsp;&nbsp;&nbsp; - animate: animates the scene on every frame\
&nbsp;&nbsp;&nbsp;&nbsp; - update: update the arToolkitContext\
&nbsp;&nbsp;&nbsp;&nbsp; - render: renders the scene to the screen
- **/src/store.js**:\
This file has the logic for handling the central state of the application. It currently exports the following functions:\
&nbsp;&nbsp;&nbsp;&nbsp; - getState(): this return the state object\
&nbsp;&nbsp;&nbsp;&nbsp; - setState(): this sets data inside of the state. It requires an object as input\
- **/src/3d-models/**:\
This folder is a place to store 3d models. I.e. in [GLTF2.0](https://en.wikipedia.org/wiki/GlTF) format.\
- **/src/ar-markers/**:\
This folder is a place to store the .patt files for the pattern recognisition of the AR-markers.\
- **/src/styles/**:\
This folder is a place to store css stylesheets. Currently there's only a simple main.css stylesheet in it.\
- **/src/videos/**:\
Thisfolder is a place to store video files to use in your project.

## This project is making use of the following libraries
- Three.js: http://threejs.org
- three-orbitcontrols: https://www.npmjs.com/package/three-orbitcontrols
- node-ar.js: https://www.npmjs.com/package/node-ar.js (Node.js installable [AR.js](https://www.npmjs.com/package/ar.js) based on AR.js by [jeromeetienne](https://github.com/jeromeetienne))
- Webpack.js: https://webpack.js.org
