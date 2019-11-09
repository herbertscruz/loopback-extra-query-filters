
const isEmpty = require('lodash/isEmpty');
const isString = require('lodash/isString');
const isArray = require('lodash/isArray');
const isObject = require('lodash/isObject');
const get = require('lodash/get');
const set = require('lodash/set');
const has = require('lodash/has');
const compact = require('lodash/compact');
const omit = require('lodash/omit');

module.exports = class QueryFilters {
  apply(data, filter = {}) {
    if (isEmpty(data)) return data;
    return compact(data.map(
      item => this._item(item, filter),
    ));
  }

  _item(item, scope) {
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
    return item;
  }

  _scope(item, scope) {
    const relation = get(scope, 'relation');
    let subItem = get(item, `__data.${relation}`, get(item, relation));
    if (subItem) {
      const subScope = get(scope, 'scope');
      if (subScope) {
        if (isArray(subItem)) {
          subItem = this.apply(subItem, subScope);
        } else {
          subItem = this._item(subItem, subScope);
        }
        if (get(item, `__data.${relation}`)) {
          set(item, `__data.${relation}`, subItem);
        } else {
          set(item, relation, subItem);
        }
      }
    }
    return item;
  }
  _toArrayInclude(include) {
    if (!include) return [];
    if (isString(include)) {
      return [{relation: include}];
    } else if (isArray(include)) {
      return include.map(relation => {
        if (isString(relation)) {
          relation = {relation};
        }
        return relation;
      });
    } else if (isObject(include)) {
      return [include];
    }
  }

  _has(item, scope) {
    if (!(isArray(scope.has) || isString(scope.has))) {
      throw '"has" filter must be a string or array of strings';
    }
    if (isString(scope.has)) scope.has = [scope.has];
    return has(get(item, '__data', item), scope.has);
  }

  _noHas(item, scope) {
    if (!(isArray(scope.notHas) || isString(scope.notHas))) {
      throw '"notHas" filter must be a string or array of strings';
    }
    if (isString(scope.notHas)) scope.notHas = [scope.notHas];
    return !has(get(item, '__data', item), scope.notHas);
  }

  _isEmpty(item, scope) {
    if (!(isArray(scope.isEmpty) || isString(scope.isEmpty))) {
      throw '"isEmpty" filter must be a string or array of strings';
    }
    if (isString(scope.isEmpty)) scope.isEmpty = [scope.isEmpty];
    return scope.isEmpty.every(i => {
      item = get(item, '__data', item);
      return isEmpty(get(item, i));
    });
  }

  _isNotEmpty(item, scope) {
    if (!(isArray(scope.isNotEmpty) || isString(scope.isNotEmpty))) {
      throw '"_isNotEmpty" filter must be a string or array of strings';
    }
    if (isString(scope.isNotEmpty)) scope.isNotEmpty = [scope.isNotEmpty];
    return scope.isNotEmpty.every(i => {
      item = get(item, '__data', item);
      return !isEmpty(get(item, i));
    });
  }

  clearFilter(filter) {
    if (!filter) return;
    filter = JSON.parse(JSON.stringify(filter));
    if (filter.include) {
      if (isArray(filter.include)) {
        filter.include = filter.include.map(include => {
          if (isString(include)) return include;
          if (include.scope) {
            include.scope = this.clearFilter(include.scope);
          }
          return include;
        });
      } else if (isObject(filter.include)) {
        const scope = get(filter, 'include.scope');
        if (scope) {
          set(filter, 'include.scope', this.clearFilter(scope));
        }
        filter.include = this.clearFilter(filter.include);
      }
    }
    return omit(filter, ['has', 'notHas', 'isEmpty', 'isNotEmpty']);
  }
};
