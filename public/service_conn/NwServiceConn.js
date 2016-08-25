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
    var NwServiceConn = Class(function () {

        return {
            //$singleton: true,
            wsClient: {},

            constructor: function (wsClient) {
                this.wsClient = wsClient;
            },

            getAllStockName: function (cb) {
                this.wsClient.callService('getAllStockName', {}, cb);
            },

            //#region Products
            getAllProducts: function (stockName, cb) {
                this.wsClient.callService('getAllProducts', { stock_name: stockName }, cb);
            },
            findeProductStartWith: function (stockName, findWord, limit, cb) {
                this.wsClient.callService('findeProductStartWith', { stock_name: stockName, findWord: findWord, limit: limit }, cb);
            },
            insertProduct: function (insertObj, cb) {

                this.wsClient.callService('insertProduct', insertObj, cb);
            },
            updateProduct: function (updateObj, cb) {
             
                this.wsClient.callService('updateProduct', updateObj, cb);
            },
            deleteProduct: function (stockName, code, cb) {
                this.wsClient.callService('deleteProduct', { stock_name: stockName, code: code }, cb);
            },
            //#endregion

            //#region SupplyLog
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
            getLastSupplyLog: function (dataObj, cb) {
                this.wsClient.callService('getLastSupplyLog', dataObj, cb);
            },
            //#endregion

            //#region ImportProduct
            insertImportProduct: function (dataObj, cb) {
                this.wsClient.callService('insertImportProduct', dataObj, cb);
            },
            getImportProductInPeriod: function (dataObj, cb) {
                this.wsClient.callService('getImportProductInPeriod', dataObj, cb);
            },
            //#endregion

            //#region Supplier
            getAllSupplier: function (cb) {
                this.wsClient.callService('getAllSupplier', {}, cb);
            },

            insertSupplier: function (dataObj, cb) {
                this.wsClient.callService('insertSupplier', dataObj, cb);
            },
            updateSupplier: function (dataObj, cb) {
                this.wsClient.callService('updateSupplier', dataObj, cb);
            },
            deleteSupplier: function (code, cb) {
                this.wsClient.callService('deleteSupplier', { code: code }, cb);
            },
            //#endregion
        };
    });

    if (typeof module !== "undefined" && module.exports) {                       // NodeJS/CommonJS
        module.exports = NwServiceConn;
    } else {

        context.NwServiceConn = NwServiceConn;
    }

})(this);
