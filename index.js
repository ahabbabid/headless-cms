const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
const fs = require("fs");
const knex = require("./config/database.js");
const { Model } = require("objection");
const addRelation = require("./utils/add_relation.js");
const sendResponse = require("./utils/send_response.js");
const fetchModelFromTablename = require("./utils/fetch_model_from_tablename.js");
const cors = require("cors");
const {
  handleCustomException,
  throwCustomException,
  handleGeneralException,
} = require("./utils/handle_errors.js");
app.use(cors({ origin: "http://localhost:3000" }));
// consolre.log("ay this the real shit:" + models["user"].tableName());
const make_tables = require("./make_migrations.js");
const models = require("./models.js");
const get_model_data = require("./utils/get_model_data.js");
Model.knex(knex);
// make_tables();
// TODO: define database structure for different types of relationships

// knex.schema.hasTable("users").then(function (exists) {
//   if (!exists) {
//     return knex.schema
//       .createTable("users", function (table) {
//         for (field in object) {
//           //console.log(field)
//           if (object[field] == "number") table.increments();
//           if (object[field] == "string") table.string(field);
//         }
//       })
//       .then(() => console.log("successfull"))
//       .catch((e) => console.log(e));
//   } else console.log("yolo");
// });

let r = JSON.parse(fs.readFileSync("routes.json"));
// fs.readFile("routes.json", (err, data) => {
//   if (err) throw err;
//   r = JSON.parse(data);
//   console.log(r);
// });
console.log(r);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// for (route of r.routes) {
//   const [controller, methodName] = route.handler.split(".");

