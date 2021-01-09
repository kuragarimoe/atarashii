
    // load news
    axios.get("/api/web/news?limit=4") // limit news
        .then((res) => {
            if (res.data.code !== 200)
                return; // well that sucks 

            let news = res.data.data
            let first = news.shift()

            $("#news").append(newsFormat(first, true));

            let base = `<br><article class="tile is-child" id="news"><div class="columns" id="secondaries">`
            function newsFormat(data, first = false) {
                return `<div class="column${first == false ? "" : " no-padding"} article">
                    <a href="/news/${data.id}"><nav class="panel">
                        <p class="panel-heading news-header" style="background-image: url(${data.image_url || "/static/images/default_news.svg"});">
                        </p>
                        <div class="panel-block news-content">
                            <p>
                                ${data.title}<br>
                                by <strong>${data.author_name}</strong>
                            </p>
                        </div>
                    </nav></a>
                </div>`
            }

            for (let newy of news) {
                base += newsFormat(newy);
            }

            base += `</div></article>`;
            $("#news").append(base);
        });

    // load player count
    axios.get("/api/metadata") // limit news
        .then((res) => {
            if (res.data.code !== 200)
                return; // well that sucks 

            let data = res.data.data

            $("#total").html(` ${data.users.total} `);
            $("#online").html(` ${data.users.online} `);

            for (let key of Object.keys(data.records)) {
                $(`#${key}-pp`).html(Math.floor(data.records[key].pp) + "pp");
                $(`#${key}-holder`).html(data.records[key].holder);
            }
        });