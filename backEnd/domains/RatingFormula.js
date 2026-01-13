// classes/RatingFormula.js
import RatingFormula from "../schemas/RatingFormulaSchema.js";

export default class RatingFormula {
  // CREATE
  static async create(data) {
    const formula = new RatingFormula(data);
    return await formula.save();
  }

  // UPDATE
  static async update(id, data) {
    return await RatingFormula.findByIdAndUpdate(id, data, { new: true });
  }

  // DELETE
  static async delete(id) {
    return await RatingFormula.findByIdAndDelete(id);
  }

  // GET ALL
  static async getAll() {
    return await RatingFormula.find({});
  }

  // GET BY ID
  static async getById(id) {
    return await RatingFormula.findById(id);
  }

  // GET DEFAULT FORMULA
  static async getDefault() {
    return await RatingFormula.findOne({ isDefault: true });
  }
}
