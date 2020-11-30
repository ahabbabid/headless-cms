
exports.up = function (knex){
  return knex.schema.createTable('test', function(table){
    table.increments('id');

  })

}

exports.down = function (knes){
  return knex.schema.dropTable("test");
}
