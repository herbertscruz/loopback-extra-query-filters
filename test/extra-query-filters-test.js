const assert = require('chai').assert;
const server = require('./loopback/server/server');
const request = require('supertest')(server);

describe('mixins/extra-query-filters.js', () => {
  it('should return success', async () => {
    return request
      .post('/api/notes')
      .send({
        title: 'Title Test',
        content: 'Content Test',
      })
      .then(response => {
        return request
          .get('/api/notes')
          .query({
            filter: JSON.stringify({
              limit: 1,
            }),
          })
          .send()
          .then(response => {
            assert.isOk(response);
          });
      });
  });
});
