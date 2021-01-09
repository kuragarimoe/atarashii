const router = require("express").Router();

router.get("/", (req, res) => {
    // basic message
    res.status(200).json({
        code: 200,
        message: "Hewwo! (´･ω･`)",
        endpoints: [
            "/api/beatmaps",
            "/api/beatmaps/sets/:id",
            "/api/beatmaps/:id"
        ]
    })
});

router.get("/sets/:id", async (req, res) => {
    let server = req.pools["server"];

    let [maps, _] = await server.execute(`SELECT * FROM maps WHERE set_id = ${require("mysql2").escape(req.params.id)}`);

    if (!maps[0])
        return res.status(404).json({
            code: 404,
            message: "Beatmap set not found."
        });

    for (let map of maps) {
        for (let key of Object.keys(map)) {
            if (typeof map[key] == "number") {
                map[key] = parseFloat(map[key].toFixed(2));
            }
        }
    }

    return res.status(200).json({
        code: 200,
        data: {
            id: maps[0].set_id,
            maps: maps.sort((a,b) => a.diff - b.diff)
        }
    })
})


router.get("/:id", async (req, res) => {
    let server = req.pools["server"];

    let [maps, _] = await server.execute(`SELECT * FROM maps WHERE id = ${require("mysql2").escape(req.params.id)}`);

    if (!maps[0])
        return res.status(404).json({
            code: 404,
            message: "Beatmap not found."
        });

    let map = maps[0]
    for (let key of Object.keys(map)) {
        if (typeof map[key] == "number") {
            map[key] = parseFloat(map[key].toFixed(2));
        }
    }

    return res.status(200).json({
        code: 200,
        data: map
    })
});


module.exports = router;