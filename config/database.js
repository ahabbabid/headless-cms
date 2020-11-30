module.exports = require("knex")({
  client: "mysql",
  connection: {
    host: "127.0.0.1",
    user: "homestead",
    password: "secret",
    database: "homestead",
  },
});
