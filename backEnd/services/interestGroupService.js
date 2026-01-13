import InterestGroupDomain from "../domains/InterestGroupDomain.js";

export default class InterestGroupService {
  static create(data) {
    return InterestGroupDomain.create(data);
  }

  static getAll() {
    return InterestGroupDomain.getAll();
  }

  static getById(id) {
    return InterestGroupDomain.getById(id);
  }

  static update(id, data) {
    return InterestGroupDomain.update(id, data);
  }

  static delete(id) {
    return InterestGroupDomain.delete(id);
  }

  static addMember(groupId, userId) {
    return InterestGroupDomain.addMember(groupId, userId);
  }

  static removeMember(groupId, userId) {
    return InterestGroupDomain.removeMember(groupId, userId);
  }

  static addGame(groupId, gameId) {
    return InterestGroupDomain.addGame(groupId, gameId);
  }

  static addLeague(groupId, leagueId) {
    return InterestGroupDomain.addLeague(groupId, leagueId);
  }
}
