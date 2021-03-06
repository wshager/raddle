"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;
exports.traverse = traverse;
exports.find = find;

function process(word, root, map, processed, key, c) {
  if (c == word.length) return;
  let cp = word[c++];
  processed += cp;

  if (map[cp]) {
    return process(word, root, map[cp], processed, key, c);
  } else {
    if (map.constructor == Array) {
      for (let i = 0; i < map.length; i++) {
        if (map[i][cp]) {
          return process(word, root, map[i][cp], processed, key, c);
        }
      }
    }

    map = root;
    var len = processed.length;
    c = 0;

    do {
      let cp = processed[c++];

      if (map[cp]) {
        var newmap = {};
        let entry = map[cp];

        if (Array.isArray(entry)) {
          map[cp].push(newmap);
        } else {
          map[cp] = [entry, newmap];
        }

        newmap.parent = map[cp];
        map = newmap;
      } else {
        while (map.parent) {
          var found = false;
          var oldmap = map;

          for (var i = 0; i < map.parent.length; i++) {
            if (map.parent[i][cp] !== undefined) {
              let newmap = {};

              if (map.parent[i][cp].constructor == Array) {
                map.parent[i][cp].push(newmap);
              } else {
                map.parent[i][cp] = [map.parent[i][cp], newmap];
              }

              newmap.parent = map.parent[i][cp];
              map = newmap;
              found = true;
              break;
            }
          }

          delete oldmap.parent;
          if (found) cp = processed[c++];
          if (!found) break;
        }

        map[cp] = {
          _k: word,
          _v: parseInt(key)
        };
      }
    } while (c < len);
  }
}

function create(input, order) {
  var root = {};

  if (!order) {
    order = function (a, b) {
      return input[a].localeCompare(input[b]);
    };
  }

  Object.keys(input).sort(order).forEach(function (k) {
    process(input[k], root, root, "", k, 0);
  });

  const stripObj = x => {
    if ("_k" in x) return x;

    for (var k in x) {
      x[k] = strip(x[k]);
    }

    return x;
  };

  const strip = x => Array.isArray(x) ? x.filter(entry => Object.keys(entry).length).map(strip) : typeof x == "object" ? stripObj(x) : x;

  return strip(root);
}

function traverse(tmp, word) {
  var b = "";
  var ret = tmp[0],
      path = tmp[1] || [];
  let i = 0,
      l = word.length;

  for (; i < l; i++) {
    let c = word[i];
    b += c;
    tmp = find(ret, c, b, path);
    ret = tmp[0];
    path = tmp[1];
    if (!ret) return;
  }

  if (Array.isArray(ret)) {
    for (const entry of ret) {
      if (entry._v !== undefined && entry._k === b) return entry._v;
    }
  } else {
    if (ret._v !== undefined && ret._k === b) return ret._v;
  }

  for (let entry of path) {
    if (entry._v !== undefined && entry._k === b) return entry._v;
  }

  return [ret, path];
}

function filter(path, cp, pos) {
  if (path.length && path[0]._k[pos] != cp) path.shift();
  return path.length ? path : null;
}

function find(entry, cp, word, path) {
  if (Array.isArray(entry)) {
    let pos = word.length - 1;
    let len = entry.length;
    var ret;

    for (var i = 0; i < len; i++) {
      let a = entry[i];

      if ("_v" in a) {
        if (a._k[pos] == cp) {
          if (path[path.length - 1] !== a) {
            path.push(a);
          }

          ret = a;
        }
      } else {
        if (a[cp] !== undefined) {
          return [a[cp], path];
        }
      }
    }

    if (ret !== undefined) return [ret, path];
    return [filter(path, cp, pos), []];
  } else if (!("_v" in entry)) {
    return [entry[cp], path];
  } else {
    let pos = word.length - 1;

    if (entry._k[pos] === cp) {
      if (path[path.length - 1] !== entry) path.push(entry);
      return [entry, path];
    }

    return [filter(path, cp, pos), []];
  }
}
//# sourceMappingURL=trie.js.map