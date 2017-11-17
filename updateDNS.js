request = require('request');

//var url = "andamania";
//var token = "501c6eeb-1d48-429c-a79c-c869624efd3c"

var url = "newww";
var token = "1c7c011a-c53e-40db-bd12-df8e74a4a326";

function updateDns(url, token) {
    var url = "https://www.duckdns.org/update/" + url + "/" + token;
    request.get(url, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            console.log('update dns', body);
            //cb(body);
        }
    });
}

updateDns(url, token);
setInterval(function () {
    updateDns(url, token);
}, 5 * 60000)

