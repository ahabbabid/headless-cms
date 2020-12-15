const fs = require("fs");
module.exports = (modelName, relatedModel, relation) => {
  console.log("called");
  let fileData = JSON.parse(fs.readFileSync(`./models/${modelName}.json`));
  if (relation === "BelongsToOne") {
    fileData.relations.push({
      type: "BelongsToOne",
      model: relatedModel,
    });
  } else if (relation === "ManyToMany") {
    const relatedTable =
      relatedModel[relatedModel.length - 1] === "s"
        ? `${relatedModel}es`
        : `${relatedModel}s`;
    fileData.relations.push({
      type: "ManyToMany",
      model: relatedModel,
      join_table: `${fileData.tableName}_${relatedTable}`,
    });
  }
  console.log(fileData);
  //   fs.writeFileSync(`./models/${modelName}.js`, JSON.stringify(fileData));
};
