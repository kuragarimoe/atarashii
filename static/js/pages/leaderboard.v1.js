// render active
$(`#${mode}`).addClass("is-active")
$(`#${type}`).addClass("is-active")
$(`#${sort}`).addClass("is-active");

// idents
let alphabet = "abcdefghijklmnopqrstuvwxyz";
let indicators = "🇦🇧🇨🇩🇪🇫🇬🇭🇮🇯🇰🇱🇲🇳🇴🇵🇶🇷🇸🇹🇺🇻🇼🇽🇾🇿";

let html = "";
if (page < 4) {
    // first 6
    for (let j = 0; j < 6; j++) {
        if (j == (page - 1)) {
            html += `<a href="/leaderboards/${mode}/${type}/${sort}/${j + 1}" class="paginator-page --selected">${j + 1}</a>`
        } else {
            html += `<a href="/leaderboards/${mode}/${type}/${sort}/${j + 1}" class="paginator-page">${j + 1}</a>`
        }
    }
} else {
    // further
    let min = 0;
    let max = 0;
    for (let j = page - 4; j < page - 1; j++) {
        if (j == (page - 1)) {
            html += `<a href="/leaderboards/${mode}/${type}/${sort}/${j + 1}" class="paginator-page --selected">${j + 1}</a>`
        } else {
            html += `<a href="/leaderboards/${mode}/${type}/${sort}/${j + 1}" class="paginator-page">${j + 1}</a>`
        }
    }

    for (let j = page - 1; j < page + 3; j++) {
        if (j == (page - 1)) {
            html += `<a href="/leaderboards/${mode}/${type}/${sort}/${j + 1}" class="paginator-page --selected">${j + 1}</a>`
        } else {
            html += `<a href="/leaderboards/${mode}/${type}/${sort}/${j + 1}" class="paginator-page">${j + 1}</a>`
        }
    }
}

if (country) {
    $("#title").html(`<a class="overall-flag" href="/leaderboards/${mode}/${type}/${sort}/${page}"><span style="width: 40px; top: 17px; position: relative;">${getIndicators(country)}</span></a> ${$("#title").html()}`)
}

$("#left").after(html);

// query ldrboard
$(document).ready(() => {
    let _mode;
    let _type;

    switch (mode) {
        case "osu":
        case "std":
        case "0": _mode = 0;
            break;
        case "taiko":
        case "1": _mode = 1;
            break;
        case "catch":
        case "2": _mode = 2;
            break;
        case "mania":
        case "3": _mode = 3;
            break;
        default: _mode = 0; break;
    }

    switch (type) {
        case "vn":
        case "0": _type = 0;
            break;
        case "rx":
        case "1": _type = 1;
            break;
        case "ap":
        case "2": _type = 2;
            break;
        default: _type = 2; break;
    }
    
    axios.get(`/api/leaderboards/${sort}?mode=${_mode}&type=${_type}&page=${page - 1}${country ? `&country=${country}` : ""}`)
        .then((res) => {
            let data = res.data.data;
            let html2 = ""
            let i = (page - 1) * 50

            for (let user of data) {
                i++;
                html2 += `
                <tr class="leaderboard-column">
                    <td class="player-rank">#${i}</td>
                    <td class="player-main"><a href="/leaderboards/${mode}/${type}/${sort}/${page}?country=${user.country}"><span class="country">${getIndicators(user.country)}</span></a> <a style="color:white!important;" href="/user/${user.id}">${user.username}</a></td>
                    ${sort != "pp" ? `<td class="player-total-score">${numberWithCommas(user.total_score)}</td>` : ""}
                    <td class="player-sort">${numberWithCommas(sort == "pp" ? user.pp : user.ranked_score)}</td>
                    <td class="player-acc">${user.accuracy.toFixed(2)}%</td>
                    <td class="player-playcount">${numberWithCommas(user.plays)} </td>
                </tr>`;
            }


            $("#leaderboard-data").append(html2);
            
            if (country) {
                $("#leaderboard").after("<span style='font-size: 0.7em; padding: 8px;'>click the big flag to go back to the main ranking.</span>")
            }

            twemoji.parse(document.body);
        })
})


function getIndicators(string) {
    let res = "";
    for (let letter of string.split("")) {
        let ind = alphabet.split("").findIndex(l => l == letter.toLowerCase()) * 2;
        res += indicators[ind] + indicators[ind + 1];
    }

    return res;
}
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}