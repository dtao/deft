/**
 * Deft: a JavaScript dependency declaration system.
 */

/**
 * Clips a string to a given maximum length.
 *
 * @examples
 * deft.clip('hello', 10); // => 'hello'
 * deft.clip('hello', 4);  // => 'h...'
 * deft.clip('hello', -1); // => '...'
 */
exports.clip = function clip(str, length) {
  length = Math.max(length, 3);

  if (str.length <= length) {
    return str;
  }

  return str.substring(0, length - 3) + '...';
};

/**
 * Negates a function; i.e., returns whatever the opposite result is (assumes
 * boolean return values).
 *
 * @examples
 * var returnTrue = function() { return true; };
 *
 * deft.not(returnTrue);   // instanceof Function
 * deft.not(returnTrue)(); // => false
 */
exports.not = function not(fn) {
  return function() {
    return !fn.apply(this, arguments);
  };
};
