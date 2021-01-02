const router = require("express").Router();

router.get("/", (req, res) => {
    // basic message
    res.status(200).json({
        code: 200,
        message: "Hewwo! (´･ω･`)",
        endpoints: [
            "/api/users",
            "/api/users/:id_or_username"
        ]
    });
});

router.get("/:query", async (req, res) => {
    let conn = req.pools["server"];
    let query = require("mysql2").escape(req.params.query);
    let [users, _] = await conn.execute(`SELECT * FROM users WHERE name LIKE ${query} OR safe_name LIKE ${query} OR id LIKE ${query}`);

    if (!users[0])
        return res.status(404).json({
            code: "A user by this name or ID was not found."
        });

    let user = users[0];
    let joinDate = new Date(user.creation_time * 1000);

    // limit to 100 based off pp
    let [score] = await conn.execute(`SELECT * FROM stats WHERE id = ${user.id}`); // Neither: 0
    score = score[0];

    let data = {
        id: user.id,
        username: user.name,
        creation_data: joinDate.toISOString(),
        country: user.country.toUpperCase(),
    }

    function keys(mode, type) {
        switch (mode) {
            case 0: mode = "std"; break;
            case 1: mode = "catch"; break;
            case 2: mode = "taiko"; break;
            case 3: mode = "mania"; break;
            default: mode = "unknown"; break;
        }

        switch (type) {
            case 0: type = "vn"; break;
            case 1: type = "rx"; break;
            case 2: type = "ap"; break;
            default: mode = "unknown"; break;
        }

        return [ // keys based off score
            `tscore_${type}_${mode}`,
            `rscore_${type}_${mode}`,
            `pp_${type}_${mode}`,
            `plays_${type}_${mode}`,
            `playtime_${type}_${mode}`,
            `acc_${type}_${mode}`,
            `maxcombo_${type}_${mode}`
        ];
    }

    let mode = isNaN(parseInt(req.query.mode || NaN)) ? 0 : parseInt(req.query.mode);
    let type = isNaN(parseInt(req.query.type || NaN)) ? 0 : parseInt(req.query.type);

    if ((type > 2 || type < 0) || (mode > 3 || mode < 0))
        return res.status(409).json({
            code: 409,
            message: "An invalid type, or mode was provided.",
            data: {
                ranges: {
                    type: "[0 - 2]",
                    mode: "[0 - 3]"
                }
            }
        });

    let k = keys(mode, type);

    // set values
    data.ingame = {};
    data.ingame.score = {
        total: score[k[0]],
        ranked: score[k[1]]
    };

    data.ingame.pp = score[k[2]];
    data.ingame.plays = score[k[3]];
    data.ingame.playtime = score[k[4]];
    data.ingame.accuracy = score[k[5]];
    data.ingame.max_combo = score[k[6]];

    // ranks
    switch (type) {
        case 0: type = "vn"; break;
        case 1: type = "rx"; break;
        case 2: type = "ap"; break;
        default: mode = "unknown"; break;
    }

    let table = `scores_${type}`;

    let [ranks] = await conn.execute(
        `SELECT userid,
            sum(IF(grade = "XH", 1, 0)) AS XH, # SS Hidden
            sum(IF(grade = "X", 1, 0)) AS X, # S
            sum(IF(grade = "SH", 1, 0)) AS SH, # S Hidden
            sum(IF(grade = "S", 1, 0)) AS S, # S, 
            sum(IF(grade = "A", 1, 0)) AS A # A
        FROM ${table} WHERE userid = ${user.id}
        GROUP BY userid;`);

    if (!ranks[0])
        return res.status(500).json({
            code: 500,
            message: "An internal server error has occured, although it isn't really an error; moreso a confusing problem."
        });

    data.ranks = {};
    for (let key of Object.keys(ranks[0])) {
        data.ranks[key] = parseInt(ranks[0][key]);
    }

    delete data.ranks.userid;
    return res.status(200).json({
        code: 200,
        data
    })
});

router.get("/:query/scores", async (req, res) => {
    let conn = req.pools["server"];
    let sort = req.query.sort || "top";
    let query = require("mysql2").escape(req.params.query);
    let [users, _] = await conn.execute(`SELECT * FROM users WHERE name LIKE ${query} OR safe_name LIKE ${query} OR id LIKE ${query}`);

    if (!users[0])
        return res.status(404).json({
            code: "A user by this name or ID was not found."
        });

    let user = users[0];

    let mode = isNaN(parseInt(req.query.mode || NaN)) ? 0 : parseInt(req.query.mode);
    let type = isNaN(parseInt(req.query.type || NaN)) ? 0 : parseInt(req.query.type);

    let limit = parseInt(req.query.limit || 10);
    if (isNaN(limit))
        return res.json(409).json({
            code: 409,
            message: "An invalid limit was provided."
        });

    switch (mode) {
        case 0: mode = "std"; break;
        case 1: mode = "catch"; break;
        case 2: mode = "taiko"; break;
        case 3: mode = "mania"; break;
        default: mode = "unknown"; break;
    }

    switch (type) {
        case 0: type = "vn"; break;
        case 1: type = "rx"; break;
        case 2: type = "ap"; break;
        default: mode = "unknown"; break;
    }

    if (limit > 100)
        limit = 100

    let order = "pp";
    switch (sort) {
        case "top": order = "pp"; break;
        case "recent": order = "play_time"; break;
        default:
            return res.status(409).json({
                code: 409,
                message: "You have provided an invalid sort option.",
                data: {
                    valid: ["top", "recent"]
                }
            });
    }

    let [scores] = await conn.execute(`
    SELECT
	    scores_${type}.id,
	    maps.id as map,
	    maps.set_id as mapset,
	    scores_${type}.score,
	    scores_${type}.pp,
	    scores_${type}.grade as "rank",
	    scores_${type}.max_combo as maxcombo,
	    scores_${type}.acc as accuracy,
	    scores_${type}.n300 as "300s",
        scores_${type}.n100 as "100s",
        scores_${type}.n50 as "50s",
    	scores_${type}.ngeki as geki,
    	scores_${type}.nkatu as katu,
    	scores_${type}.nmiss as misses,
    	scores_${type}.play_time as date,
	    scores_${type}.mods
    FROM scores_${type}
    INNER JOIN maps
    ON scores_${type}.map_md5 = maps.md5
    WHERE userid = ${user.id}
    ORDER BY ${order} DESC LIMIT ${limit};`);

    let data = [];
    scores.forEach((score) => {
        data.push(score)
    })

    return res.status(200).json({
        code: 200,
        data
    })
})

module.exports = router;