//   const wassup = require("./controllers/" + controller + ".js");
//   console.log(wassup);
//   if (route.method == "GET") {
//     app.get(route.path, (req, res) => {
//       wassup[methodName]({ req, res });
//     });
//   }
// }
app.get("/resources", (req, res) => {
  let models = fs.readdirSync("./models");
  models = models.map((model) => model.split(".")[0]);
  res.json(models);
});
app.get("/:resource/schema", async (req, res) => {
  const [modelName, model] = fetchModelFromTablename(req.params.resource);
  // if (modelName) {
  const data = get_model_data(modelName);
  // if (data)
  sendResponse({ data: data, message: "success", statusCode: 200 }, res);
  // else handleCustomException(new Error(), res);
  // } else handleCustomException(new Error(), res);
});
app.get("/:resource", async (req, res) => {
  const [modelName, model] = fetchModelFromTablename(req.params.resource);
  if (model)
    try {
      const result = await model.query();
      sendResponse({ data: result, message: "Success", statusCode: 200 }, res);
    } catch (e) {
      handleCustomException(e, res);
    }
  else handleCustomException(new Error(), res);
});
app.get("/:resource/:id", async (req, res) => {
  const [modelName, model] = fetchModelFromTablename(req.params.resource);
  if (model)
    try {
      const result = await model.query().findById(req.params.id);
      if (!result)
        throwCustomException(
          400,
          `No resource with id: ${req.params.id} found`
        );
      sendResponse({ data: result, message: "Success", statusCode: 200 }, res);
    } catch (e) {
      handleCustomException(e, res);
    }
  else handleCustomException(new Error(), res);
});
// app.delete("/:resource/:id", asnc);
app.delete("/:resource/:id", async (req, res) => {
  const model = fetchModelFromTablename(req.params.resource);
  if (model)
    try {
      const result = await model.query().deleteById(req.params.id);
      sendResponse({ data: "", message: "Success", statusCode: 200 }, res);
    } catch (e) {
      handleCustomException(e, res);
    }
  else handleCustomException(new Error(), res);
});
/*

*/
app.post("/:resource", async (req, res) => {
  const [modelName, model] = fetchModelFromTablename(req.params.resource);
  const schema = get_model_data(modelName);

  const relations = model.getRelations();
  const newEntryData = {
    attributes: {},
    relations: {},
  };
  for (key of Object.keys(schema.attributes)) {
    newEntryData.attributes[key] = req.body.attributes[key];
  }
  // console.log(model.getRelations());
  for (key of Object.keys(relations)) {
    if (req.body.relations[key])
      newEntryData.relations[key] = req.body.relations[key];
  }

  console.log(modelName);
  if (model) {
    try {
      // console.log(model.getRelations());
      const entry = await model.query().insert(newEntryData.attributes);
      for (key of Object.keys(newEntryData.relations)) {
        let relatedModel = relations[key].relatedModelClass;

        if (
          Array.isArray(newEntryData.relations[key]) &&
          (relations[key] instanceof Model.HasManyRelation ||
            relations[key] instanceof Model.ManyToManyRelation)
        ) {
          console.log("herer");
          for (relatedEntryId of newEntryData.relations[key]) {
            let relatedEntry = await relatedModel
              .query()
              .findById(relatedEntryId);
            console.log(relatedEntry);
            await entry.$relatedQuery(key).relate(relatedEntry);
          }
        } else if (
          typeof newEntryData.relations[key] === "number" &&
          relations[key] instanceof Model.HasOneRelation
        ) {
          let relatedEntry = await relatedModel
            .query()
            .findById(newEntryData.relations[key]);
          await entry.$relatedQuery(key).relate(relatedEntry);
        } else if (
          typeof newEntryData.relations[key] === "number" &&
          relations[key] instanceof Model.BelongsToOneRelation
        ) {
          let relatedEntry = await relatedModel
            .query()
            .findById(newEntryData.relations[key]);
          await entry.$relatedQuery(key).relate(relatedEntry);
        }
      }
      sendResponse({ data: entry, message: "Success", statusCode: 200 }, res);
    } catch (e) {
      handleCustomException(e, res);
      console.log(e);
    }
  } else handleCustomException(new Error(), res);
});
app.post("/resource", (req, res) => {
  // console.log(req.body);
  let model = {
    tableName:
      req.body.resourceName[req.body.resourceName.length - 1] == "s"
        ? req.body.resourceName + "es"
        : req.body.resourceName + "s",
    attributes: {},
    relations: [],
  };
  for (let attribute of req.body.attributes) {
    if (attribute.type !== "relation") {
      model.attributes[attribute.name] = attribute.type;
    } else {
      const relatedModelData = JSON.parse(
        fs.readFileSync(`./models/${attribute.model}.json`)
      );
      const relationObject = {
        type: attribute.relationType,
        model: attribute.model,
      };
      if (attribute.relationType === "ManyToMany") {
        const relatedTable =
          attribute.model[attribute.model.length - 1] === "s"
            ? `${attribute.model}es`
            : `${attribute.model}s`;
        const joinTable = `${model.tableName}_${relatedTable}`;
        model.relations.push({
          ...relationObject,
          join_table: joinTable,
        });
        addRelation(
          { model: req.body.resourceName, type: "ManyToMany" },
          { name: attribute.model, data: relatedModelData },
          joinTable
        );
      } else if (
        attribute.relationType === "HasOne" ||
        attribute.relationType === "HasMany"
      ) {
        addRelation(
          { model: req.body.resourceName, type: "BelongsToOne" },
          { name: attribute.model, data: relatedModelData }
        );

        model.relations.push(relationObject);
      } else if (attribute.relationType === "OneToOne") {
        addRelation(
          { model: req.body.resourceName, type: "HasOne" },
          { name: attribute.model, data: relatedModelData }
        );
        model.relations.push({
          type: "BelongsToOne",
          model: attribute.model,
          inverse: "OneToOne",
        });
      } else if (attribute.relationType === "ManyToOne") {
        addRelation(
          { model: req.body.resourceName, type: "HasMany" },
          { name: attribute.model, data: relatedModelData }
        );
        models.relations.push({
          type: "BelongsToOne",
          model: attribute.model,
          inverse: "ManyToOne",
        });
      }
    }
  }
  console.log(JSON.stringify(model));
  // fs.writeFileSync(
  //   `models/${req.body.resourceName}.json`,
  //   JSON.stringify(model)
  // );
  // makeTable(model, req.body.resourceName);
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
