// MODULES
const express = require("express");
const sass = require('node-sass-middleware');
const cookieParser = require("cookie-parser");
const path = require("path");
const Logger = require("./lib/util/Logger");

// CONSTANTS
const PORT = 27341;

// APPLICATION START //
const app = require("express")();

// ASYNC //
(async () => {
    /// COOKIES ///
    app.use(cookieParser());

    /// REQUEST LOGGER ///
    app.use((req, res, next) => {
        var oldEnd = res.end;

        var chunks = [];

        res.end = function (...args) {
            Logger.debug(`[${req.method}] ${req.url} (${res.statusCode})`)

            return oldEnd.apply(res, args)
        };

        next();
    })

    // MIDDLEWARE //
    app.use(express.urlencoded({ extended: true }))
    app.use(express.json());

    app.use(sass({
        src: path.join(__dirname, "static/css"),
        dest: path.join(__dirname, "static/css"),
        prefix: "/static/css"
    }));

    // STATIC //
    app.use("/static", express.static(path.join(__dirname, "static")));

    /// OUR MIDDLEWARE ///
    await require("./lib/middleware/MySQLMiddleware")(app)
    Logger.empty()
    await require("./lib/middleware/RouterMiddleware")(app)
    Logger.empty()
    await require("./lib/middleware/HandlebarsMiddleware")(app)
    Logger.empty()


    // SETTINGS //
    app.set("json spaces", 4);
    app.disable("x-powered-by");
    app.enable("trust proxy");

    // 404 ROUTE //
    app.get('*', function (req, res) {
        res.status(404).render(".error", {
            error_name: "Page not found...",
            error_message: "The page you were looking for was not found. It's probably better to go back to the homepage!",
            title: "404"
        })
    });

    // LISTENER //
    app.listen(PORT, () => {
        Logger.info("Running server on port " + require("chalk").bold(PORT))
        Logger.empty();

        console.log(require("chalk").italic(" ~ All debug logging and requests will be logged here. ~"))
        Logger.empty();
    });
})() // run

