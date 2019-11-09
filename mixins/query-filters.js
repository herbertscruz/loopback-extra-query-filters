
const isEmpty = require('lodash/isEmpty');
const isString = require('lodash/isString');
const isArray = require('lodash/isArray');
const isObject = require('lodash/isObject');
const get = require('lodash/get');
const set = require('lodash/set');
const has = require('lodash/has');
const compact = require('lodash/compact');

module.exports = class QueryFilters {
  apply(data, filter = {}) {
    if (isEmpty(data)) return data;
    return compact(data.map(
      item => this._item(item, filter),
    ));
  }

  _item(item, scope) {
    const original = item;
    item = get(original, '__data', item);
    if (scope.include) {
      scope.include = this._toArrayInclude(scope.include);
      scope.include.forEach(include => {
        item = this._scope(item, include);
      });
    }
    if (scope.has && !this._has(item, scope)) return;
    if (scope.notHas && !this._noHas(item, scope)) return;
    if (scope.isEmpty && !this._isEmpty(item, scope)) return;
    if (scope.isNotEmpty && !this._isNotEmpty(item, scope)) return;
    if (get(original, '__data')) set(original, '__data', item);
    return original;
  }

  _scope(item, scope) {
    const relation = get(scope, 'relation');
    let subItem = get(item, relation);
    if (subItem) {
      const subScope = get(scope, 'scope');
      if (subScope) {
        if (isArray(subItem)) {
          subItem = this.apply(subItem, subScope);
        } else {
          subItem = this._item(subItem, subScope);
        }
        set(item, relation, subItem);
      }
    }
    return item;
  }
  _toArrayInclude(include) {
    if (!include) return [];
    if (isString(include)) {
      return [{relation: include}];
    } else if (isArray(include)) {
      return include.map(item => {
        if (isString(item)) {
          item = {relation: item};
        }
        return item;
      });
    } else if (isObject(include)) {
      return [include];
    }
  }

  _has(data, filter) {
    if (!(isArray(filter.has) || isString(filter.has))) {
      throw '"has" filter must be a string or array of strings';
    }
    if (isString(filter.has)) filter.has = [filter.has];
    return has(data, filter.has);
  }

  _noHas(data, filter) {
    if (!(isArray(filter.notHas) || isString(filter.notHas))) {
      throw '"notHas" filter must be a string or array of strings';
    }
    if (isString(filter.notHas)) filter.notHas = [filter.notHas];
    return !has(data, filter.notHas);
  }

  _isEmpty(data, filter) {
    if (!(isArray(filter.isEmpty) || isString(filter.isEmpty))) {
      throw '"isEmpty" filter must be a string or array of strings';
    }
    if (isString(filter.isEmpty)) filter.isEmpty = [filter.isEmpty];
    return filter.isEmpty.every(item => {
      item = get(data, item);
      return isEmpty(item);
    });
  }

  _isNotEmpty(data, filter) {
    if (!(isArray(filter.isNotEmpty) || isString(filter.isNotEmpty))) {
      throw '"_isNotEmpty" filter must be a string or array of strings';
    }
    if (isString(filter.isNotEmpty)) filter.isNotEmpty = [filter.isNotEmpty];
    return filter.isNotEmpty.every(item => {
      item = get(data, item);
      return !isEmpty(item);
    });
  }
};
