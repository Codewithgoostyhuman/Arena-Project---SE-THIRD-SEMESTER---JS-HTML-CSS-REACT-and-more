// classes/RatingFormula.js
import RatingFormulaModel from "../schemas/RatingFormulaSchema.js";

export default class RatingFormula {
  // CREATE
  static async create(data) {
    const formula = new RatingFormulaModel(data);
    return await formula.save();
  }

  // UPDATE
  static async update(id, data) {
    return await RatingFormulaModel.findByIdAndUpdate(id, data, { new: true });
  }

  // DELETE
  static async delete(id) {
    return await RatingFormulaModel.findByIdAndDelete(id);
  }

  // GET ALL
  static async getAll() {
    return await RatingFormulaModel.find({});
  }

  // GET BY ID
  static async getById(id) {
    return await RatingFormulaModel.findById(id);
  }

  // GET DEFAULT FORMULA
  static async getDefault() {
    return await RatingFormulaModel.findOne({ isDefault: true });
  }
}
