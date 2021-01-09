// parse twemoji
twemoji.parse(document.body);

// parse bio
var bb = new BBCode();
let arr = $("#biography").html().split("\n");
arr.shift();
$("#biography").html(bb.parse(arr.join("<br>")));

// kickstart
$(window).on('load', function() {
    if (!Account()) return;
    let acc = Account();

    // split path
    let url = window.location.href;
    url = url.split("/");
    url = url[url.length - 1];

    if (acc.id == parseInt(url) || acc.username == url) {
        // is self
    } else {
        // add follow button
        $("#dates").before(`<br><button id="follow" class="button follow-button">Follow</button>`);

        $("#follow").click(() => {
            Account().follow(url)
                .then((type) => {
                    if (type == true) { // followed
                        let count = parseInt($("#follower-count").html()) + 1;
                        $("#follower-count").html(count)
                        $("#follow").html("Unfollow")
                    } else { // unfollowed
                        let count = parseInt($("#follower-count").html()) - 1;
                        $("#follower-count").html(count)
                        $("#follow").html("Follow")
                    }
                })
        })
    }
})