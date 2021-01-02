const chalk = require("chalk");
const { Module } = require("module");

const CLR = {
    LOG: "#4295f5",
    WRN: "#e9f542",
    ERR: "#f54242",
    INF: "#48f542",
    DEB: "#858585"
}

class Logger {
    static log(message, title = "LOG", clr = CLR.LOG) {
        return console.log(`${chalk.bgHex(clr).hex("#000")(` ${new Date().toUTCString()} ${chalk.bold(title)} `)} ${message}`)
    }

    static info(message) {
        return Logger.log(message, "INFO", CLR.INF)
    }

    static error(message) {
        return Logger.log(message, "ERROR", CLR.ERR)
    }

    static warn(message) {
        return Logger.log(message, "WARN", CLR.WRN)
    }

    static debug(message) {
        return Logger.log(message, "DEBUG", CLR.DEB)
    }

    static empty() {
        return console.log("")
    }
}

module.exports = Logger;