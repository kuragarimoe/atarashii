var ACCOUNT;

function Account() {
    if (!ACCOUNT) return;
    let self = {};

    self.id = ACCOUNT.id;
    self.username = ACCOUNT.username;
    self.following = ACCOUNT.following;

    self.follow = (user) => {
        return new Promise((resolve) => {
            axios.post("/api/accounts/follow", {
                data: {
                    query: user
                }
            }).then((data) => {
                resolve(!data.data.message.includes("unfollowed")); // fucky way of working this, but it works
            })
        })
    }

    return self;
}

if (Cookies.get("_access")) {
    let access = Cookies.get("_access");

    // get account info
    axios.post("/api/accounts/self")
        .then((res) => {
            let data = res.data.data;
            $("#user-avatar").attr("href", `/user/${data.id}`)
            $("#user-avatar").attr("style", `background-image: url("http://a.katagiri.ga/${data.id}");`);

            ACCOUNT = data;
        }).catch(e => { /* don't handle */ })
}