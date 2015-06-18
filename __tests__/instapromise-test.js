'use strict';

jest.autoMockOff();

require('..');


describe('instapromise', function() {

  // beforeEach(function() {
  //   jasmine.clock().install();
  // });
  //
  // afterEach(function() {
  //   jasmine.clock().uninstall();
  // });

  it('adds `promise` to all objects and functions', function() {
    function func() {}
    expect(typeof func.promise).toBe('function');

    var object = { method: function() {} };
    expect(object.promise).toBeDefined();
    expect(typeof object.promise.method).toBe('function');
  });

  it('adds `promiseArray` to all objects and functions', function() {
    function func() {}
    expect(typeof func.promiseArray).toBe('function');

    var object = { method: function() {} };
    expect(object.promiseArray).toBeDefined();
    expect(typeof object.promiseArray.method).toBe('function');
  });

  describe('promise', function() {
    pit('promisifies plain functions', function() {
      var functionCallback;
      function func(a, b, callback) {
        expect(a).toBe('arg0');
        expect(b).toBe('arg1');
        functionCallback = callback;
      }

      var promise = func.promise('arg0', 'arg1');
      expect(typeof functionCallback).toBe('function');

      functionCallback(null, 'result');
      return promise.then(function(result) {
        expect(result).toBe('result');
      });
    });

    pit('promisifies object methods', function() {
      var methodCallback;
      var object = {
        method: function(a, b, callback) {
          expect(a).toBe('arg0');
          expect(b).toBe('arg1');
          methodCallback = callback;
        },
      };

      var promise = object.promise.method('arg0', 'arg1');
      expect(typeof methodCallback).toBe('function');

      methodCallback(null, 'result');
      return promise.then(function(result) {
        expect(result).toBe('result');
      });
    });

    pit('correctly sets `this` for object methods', function() {
      var object = {
        method: function(callback) {
          expect(this).toBe(object);
          callback(null, 'result');
        },
      };

      return object.promise.method().then(function(result) {
        expect(result).toBe('result');
      });
    });

    // pit('does not set `this` when accessed on a function', function() {
    //   function func(callback) {
    //     expect(this).toBe(undefined);
    //     callback(null, 'result');
    //   }
    //
    //   return func.promise().then(function(result) {
    //     expect(result).toBe('result');
    //   });
    // });

    pit('uses only the first result passed to the callback', function() {
      function func(callback) {
        callback(null, 'result0', 'result1');
      }

      return func.promise().then(function(result) {
        expect(result).toBe('result0');
      });
    });

    pit('rejects the promise if the callback receives an error', function() {
      function func(callback) {
        callback(new Error('intentional error'));
      }

      return func.promise().then(function() {
        throw new Error('The promise should be rejected');
      }, function(error) {
        expect(error instanceof Error).toBe(true);
        expect(error.message).toBe('intentional error');
      });
    });
  });

  describe('promiseArray', function() {
    it('collects multiple results passed to the callback in an array', function() {
      function func(callback) {
        callback(null, 'result0', 'result1');
      }

      return func.promise().then(function(result) {
        expect(result).toEqual(['result0', 'result1']);
      });
    });
  });
});
