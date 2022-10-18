export abstract class BaseExtension {
  Bot = null;
  NECos = null;

  constructor(NECos) {
    this.NECos = NECos;
    this.Bot = NECos.bot;
  }

  // Loader functions
  up = async () => {};

  down = async () => {};
}
