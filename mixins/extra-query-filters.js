
const QueryFilters = require('./query-filters');

module.exports = function(Model) {
  if (Model && Model.sharedClass) {
    const override = Model.find;
    Model.find = function(filter, options, cb) {
      const ps = (async () => {
        const data = await override.apply(this, [filter, options]);
        const queryFilters = new QueryFilters();
        return queryFilters.apply(data, filter);
      })();
      if (!cb) return ps;
      ps.then(data => cb(null, data));
      ps.catch(cb);
    };
  }
};
