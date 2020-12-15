const { Model } = require("objection");
const knex = require("./config/database.js");
Model.knex(knex);
const fs = require("fs");
let models = {};
let files = [];

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
      if (relation.type == "HasOne") {
        let relatedModel = models[relation.model];
        if (!model.relationMappings) {
          model.relationMappings = {};
        } //model.relationMappings = {};
        model.relationMappings[relation.model] = {
          relation: Model.HasOneRelation,
          modelClass: relatedModel,
          join: {
            from: file.fileName + ".id",
            to: relation.model + "." + file.fileName + "Id",
          },
        };
        if (!relatedModel.relationMappings) {
          relatedModel.relationMappings = {};
        }
        if (!relatedModel.relationMappings[file.fileName]) {
          relatedModel.relationMappings[file.fileName] = {
            relation: Model.BelongsToOneRelation,
            modelClass: model,
            join: {
              from: relatedModel.tableName + "." + file.fileName + "Id",
              to: file.fileName + ".id",
            },
          };
        }

        console.log(model.relationMappings[relation.model].join.from);
        console.log(model.relationMappings[relation.model].join.to);
      } else if (relation.type == "HasMany") {
        let relatedModel = models[relation.model];
        if (!model.relationMappings) {
          model.relationMappings = {};
        }
        model.relationMappings[relation.model] = {
          relation: Model.HasManyRelation,
          modelClass: relatedModel,
          join: {
            from: model.tableName + ".id",
            to: relatedModel.tableName + "." + file.fileName + "Id",
          },
        };
        if (!relatedModel.relationMappings) {
          relatedModel.relationMappings = {};
        }
        if (!relatedModel.relationMappings[file.fileName]) {
          relatedModel.relationMappings[file.fileName] = {
            relation: Model.BelongsToOneRelation,
            modelClass: model,
            join: {
              from: relatedModel.tableName + "." + file.fileName + "Id",
              to: model.tableName + ".id",
            },
          };
        }
      } else if (relation.type == "BelongsToOne") {
        let relatedModel = models[relation.model];
        if (!model.relationMappings) {
          model.relationMappings = {};
        }
        model.relationMappings[relation.model] = {
          relation: Model.BelongsToOneRelation,
          modelClass: relatedModel,
          join: {
            from: relatedModel.tableName + "." + file.fileName + "Id",
            to: model.tableName + ".id",
          },
        };
        if (!relatedModel.relationMappings) {
          relatedModel.relationMappings = {};
        }
        if (!relatedModel.relationMappings[file.fileName]) {
          relatedModel.relationMappings[file.fileName] = {
            relation: Model.BelongsToOneRelation,
            modelClass: model,
            join: {
              from: relatedModel.tableName + "." + file.fileName + "Id",
              to: file.fileName + ".id",
            },
          };
        }
      } else if (relation.type == "ManyToMany") {
        let relatedModel = models[relation.model];
        if (!model.relationMappings) {
          model.relationMappings = {};
        }
        model.relationMappings[relation.model] = {
          relation: Model.ManyToManyRelation,
          modelClass: relatedModel,
          join: {
            from: `${model.tableName}.id`,
            through: {
              from: `${relation.join_table}.${file.fileName}Id`,
              to: `${relation.join_table}.${relation.model}Id`,
            },

            to: `${relatedModel.tableName}.id`,
          },
        };
        if (!relatedModel.relationMappings) {
          relatedModel.relationMappings = {};
        }
        if (!relatedModel.relationMappings[file.fileName]) {
          relatedModel.relationMappings[file.fileName] = {
            relation: Model.ManyToManyRelation,
            modelClass: model,
            join: {
              from: `${relatedModel.tableName}.id`,
              through: {
                from: `${relation.join_table}.${relation.model}Id`,
                to: `${relation.join_table}.${file.fileName}Id`,
              },

              to: `${model.tableName}.id`,
            },
          };
        }
      }
    }
  }
}
console.log(models["address"]);
models["article"]
  .query()
  .findById(1)
  .then((result) =>
    result.$relatedQuery("tag").then((yolo) => console.log(yolo))
  );
//console.log(models["address"].tableName);
module.exports = models;
