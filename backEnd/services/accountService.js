// services/accountService.js
import Account from '../domains/Account.js'
import AccountModel from "../schemas/AccountSchema.js";

class AccountService {
  // Create new account
  async createAccount(advertiserId, initialBalance = 0, lowBalanceThreshold = 100) {
    const account = new Account(advertiserId, initialBalance, lowBalanceThreshold);
    const savedDoc = await account.create();
    return Account.fromDocument(savedDoc);
  }

  // Get account by ID
  async getAccountById(id) {
    const account = await Account.findById(id);
    if (!account) {
      throw new Error("Account not found");
    }
    return account;
  }

  // Get account by advertiser ID
  async getAccountByAdvertiser(advertiserId) {
    const account = await Account.findByAdvertiser(advertiserId);
    if (!account) {
      throw new Error("Account not found for this advertiser");
    }
    return account;
  }

  // Get all accounts (for admin/operator)
  async getAllAccounts() {
    const accountDocs = await AccountModel.find()
      .populate("advertiser", "companyName user")
      .populate("charges.tournament", "name");
    
    return accountDocs.map(doc => Account.fromDocument(doc));
  }

  // Add payment to account
  async addPayment(accountId, amount, method, transactionId) {
    const account = await Account.findById(accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    // Business logic is in the domain
    account.addPayment(amount, method, transactionId);
    
    // Persist changes
    await account.save();
    
    return account;
  }

  // Charge account
  async chargeAccount(accountId, amount, description, chargeType, tournamentId = null) {
    const account = await Account.findById(accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    // Business logic is in the domain
    account.charge(amount, description, chargeType, tournamentId);
    
    // Persist changes
    await account.save();
    
    // Check for low balance and potentially send notification
    if (account.isLowBalance()) {
      // You could emit an event here or call a notification service
      console.log(`Low balance warning for account ${accountId}`);
    }
    
    return account;
  }

  // Update low balance threshold
  async updateThreshold(accountId, threshold) {
    const account = await Account.findById(accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    // Business logic is in the domain
    account.updateThreshold(threshold);
    
    // Persist changes
    await account.save();
    
    return account;
  }

  // Delete account
  async deleteAccount(id) {
    const result = await Account.delete(id);
    if (!result) {
      throw new Error("Account not found");
    }
    return result;
  }

  // Get account balance
  async getBalance(accountId) {
    const account = await Account.findById(accountId);
    if (!account) {
      throw new Error("Account not found");
    }
    return {
      balance: account.balance,
      isLowBalance: account.isLowBalance(),
      threshold: account.lowBalanceThreshold
    };
  }

  // Get transaction history
  async getTransactionHistory(accountId) {
    const account = await Account.findById(accountId);
    if (!account) {
      throw new Error("Account not found");
    }
    
    // Combine charges and payments, sort by timestamp
    const transactions = [
      ...account.charges.map(c => ({ ...c, type: 'charge' })),
      ...account.payments.map(p => ({ ...p, type: 'payment' }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return transactions;
  }
}

export default new AccountService();