import ApplicationModel from "../schemas/ApplicationSchema.js";

export default class ApplicationDomain {
  constructor(playerId, targetType, targetId, status = "pending") {
    this.player = playerId;
    this.targetType = targetType; // "league" or "tournament"
    this.targetId = targetId;
    this.status = status;
  }

  // Create new application
  async create() {
    const appDoc = new ApplicationModel({
      player: this.player,
      targetType: this.targetType,
      targetId: this.targetId,
      status: this.status
    });
    const savedDoc = await appDoc.save();
    this._id = savedDoc._id;
    this._doc = savedDoc;
    return this; // return domain object
  }

  // Static factory: from Mongoose document
  static fromDocument(doc) {
    const app = new ApplicationDomain(
      doc.player,
      doc.targetType,
      doc.targetId,
      doc.status
    );
    app._id = doc._id;
    app._doc = doc;
    return app;
  }

  // Approve
  async approve() {
    this.status = "approved";
    if (this._doc) {
      this._doc.status = "approved";
      await this._doc.save();
    }
    return this;
  }

  // Reject
  async reject() {
    this.status = "rejected";
    if (this._doc) {
      this._doc.status = "rejected";
      await this._doc.save();
    }
    return this;
  }

  toJSON() {
    return {
      _id: this._id,
      player: this.player,
      targetType: this.targetType,
      targetId: this.targetId,
      status: this.status
    };
  }

  // Delete
  static async delete(id) {
    return await ApplicationModel.findByIdAndDelete(id);
  }

  static async findById(id) {
    const doc = await ApplicationModel.findById(id).populate("player", "name email");
    if (!doc) return null;
    return ApplicationDomain.fromDocument(doc);
  }

  static async findByPlayer(playerId) {
    const docs = await ApplicationModel.find({ player: playerId }).populate("player", "name email");
    return docs.map(doc => ApplicationDomain.fromDocument(doc));
  }

  static async findByTarget(targetType, targetId) {
    const docs = await ApplicationModel.find({ targetType, targetId }).populate("player", "name email");
    return docs.map(doc => ApplicationDomain.fromDocument(doc));
  }

  static async findAll() {
    const docs = await ApplicationModel.find().populate("player", "name email");
    return docs.map(doc => ApplicationDomain.fromDocument(doc));
  }
}
