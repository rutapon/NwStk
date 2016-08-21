/// <reference path="lib/jquery/jquery-2.1.1.js" />
/// <reference path="NwConn/NwWsClient.js" />
/// <reference path="service_conn/NwStockServiceConn.js" />


$(function () {


    //var host = 'raspberrypi.local';
    var host = 'localhost';

    var wsClient = new NwWsClient('ws://' + host + ':426');
    var stockMethod = new NwStockServiceConn(wsClient);

    wsClient.setOnConnectEventListener(function (socket) {

        var id = wsClient.getId();
        //self.wsClientList.addItem(id, wsClient);

        //if (self._onConnectEventListener) {
        //    self._onConnectEventListener(new NwSocket(socket, 'active'));
        //}

        //if (firstConnect) {
        //    firstConnect();
        //    firstConnect = null
        //}

        console.log('onConnect ' + id);

        stockMethod.getAllStockName(function myfunction(stockNames) {

            console.log(stockNames);

            async.eachSeries(stockNames, function (item, callback) {
                $('body').append(item + '<br>');

                stockMethod.getAllProducts(item, function (result) {
                    for (var i in result) {
                        $('body').append(JSON.stringify(result[i]) + '<br>');
                    }
                    callback();
                });
            });
            //for (var i in result) {
            //    $('body').append(result[i]+ '<br>');

            //    stockMethod.getAllProducts(result[i], function (result) {
            //        for (var i in result) {
            //            $('body').append(JSON.stringify(result[i]) + '<br>');
            //        }
            //    });
            //}
        });
        
     
     
    });

    wsClient.setOnDisconnectEventListener(function (socket) {

        //exeption for socket.io client can not get id direct form disconnected socket
        var disconnectId = wsClient.getId();

        console.log('onDisConnect ' + disconnectId);
        //console.log('disconnect ' + disconnectId);


        //self.wsClientList.removeItem(disconnectId);

        //if (self._onDisconnectEventListener) {
        //    self._onDisconnectEventListener(new NwSocket(socket, 'active', disconnectId));
        //}
    });

    wsClient.setOnMessageEventListener(function (socket, msgObj, fn) {

        //if (self._onMessageEventListener) {
        //    try {
        //        self._onMessageEventListener(new NwSocket(socket, 'active'), msgObj, fn);

        //    } catch (e) {
        //        //throw e;
        //        console.log('err setOnMessageEventListener :' + e.message);
        //    }
        //}
    });


});