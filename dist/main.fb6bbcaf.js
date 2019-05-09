// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"js/store.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setState = exports.getState = void 0;

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var state = {};

var getState = function getState() {
  return state;
};

exports.getState = getState;

var setState = function setState(nextState) {
  state = _objectSpread({}, state, nextState);
};

exports.setState = setState;
},{}],"js/main.js":[function(require,module,exports) {
// set the use strict for accidentalt creation of global variables
"use strict";

var _store = require("./store.js");

(0, _store.setState)({
  enable_ar: false
});
initialize();
animate();

function initialize() {
  var _getState = (0, _store.getState)(),
      enable_ar = _getState.enable_ar;

  var scene = new THREE.Scene();
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();
  scene.name = 'scene'; // create a markerRoot group

  var markerRoot = new THREE.Group();
  markerRoot.name = 'markerRoot';
  scene.add(markerRoot); // setup the renderer and add it to the page

  var renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  (0, _store.setState)({
    scene: scene,
    raycaster: raycaster,
    mouse: mouse,
    renderer: renderer
  });
  renderer.setClearColor(new THREE.Color('lightgrey'), 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement); // setup the camera and add it to the scene

  var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  camera.name = 'camera';
  scene.add(camera); // add eventlistener for window resizing & click/touch events

  addEventListeners();

  if (enable_ar === true) {
    /************************
     * setup arToolkitSource
     ***********************/
    // create the arToolkitSource (webcam, img)
    var arToolkitSource = new THREEx.ArToolkitSource({
      sourceType: 'webcam'
    }); // initiate the arToolkitSource

    arToolkitSource.init(function () {
      return onResize();
    });
    /*************************
     * setup arToolkitContext
     ************************/
    // create arToolkitContext

    var arToolkitContext = new THREEx.ArToolkitContext({
      cameraParametersUrl: './ar-markers/camera_para.dat',
      detectionMode: 'mono'
    }); // copy project matrix to camera when initialization is complete

    arToolkitContext.init(function () {
      return scene.getObjectByName('camera').projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    });
    (0, _store.setState)({
      arToolkitSource: arToolkitSource,
      arToolkitContext: arToolkitContext
    });
    /********************
     * setup markerRoots
     *******************/
    // create ArMarkerControls

    new THREEx.ArMarkerControls(arToolkitContext, scene.getObjectByName('markerRoot'), {
      type: 'pattern',
      patternUrl: "./ar-markers/hiro.patt"
    });
  } else if (enable_ar === false) {
    scene.getObjectByName('camera').position.y = Math.PI / 1;
    var controls = new THREE.OrbitControls(scene.getObjectByName('camera'));
    controls.update();
  } ////////////////////////////////////////////////////////////
  // setup scene
  ////////////////////////////////////////////////////////////


  var sceneGroup = new THREE.Group();
  scene.getObjectByName('markerRoot').add(sceneGroup); // Load a glTF resource

  var loader = new THREE.GLTFLoader();

  function loaderOnProgress(model) {
    console.log('gltf model ' + model.loaded / model.total * 100 + '% loaded');
  }

  function loaderOnError(error) {
    console.error('An error happened with loading the gltf model:\n', error);
  }

  loader.load('./3d-models/accenture-ar.gltf', function (group) {
    var logo = group.scene;
    logo.scale.set(0.2, 0.2, 0.2);
    logo.rotation.x = -Math.PI / 2;
    logo.position.z = -0.8;
    logo.castShadow = true;
    logo.name = 'logo';
    sceneGroup.add(logo);
  }, loaderOnProgress, loaderOnError); // create lighting

  var light = new THREE.PointLight(0xFFFFFF, 1, 100);
  light.position.set(0, 4, 0);
  light.castShadow = true;
  sceneGroup.add(light);
  var lightSphere = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0
  }));
  lightSphere.position.copy(light.position);
  sceneGroup.add(lightSphere);
  var ambientLight = new THREE.AmbientLight(0x6F6666, 2);
  sceneGroup.add(ambientLight); // VIDEO

  var videoGroup = new THREE.Group();
  videoGroup.name = 'video';
  sceneGroup.add(videoGroup); //assuming you have created a HTML video element with id="video"

  var videoElement = document.getElementById('video');
  (0, _store.setState)({
    videoElement: videoElement
  });
  var videoTexture = new THREE.VideoTexture(videoElement);
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  videoTexture.format = THREE.RGBFormat; // Make video mesh

  var videoMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1), new THREE.MeshBasicMaterial({
    map: videoTexture,
    side: THREE.DoubleSide
  }));
  videoMesh.rotation.x = -Math.PI / 2;
  videoMesh.name = 'videoMesh';
  videoGroup.add(videoMesh); // log out the scene in JSON and object format for debugging

  console.info('scene.JSON:', scene.toJSON());
  console.info('scene object:', scene);
} // function to add event listers


