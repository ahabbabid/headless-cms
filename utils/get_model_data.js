const fs = require("fs");
module.exports = (modelName) => {
  return modelName
    ? JSON.parse(fs.readFileSync(`./models/${modelName}.json`))
    : null;
};
