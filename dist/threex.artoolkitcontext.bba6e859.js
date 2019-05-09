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
})({"js/threex/threex.artoolkitcontext.js":[function(require,module,exports) {
var ARjs = ARjs || {};
var THREEx = THREEx || {};

ARjs.Context = THREEx.ArToolkitContext = function (parameters) {
  var _this = this;

  _this._updatedAt = null; // handle default parameters

  this.parameters = {
    // AR backend - ['artoolkit', 'aruco', 'tango']
    trackingBackend: 'artoolkit',
    // debug - true if one should display artoolkit debug canvas, false otherwise
    debug: false,
    // the mode of detection - ['color', 'color_and_matrix', 'mono', 'mono_and_matrix']
    detectionMode: 'mono',
    // type of matrix code - valid iif detectionMode end with 'matrix' - [3x3, 3x3_HAMMING63, 3x3_PARITY65, 4x4, 4x4_BCH_13_9_3, 4x4_BCH_13_5_5]
    matrixCodeType: '3x3',
    // url of the camera parameters
    cameraParametersUrl: ARjs.Context.baseURL + 'parameters/camera_para.dat',
    // tune the maximum rate of pose detection in the source image
    maxDetectionRate: 60,
    // resolution of at which we detect pose in the source image
    canvasWidth: 640,
    canvasHeight: 480,
    // the patternRatio inside the artoolkit marker - artoolkit only
    patternRatio: 0.5,
    // enable image smoothing or not for canvas copy - default to true
    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled
    imageSmoothingEnabled: false // parameters sanity check

  };
  console.assert(['artoolkit', 'aruco', 'tango'].indexOf(this.parameters.trackingBackend) !== -1, 'invalid parameter trackingBackend', this.parameters.trackingBackend);
  console.assert(['color', 'color_and_matrix', 'mono', 'mono_and_matrix'].indexOf(this.parameters.detectionMode) !== -1, 'invalid parameter detectionMode', this.parameters.detectionMode);
  this.arController = null;
  this.arucoContext = null;
  _this.initialized = false;
  this._arMarkersControls = []; //////////////////////////////////////////////////////////////////////////////
  //		setParameters
  //////////////////////////////////////////////////////////////////////////////

  setParameters(parameters);

  function setParameters(parameters) {
    if (parameters === undefined) return;

    for (var key in parameters) {
      var newValue = parameters[key];

      if (newValue === undefined) {
        console.warn("THREEx.ArToolkitContext: '" + key + "' parameter is undefined.");
        continue;
      }

      var currentValue = _this.parameters[key];

      if (currentValue === undefined) {
        console.warn("THREEx.ArToolkitContext: '" + key + "' is not a property of this material.");
        continue;
      }

      _this.parameters[key] = newValue;
    }
  }
};

Object.assign(ARjs.Context.prototype, THREE.EventDispatcher.prototype); // ARjs.Context.baseURL = '../'
// default to github page

ARjs.Context.baseURL = 'https://jeromeetienne.github.io/AR.js/three.js/';
ARjs.Context.REVISION = '1.6.0';
/**
 * Create a default camera for this trackingBackend
 * @param {string} trackingBackend - the tracking to user
 * @return {THREE.Camera} the created camera
 */

ARjs.Context.createDefaultCamera = function (trackingBackend) {
  console.assert(false, 'use ARjs.Utils.createDefaultCamera instead'); // Create a camera

  if (trackingBackend === 'artoolkit') {
    var camera = new THREE.Camera();
  } else if (trackingBackend === 'aruco') {
    var camera = new THREE.PerspectiveCamera(42, renderer.domElement.width / renderer.domElement.height, 0.01, 100);
  } else if (trackingBackend === 'tango') {
    var camera = new THREE.PerspectiveCamera(42, renderer.domElement.width / renderer.domElement.height, 0.01, 100);
  } else console.assert(false);

  return camera;
}; //////////////////////////////////////////////////////////////////////////////
//		init functions
//////////////////////////////////////////////////////////////////////////////


ARjs.Context.prototype.init = function (onCompleted) {
  var _this = this;

  if (this.parameters.trackingBackend === 'artoolkit') {
    this._initArtoolkit(done);
  } else if (this.parameters.trackingBackend === 'aruco') {
    this._initAruco(done);
  } else if (this.parameters.trackingBackend === 'tango') {
    this._initTango(done);
  } else console.assert(false);

  return;

  function done() {
    // dispatch event
    _this.dispatchEvent({
      type: 'initialized'
    });

    _this.initialized = true;
    onCompleted && onCompleted();
  }
}; ////////////////////////////////////////////////////////////////////////////////
//          update function
////////////////////////////////////////////////////////////////////////////////


ARjs.Context.prototype.update = function (srcElement) {
  // be sure arController is fully initialized
  if (this.parameters.trackingBackend === 'artoolkit' && this.arController === null) return false; // honor this.parameters.maxDetectionRate

  var present = performance.now();

  if (this._updatedAt !== null && present - this._updatedAt < 1000 / this.parameters.maxDetectionRate) {
    return false;
  }

  this._updatedAt = present; // mark all markers to invisible before processing this frame

  this._arMarkersControls.forEach(function (markerControls) {
    markerControls.object3d.visible = false;
  }); // process this frame


  if (this.parameters.trackingBackend === 'artoolkit') {
    this._updateArtoolkit(srcElement);
  } else if (this.parameters.trackingBackend === 'aruco') {
    this._updateAruco(srcElement);
  } else if (this.parameters.trackingBackend === 'tango') {
    this._updateTango(srcElement);
  } else {
    console.assert(false);
  } // dispatch event


  this.dispatchEvent({
    type: 'sourceProcessed'
  }); // return true as we processed the frame

  return true;
}; ////////////////////////////////////////////////////////////////////////////////
//          Add/Remove markerControls
////////////////////////////////////////////////////////////////////////////////


ARjs.Context.prototype.addMarker = function (arMarkerControls) {
  console.assert(arMarkerControls instanceof THREEx.ArMarkerControls);

  this._arMarkersControls.push(arMarkerControls);
};

ARjs.Context.prototype.removeMarker = function (arMarkerControls) {
  console.assert(arMarkerControls instanceof THREEx.ArMarkerControls); // console.log('remove marker for', arMarkerControls)

  var index = this.arMarkerControlss.indexOf(artoolkitMarker);
  console.assert(index !== index);

  this._arMarkersControls.splice(index, 1);
}; //////////////////////////////////////////////////////////////////////////////
//		artoolkit specific
//////////////////////////////////////////////////////////////////////////////


ARjs.Context.prototype._initArtoolkit = function (onCompleted) {
  var _this = this; // set this._artoolkitProjectionAxisTransformMatrix to change artoolkit projection matrix axis to match usual webgl one


  this._artoolkitProjectionAxisTransformMatrix = new THREE.Matrix4();

  this._artoolkitProjectionAxisTransformMatrix.multiply(new THREE.Matrix4().makeRotationY(Math.PI));

  this._artoolkitProjectionAxisTransformMatrix.multiply(new THREE.Matrix4().makeRotationZ(Math.PI)); // get cameraParameters


  var cameraParameters = new ARCameraParam(_this.parameters.cameraParametersUrl, function () {
    // init controller
    var arController = new ARController(_this.parameters.canvasWidth, _this.parameters.canvasHeight, cameraParameters);
    _this.arController = arController; // honor this.parameters.imageSmoothingEnabled

    arController.ctx.mozImageSmoothingEnabled = _this.parameters.imageSmoothingEnabled;
    arController.ctx.webkitImageSmoothingEnabled = _this.parameters.imageSmoothingEnabled;
    arController.ctx.msImageSmoothingEnabled = _this.parameters.imageSmoothingEnabled;
    arController.ctx.imageSmoothingEnabled = _this.parameters.imageSmoothingEnabled; // honor this.parameters.debug

    if (_this.parameters.debug === true) {
      arController.debugSetup();
      arController.canvas.style.position = 'absolute';
      arController.canvas.style.top = '0px';
      arController.canvas.style.opacity = '0.6';
      arController.canvas.style.pointerEvents = 'none';
      arController.canvas.style.zIndex = '-1';
    } // setPatternDetectionMode


    var detectionModes = {
      'color': artoolkit.AR_TEMPLATE_MATCHING_COLOR,
      'color_and_matrix': artoolkit.AR_TEMPLATE_MATCHING_COLOR_AND_MATRIX,
      'mono': artoolkit.AR_TEMPLATE_MATCHING_MONO,
      'mono_and_matrix': artoolkit.AR_TEMPLATE_MATCHING_MONO_AND_MATRIX
    };
    var detectionMode = detectionModes[_this.parameters.detectionMode];
    console.assert(detectionMode !== undefined);
    arController.setPatternDetectionMode(detectionMode); // setMatrixCodeType

    var matrixCodeTypes = {
      '3x3': artoolkit.AR_MATRIX_CODE_3x3,
      '3x3_HAMMING63': artoolkit.AR_MATRIX_CODE_3x3_HAMMING63,
      '3x3_PARITY65': artoolkit.AR_MATRIX_CODE_3x3_PARITY65,
      '4x4': artoolkit.AR_MATRIX_CODE_4x4,
      '4x4_BCH_13_9_3': artoolkit.AR_MATRIX_CODE_4x4_BCH_13_9_3,
      '4x4_BCH_13_5_5': artoolkit.AR_MATRIX_CODE_4x4_BCH_13_5_5
    };
    var matrixCodeType = matrixCodeTypes[_this.parameters.matrixCodeType];
    console.assert(matrixCodeType !== undefined);
    arController.setMatrixCodeType(matrixCodeType); // set the patternRatio for artoolkit

    arController.setPattRatio(_this.parameters.patternRatio); // set thresholding in artoolkit
    // this seems to be the default
    // arController.setThresholdMode(artoolkit.AR_LABELING_THRESH_MODE_MANUAL)
    // adatative consume a LOT of cpu...
    // arController.setThresholdMode(artoolkit.AR_LABELING_THRESH_MODE_AUTO_ADAPTIVE)
    // arController.setThresholdMode(artoolkit.AR_LABELING_THRESH_MODE_AUTO_OTSU)
    // notify

    onCompleted();
  });
  return this;
};
/**
 * return the projection matrix
 */


ARjs.Context.prototype.getProjectionMatrix = function (srcElement) {
  // FIXME rename this function to say it is artoolkit specific - getArtoolkitProjectMatrix
  // keep a backward compatibility with a console.warn
  console.assert(this.parameters.trackingBackend === 'artoolkit');
  console.assert(this.arController, 'arController MUST be initialized to call this function'); // get projectionMatrixArr from artoolkit

  var projectionMatrixArr = this.arController.getCameraMatrix();
  var projectionMatrix = new THREE.Matrix4().fromArray(projectionMatrixArr); // apply context._axisTransformMatrix - change artoolkit axis to match usual webgl one

  projectionMatrix.multiply(this._artoolkitProjectionAxisTransformMatrix); // return the result

  return projectionMatrix;
};

ARjs.Context.prototype._updateArtoolkit = function (srcElement) {
  this.arController.process(srcElement);
}; //////////////////////////////////////////////////////////////////////////////
//		aruco specific
//////////////////////////////////////////////////////////////////////////////


ARjs.Context.prototype._initAruco = function (onCompleted) {
  this.arucoContext = new THREEx.ArucoContext(); // honor this.parameters.canvasWidth/.canvasHeight

  this.arucoContext.canvas.width = this.parameters.canvasWidth;
  this.arucoContext.canvas.height = this.parameters.canvasHeight; // honor this.parameters.imageSmoothingEnabled

  var context = this.arucoContext.canvas.getContext('2d'); // context.mozImageSmoothingEnabled = this.parameters.imageSmoothingEnabled;

  context.webkitImageSmoothingEnabled = this.parameters.imageSmoothingEnabled;
  context.msImageSmoothingEnabled = this.parameters.imageSmoothingEnabled;
  context.imageSmoothingEnabled = this.parameters.imageSmoothingEnabled;
  setTimeout(function () {
    onCompleted();
  }, 0);
};

ARjs.Context.prototype._updateAruco = function (srcElement) {
  // console.log('update aruco here')
  var _this = this;

  var arMarkersControls = this._arMarkersControls;
  var detectedMarkers = this.arucoContext.detect(srcElement);
  detectedMarkers.forEach(function (detectedMarker) {
    var foundControls = null;

    for (var i = 0; i < arMarkersControls.length; i++) {
      console.assert(arMarkersControls[i].parameters.type === 'barcode');

      if (arMarkersControls[i].parameters.barcodeValue === detectedMarker.id) {
        foundControls = arMarkersControls[i];
        break;
      }
    }

    if (foundControls === null) return;
    var tmpObject3d = new THREE.Object3D();

    _this.arucoContext.updateObject3D(tmpObject3d, foundControls._arucoPosit, foundControls.parameters.size, detectedMarker);

    tmpObject3d.updateMatrix();
    foundControls.updateWithModelViewMatrix(tmpObject3d.matrix);
  });
}; //////////////////////////////////////////////////////////////////////////////
//		tango specific
//////////////////////////////////////////////////////////////////////////////


ARjs.Context.prototype._initTango = function (onCompleted) {
  var _this = this; // check webvr is available


  if (navigator.getVRDisplays) {// do nothing
  } else if (navigator.getVRDevices) {
    alert("Your browser supports WebVR but not the latest version. See <a href='http://webvr.info'>webvr.info</a> for more info.");
  } else {
    alert("Your browser does not support WebVR. See <a href='http://webvr.info'>webvr.info</a> for assistance.");
  }

  this._tangoContext = {
    vrDisplay: null,
    vrPointCloud: null,
    frameData: new VRFrameData() // get vrDisplay

  };
  navigator.getVRDisplays().then(function (vrDisplays) {
    if (vrDisplays.length === 0) alert('no vrDisplays available');
    var vrDisplay = _this._tangoContext.vrDisplay = vrDisplays[0];
    console.log('vrDisplays.displayName :', vrDisplay.displayName); // init vrPointCloud

    if (vrDisplay.displayName === "Tango VR Device") {
      _this._tangoContext.vrPointCloud = new THREE.WebAR.VRPointCloud(vrDisplay, true);
    } // NOTE it doesnt seem necessary and it fails on tango
    // var canvasElement = document.createElement('canvas')
    // document.body.appendChild(canvasElement)
    // _this._tangoContext.requestPresent([{ source: canvasElement }]).then(function(){
    // 	console.log('vrdisplay request accepted')
    // });


    onCompleted();
  });
};

ARjs.Context.prototype._updateTango = function (srcElement) {
  // console.log('update aruco here')
  var _this = this;

  var arMarkersControls = this._arMarkersControls;
  var tangoContext = this._tangoContext;
  var vrDisplay = this._tangoContext.vrDisplay; // check vrDisplay is already initialized

  if (vrDisplay === null) return; // Update the point cloud. Only if the point cloud will be shown the geometry is also updated.

  if (vrDisplay.displayName === "Tango VR Device") {
    var showPointCloud = true;
    var pointsToSkip = 0;

    _this._tangoContext.vrPointCloud.update(showPointCloud, pointsToSkip, true);
  }

  if (this._arMarkersControls.length === 0) return; // TODO here do a fake search on barcode/1001 ?

  var foundControls = this._arMarkersControls[0];
  var frameData = this._tangoContext.frameData; // read frameData

  vrDisplay.getFrameData(frameData);
  if (frameData.pose.position === null) return;
  if (frameData.pose.orientation === null) return; // create cameraTransformMatrix

  var position = new THREE.Vector3().fromArray(frameData.pose.position);
  var quaternion = new THREE.Quaternion().fromArray(frameData.pose.orientation);
  var scale = new THREE.Vector3(1, 1, 1);
  var cameraTransformMatrix = new THREE.Matrix4().compose(position, quaternion, scale); // compute modelViewMatrix from cameraTransformMatrix

  var modelViewMatrix = new THREE.Matrix4();
  modelViewMatrix.getInverse(cameraTransformMatrix);
  foundControls.updateWithModelViewMatrix(modelViewMatrix); // console.log('position', position)
  // if( position.x !== 0 ||  position.y !== 0 ||  position.z !== 0 ){
  // 	console.log('vrDisplay tracking')
  // }else{
  // 	console.log('vrDisplay NOT tracking')
  // }
};
},{}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "62172" + '/');

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
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","js/threex/threex.artoolkitcontext.js"], null)
//# sourceMappingURL=/threex.artoolkitcontext.bba6e859.js.map