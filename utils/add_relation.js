const fs = require("fs");
module.exports = (relation, model, joinTable) => {
  console.log("called");
  const relationObject = {
    type: relation.type,
    model: relation.model,
  };
  if (relation.type === "BelongsToOne") {
    model.data.relations.push({
      ...relationObject,
      inverse: relation.inverse,
    });
  } else if (relation.type === "ManyToMany") {
    model.data.relations.push({
      ...relationObject,
      join_table: joinTable,
    });
  } else if (relation.type === "HasOne" || "HasMany") {
    model.data.relations.push(relationObject);
  }
  console.log(model.data);
  // fs.writeFileSync(`./models/${modelName}.json`, JSON.stringify(fileData));
};
