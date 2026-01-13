import InterestGroup from "../schemas/InterestGroupSchema.js";

export default class InterestGroupDomain {
  static async create(data) {
    const group = new InterestGroup(data);
    return await group.save();
  }

  static async getAll() {
    return await InterestGroup.find()
      .populate("members", "name role")
      .populate("games", "name")
      .populate("leagues", "name");
  }

  static async getById(id) {
    return await InterestGroup.findById(id)
      .populate("members", "name role")
      .populate("games", "name")
      .populate("leagues", "name");
  }

  static async update(id, data) {
    return await InterestGroup.findByIdAndUpdate(id, data, { new: true });
  }

  static async delete(id) {
    return await InterestGroup.findByIdAndDelete(id);
  }

  static async addMember(groupId, userId) {
    return await InterestGroup.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: userId } },
      { new: true }
    );
  }

  static async removeMember(groupId, userId) {
    return await InterestGroup.findByIdAndUpdate(
      groupId,
      { $pull: { members: userId } },
      { new: true }
    );
  }

  static async addGame(groupId, gameId) {
    return await InterestGroup.findByIdAndUpdate(
      groupId,
      { $addToSet: { games: gameId } },
      { new: true }
    );
  }

  static async addLeague(groupId, leagueId) {
    return await InterestGroup.findByIdAndUpdate(
      groupId,
      { $addToSet: { leagues: leagueId } },
      { new: true }
    );
  }
}
