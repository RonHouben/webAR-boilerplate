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
})({"js/threex/threex.armarkercontrols.js":[function(require,module,exports) {
var ARjs = ARjs || {};
var THREEx = THREEx || {};

ARjs.MarkerControls = THREEx.ArMarkerControls = function (context, object3d, parameters) {
  var _this = this;

  THREEx.ArBaseControls.call(this, object3d);
  this.context = context; // handle default parameters

  this.parameters = {
    // size of the marker in meter
    size: 1,
    // type of marker - ['pattern', 'barcode', 'unknown' ]
    type: 'unknown',
    // url of the pattern - IIF type='pattern'
    patternUrl: null,
    // value of the barcode - IIF type='barcode'
    barcodeValue: null,
    // change matrix mode - [modelViewMatrix, cameraTransformMatrix]
    changeMatrixMode: 'modelViewMatrix',
    // minimal confidence in the marke recognition - between [0, 1] - default to 1
    minConfidence: 0.6 // sanity check

  };
  var possibleValues = ['pattern', 'barcode', 'unknown'];
  console.assert(possibleValues.indexOf(this.parameters.type) !== -1, 'illegal value', this.parameters.type);
  var possibleValues = ['modelViewMatrix', 'cameraTransformMatrix'];
  console.assert(possibleValues.indexOf(this.parameters.changeMatrixMode) !== -1, 'illegal value', this.parameters.changeMatrixMode); // create the marker Root

  this.object3d = object3d;
  this.object3d.matrixAutoUpdate = false;
  this.object3d.visible = false; //////////////////////////////////////////////////////////////////////////////
  //		setParameters
  //////////////////////////////////////////////////////////////////////////////

  setParameters(parameters);

  function setParameters(parameters) {
    if (parameters === undefined) return;

    for (var key in parameters) {
      var newValue = parameters[key];

      if (newValue === undefined) {
        console.warn("THREEx.ArMarkerControls: '" + key + "' parameter is undefined.");
        continue;
      }

      var currentValue = _this.parameters[key];

      if (currentValue === undefined) {
        console.warn("THREEx.ArMarkerControls: '" + key + "' is not a property of this material.");
        continue;
      }

      _this.parameters[key] = newValue;
    }
  } //////////////////////////////////////////////////////////////////////////////
  //		Code Separator
  //////////////////////////////////////////////////////////////////////////////
  // add this marker to artoolkitsystem
  // TODO rename that .addMarkerControls


  context.addMarker(this);

  if (_this.context.parameters.trackingBackend === 'artoolkit') {
    this._initArtoolkit();
  } else if (_this.context.parameters.trackingBackend === 'aruco') {
    // TODO create a ._initAruco
    // put aruco second
    this._arucoPosit = new POS.Posit(this.parameters.size, _this.context.arucoContext.canvas.width);
  } else if (_this.context.parameters.trackingBackend === 'tango') {
    this._initTango();
  } else console.assert(false);
};

ARjs.MarkerControls.prototype = Object.create(THREEx.ArBaseControls.prototype);
ARjs.MarkerControls.prototype.constructor = THREEx.ArMarkerControls;

ARjs.MarkerControls.prototype.dispose = function () {
  this.context.removeMarker(this); // TODO remove the event listener if needed
  // unloadMaker ???
}; //////////////////////////////////////////////////////////////////////////////
//		update controls with new modelViewMatrix
//////////////////////////////////////////////////////////////////////////////

/**
 * When you actually got a new modelViewMatrix, you need to perfom a whole bunch
 * of things. it is done here.
 */


ARjs.MarkerControls.prototype.updateWithModelViewMatrix = function (modelViewMatrix) {
  var markerObject3D = this.object3d; // mark object as visible

  markerObject3D.visible = true;

  if (this.context.parameters.trackingBackend === 'artoolkit') {
    // apply context._axisTransformMatrix - change artoolkit axis to match usual webgl one
    var tmpMatrix = new THREE.Matrix4().copy(this.context._artoolkitProjectionAxisTransformMatrix);
    tmpMatrix.multiply(modelViewMatrix);
    modelViewMatrix.copy(tmpMatrix);
  } else if (this.context.parameters.trackingBackend === 'aruco') {// ...
  } else if (this.context.parameters.trackingBackend === 'tango') {// ...
  } else console.assert(false);

  if (this.context.parameters.trackingBackend !== 'tango') {
    // change axis orientation on marker - artoolkit say Z is normal to the marker - ar.js say Y is normal to the marker
    var markerAxisTransformMatrix = new THREE.Matrix4().makeRotationX(Math.PI / 2);
    modelViewMatrix.multiply(markerAxisTransformMatrix);
  } // change markerObject3D.matrix based on parameters.changeMatrixMode


  if (this.parameters.changeMatrixMode === 'modelViewMatrix') {
    markerObject3D.matrix.copy(modelViewMatrix);
  } else if (this.parameters.changeMatrixMode === 'cameraTransformMatrix') {
    markerObject3D.matrix.getInverse(modelViewMatrix);
  } else {
    console.assert(false);
  } // decompose - the matrix into .position, .quaternion, .scale


  markerObject3D.matrix.decompose(markerObject3D.position, markerObject3D.quaternion, markerObject3D.scale); // dispatchEvent

  this.dispatchEvent({
    type: 'markerFound'
  });
}; //////////////////////////////////////////////////////////////////////////////
//		utility functions
//////////////////////////////////////////////////////////////////////////////

/**
 * provide a name for a marker
 * - silly heuristic for now
 * - should be improved
 */


ARjs.MarkerControls.prototype.name = function () {
  var name = '';
  name += this.parameters.type;

  if (this.parameters.type === 'pattern') {
    var url = this.parameters.patternUrl;
    var basename = url.replace(/^.*\//g, '');
    name += ' - ' + basename;
  } else if (this.parameters.type === 'barcode') {
    name += ' - ' + this.parameters.barcodeValue;
  } else {
    console.assert(false, 'no .name() implemented for this marker controls');
  }

  return name;
}; //////////////////////////////////////////////////////////////////////////////
//		init for Artoolkit
//////////////////////////////////////////////////////////////////////////////


ARjs.MarkerControls.prototype._initArtoolkit = function () {
  var _this = this;

  var artoolkitMarkerId = null;
  var delayedInitTimerId = setInterval(function () {
    // check if arController is init
    var arController = _this.context.arController;
    if (arController === null) return; // stop looping if it is init

    clearInterval(delayedInitTimerId);
    delayedInitTimerId = null; // launch the _postInitArtoolkit

    postInit();
  }, 1000 / 50);
  return;

  function postInit() {
    // check if arController is init
    var arController = _this.context.arController;
    console.assert(arController !== null); // start tracking this pattern

    if (_this.parameters.type === 'pattern') {
      arController.loadMarker(_this.parameters.patternUrl, function (markerId) {
        artoolkitMarkerId = markerId;
        arController.trackPatternMarkerId(artoolkitMarkerId, _this.parameters.size);
      });
    } else if (_this.parameters.type === 'barcode') {
      artoolkitMarkerId = _this.parameters.barcodeValue;
      arController.trackBarcodeMarkerId(artoolkitMarkerId, _this.parameters.size);
    } else if (_this.parameters.type === 'unknown') {
      artoolkitMarkerId = null;
    } else {
      console.log(false, 'invalid marker type', _this.parameters.type);
    } // listen to the event


    arController.addEventListener('getMarker', function (event) {
      if (event.data.type === artoolkit.PATTERN_MARKER && _this.parameters.type === 'pattern') {
        if (artoolkitMarkerId === null) return;
        if (event.data.marker.idPatt === artoolkitMarkerId) onMarkerFound(event);
      } else if (event.data.type === artoolkit.BARCODE_MARKER && _this.parameters.type === 'barcode') {
        // console.log('BARCODE_MARKER idMatrix', event.data.marker.idMatrix, artoolkitMarkerId )
        if (artoolkitMarkerId === null) return;
        if (event.data.marker.idMatrix === artoolkitMarkerId) onMarkerFound(event);
      } else if (event.data.type === artoolkit.UNKNOWN_MARKER && _this.parameters.type === 'unknown') {
        onMarkerFound(event);
      }
    });
  }

  function onMarkerFound(event) {
    // honor his.parameters.minConfidence
    if (event.data.type === artoolkit.PATTERN_MARKER && event.data.marker.cfPatt < _this.parameters.minConfidence) return;
    if (event.data.type === artoolkit.BARCODE_MARKER && event.data.marker.cfMatt < _this.parameters.minConfidence) return;
    var modelViewMatrix = new THREE.Matrix4().fromArray(event.data.matrix);

    _this.updateWithModelViewMatrix(modelViewMatrix);
  }
}; //////////////////////////////////////////////////////////////////////////////
//		aruco specific
//////////////////////////////////////////////////////////////////////////////


ARjs.MarkerControls.prototype._initAruco = function () {
  this._arucoPosit = new POS.Posit(this.parameters.size, _this.context.arucoContext.canvas.width);
}; //////////////////////////////////////////////////////////////////////////////
//		init for Artoolkit
//////////////////////////////////////////////////////////////////////////////


ARjs.MarkerControls.prototype._initTango = function () {
  var _this = this;

  console.log('init tango ArMarkerControls');
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
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","js/threex/threex.armarkercontrols.js"], null)
//# sourceMappingURL=/threex.armarkercontrols.242cc783.js.map