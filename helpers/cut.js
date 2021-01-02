module.exports = (string) => {
    let cutAt = 128;
    return string.substring(0, cutAt) + (string.length > cutAt ? "..." : "");
}