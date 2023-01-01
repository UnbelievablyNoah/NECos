import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("affiliates", function (table) {
    table.increments("id");
    
    table.string("discord_id").notNullable().unique();
    table.string("group_name").notNullable().unique();
    table.string("group_id").notNullable().unique();
    table.string("owner_id").notNullable();
    table.string("invite").notNullable().defaultTo("N/A");

    table.json("data_cache").notNullable().defaultTo('{"last_update": 0}')
    table.json("representatives").notNullable().defaultTo("[]");

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("affiliates");
}

