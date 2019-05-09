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
})({"js/threex/threex.artoolkitsource.js":[function(require,module,exports) {
var ARjs = ARjs || {};
var THREEx = THREEx || {};

ARjs.Source = THREEx.ArToolkitSource = function (parameters) {
  var _this = this;

  this.ready = false;
  this.domElement = null; // handle default parameters

  this.parameters = {
    // type of source - ['webcam', 'image', 'video']
    sourceType: 'webcam',
    // url of the source - valid if sourceType = image|video
    sourceUrl: null,
    // resolution of at which we initialize in the source image
    sourceWidth: 640,
    sourceHeight: 480,
    // resolution displayed for the source 
    displayWidth: 640,
    displayHeight: 480 //////////////////////////////////////////////////////////////////////////////
    //		setParameters
    //////////////////////////////////////////////////////////////////////////////

  };
  setParameters(parameters);

  function setParameters(parameters) {
    if (parameters === undefined) return;

    for (var key in parameters) {
      var newValue = parameters[key];

      if (newValue === undefined) {
        console.warn("THREEx.ArToolkitSource: '" + key + "' parameter is undefined.");
        continue;
      }

      var currentValue = _this.parameters[key];

      if (currentValue === undefined) {
        console.warn("THREEx.ArToolkitSource: '" + key + "' is not a property of this material.");
        continue;
      }

      _this.parameters[key] = newValue;
    }
  }
}; //////////////////////////////////////////////////////////////////////////////
//		Code Separator
//////////////////////////////////////////////////////////////////////////////


ARjs.Source.prototype.init = function (onReady, onError) {
  var _this = this;

  if (this.parameters.sourceType === 'image') {
    var domElement = this._initSourceImage(onSourceReady, onError);
  } else if (this.parameters.sourceType === 'video') {
    var domElement = this._initSourceVideo(onSourceReady, onError);
  } else if (this.parameters.sourceType === 'webcam') {
    // var domElement = this._initSourceWebcamOld(onSourceReady)                        
    var domElement = this._initSourceWebcam(onSourceReady, onError);
  } else {
    console.assert(false);
  } // attach


  this.domElement = domElement;
  this.domElement.style.position = 'absolute';
  this.domElement.style.top = '0px';
  this.domElement.style.left = '0px';
  this.domElement.style.zIndex = '-2';
  return this;

  function onSourceReady() {
    document.body.appendChild(_this.domElement);
    _this.ready = true;
    onReady && onReady();
  }
}; ////////////////////////////////////////////////////////////////////////////////
//          init image source
////////////////////////////////////////////////////////////////////////////////


ARjs.Source.prototype._initSourceImage = function (onReady) {
  // TODO make it static
  var domElement = document.createElement('img');
  domElement.src = this.parameters.sourceUrl;
  domElement.width = this.parameters.sourceWidth;
  domElement.height = this.parameters.sourceHeight;
  domElement.style.width = this.parameters.displayWidth + 'px';
  domElement.style.height = this.parameters.displayHeight + 'px'; // wait until the video stream is ready

  var interval = setInterval(function () {
    if (!domElement.naturalWidth) return;
    onReady();
    clearInterval(interval);
  }, 1000 / 50);
  return domElement;
}; ////////////////////////////////////////////////////////////////////////////////
//          init video source
////////////////////////////////////////////////////////////////////////////////


ARjs.Source.prototype._initSourceVideo = function (onReady) {
  // TODO make it static
  var domElement = document.createElement('video');
  domElement.src = this.parameters.sourceUrl;
  domElement.style.objectFit = 'initial';
  domElement.autoplay = true;
  domElement.webkitPlaysinline = true;
  domElement.controls = false;
  domElement.loop = true;
  domElement.muted = true; // trick to trigger the video on android

  document.body.addEventListener('click', function onClick() {
    document.body.removeEventListener('click', onClick);
    domElement.play();
  });
  domElement.width = this.parameters.sourceWidth;
  domElement.height = this.parameters.sourceHeight;
  domElement.style.width = this.parameters.displayWidth + 'px';
  domElement.style.height = this.parameters.displayHeight + 'px'; // wait until the video stream is ready

  var interval = setInterval(function () {
    if (!domElement.videoWidth) return;
    onReady();
    clearInterval(interval);
  }, 1000 / 50);
  return domElement;
}; ////////////////////////////////////////////////////////////////////////////////
//          handle webcam source
////////////////////////////////////////////////////////////////////////////////


ARjs.Source.prototype._initSourceWebcam = function (onReady, onError) {
  var _this = this; // init default value


  onError = onError || function (error) {
    alert('Webcam Error\nName: ' + error.name + '\nMessage: ' + error.message);
  };

  var domElement = document.createElement('video');
  domElement.setAttribute('autoplay', '');
  domElement.setAttribute('muted', '');
  domElement.setAttribute('playsinline', '');
  domElement.style.width = this.parameters.displayWidth + 'px';
  domElement.style.height = this.parameters.displayHeight + 'px'; // check API is available

  if (navigator.mediaDevices === undefined || navigator.mediaDevices.enumerateDevices === undefined || navigator.mediaDevices.getUserMedia === undefined) {
    if (navigator.mediaDevices === undefined) var fctName = 'navigator.mediaDevices';else if (navigator.mediaDevices.enumerateDevices === undefined) var fctName = 'navigator.mediaDevices.enumerateDevices';else if (navigator.mediaDevices.getUserMedia === undefined) var fctName = 'navigator.mediaDevices.getUserMedia';else console.assert(false);
    onError({
      name: '',
      message: 'WebRTC issue-! ' + fctName + ' not present in your browser'
    });
    return null;
  } // get available devices


  navigator.mediaDevices.enumerateDevices().then(function (devices) {
    var userMediaConstraints = {
      audio: false,
      video: {
        facingMode: 'environment',
        width: {
          ideal: _this.parameters.sourceWidth // min: 1024,
          // max: 1920

        },
        height: {
          ideal: _this.parameters.sourceHeight // min: 776,
          // max: 1080

        }
      } // get a device which satisfy the constraints

    };
    navigator.mediaDevices.getUserMedia(userMediaConstraints).then(function success(stream) {
      // set the .src of the domElement
      domElement.srcObject = stream; // to start the video, when it is possible to start it only on userevent. like in android

      document.body.addEventListener('click', function () {
        domElement.play();
      }); // domElement.play();
      // TODO listen to loadedmetadata instead
      // wait until the video stream is ready

      var interval = setInterval(function () {
        if (!domElement.videoWidth) return;
        onReady();
        clearInterval(interval);
      }, 1000 / 50);
    }).catch(function (error) {
      onError({
        name: error.name,
        message: error.message
      });
    });
  }).catch(function (error) {
    onError({
      message: error.message
    });
  });
  return domElement;
}; //////////////////////////////////////////////////////////////////////////////
//		Handle Mobile Torch
//////////////////////////////////////////////////////////////////////////////


ARjs.Source.prototype.hasMobileTorch = function () {
  var stream = arToolkitSource.domElement.srcObject;
  if (stream instanceof MediaStream === false) return false;

  if (this._currentTorchStatus === undefined) {
    this._currentTorchStatus = false;
  }

  var videoTrack = stream.getVideoTracks()[0]; // if videoTrack.getCapabilities() doesnt exist, return false now

  if (videoTrack.getCapabilities === undefined) return false;
  var capabilities = videoTrack.getCapabilities();
  return capabilities.torch ? true : false;
};
/**
 * toggle the flash/torch of the mobile fun if applicable.
 * Great post about it https://www.oberhofer.co/mediastreamtrack-and-its-capabilities/
 */


ARjs.Source.prototype.toggleMobileTorch = function () {
  // sanity check
  console.assert(this.hasMobileTorch() === true);
  var stream = arToolkitSource.domElement.srcObject;

  if (stream instanceof MediaStream === false) {
    alert('enabling mobile torch is available only on webcam');
    return;
  }

  if (this._currentTorchStatus === undefined) {
    this._currentTorchStatus = false;
  }

  var videoTrack = stream.getVideoTracks()[0];
  var capabilities = videoTrack.getCapabilities();

  if (!capabilities.torch) {
    alert('no mobile torch is available on your camera');
    return;
  }

  this._currentTorchStatus = this._currentTorchStatus === false ? true : false;
  videoTrack.applyConstraints({
    advanced: [{
      torch: this._currentTorchStatus
    }]
  }).catch(function (error) {
    console.log(error);
  });
};

ARjs.Source.prototype.domElementWidth = function () {
  return parseInt(this.domElement.style.width);
};

ARjs.Source.prototype.domElementHeight = function () {
  return parseInt(this.domElement.style.height);
}; ////////////////////////////////////////////////////////////////////////////////
//          handle resize
////////////////////////////////////////////////////////////////////////////////


ARjs.Source.prototype.onResizeElement = function () {
  var _this = this;

  var screenWidth = window.innerWidth;
  var screenHeight = window.innerHeight; // sanity check

  console.assert(arguments.length === 0); // compute sourceWidth, sourceHeight

  if (this.domElement.nodeName === "IMG") {
    var sourceWidth = this.domElement.naturalWidth;
    var sourceHeight = this.domElement.naturalHeight;
  } else if (this.domElement.nodeName === "VIDEO") {
    var sourceWidth = this.domElement.videoWidth;
    var sourceHeight = this.domElement.videoHeight;
  } else {
    console.assert(false);
  } // compute sourceAspect


  var sourceAspect = sourceWidth / sourceHeight; // compute screenAspect

  var screenAspect = screenWidth / screenHeight; // if screenAspect < sourceAspect, then change the width, else change the height

  if (screenAspect < sourceAspect) {
    // compute newWidth and set .width/.marginLeft
    var newWidth = sourceAspect * screenHeight;
    this.domElement.style.width = newWidth + 'px';
    this.domElement.style.marginLeft = -(newWidth - screenWidth) / 2 + 'px'; // init style.height/.marginTop to normal value

    this.domElement.style.height = screenHeight + 'px';
    this.domElement.style.marginTop = '0px';
  } else {
    // compute newHeight and set .height/.marginTop
    var newHeight = 1 / (sourceAspect / screenWidth);
    this.domElement.style.height = newHeight + 'px';
    this.domElement.style.marginTop = -(newHeight - screenHeight) / 2 + 'px'; // init style.width/.marginLeft to normal value

    this.domElement.style.width = screenWidth + 'px';
    this.domElement.style.marginLeft = '0px';
  }
};
/*
ARjs.Source.prototype.copyElementSizeTo = function(otherElement){
	otherElement.style.width = this.domElement.style.width
	otherElement.style.height = this.domElement.style.height	
	otherElement.style.marginLeft = this.domElement.style.marginLeft
	otherElement.style.marginTop = this.domElement.style.marginTop
}
*/


ARjs.Source.prototype.copyElementSizeTo = function (otherElement) {
  if (window.innerWidth > window.innerHeight) {
    //landscape
    otherElement.style.width = this.domElement.style.width;
    otherElement.style.height = this.domElement.style.height;
    otherElement.style.marginLeft = this.domElement.style.marginLeft;
    otherElement.style.marginTop = this.domElement.style.marginTop;
  } else {
    //portrait
    otherElement.style.height = this.domElement.style.height;
    otherElement.style.width = parseInt(otherElement.style.height) * 4 / 3 + "px";
    otherElement.style.marginLeft = (window.innerWidth - parseInt(otherElement.style.width)) / 2 + "px";
    otherElement.style.marginTop = 0;
  }
}; //////////////////////////////////////////////////////////////////////////////
//		Code Separator
//////////////////////////////////////////////////////////////////////////////


ARjs.Source.prototype.copySizeTo = function () {
  console.warn('obsolete function arToolkitSource.copySizeTo. Use arToolkitSource.copyElementSizeTo');
  this.copyElementSizeTo.apply(this, arguments);
}; //////////////////////////////////////////////////////////////////////////////
//		Code Separator
//////////////////////////////////////////////////////////////////////////////


ARjs.Source.prototype.onResize = function (arToolkitContext, renderer, camera) {
  if (arguments.length !== 3) {
    console.warn('obsolete function arToolkitSource.onResize. Use arToolkitSource.onResizeElement');
    return this.onResizeElement.apply(this, arguments);
  }

  var trackingBackend = arToolkitContext.parameters.trackingBackend; // RESIZE DOMELEMENT

  if (trackingBackend === 'artoolkit') {
    this.onResizeElement();
    var isAframe = renderer.domElement.dataset.aframeCanvas ? true : false;

    if (isAframe === false) {
      this.copyElementSizeTo(renderer.domElement);
    } else {}

    if (arToolkitContext.arController !== null) {
      this.copyElementSizeTo(arToolkitContext.arController.canvas);
    }
  } else if (trackingBackend === 'aruco') {
    this.onResizeElement();
    this.copyElementSizeTo(renderer.domElement);
    this.copyElementSizeTo(arToolkitContext.arucoContext.canvas);
  } else if (trackingBackend === 'tango') {
    renderer.setSize(window.innerWidth, window.innerHeight);
  } else console.assert(false, 'unhandled trackingBackend ' + trackingBackend); // UPDATE CAMERA


  if (trackingBackend === 'artoolkit') {
    if (arToolkitContext.arController !== null) {
      camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    }
  } else if (trackingBackend === 'aruco') {
    camera.aspect = renderer.domElement.width / renderer.domElement.height;
    camera.updateProjectionMatrix();
  } else if (trackingBackend === 'tango') {
    var vrDisplay = arToolkitContext._tangoContext.vrDisplay; // make camera fit vrDisplay

    if (vrDisplay && vrDisplay.displayName === "Tango VR Device") THREE.WebAR.resizeVRSeeThroughCamera(vrDisplay, camera);
  } else console.assert(false, 'unhandled trackingBackend ' + trackingBackend);
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
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","js/threex/threex.artoolkitsource.js"], null)
//# sourceMappingURL=/threex.artoolkitsource.a1eaaa09.js.map