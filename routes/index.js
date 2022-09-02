const router = require("express").Router();

router.get("/", (req, res) => {
    try {
        return res.render("index", { pageTitle: "Welcome", req });
    }
    catch (err) {
        return res.redirect("/");
    }
});

router.get("/about", (req, res) => {
    try {
        return res.render("about", { pageTitle: "About Us", req });
    }
    catch (err) {
        return res.redirect("/");
    }
});

router.get("/faq", (req, res) => {
    try {
        return res.render("faq", { pageTitle: "FAQ", req });
    }
    catch (err) {
        return res.redirect("/");
    }
});



module.exports = router;