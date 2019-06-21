const _combinatoricsjs = require('js-combinatorics');
let _ = require('lodash');

const YsakON = (o, prefix) => {

  prefix = prefix || 'root';

  switch (typeof o) {
    case 'object':
      if (Array.isArray(o)) {
        return prefix + '=' + JSON.stringify(o) + '\n';
      }

      let output = "";
      for (let k in o) {
        if (o.hasOwnProperty(k)) {
          output += YsakON(o[k], prefix + '.' + k);
        }
      }
      return output;
    case 'function':
      return "";
    default:
      return prefix + '=' + o + '\n';
  }
};

const distinct = (value, index, self) => self.indexOf(value) === index;

const set = (obj, path, value) => {
  if (Object(obj) !== obj) {
    return obj;
  } // When obj is not an object
    // If not yet an array, get the keys from the string-path
  if (!Array.isArray(path)) {
    path = path.toString().match(/[^.[\]]+/g) || [];
  }
  path.slice(0, -1).reduce((a, c, i) => // Iterate all of them except the last one
      Object(a[c]) === a[c] // Does the key exist and is its value an object?
        // Yes: then follow that path
        ? a[c]
        // No: create the key. Is the next key a potential array-index?
        : a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1]
        ? [] // Yes: assign a new array object
        : {}, // No: assign a new plain object
    obj)[path.pop()] = value; // Finally assign the value to the last key
  return obj; // Return the top-level object to allow chaining
};

const Combinatorics = {

  map: (spec) => {

    let options = [];
    let allSpecNotations = YsakON(spec).split('\n')
    .map(a => a.split('='))
    .map(b => ({path: b[0], value: b[1]}))
    .filter(c => c.path.includes('_value'))
    .map(d => ({path: d.path, value: JSON.parse(d.value)}));

    // Generate list of options
    allSpecNotations.forEach(
      e => e.value.forEach(v => options.push({path: e.path, value: v})));

    // Get nelem required
    let nelem = allSpecNotations.map(a => a.path).filter(distinct).length;

    // Not combinations
    if (nelem === 0) {
      return [spec];
    }

    // Permutation of options by nelem and filter invalid
    let combination = _combinatoricsjs.combination(options, nelem).filter(
      a => a.map(x => x.path).filter(distinct).length === nelem
    );

    let newSpecs = [];

    combination.forEach(cmb => {

      let newSpec = _.clone(spec);
      cmb.forEach(i => {
        set(newSpec, i.path.replace('root.', '').replace('._values', ''),
          i.value);
      });
      newSpecs.push(newSpec);
    });

    return newSpecs;
  }

};
module.exports = Combinatorics;
