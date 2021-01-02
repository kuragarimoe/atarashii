class Util {
    static toUnix(date) {
        return parseInt(((date || new Date()).getTime() / 1000).toFixed(0));
    }

    static fromUnix(time) {
        return new Date(time * 1000);
    }
}

module.exports = Util;