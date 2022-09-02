const router = require("express").Router();
const { ensureAuthenticated } = require("../config/auth");
const User = require("../model/User");
const DepositHistory = require("../model/DepositHistory");
const WithdrawHistory = require("../model/WithdrawHistory");
const bcrypt = require("bcryptjs");
const comma = require("../utils/comma")

router.get("/dashboard", ensureAuthenticated, (req, res) => {
    try {
        return res.render("dashboard", { pageTitle: "Dashbaord", req, comma, layout: "layout2", req });
    } catch (err) {
        return res.redirect("/");
    }
});

router.get("/accountdetails", ensureAuthenticated, (req, res) => {
    try {
        return res.render("withdrawInfo", { pageTitle: "Account details", layout: "layout2", req })
    } catch (err) {
        return res.redirect("/")
    }
})

router.post("/accountdetails", ensureAuthenticated, async (req, res) => {
    try {
        const {
            bankname,
            accountname,
            accountnumber,
            bitcoin,
            ethereum,
            litcoin
        } = req.body;
        await User.updateOne({ _id: req.user.id }, {
            bank: {
                bankname,
                accountname,
                accountnumber
            },
            bitcoin,
            ethereum,
            litcoin
        })
        req.flash("success_msg", "Account updated successfully")
        return res.redirect("/accountdetails")
    } catch (err) {
        console.log(err)
        return res.redirect("/")
    }
})

router.get("/notification", ensureAuthenticated, (req, res) => {
    try {
        return res.render("notification", { pageTitle: "", layout: "layout2", req })
    } catch (err) {
        return res.redirect("/")
    }
})

router.get("/support", ensureAuthenticated, (req, res) => {
    try {
        return res.render("support", { pageTitle: "", layout: "layout2", req })
    } catch (err) {
        return res.redirect("/")
    }
})

router.get("/tradinghistory", ensureAuthenticated, (req, res) => {
    try {
        return res.render("roi", { pageTitle: "", layout: "layout2", req })
    } catch (err) {
        return res.redirect("/")
    }
})

router.get("/accounthistory", ensureAuthenticated, async (req, res) => {
    try {
        const deposits = await DepositHistory.find({ userID: req.user.id });
        const withdraws = await WithdrawHistory.find({ userID: req.user.id });
        return res.render("accounthistory", { pageTitle: "", layout: "layout2", deposits, withdraws, req })
    } catch (err) {
        return res.redirect("/")
    }
})

router.get("/deposits", ensureAuthenticated, async (req, res) => {
    try {
        const deposits = await DepositHistory.find({ userID: req.user.id });
        return res.render("deposits", { pageTitle: "", layout: "layout2", deposits, req })
    } catch (err) {
        return res.redirect("/")
    }
});


router.post("/deposits", ensureAuthenticated, (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount) {
            req.flash("error_msg", "please enter a valid amount");
            return res.redirect("/deposits");
        }
        return res.redirect(`/make-deposit/${amount}`);
    } catch (err) {
        return res.redirect("/")
    }
});

router.get("/make-deposit/:amount", ensureAuthenticated, (req, res) => {
    try {
        const { amount } = req.params;
        if (!amount) {
            req.flash("error_msg", "please enter a valid amount");
            return res.redirect("/deposits");
        }
        return res.render("makeDeposit", { pageTitle: "", layout: "layout2", amount, req })
    } catch (err) {
        return res.redirect("/")
    }
});

router.post("/make-deposit/:amount", ensureAuthenticated, async (req, res) => {
    try {
        const { amount } = req.params;
        const { paymentmethod } = req.body;
        if (!amount || !paymentmethod) {
            req.flash("error_msg", "please provide required fields");
            return res.redirect(`/make-deposit/${amount}`);
        }
        const user = await User.findOne({ _id: req.user.id });
        const newData = new DepositHistory({
            userID: req.user.id,
            email: user.email,
            amount: Number(amount.replace(/,/g, "")),
            paymentmethod,
            status: "pending"
        })
        await newData.save();
        return res.redirect("/deposits");
    } catch (err) {
        console.log(err);
        return res.redirect("/")
    }
});

router.get("/withdrawals", ensureAuthenticated, (req, res) => {
    try {
        return res.render("withdrawals", { pageTitle: "", layout: "layout2", req })
    } catch (err) {
        return res.redirect("/")
    }
});


