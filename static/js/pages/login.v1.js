var displayed_error = false;

$("#login-form").submit((event) => {
    // serialize data
    var data = $('#login-form').serializeArray().reduce(function(obj, item) {
        obj[item.name] = item.value;
        return obj;
    }, {});

    // post user
    axios.post("/auth/login", data)
        .then((res) => {
            let data = res.data;

            // done, now attach to cookies
            Cookies.set("_access", data.data.access_token)
            window.location.replace("/home");
        }).catch((e) => {
            let data = e.response.data;

            if (displayed_error) {
                $("#err-text").html(data.message)
                return;
            }
            displayed_error = true;
            // insert error
            $("#main").prepend(makeError(data.message))
        })

    // prevent default
    event.preventDefault();
})