export abstract class BaseExtension {
  Bot = null;
  NECos = null;

  name = "";
  description = "";

  constructor(NECos) {
    this.NECos = NECos;
    this.Bot = NECos.bot;
  }
}
