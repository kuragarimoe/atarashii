module.exports = function(a1, a2, options) {
    return (a1 == a2) ? options.fn(this) : options.inverse(this);
}