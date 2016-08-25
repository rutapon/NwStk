/// <reference path="../../lib/NwLib.js" />
/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../NwConn/NwDbConnection.js" />
/// <reference path="../NwServiceProcess.js" />


(function (context, undefined) {
    //#region requre

    if (typeof module !== "undefined") {
        NwLib = require('../../lib/NwLib.js');
        _ = require('../../lib/underscore/underscore.js');
        Class = NwLib.Nwjsface.Class;

        //sqlite3 = require('sqlite3').verbose();
        NwDbConnection = require('../NwConn/NwDbConnection.js');
        NwServiceProcess = require('../NwServiceProcess.js');

    } else {

    }
    //#endregion
    //var NwStockServiceMethod = Class(function () {
    //    var stock1 = new NwDbConnection('../Database/stock1.s3db');
    //    return {
    //        $singleton: true,
    //        constructor: function (dbPath) {
    //            this.dbPath = dbPath;
    //        },

    //        getAllProducts: function (stockName) {

    //        }

    //    };
    //});


    var productTableName = 'products';
    var supplyLogTableName = 'supply_log';
    var importProductTableName = 'product_in';

    var importSupplierTableName = 'supplier';


    var stocks = {};

    var socksName = ['Store-ใหญ่', 'Store-ช่าง', 'Store-ทดสอบ'];
    var dbPath = __dirname + '/../../Database/linvodb/';

    //_.each(socksName, function (sn) {

    //});

    var globalDB = new NwDbConnection(dbPath + 'globalDB');

    async.eachSeries(socksName, function (sn, callback) {

        console.log('create', sn);
        stocks[sn] = new NwDbConnection(dbPath + sn);
        stocks[sn].initDB(function () {
            callback();
        });
    });

    //stocks['Store-ช่าง'] = new NwDbConnection(__dirname + '/../Database/stock/stock2');
    //stocks['Store-ทดสอบ'] = new NwDbConnection(__dirname + '/../Database/stock/stock3');

    //stocks['ทดสอบ stock 123'] = new NwDbConnection(__dirname + '/../Database/stock/ทดสอบ stock 123.s3db');

    var getStock = function (stockName) {
        return stocks[stockName];
    }

    var NwStockServiceMethod = {

        getAllStockName: function (data, cb) {
            if (cb) { cb(_.keys(stocks)) };
        },
        getAllProducts: function (data, cb) {
            console.log('getAllProducts', data);
            var stockName = data.stock_name;
            var stock = getStock(stockName);
            if (stockName) {
                stock.getAll(productTableName, function (result) {

                    if (cb) { cb(result) }
                });
            }
        },
        findeProductStartWith: function (data, cb) {

            var stockName = data.stock_name;
            var findWord = data.findWord;
            var limit = data.limit ? data.limit : 20;
            //var stock = new NwDbConnection(__dirname + '/../Database/stock/stock1.s3db'); //getStock(stockName);
            var stock = getStock(stockName);
            stock.findStartWith(productTableName, { code: findWord, name: findWord }, limit, function (result) {
                if (cb) { cb(result) }
            });
        },
        insertProduct: function (data, cb) {

            console.log('insertProduct', data);
            var stockName = data.stock_name;

            //var code = data.code;
            //var name = data.name;
            //var unit_type = data.unit_type;
            //var unit_size = data.unit_size;

            //var description = data.description;

            //var create_by = data.create_by;
            //var create_datetime = new Date().toISOString().replace('T', ' ').substr(0, 19);

            //var supplier_default = data.supplier_default;
            //var unit_price_default = data.unit_price_default;

            var insertObj = {
                code: data.code,
                name: data.name,
                unit_type: data.unit_type,
                //unit_size: unit_size,
                description: data.description,
                stock_name: data.stock_name,
                supplier_default: data.supplier_default,
                unit_price_default: data.unit_price_default,
                createingLog: { creator: 'admin', 'createDate': new Date() }
            };

            var stock = getStock(stockName);
            stock.insert(productTableName, insertObj, function (result) {
                if (cb) { cb(result) }
            })
        },

        updateProduct: function (data, cb) {
            var stockName = data.stock_name;
            var code = data.code;

            //var code = data.code;
            //var name = data.name;
            //var unit_type = data.unit_type;
            //var unit_size = data.unit_size;
            //var description = data.description;

            //var create_by = data.create_by;
            //var create_datetime = data.create_datetime;

            //var supplier_default = data.supplier_default;
            //var unit_price_default = data.unit_price_default;

            var dataObj = {
                code: data.code,
                name: data.name,
                unit_type: data.unit_type,
                description: data.description,
                stock_name: data.stock_name,
                supplier_default: data.supplier_default,
                unit_price_default: data.unit_price_default,
            };

            var stock = getStock(stockName);
            stock.update(productTableName, { code: code }, dataObj, function (result) {
                if (cb) { cb(result) }
            })
        },

        deleteProduct: function (data, cb) {
            var stockName = data.stock_name;
            var code = data.code;
            console.log('deleteProduct', data);

            var stock = getStock(stockName);
            stock.destroy(productTableName, { code: code }, function (result) {
                if (cb) { cb(result) }
            })
        },

        //#region SupplyLog
        insertSupplyLog: function (data, cb) {
            console.log('insertSupplyLog', data);
            var stockName = data.stock_name;

            //var dataObj = {
            //    //product_id: data.product_id,
            //    code: data.code,
            //    supplier_name: data.supplier_name,
            //    unit_price: data.unit_price,
            //    create_by: data.create_by,
            //    create_datetime: new Date().toISOString().replace('T', ' ').substr(0, 19)
            //};

            var dataObj = {
                product_code: data.product_code,
                supplier_code: data.supplier_code,
                unit_price: data.unit_price,
                createingLog: { creator: 'admin', 'createDate': new Date() }
            };

            var stock = getStock(stockName);
            stock.insert(supplyLogTableName, dataObj, function (result) {
                if (cb) { cb(result) }
            })
        },

        checkForInsertSupplyLog: function (data, cb) {
            console.log('checkForInsertSupplyLog', data);
            var self = this;
            var stockName = data.stock_name;

            var findObj = {
                //product_id: data.product_id,
                product_code: data.product_code,
                supplier_code: data.supplier_code,
                //unit_price: data.unit_price
            }

            var stock = getStock(stockName);
            //stock.findOne(supplyLogTableName, findObj, function (result) {

            //    if (result) {
            //        if (cb) { cb(false) }
            //    } else {
            //        self.insertSupplyLog(data, cb);
            //    }
            //});

            stock.findLastOne(supplyLogTableName, findObj, { 'createingLog.createDate': -1 }, function (result) {

                if (result && result.unit_price == data.unit_price) {
                    if (cb) { cb(false) }
                } else {
                    self.insertSupplyLog(data, cb);
                }
            });
        },

        updateSupplyLog: function (data, cb) {
            var stockName = data.stock_name;
            var _id = data._id;

            var dataObj = {
                //product_id: data.product_id,
                product_code: data.product_code,
                supplier_code: data.supplier_code,
                unit_price: data.unit_price
            };

            var stock = getStock(stockName);
            stock.update(supplyLogTableName, { _id: _id }, dataObj, function (result) {
                if (cb) { cb(result) }
            })
        },
        findeSupplyLog: function (data, cb) {

            var stockName = data.stock_name;
            delete data.stock_name;
            console.log('findeSupplyLog', data);
            //var product_id = data.product_id;{ product_id: product_id }
            var db = getStock(stockName);
            if (data.limit) {
                db.findLimit(supplyLogTableName, data, data.limit, function (result) {
                    if (cb) { cb(result) }
                });
            } else {
                db.find(supplyLogTableName, data, function (result) {
                    if (cb) { cb(result) }
                });
            }
        },

        getLastSupplyLog: function (data, cb) {
            console.log('getLastSupplyLog', data);
            var stockName = data.stock_name;

            var findObj = {
                //product_id: data.product_id,
                product_code: data.product_code,
                supplier_code: data.supplier_code,
                //unit_price: data.unit_price
            }
            getStock(stockName).findLastOne(supplyLogTableName, findObj, { 'createingLog.createDate': -1 }, function (result) {
                cb(result);
            });
        },

        //getLastSupplyLogByCode: function (data, cb) {
        //    //console.log('getLastSupplyLog', data);
        //    var stockName = data.stock_name;

        //    var findObj = {
        //        code: data.code,
        //    }
        //    getStock(stockName).find(supplyLogTableName, findObj, function (result) {
        //        cb(result);
        //    });
        //},

        getAllSupplyLog: function (data, cb) {
            var stockName = data.stock_name;

            console.log('getAllSupplyLog', data);

            getStock(stockName).getAll(supplyLogTableName, function (result) {

                if (cb) { cb(result) }
            });

        },

        //#endregion

        insertImportProduct: function (data, cb) {
            var stockName = data.stock_name;

            //var dataObj = {
            //    product_id: data.product_id,
            //    invoid_id:invoid_id,
            //    supplier_name: data.supplier_name,
            //    unit_price: data.unit_price,
            //    unit: unit,
            //    in_date:in_date,
            //    create_by: data.create_by,
            //    create_datetime: new Date().toISOString().replace('T', ' ').substr(0, 19)
            //};
            console.log('insertImportProduct', data);
            //'product_id'
            var dataObj = _.pick(data, ['code',
                'invoid_id', 'supplier_name', 'unit_price', 'unit', 'in_date',
                'create_by']);
            dataObj.create_datetime = new Date();//.toISOString().replace('T', ' ').substr(0, 19);


            var stock = getStock(stockName);
            stock.insert(importProductTableName, dataObj, function (result) {

                var supplier_default = data.supplier_name;
                var unit_price_default = data.unit_price;

                stock.update(productTableName, { code: data.code }, { supplier_default: supplier_default, unit_price_default: unit_price_default }, function (result) {
                    if (cb) { cb(result) }
                })

                //if (cb) { cb(result) }
            })
        },
        getImportProductInPeriod: function (data, cb) {
            var timeStart = data.timeStart;
            var timeEnd = data.timeEnd;
            var stock = getStock(stockName);
            stock.findInPeriod(productTableName, {}, 'create_datetime', timeStart, timeEnd, function () {
                if (cb) { cb(result) }
            });
        },

        //#region Supplier
        getAllSupplier: function (data, cb) {

            //console.log('getAllSupplier', data);

            globalDB.getAll(importSupplierTableName, function (result) {

                if (cb) { cb(result) }
            });

        },

        insertSupplier: function (data, cb) {

            var dataObj = {
                //product_id: data.product_id,
                code: data.code,
                name: data.name,
                credit: data.credit,
                createingLog: { creator: 'admin', 'createDate': new Date() }
            };

            globalDB.insert(importSupplierTableName, dataObj, function (result) {

                if (cb) { cb(result) }
            });
        },
        updateSupplier: function (data, cb) {
            console.log('updateSupplier', data);
            var dataObj = {
                //product_id: data.product_id,
                code: data.code,
                name: data.name,
                credit: data.credit,
                createingLog: { creator: 'admin', 'createDate': new Date() }
            };
            globalDB.update(importSupplierTableName, { code: data.code }, dataObj, function (result) {

                if (cb) { cb(result) }
            });
        },
        deleteSupplier: function (data, cb) {
            var code = data.code;

            globalDB.destroy(importSupplierTableName, { code: code }, function (result) {
                if (cb) { cb(result) }
            })
        },
        //#endregion
    };


    if (typeof module !== "undefined" && module.exports) {                       // NodeJS/CommonJS
        module.exports = NwStockServiceMethod;
    } else {

        context.NwStockServiceMethod = NwStockServiceMethod;
    }

})(this);