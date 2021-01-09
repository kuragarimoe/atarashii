const router = require("express").Router();
const bcrypt = require('bcrypt');
const md5 = require('js-md5');
const exec = require('child_process').exec;

const phpCMD = process.platform == "win32" ?
    "C:\\php\\php" : "php";

router.get("/", (req, res) => {
    // basic message
    res.status(200).json({
        code: 200,
        message: "Hewwo! (´･ω･`)",
        endpoints: [
            "/auth",
            "/auth/login",
            "/auth/register"
        ]
    })
});

router.post("/login", async (req, res) => {
    let conn = req.pools["server"];
    let web = req.pools["web"];

    if (!req.body.username || !req.body.password)
        return res.status(409).json({
            code: 409,
            message: "A username or password wasn't provided."
        });

    // create password salt
    let salt = bcrypt.genSaltSync(12);
    let hash = bcrypt.hashSync(md5(req.body.password), salt);

    let [users, fields] = await conn.execute(`SELECT id, pw_bcrypt FROM users WHERE name = ${require("mysql2").escape(req.body.username)}`)
        .catch((e) => {
            res.status(500).json({
                code: 500,
                message: "An internal database error has occured."
            })
        })

    if (!users[0])
        return res.status(404).json({
            code: 404,
            message: "The user by the username provided was not found."
        });

    // :desolate:
    let cmd = `${phpCMD} "${require("path").join(__dirname, "/../../subscripts/hash.php")}" ${req.body.password} ${users[0].pw_bcrypt}`
    exec(cmd, async(err, stdout, stderr) => {
        if (err)
            return res.status(500).json({
                code: 500,
                message: "An internal server error has occured."
            });

        switch (stdout) {
            case "1":
                let date = new Date()
                let now = Math.floor(date.getTime() / 1000)
                let [rows, fields] = await web.execute(`SELECT token FROM login_tokens WHERE user_id = ${users[0].id} AND expiry_time > ${now}`)
               
                // theres a token
                if (rows[0]) {
                    return res.status(200).json({
                        code: 200,
                        message: `Welcome back, ${req.body.username}!`,
                        data:{
                            access_token: rows[0].token
                        }
                    })
                } else {
                    // delete old unnecessary tokens
                    await web.execute(`DELETE FROM login_tokens WHERE user_id = ${users[0].id} AND expiry_time < ${now}`)
                }
                
                // gen access token
                let creation = Math.floor(date.getTime() / 1000)
                let expiry = date.setDate(date.getDate() + 7);
                expiry = Math.floor(date.getTime() / 1000)
                let token = md5(`${req.body.username}${creation}${expiry}`);

                let query = `INSERT INTO login_tokens (\`id\`, \`user_id\`, \`token\`, \`expiry_time\`, \`creation_time\`) VALUES (NULL, ${users[0].id}, '${token}', ${expiry}, ${creation})`

                await web.execute(query); // query
                return res.status(200).json({
                    code: 200,
                    message: `Welcome back, ${req.body.username}!`,
                    data:{
                        access_token: token
                    }
                });
            default:
                return res.status(401).json({
                    code: 401,
                    message: "The password provided does not match the recorded user's."
                })
        }
    });
});

router.post("/logout", async(req, res) => {
    let web = req.pools["web"];
    if (!req.body.access_token)
        return res.status(409).json({
            code: 409,
            message: "You are missing an access token!"
        });

    let [rows, _] = await web.execute(`SELECT token FROM login_tokens WHERE user_id = ${users[0].id};`);
})

module.exports = router;