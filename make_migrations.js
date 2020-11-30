const { table } = require("console");
let fs = require("fs");
const models = require("./models");

fs.readdirSync("./models").forEach((file) => {
  let model = JSON.parse(fs.readFileSync("./models/" + file));
  let [modelName] = file.split(".");
  let tableName = model.tableName;
  let attributes = ``;
  for (let attribute in model.attributes) {
    attributes += `table.${model.attributes[attribute]}(${attribute});`;
  }
  let migration = `
    exports.up = function (knex){
        return knex.schema.createTable('${tableName}', function(table){
            table.increments('id');
            ${attributes}
        })

    }

    exports.down = function (knes){
        return knex.schema.dropTable("${modelName}");
    }
`;
  console.log(migration);
});
