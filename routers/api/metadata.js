const router = require("express").Router();

router.get("/", async(req, res) => {
    let conn = req.pools["server"];
    // basic message
    let ppRecordRX = (await conn.query("SELECT pp, users.name as holder FROM scores_rx INNER JOIN users ON users.id = scores_rx.userid ORDER BY pp DESC"))[0][0];
    let ppRecordVN = (await conn.query("SELECT pp, users.name as holder FROM scores_vn INNER JOIN users ON users.id = scores_vn.userid ORDER BY pp DESC"))[0][0];
    let ppRecordAP = (await conn.query("SELECT pp, users.name as holder FROM scores_ap INNER JOIN users ON users.id = scores_ap.userid ORDER BY pp DESC"))[0][0];

    res.status(200).json({
        code: 200,
        message: "Hewwo! (´･ω･`)",
        data: {
            users: {
                total: (await conn.query("SELECT COUNT(*) FROM users"))[0][0]["COUNT(*)"],
                online:(await conn.query("SELECT COUNT(*) FROM user_sessions"))[0][0]["COUNT(*)"]
            },
            records: {
                vn: ppRecordVN,
                rx: ppRecordRX,
                ap: ppRecordAP
            }
        }
    });
});

module.exports = router;