const knex = require("../config/database.js");
const getModelData = require("./get_model_data.js");
module.exports = async (model, modelName) => {
  try {
    //   console.log(modelName);
    let tableName = model.tableName;
    //   console.log(tableName);
    //TODO: implement try catch blocks for async code and try to refactor the whole code to async/await

    let exists = await knex.schema.hasTable(tableName);
    if (!exists) {
      await knex.schema.createTable(tableName, (table) => {
        table.increments();
        for (let attribute in model.attributes) {
          if (model.attributes[attribute] == "string") table.string(attribute);
          if (model.attributes[attribute] == "integer")
            table.integer(attribute);
        }
      });
      if (model.relations) {
        for (let relation of model.relations) {
          if (relation.type == "BelongsToOne") {
            // console.log("true");

            await knex.schema.table(tableName, (table) => {
              table.integer(`${relation.model}Id`).unsigned();
            });
          } else if (relation.type == "ManyToMany") {
            let exists = await knex.schema.hasTable(relation.join_table);
            console.log(exists);
            if (!exists) {
              await knex.schema.createTable(relation.join_table, (table) => {
                table.integer(`${modelName}Id`).unsigned();
                table.integer(`${relation.model}Id`).unsigned();
              });
            }
          }
        }
      }
    } else {
      for (let attribute in model.attributes) {
        let columnExists = await knex.schema.hasColumn(tableName, attribute);
        if (!columnExists) {
          newAttributes[attribute] = model.attributes[attribute];
          console.log(newAttributes);
          await knex.schema.table(tableName, function (table) {
            if (model.attributes[attribute] == "string")
              table.string(attribute);
            if (model.attributes[attribute] == "integer")
              table.integer(attribute);
          });
        }
      }
      if (model.relations) {
        for (let relation of model.relations) {
          if (relation.type == "OneToOne") {
            let exists = await knex.schema.hasColumn(
              tableName,
              `${relation.model}Id`
            );
            if (!exists) {
              await knex.schema.table(tableName, function (table) {
                table.integer(`${relation.model}Id`).unsigned();
              });
            }
          } else if (relation.type == "ManyToMany") {
            console.log(relation.join_table);
            let exists = await knex.schema.hasTable(relation.join_table);
            if (!exists) {
              await knex.schema.createTable(relation.join_table, (table) => {
                table.integer(`${modelName}Id`).unsigned();
                table.integer(`${relation.model}Id`).unsigned();
              });
            }
          } else if (
            relation.type === "HasOne" ||
            relation.type === "HasMany"
          ) {
            const { tableName } = getModelData(relation.model);
            console.log(tableName);
            console.log(modelName);
            let exists = await knex.schema.hasColumn(
              tableName,
              `${modelName}Id`
            );
            if (!exists) {
              await knex.schema.table(tableName, function (table) {
                table.integer(`${modelName}Id`).unsigned();
              });
            }
          }
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
};
