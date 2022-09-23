const router = require("express").Router();
const User = require("../../model/User");
const DepositHistory = require("../../model/DepositHistory");
const WithdrawHistory = require("../../model/WithdrawHistory");
const { ensureAdmin } = require("../../config/auth");
const bcrypt = require("bcryptjs/dist/bcrypt");

router.get("/", ensureAdmin, async (req, res) => {
    try {
        const customers = await User.find({ isAdmin: false });
        const history = await DepositHistory.find({});
        const withdraws = await WithdrawHistory.find({});
        const total_bal = customers.reduce((prev, cur) => prev + Number(cur.balance), 0);
        return res.render("admin/index", { layout: "admin/layout", pageTitle: "Welcome", customers: customers.reverse(), history, withdraws, total_bal, req });
    }
    catch (err) {
        return res.redirect("/admin");
    }
});

router.get("/edit-user/:id", ensureAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await User.findOne({ _id: id });
        return res.render("admin/editUser", { layout: "admin/layout", pageTitle: "Welcome", customer, req });
    }
    catch (err) {
        return res.redirect("/admin");
    }
});

router.post("/edit-user/:id", ensureAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { balance, profit, deposited, bonus, refbonus, totalpackages, activepackages, pin } = req.body;
        await User.updateOne({ _id: id }, {
            balance: balance || 0,
            profit: profit || 0,
            deposited: deposited || 0,
            bonus: bonus || 0,
            refbonus: refbonus || 0,
            totalpackages: totalpackages || 0,
            activepackages: activepackages || 0,
            pin: pin || Number(String(Math.random()).slice(2, 8))
        });
        req.flash("success_msg", "account updated");
        return res.redirect("/admin/edit-user/" + id);
    }
    catch (err) {
        console.log(err);
        return res.redirect("/admin");
    }
});

router.get("/delete-account/:id", ensureAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.redirect("/admin");
        }
        await User.deleteOne({ _id: id });
        return res.redirect("/admin");
    } catch (err) {
        return res.redirect("/admin")
    }
});

router.get("/deposit", ensureAdmin, async (req, res) => {
    try {
        const customers = await User.find({});
        return res.render("admin/deposit", { layout: "admin/layout", pageTitle: "Deposit", customers, req });
    } catch (err) {
        return res.redirect("/admin")
    }
});

router.post("/deposit", ensureAdmin, async (req, res) => {
    try {
        const { amount, userID, debt } = req.body;
        if (!amount || !userID || !debt) {
            req.flash("error_msg", "Please provide all fields");
            return res.redirect("/admin/deposit");
        }
        const customer = await User.findOne({ _id: userID });
        const newHistData = {
            type: "Credit",
            userID,
            amount,
            status: 'successful',
            account: customer.email
        }
        const newHist = new DepositHistory(newHistData);
        await newHist.save();

        await User.updateOne({ _id: userID }, {
            balance: Number(customer.balance) + Number(amount),
            active_deposit: Number(customer.active_deposit) + Number(amount),
            debt,
            total_deposit: Number(customer.total_deposit) + Number(amount)
        });

        req.flash("success_msg", "Deposit successful");
        return res.redirect("/admin/deposit");

    } catch (err) {
        console.log(err);
        return res.redirect("/admin");
    }
})

router.get("/change-password", ensureAdmin, async (req, res) => {
    try {
        return res.render("admin/changePassword", { layout: "admin/layout", pageTitle: "Change Password", req });
    } catch (err) {
        console.log(err);
        return res.redirect("/admin");
    }
})

router.post("/change-password", ensureAdmin, async (req, res) => {
    try {
        const { password, password2 } = req.body;
        console.log(req.body);
        if (!password || !password2) {
            req.flash("error_msg", "Please provide fill all fields");
            return res.redirect("/admin/change-password");
        }
        else if (password !== password2) {
            req.flash("error_msg", "Both passwords must be same");
            return res.redirect("/admin/change-password");
        }
        else if (password.length < 6) {
            req.flash("error_msg", "Password too short")
            return res.redirect("/admin/change-password");
        } else {
            const salt = await bcrypt.genSalt();
            const hash = await bcrypt.hash(password2, salt);
            await User.updateOne({ _id: req.user.id }, {
                password: hash
            });
            req.flash("success_msg", "password updated successfully");
            return res.redirect("/admin/change-password");
        }

    } catch (err) {
        console.log(err);
        return res.redirect("/admin");
    }
});

router.get("/approve-deposit/:id", ensureAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const hist = await DepositHistory.findById(id);
        const user = await User.findById(hist.userID);
        await User.updateOne({
            balance: user.balance + hist.amount,
            deposited: user.deposited + hist.amount
        })
        await DepositHistory.updateOne({ _id: id }, {
            status: "approved"
        });
        return res.redirect("/admin");
    } catch (err) {
        console.log(err);
        return res.redirect("/admin");
    }
})

router.get("/approve-withdraw/:id", ensureAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const hist = await WithdrawHistory.findById(id);
        const user = await User.findById(hist.userID);
        await User.updateOne({
            balance: user.balance - hist.amount
        })
        await WithdrawHistory.updateOne({ _id: id }, {
            status: "approved"
        });
        return res.redirect("/admin");
    } catch (err) {
        console.log(err);
        return res.redirect("/admin");
    }
})

module.exports = router;