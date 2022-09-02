const { model, Schema } = require("mongoose");

const UserSchema = new Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        required: false,
        default: 0
    },
    deposited: {
        type: Number,
        required: false,
        default: 0
    },
    profit: {
        type: Number,
        required: false,
        default: 0
    },
    bonus: {
        type: Number,
        required: false,
        default: 0
    },
    refbonus: {
        type: Number,
        required: false,
        default: 0
    },
    totalpackages: {
        type: Number,
        required: false,
        default: 0
    },
    activepackages: {
        type: Number,
        required: false,
        default: 0
    },
    plan: {
        type: String,
        required: false,
        default: ""
    },
    bitcoin: {
        type: String,
        required: false,
        default: ""
    },
    ethereum: {
        type: String,
        required: false,
        default: ""
    },
    litcoin: {
        type: String,
        required: false,
        default: ""
    },
    bank: {
        type: Object,
        required: false,
        default: {
            bankname: "",
            accountname: "",
            accountnumber: ""
        }
    },
    isAdmin: {
        type: Boolean,
        required: false,
        default: false
    },
    regDate: {
        type: Date,
        required: false,
        default: Date.now()
    },
    pin: {
        type: Number,
        required: false,
        default: Number(String(Math.random()).slice(2, 8))
    }
});

module.exports = User = model("User", UserSchema);