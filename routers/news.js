const Util = require("../lib/util/Util");

const router = require("express").Router();

// general
router.get("/", async (req, res) => {
    let web = req.pools["web"];
    let server = req.pools["server"];
    let [news, _] = await web.execute("SELECT blog_posts.* FROM blog_posts");

    let year = parseInt(req.query.year) || new Date().getFullYear();

    if (isNaN(parseInt(year)))
        year = new Date().getFullYear();

    news = news.sort((a, b) => b.date - a.date);
    let no = [];
    let years = [];

    let overall = []

    // user stuff
    for (let article of news) {
        // year parse
        if (!years.includes(Util.fromUnix(article.date).getFullYear()))
            years.push(Util.fromUnix(article.date).getFullYear());

        // get current date
        let date = Util.fromUnix(article.date);
        let totalTimeString = date.toUTCString();
        let monthString = totalTimeString.slice(8, 16);

        if (!overall.find(a => a.stamp == monthString))
            overall.push({
                stamp: monthString,
                articles: []
            });

        let ind = overall.findIndex(a => a.stamp == monthString);
        overall[ind].articles.push(article.title);

        let authors = [];
        let ids = article.author_ids.split(",");
        let query = `SELECT name FROM users WHERE id = ${ids.shift()}`

        for (let id of ids) {
            query += ` OR id = ${id}`;
        }

        let [authorData, _] = await server.execute(query);
        authorData.forEach(a => authors.push(a.name));
        article.author_name = authors.join(", ")

        delete article.author_ids;
        no.push(article);
    };

    overall = overall.filter((a) => {
        return a.stamp.endsWith(year);
    });

    news = no.filter((n) => {
        let time = Util.toUnix(new Date(year.toString()));
        let yearAfter = Util.toUnix(new Date((year + 1).toString()));

        return time <= n.date // after the beginning of the year
            && yearAfter >= n.date // before the next year
    });

    if (!years.includes(year) || news.length == 0)
        return res.status(404).render(".error", {
            error_name: "Year not found...",
            error_message: "We were unable to find any news in the year that you provided.",
            title: "news"
        })

    let monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    let months = [];
    let i = 0;

    res.status(200).render("news", {
        news,
        years,
        year,
        strings: overall,
        rendered: true,
        title: "news"
    })
})

module.exports = router;