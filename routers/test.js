const router = require("express").Router();

router.get("/", (req, res) => {
    // basic message
    res.status(200).json({
        code: 200,
        message: "Hewwo! Welcome to my test endpoint! (´･ω･`)"
    })
})

module.exports = router;