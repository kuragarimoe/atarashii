const router = require("express").Router();

router.get("/", (req, res) => {
    // basic message
    res.status(200).json({
        code: 200,
        message: "Hewwo! (´･ω･`)",
        endpoints: [
            "/api/web",
            "/api/web/news"
        ]
    })
});

router.get("/news", async(req, res) => {
    let web = req.pools["web"];
    let server = req.pools["server"];
    let [news, _] = await web.execute("SELECT blog_posts.* FROM blog_posts");

    let arr = []
    news = news.sort((a, b) => b.date - a.date);
    let no = [];

    for (let article of news) {
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
    
    news = no;

    if (req.query.limit) {
        let int = parseInt(req.query.limit);
        if (isNaN(int))
            return res.json(409).json({
                code: 409,
                message: "An invalid limit was provided."
            });

        for (let i = 1; i <= int; i++) {
            if (!news[i - 1]) break; // no more

            arr.push(news[i - 1]);
        }
    } else arr = news;

    return res.status(200).json({
        code: 200,
        data: arr
    });
})

module.exports = router;