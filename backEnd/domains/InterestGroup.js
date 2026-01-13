import InterestGroupModel from "../schemas/InterestGroupSchema.js";

export default class InterestGroupDomain {
  static async create(data) {
    const group = new InterestGroupModel(data);
    return await group.save();
  }

  static async getAll() {
    return await InterestGroupModel.find()
      .populate("members", "name role")
      .populate("games", "name")
      .populate("leagues", "name");
  }

  static async getById(id) {
    return await InterestGroupModel.findById(id)
      .populate("members", "name role")
      .populate("games", "name")
      .populate("leagues", "name");
  }

  static async update(id, data) {
    return await InterestGroupModel.findByIdAndUpdate(id, data, { new: true });
  }

  static async delete(id) {
    return await InterestGroupModel.findByIdAndDelete(id);
  }

  static async addMember(groupId, userId) {
    return await InterestGroupModel.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: userId } },
      { new: true }
    );
  }

  static async removeMember(groupId, userId) {
    return await InterestGroupModel.findByIdAndUpdate(
      groupId,
      { $pull: { members: userId } },
      { new: true }
    );
  }

  static async addGame(groupId, gameId) {
    return await InterestGroupModel.findByIdAndUpdate(
      groupId,
      { $addToSet: { games: gameId } },
      { new: true }
    );
  }

  static async addLeague(groupId, leagueId) {
    return await InterestGroupModel.findByIdAndUpdate(
      groupId,
      { $addToSet: { leagues: leagueId } },
      { new: true }
    );
  }
}
