'use strict';

const promisify = require('./promisify');

const nonProxiedPropertyNames = {
  constructor: true,
  promise: true,
  promiseArray: true,
};

function defineMemoizedInstanceProperty(target, propertyName, factory) {
  Object.defineProperty(target, propertyName, {
    enumerable: false,
    configurable: true,
    get() {
      let value = factory(this);
      Object.defineProperty(this, propertyName, {
        enumerable: false,
        configurable: true,
        value,
        writable: true,
      });
      return value;
    },
    set(value) {
      Object.defineProperty(this, propertyName, {
        enumerable: true,
        configurable: true,
        value,
        writable: true,
      });
    },
  });
}

/**
 * Creates the proxy accessed via `source.promise` or `source.promiseArray`.
 */
function createPromisifiedProxy(source, promisifyPropertyName) {
  // TODO: Use actual proxy objects when supported
  let proxy;
  let withArrayResult = promisifyPropertyName === 'promiseArray';
  if (typeof source === 'function') {
    proxy = promisify(source, withArrayResult);

    // TODO: Use a symbol for the property name when supported
    Object.defineProperty(proxy, '___instapromiseOriginalFunction___', {
      enumerable: false,
      configurable: true,
      value: source,
      writable: true,
    });

    let originalPrototype = Object.getPrototypeOf(source);
    if (originalPrototype !== Function.prototype) {
      setPrototypeOf(proxy, originalPrototype);
    }
  } else {
    let originalPrototype = Object.getPrototypeOf(source);
    proxy = Object.create(originalPrototype);
  }

  // Expose the functions of the source object through the proxy
  let propertyNames = Object.getOwnPropertyNames(source);
  for (let propertyName of propertyNames) {
    if (nonProxiedPropertyNames.hasOwnProperty(propertyName)) {
      continue;
    }
    // Ignore overrides of built-in methods like toString that can cause issues
    if (Object.prototype.hasOwnProperty(propertyName)) {
      continue;
    }
    let descriptor = Object.getOwnPropertyDescriptor(source, propertyName);
    // Getter methods are not supported since they can have unintentional side
    // effects when called in the wrong context
    if (descriptor.get) {
      continue;
    }
    // Proxy only functions
    if (typeof source[propertyName] !== 'function') {
      continue;
    }
    proxy[propertyName] = function(...args) {
      let asyncFunction = promisify(source[propertyName], withArrayResult);
      return asyncFunction.apply(source, args);
    };
    proxy[propertyName].displayName = propertyName;
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

for (let base of [Object.prototype, Function.prototype]) {
  for (let promisifyPropertyName of ['promise', 'promiseArray']) {
    if (base.hasOwnProperty(promisifyPropertyName)) {
      continue;
    }
    defineMemoizedInstanceProperty(base, promisifyPropertyName, (target) => {
      return createPromisifiedProxy(target, promisifyPropertyName);
    });
  }
}
