
const Promise = require('bluebird');
const faker = require('faker');
const set = require('lodash/set');

module.exports = async function(app) {
  const db = app.dataSources.db;

  await db.automigrate();
  console.log('Automigrate complete');

  let author = {
    name: faker.name.findName(),
  };
  author = await app.models.Author.create(author);

  let notes = [];
  for (let i = 0; i < 10; i++) {
    notes.push({
      title: faker.name.jobTitle(),
      content: faker.name.jobDescriptor(),
    });
  }
  notes = await app.models.Note.create(notes.map((i, idx) => {
    if ([0, 4, 9].includes(idx)) {
      set(i, 'authorId', author.id);
    }
    return i;
  }));

  await Promise.each(notes, async (note, idx) => {
    if ([0, 4, 9].includes(idx)) {
      const likes = [];
      for (let i = 0; i < 10; i++) {
        likes.push({
          name: faker.name.findName(),
          noteId: note.id,
        });
      }
      return app.models.Like.create(likes);
    }
  });

  console.log('Mass of data imported');
};
