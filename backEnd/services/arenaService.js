import ArenaDomain from "../domains/Arena.js";

export default class ArenaService {
  static async createArena(data) {
    const arena = new ArenaDomain(data);
    return await arena.create();
  }

  static async getArena() {
    return await ArenaDomain.get();
  }

  static async updateArena(data) {
    return await ArenaDomain.update(data);
  }

  static async toggleMaintenance() {
    return await ArenaDomain.toggleMaintenance();
  }
}
