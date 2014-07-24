/**
 * Clips a string to a given maximum length.
 *
 * @private
 * @examples
 * clip('hello', 10); // => 'hello'
 * clip('hello', 4);  // => 'h...'
 * clip('hello', -1); // => '...'
 */
function clip(str, length) {
  length = Math.max(length, 3);

  if (str.length <= length) {
    return str;
  }

  return str.substring(0, length - 3) + '...';
}

/**
 * Negates a function; i.e., returns whatever the opposite result is (assumes
 * boolean return values).
 *
 * @private
 * @examples
 * var returnTrue = function() { return true; };
 *
 * not(returnTrue);   // instanceof Function
 * not(returnTrue)(); // => false
 */
function not(fn) {
  return function() {
    return !fn.apply(this, arguments);
  };
}

module.exports = {
  clip: clip,
  not: not
};
