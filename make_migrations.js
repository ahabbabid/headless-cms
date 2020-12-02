let fs = require("fs");
const knex = require("./config/database.js");
// const models = require("./models");
module.exports = async () => {
  try {
    files = await fs.promises.readdir("./models");
    if (Array.isArray(files)) {
      for (let file of files) {
        let model = JSON.parse(fs.readFileSync("./models/" + file));
        let [modelName] = file.split(".");
        //   console.log(modelName);
        let tableName = model.tableName;
        //   console.log(tableName);
        //TODO: implement try catch blocks for async code and try to refactor the whole code to async/await
        try {
          let exists = await knex.schema.hasTable(tableName);
          if (!exists) {
            try {
              await knex.schema.createTable(tableName, (table) => {
                table.increments();
                for (let attribute in model.attributes) {
                  if (model.attributes[attribute] == "string")
                    table.string(attribute);
                  if (model.attributes[attribute] == "integer")
                    table.integer(attribute);
                }
              });
              if (model.relations) {
                for (let relation of model.relations) {
                  if (relation.type == "BelongsToOne") {
                    // console.log("true");

                    try {
                      await knex.schema.table(tableName, (table) => {
                        table.integer(`${relation.model}Id`).unsigned();
                      });
                    } catch (e) {
                      console.log(e);
                    }
                  } else if (relation.type == "ManyToMany") {
                    let exists = await knex.schema.hasTable(
                      relation.join_table
                    );
                    console.log(exists);
                    if (!exists) {
                      await knex.schema.createTable(
                        relation.join_table,
                        (table) => {
                          table.integer(`${modelName}Id`).unsigned();
                          table.integer(`${relation.model}Id`).unsigned();
                        }
                      );
                    }
                  }
                }
              }
            } catch (e) {
              console.log(e);
            }
          } else {
            for (let attribute in model.attributes) {
              knex.schema
                .hasColumn(tableName, attribute)
                .then(async (columnExists) => {
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
                });
            }
            if (model.relations) {
              for (let relation of model.relations) {
                if (relation.type == "BelongsToOne") {
                  knex.schema
                    .hasColumn(tableName, `${relation.model}Id`)
                    .then(async (exists) => {
                      if (!exists) {
                        await knex.schema.table(tableName, function (table) {
                          table.integer(`${relation.model}Id`).unsigned();
                        });
                      }
                    });
                } else if (relation.type == "ManyToMany") {
                  console.log(relation.join_table);
                  let exists = await knex.schema.hasTable(relation.join_table);
                  if (!exists) {
                    await knex.schema.createTable(
                      relation.join_tables,
                      (table) => {
                        table.integer(`${modelName}Id`).unsigned();
                        table.integer(`${relation.model}Id`).unsigned();
                      }
                    );
                  }
                }
              }
            }
          }
        } catch (e) {
          console.log(e);
        }
        // knex.schema.hasTable(tableName).then(async (exists) => {
        //   if (!exists) {
        //     knex.schema
        //       .createTable(tableName, async (table) => {
        //         table.increments();
        //         for (let attribute in model.attributes) {
        //           if (model.attributes[attribute] == "string")
        //             table.string(attribute);
        //           if (model.attributes[attribute] == "integer")
        //             table.integer(attribute);
        //         }
        //         if (model.relations) {
        //           for (let relation of model.relations) {
        //             if (relation.type == "BelongsToOne") {
        //               // console.log("true");
        //               table.integer(`${relation.model}Id`).unsigned();
        //             } else if (relation.type == "ManyToMany") {
        //               let exists =
        //                 (await knex.schema.hasTable(relation.join_table)) ||
        //                 manyToManyTable[relation.join_table] == undefined
        //                   ? false
        //                   : true;
        //               // console.log(exists);
        //               if (!exists) {
        //                 manyToManyTable[relation.join_table] = true;
        //                 await knex.schema.createTable(
        //                   relation.join_table,
        //                   (table) => {
        //                     table.integer(`${modelName}Id`).unsigned();
        //                     table.integer(`${relation.model}Id`).unsigned();
        //                   }
        //                 );
        //               }
        //             }
        //           }
        //         }
        //       })
        //       .then(() => console.log(true));
        //   } else {
        //     let attributes = ``;
        //     let relations = ``;
        //     let attributesToDrop = ``;
        //     let newAttributes = {};

        //     for (let attribute in model.attributes) {
        //       knex.schema
        //         .hasColumn(tableName, attribute)
        //         .then(async (columnExists) => {
        //           if (!columnExists) {
        //             newAttributes[attribute] = model.attributes[attribute];
        //             console.log(newAttributes);
        //             await knex.schema.table(tableName, function (table) {
        //               if (model.attributes[attribute] == "string")
        //                 table.string(attribute);
        //               if (model.attributes[attribute] == "integer")
        //                 table.integer(attribute);
        //             });
        //           }
        //         });
        //     }
        //     if (model.relations) {
        //       for (let relation of model.relations) {
        //         if (relation.type == "BelongsToOne") {
        //           knex.schema
        //             .hasColumn(tableName, `${relation.model}Id`)
        //             .then(async (exists) => {
        //               if (!exists) {
        //                 await knex.schema.table(tableName, function (table) {
        //                   table.integer(`${relation.model}Id`).unsigned();
        //                 });
        //               }
        //             });
        //         } else if (relation.type == "ManyToMany") {
        //           console.log(relation.join_table);
        //           let exists = await knex.schema.hasTable(relation.join_table);
        //           if (!exists) {
        //             await knex.schema.createTable(
        //               relation.join_tables,
        //               (table) => {
        //                 table.integer(`${modelName}Id`).unsigned();
        //                 table.integer(`${relation.model}Id`).unsigned();
        //               }
        //             );
        //           }
        //         }
        //       }
        //     }
        //   }
        // });
      }
    }
  } catch (e) {
    console.error(e);
  }
};
// fs.readdirSync("./models").forEach((file) => {
//   //makes migration files for every model file in the ./models folder
// });
