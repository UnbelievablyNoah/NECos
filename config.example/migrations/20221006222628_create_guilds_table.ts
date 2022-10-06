import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("guilds", function (table) {
    table.increments("id");
    table.string("guild_id", 128).notNullable();
    table.text("configuration", "longtext").notNullable();
    table
      .text("command_permissions", "longtext")
      .notNullable()
      .defaultTo("{}");
    table
      .text("verification_bind_data", "longtext")
      .notNullable()
      .defaultTo("[]");
    table.text("mod_actions", "longtext").notNullable().defaultTo("[]");
  });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("guilds");
}

