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
      method(a, b, callback) {
        expect(a).toBe('arg0');
        expect(b).toBe('arg1');
        methodCallback = callback;
      },
    };

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

  // it('does not set `this` when accessed on a function', () => {
  //   function func(callback) {
  //     expect(this).toBe(undefined);
  //     callback(null, 'result');
  //   }
  //
  //   return func.promise().then(function(result) {
  //     expect(result).toBe('result');
  //   });
  // });

  it('sets `this` when bound', () => {
    let context = {};
    function func(callback) {
      callback(null, this);
    }

    return func.promise.bind(context)().then(function(result) {
      expect(result).toBe(context);
    });
  });

  it('sets `this` when invoked with `call`', () => {
    let context = {};
    function func(callback) {
      callback(null, this);
    }

    return func.promise.call(context).then(function(result) {
      expect(result).toBe(context);
    });
  });

  it('preserves `this` when acessed on a bound function', () => {
    let context = {};
    function func(callback) {
      callback(null, this);
    }

    return func.bind(context).promise().then(function(result) {
      expect(result).toBe(context);
    });
  });

  it('uses only the first result passed to the callback', () => {
    function func(callback) {
      callback(null, 'result0', 'result1');
    }

    return func.promise().then(function(result) {
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