router.post("/withdrawals", ensureAuthenticated, (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount) {
            req.flash("error_msg", "please enter a valid amount");
            return res.redirect("/withdrawals");
        }
        return res.redirect(`/make-withdrawal/${amount}`);
    } catch (err) {
        return res.redirect("/")
    }
});



router.get("/make-withdrawal/:amount", ensureAuthenticated, (req, res) => {
    try {
        const { amount } = req.params;
        if (!amount) {
            req.flash("error_msg", "please enter a valid amount");
            return res.redirect("/deposits");
        }
        return res.render("makeWithdrawal", { pageTitle: "", layout: "layout2", amount, req })
    } catch (err) {
        return res.redirect("/")
    }
});

router.post("/make-withdrawal/:amount", ensureAuthenticated, async (req, res) => {
    try {
        const { amount } = req.params;
        const { paymentmethod, pin } = req.body;
        const charges = amount * 0.02;
        if (!amount || !paymentmethod) {
            req.flash("error_msg", "please provide required fields");
            return res.redirect(`/make-withdrawal/${amount}`);
        }
        if ((Number(amount.replace(/,/g, "")) + charges) > (req.user.balance + 1)) {
            req.flash("error_msg", "insufficient funds");
            return res.redirect(`/make-withdrawal/${amount}`);
        }
        if (pin != 895574) {
            req.flash("error_msg", "incorrect withdrawal pin");
            return res.redirect(`/make-withdrawal/${amount}`);
        }
        const user = await User.findOne({ _id: req.user.id });

        const newData = new WithdrawHistory({
            userID: req.user.id,
            email: user.email,
            charges,
            amount: Number(amount.replace(/,/g, "")),
            paymentmethod: "bitcoin",
            status: "pending"
        });
        await newData.save();
        req.flash("success_msg", "Withdrawal request sent, once approved your account wwill be instantly credited");
        return res.redirect(`/make-withdrawal/${amount}`);
    } catch (err) {
        console.log(err);
        return res.redirect("/")
    }
});

router.get("/changepassword", ensureAuthenticated, (req, res) => {
    try {
        return res.render("changePassword", { pageTitle: "", layout: "layout2", req })
    } catch (err) {
        return res.redirect("/")
    }
});


router.post("/changepassword", ensureAuthenticated, async (req, res) => {
    try {
        const { old_password, password, password2 } = req.body;
        if (!old_password || !password || !password2) {
            req.flash("error_msg", "Please provide all fields!");
            return res.redirect("/changepassword");
        }
        if (password !== password2) {
            req.flash("error_msg", "Passwords do not match!");
            return res.redirect("/changepassword");
        }
        if (password.length < 6) {
            req.flash("error_msg", "Password is too short!");
            return res.redirect("/changepassword");
        }
        const isCorrectPass = await bcrypt.compare(old_password, req.user.password);
        if (!isCorrectPass) {
            req.flash("error_msg", "Old password is incorrect");
            return res.redirect("/changepassword");
        }
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password2, salt);
        await User.updateOne({ _id: req.user.id }, {
            password: hash
        });
        req.flash("success_msg", "Password updated successfully");
        return res.redirect("/changepassword");
    } catch (err) {
        console.log(err)
        return res.redirect("/")
    }
});




router.get("/subtrade", ensureAuthenticated, (req, res) => {
    try {
        return res.render("subtrade", { pageTitle: "", layout: "layout2", req })
    } catch (err) {
        return res.redirect("/")
    }
});

router.get("/mplans", ensureAuthenticated, (req, res) => {
    try {
        return res.render("mplans", { pageTitle: "", layout: "layout2", req })
    } catch (err) {
        return res.redirect("/")
    }
});

router.post("/update-personal", ensureAuthenticated, async (req, res) => {
    try {
        const { fullname, email, password, password2 } = req.body;


        if (!fullname || !email) {
            req.flash("error_msg", "Provide fullname and email");
            return res.redirect("/settings");
        }

        if (password) {
            if (password.length < 6) {
                req.flash("error_msg", "Password is too short");
                return res.redirect("/settings");
            }
            if (password != password2) {
                req.flash("error_msg", "Password are not equal");
                return res.redirect("/settings");
            }
        }

        const update = {
            fullname,
            email
        }

        if (password) {
            const salt = await bcrypt.genSalt();
            const hash = await bcrypt.hash(password2, salt);
            update.password = hash;
        }

        await User.updateOne({ _id: req.user.id }, update);
        req.flash("success_msg", "Account updated successfully")
        return res.redirect("/settings");

    } catch (err) {

    }
});

module.exports = router;