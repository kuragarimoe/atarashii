const router = require("express").Router();

router.get("/:mode/:type/:sort", (req, res, next) => {
    let valid = ["ranked_score", "rscore", "score", "pp"];
    if (!valid.includes(req.params.sort))
        return next();

    let mode;
    let type;
    switch (req.params.mode) {
        case "osu":
        case "std":
        case "0": mode = "std";
            break;
        case "taiko":
        case "1": mode = "taiko";
            break;
        case "catch":
        case "2": mode = "catch";
            break;
        case "mania":
        case "3": mode = "mania";
            break;
        default: mode = "unknown"; break;
    }

    switch (req.params.type) {
        case "vn":
        case "0": type = "vn";
            break;
        case "rx":
        case "1": type = "rx";
            break;
        case "ap":
        case "2": type = "ap";
            break;
        default: mode = "unknown"; break;
    }

    if (mode == "unknown" || type == "unknown")
        return next();

    return res.status(200).render(".leaderboard", {
        mode,
        type,
        sort: req.params.sort,
        country: req.query.country ? req.query.country : null,
        page: 1,
        prev: 0,
        next: parseInt(req.params.page) + 1,
        disable_prev: true,
        title: "leaderboard"
    })
});

router.get("/:mode/:type/:sort/:page", (req, res, next) => {
    let valid = ["ranked_score", "rscore", "score", "pp"];
    if (!valid.includes(req.params.sort))
        return next();

    let mode;
    let type;
    switch (req.params.mode) {
        case "osu":
        case "std":
        case "0": mode = "std";
            break;
        case "taiko":
        case "1": mode = "taiko";
            break;
        case "catch":
        case "2": mode = "catch";
            break;
        case "mania":
        case "3": mode = "mania";
            break;
        default: mode = "unknown"; break;
    }

    switch (req.params.type) {
        case "vn":
        case "0": type = "vn";
            break;
        case "rx":
        case "1": type = "rx";
            break;
        case "ap":
        case "2": type = "ap";
            break;
        default: mode = "unknown"; break;
    }

    if (mode == "unknown" || type == "unknown")
        return next();

    if (parseInt(req.params.page) < 1)
        return next();

    return res.status(200).render(".leaderboard", {
        mode,
        type,
        country: req.query.country ? req.query.country : null,
        sort: req.params.sort,
        page: req.params.page,
        prev: parseInt(req.params.page) - 1,
        next: parseInt(req.params.page) + 1,
        disable_prev: req.params.page == "0" || req.params.page == "1",
        title: "leaderboard"
    })
});

module.exports = router;