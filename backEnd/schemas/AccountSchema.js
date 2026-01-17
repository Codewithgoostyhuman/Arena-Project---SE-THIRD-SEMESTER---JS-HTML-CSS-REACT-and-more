import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema({
  advertiser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Advertiser",
    required: true
  },
  
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // History of charges
  charges: [{
    amount: Number,
    description: String,
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament"
    },
    chargeType: {
      type: String,
      enum: ['exclusiveSponsorship', 'impression', 'click'],
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // History of payments (money added to account)
  payments: [{
    amount: Number,
    method: String, // e.g., 'credit card', 'bank transfer'
    transactionId: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Alert threshold
  lowBalanceThreshold: {
    type: Number,
    default: 100
  }
}, {
  timestamps: true
});

// Method to charge account
AccountSchema.methods.charge = function(amount, description, chargeType, tournament) {
  if (this.balance < amount) {
    throw new Error('Insufficient balance');
  }
  
  this.balance -= amount;
  this.charges.push({
    amount,
    description,
    chargeType,
    tournament,
    timestamp: new Date()
  });
  
  return this.save();
};

// Method to add payment
AccountSchema.methods.addPayment = function(amount, method, transactionId) {
  this.balance += amount;
  this.payments.push({
    amount,
    method,
    transactionId,
    timestamp: new Date()
  });
  
  return this.save();
};

export default mongoose.model("Account", AccountSchema);