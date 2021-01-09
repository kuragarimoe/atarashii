function makeError(message) {
    return `<div class="notification is-error"><button class="delete" onclick="$(this).parent().remove(); displayed_error = false;"></button><span id="err-text">${message}</span></div>`
}