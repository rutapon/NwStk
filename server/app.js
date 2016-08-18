/// <reference path="../lib/NwLib.js" />
/// <reference path="../lib/underscore/underscore.js" />
/// <reference path="NwServiceProcess.js" />
/// <reference path="service_method/NwStockServiceMethod.js" />
/// <reference path="NwConn/NwWsServer.js" />

(function (context, undefined) {
    //#region requre

    if (typeof module !== "undefined") {
        process.chdir(__dirname);


        NwLib = require('../lib/NwLib.js');
        _ = require('../lib/underscore/underscore.js');
        Class = NwLib.Nwjsface.Class;


        NwServiceProcess = require('./NwServiceProcess.js');
        NwStockServiceMethod = require('./service_method/NwStockServiceMethod.js');

        http = require('http');
        NwWsServer = require('./NwConn/NwWsServer.js');

        //require('./StaticHttp.js');

        request = require('request');

        var express = require('express');
        var compression = require('compression');
        var minify = require('express-minify');

        var nodestatic = require('node-static');
        file = new nodestatic.Server(__dirname + '/../web');

        var app = express();

        app.use(compression());

        app.use(function (req, res, next) {
            if (/\.min\.(css|js)$/.test(req.url)) {
                res._no_minify = true;
            }
            next();
        });

        app.use(minify());
    

        app.use(function (req, res) {
            //res.send('Hello World! by newww นิว');
            //res.sendfile('index.html');
            file.serve(req, res);
        });

        //require('mkdirp')(__dirname + '/../cache', function (err) {
        //    if (err) console.error(err)
        //    else app.use(minify({
        //        cache: __dirname + '/../cache'
        //    }));    
        //});

    } else {

    }



    NwServiceProcess.addServiceMethod(NwStockServiceMethod);

    var passiveConn = function (appServer, port, ip) {
        var self = this;

        var wsServer = new NwWsServer(appServer);

        //var key;
        //if (port) {
        //    if (!ip) {
        //        ip = '0.0.0.0'
        //    }

        //    key = ip + ':' + port;

        //} else {
        //    key = Nw.getGUID();
        //}

        //this.wsServerList.addItem(key, wsServer);

        wsServer.setOnConnectEventListener(function (socket) {
            console.log('setOnConnectEventListener ' + socket.id);
            //if (self._onConnectEventListener) {
            //    self._onConnectEventListener(new NwSocket(socket, 'passive'));
            //}
        });

        wsServer.setOnDisconnectEventListener(function (socket) {
            console.log('setOnDisconnectEventListener');
            //var disconnectId = socket.id;
            //console.log('disconnect ' + socket.id);

            //self.wsClientList.removeItem(disconnectId);

            //if (self._onDisconnectEventListener) {
            //    self._onDisconnectEventListener(new NwSocket(socket, 'passive'));
            //}
        });

        wsServer.setOnMessageEventListener(function (socket, msgObj, fn) {
            //console.log('setOnMessageEventListener ' + JSON.stringify( msgObj));
            //if (self._onMessageEventListener) {
            //    try {
            //        self._onMessageEventListener(new NwSocket(socket, 'passive'), msgObj, fn);
            //    } catch (e) {
            //        //throw e;
            //        console.log('err wsServer.setOnMessageEventListener :' + e);
            //    }
            //}

            NwServiceProcess.cammandProcess(msgObj, function (result) {
                //console.log(result);
                fn(result);
            });
        });
    }

    var listenCommand = function (commandPort) {
        this.commandPort = commandPort;

        var appServer = http.createServer(app);
        passiveConn(appServer);

        //appServer.listen(commandPort, '0.0.0.0');
        appServer.listen(commandPort);

    }

    //app.use(express.static(__dirname + '/../web'))

    listenCommand(process.env.PORT || 8088);

    var url = "andamania";
    var token = "563f471d-5950-459c-9461-2424eae03e37";
    //var url = "wts";
    //var token = "1c7c011a-c53e-40db-bd12-df8e74a4a326";

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


    //NwStockServiceMethod.getAllProducts();
})(this);

