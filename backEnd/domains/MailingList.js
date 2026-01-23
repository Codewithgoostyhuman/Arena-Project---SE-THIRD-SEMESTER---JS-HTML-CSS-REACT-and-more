import MailingList from "../schemas/MailingListSchema.js";
import User from "../schemas/UserSchema.js";

export default class MailingListDomain {
  
  static async subscribe(userId, listName) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    let list = await MailingList.findOne({ name: listName });
    if (!list) {
      list = new MailingList({ name: listName });
    }

    if (!list.subscribers.includes(userId)) {
      list.subscribers.push(userId);
      await list.save();
    }

    return list;
  }

  static async unsubscribe(userId, listName) {
    const list = await MailingList.findOne({ name: listName });
    if (!list) return null;

    list.subscribers = list.subscribers.filter(
      id => id.toString() !== userId.toString()
    );
    await list.save();
    return list;
  }

  static async getSubscribers(listName) {
    const list = await MailingList.findOne({ name: listName }).populate('subscribers', 'name email');
    if (!list) return [];
    return list.subscribers;
  }

  static async getListsForUser(userId) {
    return await MailingList.find({ subscribers: userId });
  }

  // Logic for operators to find targeting lists
  static async findListsByType(type, referenceId = null) {
    let query = { type };
    if (referenceId) query.referenceId = referenceId;
    return await MailingList.find(query);
  }

  static async createList(data) {
    const existing = await MailingList.findOne({ name: data.name });
    if (existing) throw new Error("Mailing list already exists");
    
    const list = new MailingList(data);
    await list.save();
    return list;
  }
}
