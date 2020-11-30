let fs = require("fs");
const knex = require("./config/database.js");
const models = require("./models");
fs.readdirSync("./models").forEach((file) => {
  //makes migration files for every model file in the ./models folder
  let model = JSON.parse(fs.readFileSync("./models/" + file));
  let [modelName] = file.split(".");
  console.log(modelName);
  let tableName = model.tableName;
  knex.schema.hasTable(tableName).then((exists) => {
    if (!exists) {
      let attributes = ``;
      let relations = ``;
      for (let attribute in model.attributes) {
        attributes += `table.${model.attributes[attribute]}('${attribute}');\n\t\t`;
      }
      if (model.relations) {
        for (let relation of model.relations) {
          if (relation.type == "BelongsToOne") {
            relations += `table.integer('${relation.model}Id').unsigned()`;
          }
        }
      }

      let migration = `
        exports.up = function (knex){
            return knex.schema.createTable('${tableName}', function(table){
                table.increments('id');
                ${attributes}
                ${relations}
            });

        }

        exports.down = function (knex){
            return knex.schema.dropTable("${tableName}");
        }
    `;
      knex.migrate.make(modelName).then((file) => {
        fs.writeFileSync(file, migration);
      });

      console.log(migration);
    }
  });
});
// knex.migrate.forceFreeMigrationsLock().then(() => {
//   knex.migrate.latest();
// });
knex.migrate.latest();
