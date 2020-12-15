const knex = require("../config/database.js");

module.exports = {
  async index(ctx) {
    knex
      .table("users")
      .select()
      .then((data) => console.log(data));
  },
};
