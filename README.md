<div align="center">
    <img src="https://cdn.imskyyc.xyz/i/JIRq" width="150px" />
    <h1>NECos</h1>
    <a href="https://github.com/Nuclear-Engineering-Co/NECos-Bun/actions/workflows/build.yml">
        <img src="https://github.com/Nuclear-Engineering-Co/NECos-Bun/actions/workflows/build.yml/badge.svg">
    </a>
    <a href="https://github.com/Nuclear-Engineering-Co/NECos-Bun/blob/master/LICENSE">
        <img src="https://img.shields.io/github/license/Nuclear-Engineering-Co/NECos-Bun"/>
    </a>
    <a href="https://github.com/Nuclear-Engineering-Co/NECos-Bun/releases">
        <img src="https://img.shields.io/github/v/release/Nuclear-Engineering-Co/NECos-Bun?label=version"/>
    </a>
    <a href="https://discord.gg/tvfzhfMu4V">
        <img src="https://img.shields.io/discord/966180940827226163?label=discord&logo=discord&logoColor=white"/>
    </a>
    <br />
</div>

<p align="center">NECos is a Discord bot & REST API developed the Nuclear Engineering Co. (See links below).</p>
<h2> Links </h2>

[NECos Releases](https://github.com/Nuclear-Engineering-Co/NECos-Bun/releases)
[Nuclear Engineering Co.](https://www.roblox.com/groups/6380413/Nuclear-Engineering-Co#!/about)
[NECo Discord](https://discord.gg/RbRQwSvF)

<h2> Information </h2>
NECos has a **built-in CLI utility**, via the `necos` script in the root project directory. Run `./necos usage` to get a list of commands.
You can also run the application manually by requiring the `NECos.ts` file.

NECos is written in TypeScript, but it also ships with ts-node as a dependency so you're good there.
**However,** NECos ***requires*** npx, *if starting the bot via CLI.*

<h2> Installation </h2>
  1. Clone the [NECos](https://github.com/Nuclear-Engineering-Co/NECos-Bun/) repository to whatever directory you'd like.
  2. Run `npm install`, or `yarn install`. **PNPM has NOT been tested.**
  3. Copy the `config.example` directory to `config`. **The application will NOT start without valid configuration.** See `configuration` below.
  4. You're done!

<h2> Configuration </h2>
NECos requires a working database backend. The application uses [Knex](https://knexjs.org/) as a database backend. The database can be configured in `config/dbconfig.js`. By default you have two "environments", development and production. The environment used is dependent on the NODE_ENV environment variable.
This is to ensure testing and production data are separate, as not to accidentally corrupt anything from update to update.

In `config/application.toml`, you have three different configuration sections, `app`, `bot`, and `api`.
<h3> App </h3>
App configuration is global configuration values that are used throughout the framework.

<h3> Bot </h3>
Bot configuration contains discord-specific values for the bot to use. Values such as token **must** be set for the discord application to run. It can be disabled via changing `enabled = false` in the bot section.

<h3> API </h3>
API configuration is for the REST API for external data access. This feature is coming soon.

<h2> Running the application </h3>
To run NECos, it's as simple as running `./necos start`, and optionally adding the `--debug` flag for extra output messages. (For **all** flags, see `./necos usage')
