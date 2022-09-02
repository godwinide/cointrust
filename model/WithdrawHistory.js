const { model, Schema } = require("mongoose");

const WithdrawHistorySchema = new Schema({
    amount: {
        type: Number,
        required: true
    },
    charges: {
        type: Number,
        required: true
    },
    paymentmethod: {
        type: String,
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

module.exports = WithdrawHistory = model("WithdrawHistory", WithdrawHistorySchema);