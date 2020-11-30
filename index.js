const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");
const knex = require("./config/database.js");
const { Model } = require("objection");
const models = require("./models.js");
// console.log("ay this the real shit:" + models["user"].tableName());
Model.knex(knex);
knex.migrate.rollback();
// let models = {};
// let model = class extends Model {
//   name = "ahabb";
// };
// class User extends Model {
//   //static get relationMappings
// }
// models[model.name] = model;
// // console.log(models[model.name].name);
// User.relationMappings = function () {
//   console.log("what up chief");
//   return "wa";
// };
// User.tableName = function () {
//   return "users";
// };
console.log("query:");
models["user"]
  .query()
  .findById(1)
  .then((user) => {
    console.log(user);
  });

// User.prototype.ahabb = function () {
//   console.log("ahabb is awesome");
// };
// User.relationMappings();
// let ahabb = new User();
//ahabb.relationMappings();
const object = {
  tableName: "users",
  attributes: {
    id: "number",
    name: "string",
    address: {
      //model: "address",
      via: "user",
    },
  },
};

// let model = class extends Model {};
// models[tableName];

if (!object.attributes.address.model) {
  console.log("true");
}

const object2 = {
  tableName: "addresses",
  attributes: {
    id: "number",
    user: {
      model: "user",
    },
  },
};

// TODO: define database structure for different types of relationships

knex.schema.hasTable("users").then(function (exists) {
  if (!exists) {
    return knex.schema
      .createTable("users", function (table) {
        for (field in object) {
          //console.log(field)
          if (object[field] == "number") table.increments();
          if (object[field] == "string") table.string(field);
        }
      })
      .then(() => console.log("successfull"))
      .catch((e) => console.log(e));
  } else console.log("yolo");
});

//console.log(table['id'])
// knex.schema.createTable('users', function (table) {
//     for(field in object.attributes){
//         //console.log(field)
//         if(field.model){
//           console.log
//         }

//     }

// }).then(()=> console.log('successfull')).catch(e=>console.log(e))
// app.get("/:resource", (req, res) => {
//     console.log(knex.table().select(req.params.resource)
// //   res.send(knex.table().select(req.params.resource));
// });

let r = JSON.parse(fs.readFileSync("routes.json"));
// fs.readFile("routes.json", (err, data) => {
//   if (err) throw err;
//   r = JSON.parse(data);
//   console.log(r);
// });
console.log(r);

for (route of r.routes) {
  const [controller, methodName] = route.handler.split(".");

  const wassup = require("./controllers/" + controller + ".js");
  console.log(wassup);
  if (route.method == "GET") {
    app.get(route.path, (req, res) => {
      wassup[methodName]({ req, res });
    });
  }
}
app.get("/:resource", (req, res) => {
  knex
    .table(req.params.resource)
    .select()
    .then((data) => console.log(data));
});
app.post("/:resource", (req, res) => {});
app.get("/users", (req, res) => {
  res.send("what up");
});
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
