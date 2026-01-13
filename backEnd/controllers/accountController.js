// controllers/accountController.js
import accountService from "../services/accountService.js"
export const createAccount = async (req, res) => {
  try {
    const { initialBalance, lowBalanceThreshold } = req.body;
    const account = await accountService.createAccount(
      req.user.advertiserId,
      initialBalance,
      lowBalanceThreshold
    );
    res.status(201).json(account.toJSON());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAccount = async (req, res) => {
  try {
    const account = await accountService.getAccountById(req.params.id);
    res.json(account.toJSON());
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const getMyAccount = async (req, res) => {
  try {
    const account = await accountService.getAccountByAdvertiser(req.user.advertiserId);
    res.json(account.toJSON());
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const getAllAccounts = async (req, res) => {
  try {
    const accounts = await accountService.getAllAccounts();
    res.json(accounts.map(a => a.toJSON()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addPayment = async (req, res) => {
  try {
    const { amount, method, transactionId } = req.body;
    const account = await accountService.addPayment(
      req.params.id,
      amount,
      method,
      transactionId
    );
    res.json(account.toJSON());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const chargeAccount = async (req, res) => {
  try {
    const { amount, description, chargeType, tournamentId } = req.body;
    const account = await accountService.chargeAccount(
      req.params.id,
      amount,
      description,
      chargeType,
      tournamentId
    );
    res.json(account.toJSON());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateThreshold = async (req, res) => {
  try {
    const { threshold } = req.body;
    const account = await accountService.updateThreshold(req.params.id, threshold);
    res.json(account.toJSON());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    await accountService.deleteAccount(req.params.id);
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getBalance = async (req, res) => {
  try {
    const balance = await accountService.getBalance(req.params.id);
    res.json(balance);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const getTransactionHistory = async (req, res) => {
  try {
    const history = await accountService.getTransactionHistory(req.params.id);
    res.json(history);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};