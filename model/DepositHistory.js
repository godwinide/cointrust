const { model, Schema } = require("mongoose");

const DepositHistorySchema = new Schema({
    amount: {
        type: Number,
        required: true
    },
    userID: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    paymentmethod: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: false,
        default: Date.now()
    }
});

module.exports = DepositHistory = model("DepositHistory", DepositHistorySchema);