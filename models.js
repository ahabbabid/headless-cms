const { Model } = require("objection");
const knex = require("./config/database.js");
Model.knex(knex);
const fs = require("fs");
let models = {};
let files = [];

// knex.migrate.make("test").then((name) => {
//   fs.writeFileSync(name, migration);

//   knex.migrate.latest();
// });
fs.readdirSync("./models").forEach((file) => {
  const modelName = file.split(".")[0];
  fileData = JSON.parse(fs.readFileSync("./models/" + file));
  let fileObject = {
    fileName: modelName,
    data: fileData,
  };
  files.push(fileObject);
  let model = class extends Model {};
  model.tableName = fileObject.data.tableName;
  models[modelName] = model;
});
console.log(files);
// TODO: define other relationships
// TODO: try to improve complexity of the algorithm

for (file of files) {
  let model = models[file.fileName];
  if (file.data.relations) {
    for (relation of file.data.relations) {
      if (relation.type == "hasOne") {
        let relatedModel = models[relation.model];
        if (!model.relationMappings) {
          model.relationMappings = {};
          console.log("yolo");
        } //model.relationMappings = {};
        model.relationMappings[relation.model] = {
          relation: Model.HasOneRelation,
          modelClass: relatedModel,
          join: {
            from: model.tableName + ".id",
            to: relatedModel.tableName + "." + model.tableName + "Id",
          },
        };
        // if (!relatedModel.relationMappings) {
        //   relatedModel.relationMappings = {};
        // }
        // relatedModel.relationMappings[file.fileName] = {
        //   relation: Model.BelongsToOneRelation,
        //   modelClass: model,
        //   join: {
        //     from: relatedModel.tableName + "." + model.tableName + "Id",
        //     to: model.tableName + ".id",
        //   },
        // };

        console.log(model.relationMappings[relation.model].join.from);
        console.log(model.relationMappings[relation.model].join.to);
      } else if (relation.type == "hasMany") {
        let relatedModel = models[relation.model];
        if (!model.relationMappings) {
          model.relationMappings = {};
        }
        model.relationMappings[relation.model] = {
          relation: Model.HasManyRelation,
          modelClass: relatedModel,
          join: {
            from: model.tableName + ".id",
            to: relatedModel.tableName + "." + model.tableName + "Id",
          },
        };
        // if (!relatedModel.relationMappings) {
        //   relatedModel.relationMappings = {};
        // }
        // relatedModel.relationMappings[file.fileName] = {
        //   relation: Model.BelongsToOneRelation,
        //   modelClass: model,
        //   join: {
        //     from: relatedModel.tableName + "." + model.tableName + "Id",
        //     to: model.tableName + ".id",
        //   },
        // };
      } else if (relation.type == "BelongsToOne") {
        let relatedModel = models[relation.model];
        if (!model.relationMappings) {
          model.relationMappings = {};
        }
        model.relationMappings[relation.model] = {
          relation: Model.BelongsToOneRelation,
          modelClass: relatedModel,
          join: {
            from: relatedModel.tableName + "." + model.tableName + "Id",
            to: model.tableName + ".id",
          },
        };
        // if (!relatedModel.relationMappings) {
        //   relatedModel.relationMappings = {};
        // }
        // relatedModel.relationMappings[file.fileName] = {
        //   relation: Model.BelongsToOneRelation,
        //   modelClass: model,
        //   join: {
        //     from: relatedModel.tableName + "." + model.tableName + "Id",
        //     to: model.tableName + ".id",
        //   },
        // };
      }
    }
  }
  //   console.log(models["user"]);

  // models["address"]
  //   .query()
  //   .findById(1)
  //   .then((result) =>
  //     result.$relatedQuery("user").then((yolo) => console.log(yolo))
  //   );
  //   console.log(file.fileName);
  //   models[file.fileName].tableName = file.data.tableName;
  //   if (file.data.attributes.relations) {
  //     console.log("yolo true");
  //     for (relation of file.data.attributes.relations) {
  //       if (relation.type == "hasOne") {
  //         console.log(relation.model);
  //         let relatedModel = models[relation.model];
  //         console.log(relatedModel.tableName());
  //       }
  //     }
  //   }
}
console.log(models["address"]);
models["user"]
  .query()
  .findById(1)
  .then((result) =>
    result.$relatedQuery("address").then((yolo) => console.log(yolo))
  );
//console.log(models["address"].tableName);
module.exports = models;
