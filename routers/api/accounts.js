const Cookies = require("js-cookie");
const router = require("express").Router();

router.get("/", async (req, res) => {
    res.status(200).json({
        code: 200,
        message: "Hewwo! (´･ω･`)",
        endpoints: [
            "/api/accounts",
            "/api/accounts/self"
        ]
    });
});

router.post("/follow", async (req, res) => {
    let server = req.pools["server"];
    let web = req.pools["web"];

    let result = await checkAccount(req, res, req.cookies)
    if (!result) return;

    if (!req.body.data?.query && !req.body.query) // thanks axios
        return res.status(409).json({
            code: 409,
            message: "User ID or Username not provided."
        });

    let query = require("mysql2").escape(req.body.data?.query || req.body.query);
    let [users, _] = await server.execute(`SELECT * FROM users WHERE name LIKE ${query} OR safe_name LIKE ${query} OR id = ${query}`);

    if (!users[0])
        return res.status(404).json({
            code: 404,
            message: "User not found."
        });

    let user = users[0];
    let [followy, __] = await web.execute(`SELECT * FROM followers WHERE follower = ${result.user_id} AND following = ${user.id}`);

    if (followy[0]) { // unfollow 
        await web.execute(`DELETE FROM followers WHERE ${followy[0].id}`);
        return res.status(200).json({
            code: 200,
            message: "Successfully unfollowed " + user.name
        })
    } else { // follow
        await web.execute(`INSERT INTO followers (\`id\`, \`follower\`, \`following\`) VALUES (NULL, ${result.user_id}, ${user.id})`);
        return res.status(200).json({
            code: 200,
            message: "Successfully followed " + user.name
        })
    }
})

router.all("/self", async (req, res) => {
    let server = req.pools["server"];
    let web = req.pools["web"];

    let result = await checkAccount(req, res, req.cookies)
    if (!result) return;

    let [user, _] = await server.execute(`SELECT * FROM users WHERE id = ${result.user_id}`);
    user = user[0];

    res.status(200).json({
        code: 200,
        data: {
            id: user.id,
            username: user.name,
            privileges: user.priv,
            following: (await web.execute(`SELECT following as user_id, users.name as username FROM followers INNER JOIN samui.users ON users.id = followers.following WHERE follower = ${user.id}`))[0]
        }
    });
});

async function checkAccount(req, res, cookies) {
    let web = req.pools["web"];

    if (!cookies["_access"]) { // utilize cookies instead of body, as this is a site specific endpoint
        res.status(401).json({
            code: 401,
            message: "No access token was found."
        });
        return false;
    }

    let token = cookies["_access"];
    let now = Math.floor(new Date().getTime() / 1000)
    let [rows, _] = await web.execute(`SELECT token, user_id FROM login_tokens WHERE token = ${require("mysql2").escape(token)} AND expiry_time > ${now}`);

    if (rows[0]) {
        return rows[0];
    } else {
        // delete old unnecessary tokens
        await web.execute(`DELETE FROM login_tokens WHERE token = ${require("mysql2").escape(token)} AND expiry_time < ${now}`);

        // return 401
        res.status(401).json({
            code: 401,
            message: "This access token has expired."
        });
        return true;
    }
}

module.exports = router;