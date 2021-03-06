/**
 * Deft: a JavaScript dependency declaration system.
 */

var deft   = {},
    path   = require('path'),
    semver = require('semver'),
    url    = require('url');

/**
 * Gets the required files (as a mapping from source to destination name) from a
 * declared dependency.
 *
 * @param {!Array.<string>} dependency
 * @return {!Object.<string, string>}
 *
 * @examples
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
 *
 * @examples
 * deft.getFiles('foo.js'); // => { 'foo.js': 'foo.js' }
 * deft.getFiles(['foo.js', 'bar.js']); // => { 'foo.js': 'foo.js', 'bar.js': 'bar.js' }
 */
deft.getFiles = function getFiles(files) {
  if (typeof files === 'string') {
    return deft.filesFromString(files);
  }

  if (files instanceof Array) {
    return deft.filesFromArray(files);
  }

  return deft.normalizeFilePaths(files);
};


/**
 * Converts a simple representation of a file (a string) to the full-fledged
 * object mapping represetnation.
 *
 * @param {string} string
 * @return {!Object.<string, string>}
 *
 * @example
 * deft.filesFromString('foo.js'); // => { 'foo.js': 'foo.js' }
 */
deft.filesFromString = function filesFromString(string) {
  var object = {};
  object[string] = path.basename(string);
  return deft.normalizeFilePaths(object);
};


/**
 * Converts an array representation of files to the object mapping
 * representation. This is for the simple case where you want source and
 * destination names to be the same.
 *
 * @param {!Array.<string>} array
 * @return {!Object.<string, string>}
 *
 * @example
 * deft.filesFromArray(['foo.js', 'bar.js']); // => { 'foo.js': 'foo.js', 'bar.js': 'bar.js' }
 */
deft.filesFromArray = function filesFromArray(array) {
  var object = {};
  for (var i = 0; i < array.length; ++i) {
    object[array[i]] = path.basename(array[i]);
  }
  return deft.normalizeFilePaths(object);
};


/**
 * Ensures the keys in a source-to-destination-file mapping object are
 * normalized for the current platform.
 *
 * @param {!Object.<string, string>}
 * @return {!Object.<string, string>}
 */
deft.normalizeFilePaths = function(files) {
  var normalized = {};
  for (var key in files) {
    normalized[path.normalize(key)] = files[key];
  }
  return normalized;
};


/**
 * Given the name of a file and the dependency it comes from, gets the URL used
 * to download the file.
 *
 * @param {string} file
 * @param {!Array.<string>} dependency
 * @return {string}
 *
 * @examples
 * deft.getUrl('lodash.js', ['lodash/lodash', 'lodash.js']);
 * // => 'https://raw.githubusercontent.com/lodash/lodash/master/lodash.js'
 *
 * deft.getUrl('underscore.js', ['jashkenas/underscore', '1.6.0', 'underscore.js']);
 * // => 'https://raw.githubusercontent.com/jashkenas/underscore/1.6.0/underscore.js'
 *
 * deft.getUrl('underscore.js', ['http://cdnjs.com/libraries/', 'underscore.js']);
 * // => 'http://cdnjs.com/libraries/underscore.js'
 *
 * deft.getUrl('underscore.js', ['http://cdnjs.com/libraries', 'underscore.js']);
 * // => 'http://cdnjs.com/libraries/underscore.js'
 */
deft.getUrl = function getUrl(file, dependency) {
  if ((/^https?:/).test(dependency[0])) {
    if (!endsWith(dependency[0], '/'))
      dependency[0] += '/';
    return url.resolve(dependency[0], file);
  }

  var name = dependency[0],
      tag  = dependency.length > 2 ? dependency[1] : 'master';

  return 'https://raw.githubusercontent.com/' + name + '/' + tag + '/' + file;
};


/**
 * Given a dependency, gets the Github API url to list tags of the project.
 *
 * @param {!Array.<string>} dependency
 * @return {string}
 *
 * @examples
 * deft.getTagsUrl(['lodash/lodash', 'lodash.js']);
 * // => 'https://api.github.com/repos/lodash/lodash/tags'
 *
 * deft.getTagsUrl(['jashkenas/underscore', '1.6.0', 'underscore.js']);
 * // => 'https://api.github.com/repos/jashkenas/underscore/tags'
 *
 * deft.getTagsUrl(['http://cdnjs.com/libraries/', 'underscore.js']);
 * // => undefined
 *
 * deft.getTagsUrl(['http://cdnjs.com/libraries', 'underscore.js']);
 * // => undefined
 */
deft.getTagsUrl = function getTagsUrl(dependency) {
  if (!(/^https?:/).test(dependency[0])) {
    return 'https://api.github.com/repos/' + dependency[0] + '/tags';
  }
};


/**
 * Given a dependency, gets the tag specified by the configuration.
 *
 * @param {!Array.<string>} dependency
 * @return {string}
 *
 * @examples
 * deft.getWantedTag(['lodash/lodash', 'lodash.js']);
 * // => undefined
 *
 * deft.getWantedTag(['jashkenas/underscore', '1.6.0', 'underscore.js']);
 * // => '1.6.0'
 *
 * deft.getWantedTag(['http://cdnjs.com/libraries/', 'underscore.js']);
 * // => undefined
 *
 * deft.getWantedTag(['http://cdnjs.com/libraries', 'underscore.js']);
 * // => undefined
 */
deft.getWantedTag = function getWantedTag(dependency) {
  return dependency.length > 2 ? dependency[1] : null;
};


/**
 * Given an array of tags from GitHub, and a string representing the target
 * version, returns the name of the latest version.
 *
 * @param {!Array.<!Object.<string, string>>} versions
 * @param {string} targetVersion
 * @return {string}
 *
 * @examples
 * deft.findLatestVersion([{ name: '0.5.0' }, { name: '0.10.0' }], '0.8.0');
 * // => '0.10.0'
 *
 * deft.findLatestVersion([{ name: '1.0.0' }, { name: '1.0.1' }], 'invalid');
 * // => 'invalid'
 */
deft.findLatestVersion = function findLatestVersion(versions, targetVersion) {
  if (!semver.valid(targetVersion))
    return targetVersion;

  return versions.reduce(function(latest, current) {
    if (!semver.valid(current.name)) return latest;
    return semver.compare(current.name, latest) > 0 ? current.name : latest;
  }, targetVersion);
};


/**
 * Clips a file name to 40 characters or less.
 *
 * @param {string} fileName
 * @return {string}
 */
deft.clipFileName = function clipFileName(fileName) {
  return clip(fileName, 40);
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


/**
 * Clips a string to a given maximum length (adds an ellipsis when clipping).
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
 * Checks if a string ends with a given suffix.
 *
 * @private
 * @examples
 * endsWith('foo', 'o');     // => true
 * endsWith('bar', 'a');     // => false
 * endsWith('baz', 'az');    // => true
 * endsWith('blah', 'blah'); // => true
 */
function endsWith(string, suffix) {
  return string.indexOf(suffix, string.length - suffix.length) !== -1;
};


module.exports = deft;
