/**
 * Deft: a JavaScript dependency declaration system.
 */

var deft = {},
    path = require('path');

/**
 * Gets the required files (as a mapping from source to destination name) from a
 * declared dependency.
 *
 * @param {!Array.<string>} dependency
 * @return {!Object.<string, string>}
 *
 * @example
 * deft.getFilesFromDependency(['foo/bar', 'baz.js']); // => { 'baz.js': 'baz.js' }
 * deft.getFilesFromDependency(['foo/bar', '1.1', 'baz.min.js']); // => { 'baz.min.js': 'baz.min.js' }
 */
deft.getFilesFromDependency = function getFilesFromDependency(dependency) {
  return deft.getFiles(dependency[dependency.length - 1]);
};


/**
 * Individual files can be specified in multiple ways. A string represents a
 * single file. An array represents multiple files (duh). And an object can be
 * used to provide a mapping from "source" file names to "destination" file
 * names, e.g., if you want to download jquery-1.2.3.js and have it saved as
 * just jquery.js.
 *
 * Conveniently, any of these representations can be expanded to the object
 * form. That's what this method does, simplifying the rest of the code.
 *
 * @param {string|!Array.<string>|!Object.<string, string>} files
 * @return {!Object.<string, string>}
 */
deft.getFiles = function getFiles(files) {
  if (typeof files === 'string') {
    return deft.filesFromString(files);
  }

  if (files instanceof Array) {
    return deft.filesFromArray(files);
  }

  return files;
};


/**
 * Converts a simple representation of a file (a string) to the full-fledged
 * object mapping represetnation.
 *
 * @param {string} string
 * @return {!Object.<string, string>}
 *
 * @examples
 * deft.filesFromString('foo.js'); // => { 'foo.js': 'foo.js' }
 */
deft.filesFromString = function filesFromString(string) {
  var object = {};
  object[string] = path.basename(string);
  return object;
};


/**
 * Converts an array representation of files to the object mapping
 * representation. This is for the simple case where you want source and
 * destination names to be the same.
 *
 * @param {!Array.<string>} array
 * @return {!Object.<string, string>}
 *
 * @examples
 * deft.filesFromArray(['foo.js', 'bar.js']); // => { 'foo.js': 'foo.js', 'bar.js': 'bar.js' }
 */
deft.filesFromArray = function filesFromArray(array) {
  var object = {};
  for (var i = 0; i < array.length; ++i) {
    object[array[i]] = path.basename(array[i]);
  }
  return object;
};


/**
 * Given the name of a file and the {@link Dependency} it comes from, gets
 * the URL used to download the file.
 *
 * @param {string} file
 * @param {!Dependency} dependency
 * @return {string}
 */
deft.getUrl = function getUrl(file, dependency) {
  if ((/^https?:/).test(dependency[0])) {
    return url.resolve(dependency[0], file);
  }

  var name = dependency[0],
      tag  = dependency.length > 2 ? dependency[1] : 'master';

  return 'https://raw.githubusercontent.com/' + name + '/' + tag + '/' + file;
};


/**
 * Clips a string to a given maximum length.
 *
 * @examples
 * deft.clip('hello', 10); // => 'hello'
 * deft.clip('hello', 4);  // => 'h...'
 * deft.clip('hello', -1); // => '...'
 */
deft.clip = function clip(str, length) {
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
deft.not = function not(fn) {
  return function() {
    return !fn.apply(this, arguments);
  };
};

module.exports = deft;
