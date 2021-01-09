// sticky header
window.onscroll = () => {
    var header = document.getElementById("navbar");
    var sticky = header.offsetTop;

    if (window.pageYOffset > sticky) {
        header.classList.add("minimized");
    } else {
        header.classList.remove("minimized");
    }
}

function makeError(message) {
    return `<div class="notification is-error"><button class="delete" onclick="$(this).parent().remove(); displayed_error = false;"></button><span id="err-text">${message}</span></div>`
}