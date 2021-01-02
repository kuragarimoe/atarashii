const fs = require("fs")
const toml = require("toml");
const mysql = require("mysql2/promise");
const Logger = require("../util/Logger");

module.exports = async (app) => {
    let config = toml.parse(fs.readFileSync(__dirname + "/../../config/mysql.toml"))
    let keys = Object.keys(config.database)
    let pools = {};
    let count = 0;
    
    Logger.info("Loading MySQL Pools...");

    for (let pool of keys) {
        Logger.log("Loading MySQL Pool: " + pool)
        try {
            let connection = await mysql.createConnection(config.database[pool]);
            await connection.execute(`SHOW TABLES;`).then((values) => {
                Logger.log("Successfully connected to pool!");
                pools[pool] = connection
            }).catch(err => Logger.error("Could not load MySQL pool: " + err.message));
            count++;
        } catch (err) {
            Logger.error("Could not load MySQL pool: " + err.message)
        }
    }

    app.use((req, res, next) => {
        req.pools = pools;
        next();
    })

    Logger.info(`Successfully connected to ${count} out of ${keys.length} pools.`)
    if (keys.length !== count)
        Logger.warn(`Look above to see whether or not any errors occured during pool connection.`)
}