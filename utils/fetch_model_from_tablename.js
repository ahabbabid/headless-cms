const models = require("../models.js");
module.exports = (tableName) => {
  for (key in models) {
    if (models[key].tableName == tableName) return [key, models[key]];
  }
  return [null, null];
};
