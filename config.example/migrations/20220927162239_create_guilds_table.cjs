/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('guilds', function (table) {
      table.increments('id');
      table.string('guild_id', 128).notNullable();
      table.text('configuration', 'longtext').notNullable();
      table.text('command_permissions', 'longtext').notNullable().defaultsTo('{}');
      table.text('verification_bind_data', 'longtext').notNullable().defaultsTo('[]');
      table.text('mod_actions', 'longtext').notNullable().defaultsTo('[]');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
     .dropTable('guilds');
};
