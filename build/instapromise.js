'use strict';

var promisify = require('./promisify');

var nonProxiedPropertyNames = {
  constructor: true,
  promise: true,
  promiseArray: true
};

function defineMemoizedInstanceProperty(target, propertyName, factory) {
  Object.defineProperty(target, propertyName, {
    enumerable: false,
    configurable: true,
    get: function get() {
      var value = factory(this);
      Object.defineProperty(this, propertyName, {
        enumerable: false,
        configurable: true,
        value: value,
        writable: true
      });
      return value;
    },
    set: function set(value) {
      Object.defineProperty(this, propertyName, {
        enumerable: true,
        configurable: true,
        value: value,
        writable: true
      });
    }
  });
}

/**
 * Creates the proxy accessed via `source.promise` or `source.promiseArray`.
 */
function createPromisifiedProxy(source, promisifyPropertyName) {
  // TODO: Use actual proxy objects when supported
  var proxy = void 0;
  var withArrayResult = promisifyPropertyName === 'promiseArray';
  if (typeof source === 'function') {
    proxy = promisify(source, withArrayResult);

    // TODO: Use a symbol for the property name when supported
    Object.defineProperty(proxy, '___instapromiseOriginalFunction___', {
      enumerable: false,
      configurable: true,
      value: source,
      writable: true
    });

    var originalPrototype = Object.getPrototypeOf(source);
    if (originalPrototype !== Function.prototype) {
      setPrototypeOf(proxy, originalPrototype);
    }
  } else {
    var _originalPrototype = Object.getPrototypeOf(source);
    proxy = Object.create(_originalPrototype);
  }

  // Expose the functions of the source object through the proxy
  var propertyNames = Object.getOwnPropertyNames(source);
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    var _loop = function _loop() {
      var propertyName = _step.value;

      if (nonProxiedPropertyNames.hasOwnProperty(propertyName)) {
        return 'continue';
      }
      // Ignore overrides of built-in methods like toString that can cause issues
      if (Object.prototype.hasOwnProperty(propertyName)) {
        return 'continue';
      }
      var descriptor = Object.getOwnPropertyDescriptor(source, propertyName);
      // Getter methods are not supported since they can have unintentional side
      // effects when called in the wrong context
      if (descriptor.get) {
        return 'continue';
      }
      // Proxy only functions
      if (typeof source[propertyName] !== 'function') {
        return 'continue';
      }
      proxy[propertyName] = function () {
        var asyncFunction = promisify(source[propertyName], withArrayResult);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return asyncFunction.apply(source, args);
      };
      proxy[propertyName].displayName = propertyName;
    };

    for (var _iterator = propertyNames[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _ret = _loop();

      if (_ret === 'continue') continue;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return proxy;
}

function setPrototypeOf(target, prototype) {
  if (typeof Object.setPrototypeOf === 'function') {
    Object.setPrototypeOf(target, prototype);
  } else {
    target.__proto__ = prototype;
  }
}

var _arr = [Object.prototype, Function.prototype];
for (var _i = 0; _i < _arr.length; _i++) {
  var base = _arr[_i];var _arr2 = ['promise', 'promiseArray'];

  var _loop2 = function _loop2() {
    var promisifyPropertyName = _arr2[_i2];
    if (base.hasOwnProperty(promisifyPropertyName)) {
      return 'continue';
    }
    defineMemoizedInstanceProperty(base, promisifyPropertyName, function (target) {
      return createPromisifiedProxy(target, promisifyPropertyName);
    });
  };

  for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
    var _ret2 = _loop2();

    if (_ret2 === 'continue') continue;
  }
}