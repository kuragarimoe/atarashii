const router = require("express").Router();

router.get("/", async (req, res) => {
    res.status(200).json({
        code: 200,
        message: "Hewwo! (´･ω･`)",
        endpoints: [
            "/api/leaderboards",
            "/api/leaderboards/:sort"
        ]
    });
});

router.get("/:sort", async(req, res) => {
    let server = req.pools["server"];
    let valid = ["ranked_score", "rscore", "score", "pp"];

    let sort = req.params.sort;
    if (!valid.includes(req.params.sort))
        return res.status(409).json({
            code: 409,
            message: "An invalid sorting algorithm was provided."
        });

    if (sort == "score" || sort == "ranked_score") sort = "rscore";

    let base = Object.assign({
        mode: 0, // osu
        page: 0,
        type: 0,
        country: null
    }, req.query);

    if (isNaN(parseInt(base.mode)) || isNaN(parseInt(base.page)) || isNaN(parseInt(base.type)))
        return res.status(409).json({
            code: 409,
            message: "Invalid numbers were provided."
        });

    let mode;
    let type;
    switch (parseInt(base.mode)) {
        case 0: mode = "std"; break;
        case 1: mode = "catch"; break;
        case 2: mode = "taiko"; break;
        case 3: mode = "mania"; break;
        default: mode = "unknown"; break;
    }

    switch (parseInt(base.type)) {
        case 0: type = "vn"; break;
        case 1: type = "rx"; break;
        case 2: type = "ap"; break;
        default: mode = "unknown"; break;
    }

    if (mode == "unknown" || type == "unknown")
        return res.status(409).json({
            code: 409,
            message: "An invalid mode or type was provided."
        })
    let [data, _] = await server.execute(`
        SELECT
            stats.id as id,
            users.name as username,
            tscore_${type}_${mode} as total_score,
            rscore_${type}_${mode} as ranked_score,
            PP_${type}_${mode} as pp,
            acc_${type}_${mode} as accuracy,
            plays_${type}_${mode} as plays,
            users.country as country
        FROM stats
        INNER JOIN users
        ON users.id = stats.id AND users.id != 1 ${base.country ? `WHERE users.country = ${require("mysql2").escape(base.country)}` : ""}
        ORDER BY ${sort}_${type}_${mode} DESC
        LIMIT 50
        OFFSET ${parseInt(base.page) * 50} ;
    `);

    return res.status(200).json({
        code: 200,
        info: {
            mode,
            type,
            sort
        },
        data
    })
})

module.exports = router;