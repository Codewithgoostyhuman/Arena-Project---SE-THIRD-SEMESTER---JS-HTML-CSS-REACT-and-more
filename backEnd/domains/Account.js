// domains/Account.js
import AccountModel from "../schemas/AccountSchema.js";

export default class Account {
  constructor(advertiserId, initialBalance = 0, lowBalanceThreshold = 100) {
    this.advertiser = advertiserId;
    this.balance = initialBalance;
    this.lowBalanceThreshold = lowBalanceThreshold;
    this.charges = [];
    this.payments = [];
  }

  // Instance method to create account
  async create() {
  const accountDoc = new AccountModel({
    advertiser: this.advertiser,
    balance: this.balance,
    lowBalanceThreshold: this.lowBalanceThreshold,
    charges: this.charges,
    payments: this.payments
  });
  const savedDoc = await accountDoc.save();
  this._id = savedDoc._id;
  this._doc = savedDoc;
  return this; // Return domain object
}


  // Static factory method to load from database
  static async findById(id) {
    const accountDoc = await AccountModel.findById(id)
      .populate("advertiser", "companyName user")
      .populate("charges.tournament", "name");
    
    if (!accountDoc) return null;
    return Account.fromDocument(accountDoc);
  }

  // Static factory method to load by advertiser
  static async findByAdvertiser(advertiserId) {
    const accountDoc = await AccountModel.findOne({ advertiser: advertiserId })
      .populate("advertiser", "companyName user")
      .populate("charges.tournament", "name");
    
    if (!accountDoc) return null;
    return Account.fromDocument(accountDoc);
  }

  // Static factory method to create domain object from Mongoose document
  static fromDocument(doc) {
    const account = new Account(
      doc.advertiser,
      doc.balance,
      doc.lowBalanceThreshold
    );
    account._id = doc._id;
    account.charges = doc.charges || [];
    account.payments = doc.payments || [];
    account._doc = doc; // Keep reference to original document
    return account;
  }

  // Business logic: Add payment
  addPayment(amount, method, transactionId) {
    if (amount <= 0) {
      throw new Error("Payment amount must be positive");
    }

    this.balance += amount;
    this.payments.push({
      amount,
      method,
      transactionId,
      timestamp: new Date()
    });
  }

  // Business logic: Charge account
  charge(amount, description, chargeType, tournamentId = null) {
    if (amount <= 0) {
      throw new Error("Charge amount must be positive");
    }

    if (this.balance < amount) {
      throw new Error("Insufficient balance");
    }

    this.balance -= amount;
    this.charges.push({
      amount,
      description,
      chargeType,
      tournament: tournamentId,
      timestamp: new Date()
    });
  }

  // Business logic: Update threshold
  updateThreshold(threshold) {
    if (threshold < 0) {
      throw new Error("Threshold must be non-negative");
    }
    this.lowBalanceThreshold = threshold;
  }

  // Business logic: Check if balance is low
  isLowBalance() {
    return this.balance < this.lowBalanceThreshold;
  }

  // Persistence: Save changes to database
  async save() {
    if (this._doc) {
      // Update existing document
      this._doc.balance = this.balance;
      this._doc.lowBalanceThreshold = this.lowBalanceThreshold;
      this._doc.charges = this.charges;
      this._doc.payments = this.payments;
      return await this._doc.save();
    } else {
      // Create new document (shouldn't happen if using create())
      throw new Error("Cannot save domain object without document reference");
    }
  }

  // Static method: Delete account
  static async delete(id) {
    return await AccountModel.findByIdAndDelete(id);
  }

  // Convert to plain object for JSON responses
  toJSON() {
    return {
      _id: this._id,
      advertiser: this.advertiser,
      balance: this.balance,
      lowBalanceThreshold: this.lowBalanceThreshold,
      charges: this.charges,
      payments: this.payments,
      isLowBalance: this.isLowBalance()
    };
  }
}