const fs = require("fs");
const path = require("path")
const toml = require("toml");
const exphbs = require('express-handlebars');
const Logger = require("../util/Logger");

module.exports = async (app) => {
    Logger.info("Reading Handlebars views...");

    let hbs = exphbs.create({
        extname: '.hbs',
        helpers: (function helpers() {
            let res = {};

            let files = fs.readdirSync(path.join(__dirname, "/../../helpers"));
            for (let file of files) {
                let name = file.slice(0, -3);
                try {
                    file = require(path.join(path.join(__dirname, "/../../helpers/" + file)));
                    res[name] = file;
                } catch (_) {
                    // catch and do nothing
                }
            }

            return res;
        })()
    });

    // Set view engine
    app.engine('.hbs', hbs.engine);
    app.set('view engine', '.hbs');

    // Load all files as views.
    let FILE_SPACE = (function read(dir, split = "") {
        let arr = [];
        let files = fs.readdirSync(dir);

        for (let file of files) {
            file = path.join(dir, file);
            let stats = fs.lstatSync(file);

            if (stats.isDirectory()) {
                // hi directory
                arr = [...arr, ...read(file)];
            } else arr.push(file);
        }

        return arr.map(a => a.slice(split.length, a.length));
    })(path.join(__dirname, "/../../views"), path.join(__dirname, "/../../views"));

    // Main Page
    app.get("/", (req, res) => res.render("home", {
        title: "home"
    }));

    // Render Pages
    app.get("*", (req, res, next) => {
        let file = FILE_SPACE.find(f => {
            f = f.replace(/\\/g, "/")
                .replace(/\.hbs/g, "");

            if (req.path == f) return true;
        })

        // file exists, so route it as a path
        if (file) {
            file = file.replace(/\\/g, "/")
                .replace(/\.hbs/g, "");

            if (file.startsWith("/."))
                return next(); // ignore files with .


            return res.status(200).render(file.slice(1), {
                title: file.slice(1),
                navbar: true
            });
        } else {
            // do nothing, 404 handler made.
            next();
        }
    });

    Logger.info(`Successfully setup render engine.`)
}