function addEventListeners() {
  window.addEventListener('resize', function () {
    return onResize();
  });
  window.addEventListener('click', onClick, false);
  window.addEventListener('touchend', onTouch, false);
} // Resize logic


function onResize() {
  var _getState2 = (0, _store.getState)(),
      enable_ar = _getState2.enable_ar,
      scene = _getState2.scene,
      renderer = _getState2.renderer,
      arToolkitSource = _getState2.arToolkitSource,
      arToolkitContext = _getState2.arToolkitContext;

  if (enable_ar === true) {
    arToolkitSource.onResizeElement();
    arToolkitSource.copyElementSizeTo(renderer.domElement);

    if (arToolkitContext.arController !== null) {
      arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
    }
  } else if (enable_ar === false) {
    scene.getObjectByName('camera').aspect = window.innerWidth / window.innerHeight;
    scene.getObjectByName('camera').updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
} // update logic


function update() {
  var _getState3 = (0, _store.getState)(),
      enable_ar = _getState3.enable_ar,
      arToolkitSource = _getState3.arToolkitSource,
      arToolkitContext = _getState3.arToolkitContext;

  if (enable_ar === true) {
    if (arToolkitSource.ready !== false) arToolkitContext.update(arToolkitSource.domElement);
  }
} // draw scene


function render() {
  var _getState4 = (0, _store.getState)(),
      scene = _getState4.scene,
      renderer = _getState4.renderer;

  renderer.render(scene, scene.getObjectByName('camera'));
} // run game loop (update, render, repeat)


function animate() {
  var _getState5 = (0, _store.getState)(),
      scene = _getState5.scene;

  var x = scene.getObjectByName('video').scale.x;
  var y = scene.getObjectByName('video').scale.y;
  var z = scene.getObjectByName('video').scale.z; // Animate scaling of video

  if (x < 10 && z < 10) {
    x += 0.1;
    z += 0.1;
    scene.getObjectByName('video').scale.set(x, y, z);
  }

  requestAnimationFrame(animate);
  update();
  render();
}

function onClick(event) {
  var _getState6 = (0, _store.getState)(),
      videoElement = _getState6.videoElement;

  var _getState7 = (0, _store.getState)(),
      raycaster = _getState7.raycaster,
      mouse = _getState7.mouse,
      scene = _getState7.scene; // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components


  mouse.x = event.clientX / window.innerWidth * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1; // update the picking ray with the camera and mouse position

  raycaster.setFromCamera(mouse, scene.getObjectByName('camera')); // calculate objects intersecting the picking ray

  var intersects = raycaster.intersectObjects(scene.children, true);
  intersects.forEach(function (intersect) {
    return intersect.object.name == 'videoMesh' ? playPauseVideo(videoElement) : null;
  });
}

function onTouch(event) {
  var _getState8 = (0, _store.getState)(),
      raycaster = _getState8.raycaster,
      mouse = _getState8.mouse,
      scene = _getState8.scene;

  mouse.x = event.changedTouches[0].clientX / window.innerWidth * 2 - 1;
  mouse.y = -(event.changedTouches[0].clientY / window.innerHeight) * 2 + 1; // update the picking ray with the camera and mouse position

  raycaster.setFromCamera(mouse, scene.getObjectByName('camera')); // calculate objects intersecting the picking ray

  var intersects = raycaster.intersectObjects(scene.children, true);
  intersects.forEach(function (intersect) {
    return intersect.object.name == 'videoMesh' ? playPauseVideo(videoElement) : null;
  });
}

function playPauseVideo(video) {
  if (video.paused) video.play();else video.pause();
}
},{"./store.js":"js/store.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "52266" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","js/main.js"], null)
//# sourceMappingURL=/main.fb6bbcaf.js.map