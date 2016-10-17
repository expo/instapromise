'use strict';

require('../instapromise');

it('adds `promise` to all objects and functions', () => {
  function func() {}
  expect(typeof func.promise).toBe('function');

  let object = { method() {} };
  expect(object.promise).toBeDefined();
  expect(typeof object.promise.method).toBe('function');
});

it('adds `promiseArray` to all objects and functions', () => {
  function func() {}
  expect(typeof func.promiseArray).toBe('function');

  let object = { method() {} };
  expect(object.promiseArray).toBeDefined();
  expect(typeof object.promiseArray.method).toBe('function');
});

describe('promise', () => {
  it('promisifies plain functions', () => {
    let functionCallback;
    function func(a, b, callback) {
      expect(a).toBe('arg0');
      expect(b).toBe('arg1');
      functionCallback = callback;
    }

    let promise = func.promise('arg0', 'arg1');
    expect(typeof functionCallback).toBe('function');

    functionCallback(null, 'result');
    return promise.then(result => {
      expect(result).toBe('result');
    });
  });

  it('promisifies object methods', () => {
    let methodCallback;
    let object = {
      methodX(a, b, callback) {
        expect(a).toBe('arg0');
        expect(b).toBe('arg1');
        methodCallback = callback;
      },
    };

    let promise = object.promise.methodX('arg0', 'arg1');
    expect(typeof methodCallback).toBe('function');

    methodCallback(null, 'result');
    return promise.then(result => {
      expect(result).toBe('result');
    });
  });

  it('promisifies instance methods', () => {
    let methodCallback;
    class TestClass {
      method(a, b, callback) {
        expect(a).toBe('arg0');
        expect(b).toBe('arg1');
        methodCallback = callback;
      }
    }

    let object = new TestClass();
    let promise = object.promise.method('arg0', 'arg1');
    expect(typeof methodCallback).toBe('function');

    methodCallback(null, 'result');
    return promise.then(result => {
      expect(result).toBe('result');
    });
  });

  it('correctly sets `this` for object methods', () => {
    var object = {
      method(callback) {
        expect(this).toBe(object);
        callback(null, 'result');
      },
    };

    return object.promise.method().then(result => {
      expect(result).toBe('result');
    });
  });

  // Not sure how to implement this without calling bind
  xit('does not set `this` when accessed on a function', () => {
    function func(callback) {
      expect(this).toBe(undefined);
      callback(null, 'result');
    }

    return func.promise().then(result => {
      expect(result).toBe('result');
    });
  });

  it('sets `this` when bound', () => {
    let context = {};
    function func(callback) {
      callback(null, this);
    }

    return func.promise.bind(context)().then(result => {
      expect(result).toBe(context);
    });
  });

  it('sets `this` when invoked with `call`', () => {
    let context = {};
    function func(callback) {
      callback(null, this);
    }

    return func.promise.call(context).then(result => {
      expect(result).toBe(context);
    });
  });

  it('preserves `this` when acessed on a bound function', () => {
    let context = {};
    function func(callback) {
      callback(null, this);
    }

    return func.bind(context).promise().then(result => {
      expect(result).toBe(context);
    });
  });

  it('uses only the first result passed to the callback', () => {
    function func(callback) {
      callback(null, 'result0', 'result1');
    }

    return func.promise().then(result => {
      expect(result).toBe('result0');
    });
  });

  it('rejects the promise if the callback receives an error', () => {
    function func(callback) {
      callback(new Error('intentional error'));
    }

    return func.promise().then(() => {
      throw new Error('The promise should be rejected');
    }, error => {
      expect(error instanceof Error).toBe(true);
      expect(error.message).toBe('intentional error');
    });
  });

  it('supports anonymous functions', () => {
    let anonymousFunction = new Function('callback', 'callback(null, "ok")');

    expect(anonymousFunction.promise.name).toBe('anonymous');
    return anonymousFunction.promise().then(result => {
      expect(result).toBe('ok');
    });
  });

  it('supports functions named `default`', () => {
    let defaultFunction = ({
      default(callback) {
        callback(null, 'ok');
      },
    }).default;

    expect(defaultFunction.name).toBe('default');
    return defaultFunction.promise().then(result => {
      expect(result).toBe('ok');
    });
  });

  it('supports bound functions', () => {
    let boundFunction = function example(callback) {
      callback(null, 'ok');
    }.bind(null);

    expect(boundFunction.promise.name).toBe('example');
    return boundFunction.promise().then(result => {
      expect(result).toBe('ok');
    });
  });

  it('supports functions with symbol names', () => {
    let symbolFunction = ({
      [Symbol.iterator](callback) {
        callback(null, 'ok');
      },
    })[Symbol.iterator];

    // The name actually should be "[Symbol.iterator]"
    expect(symbolFunction.promise.name).toBe('iterator');
    return symbolFunction.promise().then(result => {
      expect(result).toBe('ok');
    });
  });

  xit('is defined on Jest mocks', () => {
    let mockFunction = jest.fn();
    expect(typeof mockFunction.promise).toBe('function');
  });
});

describe('promiseArray', () => {
  it('collects multiple results passed to the callback in an array', () => {
    function func(callback) {
      callback(null, 'result0', 'result1');
    }

    return func.promiseArray().then(result => {
      expect(result).toEqual(['result0', 'result1']);
    });
  });
});
