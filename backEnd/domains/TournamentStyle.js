import TournamentStyleModel from "../schemas/TournamentStyle.js";

export default class TournamentStyleDomain {
  constructor(name, description, isDefault = false, status = "active") {
    this.name = name;
    this.description = description;
    this.isDefault = isDefault;
    this.status = status;
  }

  // Create new style
  async create() {
    const newStyle = new TournamentStyleModel({
      name: this.name,
      description: this.description,
      isDefault: this.isDefault,
      status: this.status
    });
    return await newStyle.save();
  }

  // Static methods for existing styles
  static async update(id, data) {
    return await TournamentStyleModel.findByIdAndUpdate(id, data, { new: true });
  }

  static async delete(id) {
    return await TournamentStyleModel.findByIdAndDelete(id);
  }

  static async getAll() {
    return await TournamentStyleModel.find().sort({ createdAt: -1 });
  }

  static async getById(id) {
    return await TournamentStyleModel.findById(id);
  }

  static async getDefault() {
    return await TournamentStyleModel.findOne({ isDefault: true, status: "active" });
  }
}
