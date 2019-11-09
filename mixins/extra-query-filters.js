
const QueryFilters = require('./query-filters');

module.exports = function(Model) {
  if (Model && Model.sharedClass) {
    const override = Model.find;
    Model.find = function(filter, options, cb) {
      const ps = (async () => {
        const queryFilters = new QueryFilters();
        const clearFilter = queryFilters.clearFilter(filter);
        const data = await override.apply(this, [clearFilter, options]);
        return queryFilters.apply(data, filter);
      })();
      if (!cb) return ps;
      ps.then(data => cb(null, data));
      ps.catch(cb);
    };
  }
};
