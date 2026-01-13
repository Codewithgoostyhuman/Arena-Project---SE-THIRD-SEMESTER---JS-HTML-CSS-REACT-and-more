import Arena from "../schemas/ArenaSchema.js";

export default class ArenaDomain {
  constructor({
    maxTournamentsPerLeague = 10,
    maxTournamentsGlobal = 100,
    exclusiveSponsorshipFee = 500,
    perImpressionCost = 0.10,
    perClickCost = 1.00,
    maintenanceMode = false
  } = {}) {
    this.maxTournamentsPerLeague = maxTournamentsPerLeague;
    this.maxTournamentsGlobal = maxTournamentsGlobal;
    this.exclusiveSponsorshipFee = exclusiveSponsorshipFee;
    this.perImpressionCost = perImpressionCost;
    this.perClickCost = perClickCost;
    this.maintenanceMode = maintenanceMode;
  }

  async create() {
    const existing = await Arena.findOne();
    if (existing) throw new Error("Arena already exists");
    const arena = new ArenaModel(this);
    return await arena.save();
  }

  static async get() {
    return await Arena.findOne();
  }

  static async update(data) {
    return await Arena.findOneAndUpdate({}, { $set: data }, { new: true });
  }

  static async toggleMaintenance() {
    const arena = await Arena.findOne();
    if (!arena) throw new Error("Arena not found");
    arena.maintenanceMode = !arena.maintenanceMode;
    return await arena.save();
  }
}
