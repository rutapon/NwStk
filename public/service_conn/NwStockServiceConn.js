/// <reference path="../../lib/socket.io-1.0.6.js" />
/// <reference path="../../Lib/step/step.js" />
/// <reference path="../lib/async/async.js" />
/// <reference path="../../NwLib/NwLib.js" />


/// <reference path="../NwConn/NwConn.js" />



(function (context, undefined) {
    //#region requre

    if (typeof module !== "undefined") {

        NwLib = require('../NwLib/NwLib.js');
        Class = NwLib.Nwjsface.Class;

        //NwDataMsgObj = require('../NwUtil/NwDataMsgObj.js');

        ////http = require('http');

        //NwConn = require('../NwConn/NwConn.js');

        //_ = require('../Lib/underscore/underscore.js');

    } else {

    }

    //#endregion
    var NwStockServiceConn = Class(function () {

        return {
            //$singleton: true,
            wsClient: {},

            constructor: function (wsClient) {
                this.wsClient = wsClient;
            },

            getAllStockName: function (cb) {
                this.wsClient.callService('getAllStockName', {}, cb);
            },

            getAllProducts: function (stockName, cb) {
                this.wsClient.callService('getAllProducts', { stockName: stockName }, cb);
            },

            findeProductStartWith: function (stockName, findWord, limit, cb) {
                this.wsClient.callService('findeProductStartWith', { stockName: stockName, findWord: findWord, limit: limit }, cb);
            },
            insertProduct: function (stockName, insertObj, cb) {
                insertObj.stockName = stockName;
                this.wsClient.callService('insertProduct', insertObj, cb);
            },
            updateProduct: function (stockName, updateObj, cb) {
                updateObj.stockName = stockName;
                this.wsClient.callService('updateProduct', updateObj, cb);
            },
            deleteProduct: function (stockName, code, cb) {
                this.wsClient.callService('deleteProduct', { stockName: stockName, code: code }, cb);
            },
            insertSupplyLog: function (dataObj, cb) {
                this.wsClient.callService('insertSupplyLog', dataObj, cb);
            },
            updateSupplyLog: function (dataObj, cb) {
                this.wsClient.callService('updateSupplyLog', dataObj, cb);
            },
            findeSupplyLog: function (dataObj, cb) {
                this.wsClient.callService('findeSupplyLog', dataObj, cb);
            },
            checkForInsertSupplyLog: function (dataObj, cb) {
                this.wsClient.callService('checkForInsertSupplyLog', dataObj, cb);
            },
            getAllSupplyLog: function (dataObj, cb) {
                this.wsClient.callService('getAllSupplyLog', dataObj, cb);
            },
            insertImportProduct: function (dataObj, cb) {
                this.wsClient.callService('insertImportProduct', dataObj, cb);
            },
            getImportProductInPeriod: function (dataObj, cb) {
                this.wsClient.callService('getImportProductInPeriod', dataObj, cb);
            },
        };
    });

    if (typeof module !== "undefined" && module.exports) {                       // NodeJS/CommonJS
        module.exports = NwStockServiceConn;
    } else {

        context.NwStockServiceConn = NwStockServiceConn;
    }

})(this);
