const assert = require('chai').assert;
const server = require('./loopback/server/server');
const request = require('supertest')(server);

describe('mixins/extra-query-filters.js', () => {
  it('should return success', async () => {
    return request
      .get('/api/notes')
      .query({
        filter: JSON.stringify({
          include: ['author', {
            relation: 'likes',
            scope: {
              notHas: 'test',
              isNotEmpty: 'name',
            },
          }],
          has: 'author',
          isNotEmpty: 'likes',
        }),
      })
      .send()
      .then(response => {
        assert.isOk(response);
      });
  });
});
