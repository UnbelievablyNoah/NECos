import type { Knex } from "knex";

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
  ci: {
    client: "mysql2",
    connection: {
      database: "NECos_ci",
      user: "NECos",
      password: "necos",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "migrations",
    },
  },

  development: {
    client: "mysql2",
    connection: {
      database: "NECos_development",
      user: "username",
      password: "password",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "migrations",
    },
  },

  production: {
    client: "mysql2",
    connection: {
      database: "NECos_production",
      user: "username",
      password: "password",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "migrations",
    },
  },
};

export default config;
