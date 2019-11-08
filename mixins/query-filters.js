
const isEmpty = require('lodash/isEmpty');

module.exports = class QueryFilters {
  apply(data, filter) {
    if (!isEmpty(data)) return data;
    return data;
  }
};
