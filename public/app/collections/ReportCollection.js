/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/// <reference path="../../lib/backbone/backbone.js" />
/// <reference path="../../lib/async/async.js" />


var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    function subtraction(a, b, fix) {
        if (!fix) fix = 10000000;
        return (a * fix - b * fix) / fix;
        // Math.floor((-0.2-0.1)*SIGDIG)/SIGDIG 
    }
    function addition(a, b, fix) {
        if (!fix) fix = 10000000;
        return (a * fix + b * fix) / fix;
    }
    function add(a, b, precision) {
        var x = Math.pow(10, precision || 2);
        return (Math.round(a * x) + Math.round(b * x)) / x;
    }
    function precision(a, precision) {
        var x = Math.pow(10, precision || 2);
        return (Math.round(a * x)) / x;
    }
    
    app.collections.ReportCollection = Backbone.Collection.extend({
        model: Backbone.Model,

        getStockCard: function (stock_selected, selectProduct, timeStart, timeEnd, cb) {
            this.selectProduct = selectProduct;
            var code = selectProduct.get('code');
            var self = this;
            var startOfAll = new Date(-8640000000000000).toISOString().slice(0, 10);

            async.parallel({
                //productInfo: function (callback) {

                //    app.serviceMethod.getProduct({ stock_name: stock_selected, code: code}, function (result) {
                //        //console.log(result);
                //        callback(null, result);
                //    });
                //},
                productIn: function (callback) {
                    app.serviceMethod.getImportProductInPeriod({ stock_name: stock_selected, code: code, timeStart: startOfAll, timeEnd: timeEnd }, function (result) {
                        //console.log(result);
                        callback(null, result);
                    });
                },
                productOut: function (callback) {
                    app.serviceMethod.getExportProductInPeriod({ stock_name: stock_selected, code: code, timeStart: startOfAll, timeEnd: timeEnd }, function (result) {
                        //console.log(result);
                        callback(null, result);
                    });

                }
            }, function (err, results) {
                //console.log(results);

                var objArr = [];
                var beforeObjArr = [];
                var resultArr = [];
                var unitBalance = 0;
                //console.log(startDateStr, results.productIn);


                _.each(results.productIn, function (piObj) {
                    var obj = {
                        //date: piObj.createingLog.createDate,//.slice(0, 10)
                        code: piObj.code,
                        description: piObj.supplier_code,
                        doc_id: piObj.invoid_id,
                        doc_date: piObj.in_date,
                        in_unit: parseFloat(piObj.unit)
                    };

                    if (obj.doc_date < timeStart) {
                        beforeObjArr.push(obj);
                    } else {
                        objArr.push(obj);
                    }
                });

                _.each(results.productOut, function (poObj) {
                    var obj = {
                        //date: poObj.createingLog.createDate,
                        code: poObj.code,
                        description: poObj.job,
                        doc_id: poObj.requisition_id,
                        doc_date: poObj.out_date,
                        out_unit: parseFloat(poObj.unit)
                    };

                    if (obj.doc_date < timeStart) {
                        beforeObjArr.push(obj);
                    } else {
                        objArr.push(obj);
                    }

                    //objArr.push(obj);
                });

                console.log('beforeObjArr', beforeObjArr);
                console.log('objArr', objArr);

                _.each(beforeObjArr, function (eachObj) {
                    if (eachObj.in_unit) {
                        unitBalance += eachObj.in_unit;
                    }
                    else if (eachObj.out_unit) {
                        unitBalance = subtraction(unitBalance, eachObj.out_unit);
                    }
                    else {
                        alert('err no unit', eachObj);
                    }
                });

                resultArr.push({

                    description: 'B/F',
                    doc_id: '',
                    doc_date: timeStart,
                    last_unit: precision(unitBalance)
                });

                objArr = _.sortBy(objArr, 'doc_date');

                if (objArr.length > 0) {

                    _.each(objArr, function (eachObj) {
                        if (eachObj.in_unit) {
                            unitBalance += eachObj.in_unit;
                        } else if (eachObj.out_unit) {
                            unitBalance = subtraction(unitBalance, eachObj.out_unit);
                        } else {
                            console.log('errrrorrr');
                        }
                        eachObj.last_unit = precision(unitBalance)
                        resultArr.push(eachObj);
                    });

                    //console.log(selectProduct);
                    //var lastSumUnit = selectProduct.get('unitSum')[stock_selected];

                    //var sumUnit = 0;
                    //_.each(objArr, function (obj) {
                    //    if (obj.in_unit) {
                    //        sumUnit += obj.in_unit;
                    //    } else if (obj.out_unit) {
                    //        sumUnit -= obj.out_unit;
                    //    } else {
                    //        console.log('errrrorrr');
                    //    }
                    //});
                    //sumUnit = lastSumUnit - sumUnit;
                    //_.each(objArr, function (obj) {

                    //    obj.date = (new Date(obj.date)).toISOString().slice(0, 10);//obj.date.slice(0, 19)

                    //    if (obj.in_unit) {
                    //        sumUnit += obj.in_unit;
                    //    } else if (obj.out_unit) {
                    //        sumUnit -= obj.out_unit;
                    //    } else {
                    //        console.log('errrrorrr');
                    //    }

                    //    obj.last_unit = sumUnit;
                    //});

                }


                // results is now equals to: {one: 1, two: 2}
                self.reset(resultArr);
                if (cb) cb(resultArr);
            });

        },

        getStockLasting0: function (stock_selected, cb) {
            var self = this
            async.parallel({
                productIn: function (callback) {
                    app.serviceMethod.getAllImportProduct({ stock_name: stock_selected }, function (result) {
                        //console.log(result);
                        callback(null, result);
                    });
                },
                productOut: function (callback) {
                    app.serviceMethod.getAllExportProduct({ stock_name: stock_selected }, function (result) {
                        //console.log(result);
                        callback(null, result);
                    });
                }
            }, function (err, results) {

                var productInObj = _.groupBy(results.productIn, 'code');
                var productOutObj = _.groupBy(results.productOut, 'code');

                var mapingObj = {};

                _.each(productInObj, function (list, code) {
                    if (!mapingObj[code]) mapingObj[code] = {};
                    //list = list.reverse();
                    mapingObj[code].in = _.sortBy(list, function (o) {
                        return o.createingLog.createDate;
                    });
                });

                _.each(productOutObj, function (list, code) {
                    if (!mapingObj[code]) mapingObj[code] = {};
                    mapingObj[code].out = _.sortBy(list, function (o) {
                        return o.createingLog.createDate;
                    });
                });

                var lasting = [];
                _.each(mapingObj, function (obj, code) {

                    if (obj.in && obj.out) {
                        while (obj.in.length > 0 && obj.out.length > 0) {
                            if (obj.in[0].unit > obj.out[0].unit) {
                                obj.in[0].unit -= obj.out[0].unit;
                                obj.out.shift();
                            } else if (obj.in[0].unit < obj.out[0].unit) {
                                obj.out[0].unit -= obj.in[0].unit;
                                obj.in.shift();
                            } else {
                                obj.out.shift();
                                obj.in.shift();
                            }
                        }
                        if (obj.in.length == 0) {
                            delete obj.in;
                        }
                        if (obj.out.length == 0) {
                            delete obj.out;
                        }
                    }
                    if (obj.in && obj.out) {
                        alert('process error obj.in && obj.out');
                    }
                    else if (obj.out) {
                        alert('process error obj.out');
                    } else if (obj.in) {
                        //if (!lasting[code]) lasting[code] = obj.in;
                        lasting.push(obj.in);
                    }
                });
                //console.log(lasting);

                lasting = _.map(lasting, function (item) {
                    return _.chain(item).groupBy('unit_price')
                        .map(function (itemPriceGroup) {
                            var useObj = itemPriceGroup[0];
                            useObj.unit = _.chain(itemPriceGroup).pluck('unit').reduce(function (memo, num) { return memo + num; }, 0).value();
                            useObj.sum = useObj.unit * useObj.unit_price;
                            return useObj;
                        }).value();
                });
                lasting = _.chain(lasting).flatten().map(function (obj) {
                    return _.pick(obj, ['code', 'unit_price', 'unit', 'sum']);
                }).value();

                var codes = _.chain(lasting).pluck('code').uniq().value();

                app.serviceMethod.getProductByCodeArray({ stock_name: stock_selected, codes: codes }, function (products) {

                    lasting = _.map(lasting, function (obj) {
                        var product = _.findWhere(products, { code: obj.code });

                        //console.log(obj.code,product);
                        return _.extend(obj, _.pick(product, ['name', 'unit_type']));
                    });
                    //console.log(lasting);
                    self.reset(lasting);
                    if (cb) cb(lasting);
                });

            });
        },
        getStockLasting: function (stock_selected, cb) {
            var self = this
            async.parallel({
                productIn: function (callback) {
                    app.serviceMethod.getAllImportProduct({ stock_name: stock_selected }, function (result) {
                        //console.log(result);
                        callback(null, result);
                    });
                },
                productOut: function (callback) {
                    app.serviceMethod.getAllExportProduct({ stock_name: stock_selected }, function (result) {
                        //console.log(result);
                        callback(null, result);
                    });
                }
            }, function (err, results) {



                _.each(results.productIn, function (piObj) {
                    piObj.unit = parseFloat(piObj.unit)
                });

                _.each(results.productOut, function (poObj) {
                    poObj.unit = parseFloat(poObj.unit)
                });

                var productInObj = _.groupBy(results.productIn, 'code');
                var productOutObj = _.groupBy(results.productOut, 'code');

                var mapingObj = {};

                _.each(productInObj, function (list, code) {
                    if (!mapingObj[code]) mapingObj[code] = {};
                    //list = list.reverse();
                    mapingObj[code].in = _.sortBy(list, function (o) {
                        return o.in_date;
                    });
                });

                _.each(productOutObj, function (list, code) {
                    if (!mapingObj[code]) mapingObj[code] = {};
                    mapingObj[code].out = _.sortBy(list, function (o) {
                        return o.out_date;
                    });
                });

                var lastingObj = {};

                _.each(mapingObj, function (eachMapObj, code) {

                    var inStock = eachMapObj.in;
                    var outStock = eachMapObj.out;

                    var numOut = 0;
                    var inStockGroup = [];
                    var lastPrice = null;
                    _.each(inStock, function (eachInStock) {
                        var currentPrice = eachInStock.unit_price;
                        var unit = eachInStock.unit;
                        if (inStockGroup.length > 0 && lastPrice == currentPrice) {
                            inStockGroup[0].unit += unit;
                        } else {
                            var obj = { price: currentPrice, unit: unit };
                            inStockGroup.unshift(obj);
                        }
                        lastPrice = currentPrice;
                    });

                    _.each(outStock, function (eachOutStock) {
                        numOut = addition(numOut, eachOutStock.unit);

                        //if (inStockGroup.length > 0) {
                        //    var unit = eachOutStock.unit;

                        //    if (inStockGroup.length > 1) {
                        //        inStockGroup.shift();
                        //    } else {
                        //        inStockGroup[0].unit = subtraction(inStockGroup[0].unit, unit);
                        //    }
                        //}
                    });

                    var i = inStockGroup.length
                    while (i--) {
                        if (numOut > 0) {
                            var unit = inStockGroup[i].unit;
                            if (unit < numOut) {
                                numOut = subtraction(numOut, unit);
                                inStockGroup.splice(i, 1);
                            } else if (unit == numOut) {
                                numOut = 0;
                                inStockGroup.splice(i, 1);
                            } else if (unit > numOut) {
                                inStockGroup[i].unit = subtraction(unit, numOut);
                                numOut = 0;
                            } else {
                                console.log('errr somewhere');
                            }
                        }
                    }

                    if (numOut > 0 && inStockGroup.length > 0) {
                        console.log('errr somewhere 2');
                    } else if (numOut > 0) {
                        inStockGroup.push({ price: lastPrice, unit: subtraction(0, numOut) });
                    } else if (inStockGroup.length == 0) {
                        inStockGroup.push({ price: lastPrice, unit: 0 });
                    }

                    inStockGroup = inStockGroup.reverse();
                    lastingObj[code] = inStockGroup;
                });

                console.log(lastingObj);

                var a = 1;

                var lasting = [];
                _.each(lastingObj, function (obj, key) {
                    _.each(obj, function (list) {
                        list.unit = precision(list.unit);
                        var sum = list.price * list.unit;
                        lasting.push({
                            code: key, unit_price: list.price, unit: list.unit,
                            sum: precision(sum)// parseFloat(sum.toPrecision(12))
                        });
                    });
                });

                var codes = _.chain(lasting).pluck('code').uniq().value();

                app.serviceMethod.getProductByCodeArray({ stock_name: stock_selected, codes: codes }, function (products) {

                    lasting = _.map(lasting, function (obj) {
                        var product = _.findWhere(products, { code: obj.code });

                        //console.log(obj.code,product);
                        return _.extend(obj, _.pick(product, ['name', 'unit_type']));
                    });
                    //console.log(lasting);
                    self.reset(lasting);
                    if (cb) cb(lasting);
                });
            });
        },
        getStockLastingDate: function (stock_selected, dateStr, cb) {
            var self = this

            var start = new Date(-8640000000000000).toISOString().slice(0, 10);
            //var end = new Date(productCheck[0].createingLog.createDate);
            var findObj = { stock_name: stock_selected, timeStart: start, timeEnd: dateStr };

            async.parallel({
                productIn: function (callback) {
                    //app.serviceMethod.getAllImportProduct({ stock_name: stock_selected }, function (result) {
                    //    //console.log(result);
                    //    callback(null, result);
                    //});

                    app.serviceMethod.getImportProductInPeriod(findObj, function (result) {
                        //console.log(result);
                        callback(null, result);
                    });

                },
                productOut: function (callback) {
                    ////app.serviceMethod.getAllExportProduct({ stock_name: stock_selected }, function (result) {
                    //    //console.log(result);
                    //    callback(null, result);
                    //});

                    app.serviceMethod.getExportProductInPeriod(findObj, function (result) {
                        //console.log(result);
                        callback(null, result);
                    });
                }
            }, function (err, results) {

                _.each(results.productIn, function (piObj) {
                    piObj.unit = parseFloat(piObj.unit)
                });

                _.each(results.productOut, function (poObj) {
                    poObj.unit = parseFloat(poObj.unit)
                });

                var productInObj = _.groupBy(results.productIn, 'code');
                var productOutObj = _.groupBy(results.productOut, 'code');

                var mapingObj = {};

                _.each(productInObj, function (list, code) {
                    if (!mapingObj[code]) mapingObj[code] = {};
                    //list = list.reverse();
                    mapingObj[code].in = _.sortBy(list, function (o) {
                        return o.in_date;
                    });
                });

                _.each(productOutObj, function (list, code) {
                    if (!mapingObj[code]) mapingObj[code] = {};
                    mapingObj[code].out = _.sortBy(list, function (o) {
                        return o.out_date;
                    });
                });

                var lastingObj = {};

                _.each(mapingObj, function (eachMapObj, code) {
                    var inStock = eachMapObj.in;
                    var outStock = eachMapObj.out;

                    var numOut = 0;
                    var inStockGroup = [];
                    var lastPrice = null;
                    _.each(inStock, function (eachInStock) {
                        var currentPrice = eachInStock.unit_price;
                        var unit = eachInStock.unit;
                        if (inStockGroup.length > 0 && lastPrice == currentPrice) {
                            inStockGroup[0].unit += unit;
                        } else {
                            var obj = { price: currentPrice, unit: unit };
                            inStockGroup.unshift(obj);
                        }
                        lastPrice = currentPrice;
                    });

                    _.each(outStock, function (eachOutStock) {
                        numOut = addition(numOut, eachOutStock.unit);

                        //if (inStockGroup.length > 0) {
                        //    var unit = eachOutStock.unit;

                        //    if (inStockGroup.length > 1) {
                        //        inStockGroup.shift();
                        //    } else {
                        //        inStockGroup[0].unit = subtraction(inStockGroup[0].unit, unit);
                        //    }
                        //}
                    });

                    var i = inStockGroup.length
                    while (i--) {
                        if (numOut > 0) {
                            var unit = inStockGroup[i].unit;
                            if (unit < numOut) {
                                numOut = subtraction(numOut, unit);
                                inStockGroup.splice(i, 1);
                            } else if (unit == numOut) {
                                numOut = 0;
                                inStockGroup.splice(i, 1);
                            } else if (unit > numOut) {
                                inStockGroup[i].unit = subtraction(unit, numOut);
                                numOut = 0;
                            } else {
                                console.log('errr somewhere');
                            }
                        }
                    }

                    if (numOut > 0 && inStockGroup.length > 0) {
                        console.log('errr somewhere 2');
                    } else if (numOut > 0) {
                        inStockGroup.push({ price: lastPrice, unit: subtraction(0, numOut) });
                    } else if (inStockGroup.length == 0) {
                        inStockGroup.push({ price: lastPrice, unit: 0 });
                    }

                    inStockGroup = inStockGroup.reverse();
                    lastingObj[code] = inStockGroup;
                });

                //console.log(lastingObj);

                var a = 1;

                var lasting = [];
                _.each(lastingObj, function (obj, key) {
                    _.each(obj, function (list) {
                        list.unit = precision(list.unit);
                        var sum = list.price * list.unit;
                        lasting.push({
                            code: key, unit_price: list.price, unit: list.unit,
                            sum: precision(sum)// parseFloat(sum.toPrecision(12))
                        });
                    });
                });

                var codes = _.chain(lasting).pluck('code').uniq().value();

                app.serviceMethod.getProductByCodeArray({ stock_name: stock_selected, codes: codes }, function (products) {

                    lasting = _.map(lasting, function (obj) {
                        var product = _.findWhere(products, { code: obj.code });

                        //console.log(obj.code,product);
                        return _.extend(obj, _.pick(product, ['name', 'unit_type']));
                    });
                    //console.log(lasting);
                    self.reset(lasting);
                    if (cb) cb(lasting);
                });
            });
        },

        getPurchasePupplier: function (stock_selected, supplierSelected, timeStart, timeEnd, cb) {
            console.log('getPurchasePupplier');
            var self = this;
            app.serviceMethod.getImportProductInPeriod({ stock_name: stock_selected, supplier_code: supplierSelected, timeStart: timeStart, timeEnd: timeEnd }, function (result) {

                var codes = _.chain(result).pluck('code').uniq().value();

                app.serviceMethod.getProductByCodeArray({ stock_name: stock_selected, codes: codes }, function (products) {

                    result = _.map(result, function (obj) {
                        var product = _.findWhere(products, { code: obj.code });
                        obj.unit_price = precision(parseFloat(obj.unit_price));
                        obj.sum = precision(parseFloat(obj.sum));

                        return _.extend(obj, _.pick(product, ['name', 'unit_type']));
                    });

                    self.reset(result);
                    if (cb) cb(result);
                });

            });
        },
        getPurchaseProduct: function (stock_selected, selectProduct, timeStart, timeEnd, allSupplier, cb) {
            var code = selectProduct.get('code');
            var self = this;
            app.serviceMethod.getImportProductInPeriod({ stock_name: stock_selected, code: code, timeStart: timeStart, timeEnd: timeEnd }, function (result) {

                var codes = _.chain(result).pluck('code').uniq().value();

                app.serviceMethod.getProductByCodeArray({ stock_name: stock_selected, codes: codes }, function (products) {

                    result = _.map(result, function (obj) {
                        var product = _.findWhere(products, { code: obj.code });
                        var supplier = _.findWhere(allSupplier, { code: obj.supplier_code });
                        obj.supplier_name = supplier.name;
                        obj.sum = precision(parseFloat(obj.sum));
                        return _.extend(obj, _.pick(product, ['unit_type']));
                    });

                    //console.log(result);
                    //console.log(lasting);
                    self.reset(result);
                    if (cb) cb(result);
                });

            });
        },

        getCheckProductDate: function (stock_selected, cb) {
            app.serviceMethod.getCheckProductDate({ stock_name: stock_selected }, cb);
        },

        getCheckProduct0: function (stock_selected, dateStr, cb) {
            var self = this;

            app.serviceMethod.getCheckProduct({ stock_name: stock_selected, check_date: dateStr }, function (productCheck) {

                console.log('getCheckProduct', productCheck);

                if (productCheck.length > 0) {
                    var start = new Date(-8640000000000000);
                    var end = new Date(productCheck[0].createingLog.createDate);
                    var findObj = { stock_name: stock_selected, timeStart: start, timeEnd: end };

                    async.parallel({
                        productIn: function (callback) {
                            app.serviceMethod.getImportProductInPeriod(findObj, function (result) {
                                //console.log(result);
                                callback(null, result);
                            });
                        },
                        productOut: function (callback) {
                            app.serviceMethod.getExportProductInPeriod(findObj, function (result) {
                                //console.log(result);
                                callback(null, result);
                            });
                        },
                        //productCheck: function (callback) {
                        //    app.serviceMethod.getCheckProduct({ stock_name: stock_selected, 'check_date': dateStr }, function (result) {
                        //        callback(null, result);
                        //    });
                        //}
                    }, function (err, results) {

                        console.log('productIn', results.productIn);
                        console.log('productOut', results.productOut);

                        var productInObj = _.groupBy(results.productIn, 'code');
                        var productOutObj = _.groupBy(results.productOut, 'code');
                        var productCheckObj = _.groupBy(productCheck, 'code');

                        console.log('productCheck', productCheckObj);


                        var mapingObj = {};

                        _.each(productInObj, function (list, code) {
                            if (!mapingObj[code]) mapingObj[code] = {};
                            //list = list.reverse();
                            mapingObj[code].in = _.sortBy(list, function (o) {
                                return o.createingLog.createDate;
                            });
                        });

                        _.each(productOutObj, function (list, code) {
                            if (!mapingObj[code]) mapingObj[code] = {};
                            mapingObj[code].out = _.sortBy(list, function (o) {
                                return o.createingLog.createDate;
                            });
                        });

                        _.each(productCheckObj, function (list, code) {
                            if (!mapingObj[code]) mapingObj[code] = {};
                            if (list.length != 1) {
                                alert('getCheckProduct list.length != 1');
                            }
                            mapingObj[code].check = list[0];
                        });

                        var lasting = [];
                        _.each(mapingObj, function (obj, code) {
                            obj.code = code;

                            if (obj.in && obj.out) {
                                while (obj.in.length > 0 && obj.out.length > 0) {
                                    if (obj.in[0].unit > obj.out[0].unit) {
                                        obj.in[0].unit -= obj.out[0].unit;
                                        obj.out.shift();
                                    } else if (obj.in[0].unit < obj.out[0].unit) {
                                        obj.out[0].unit -= obj.in[0].unit;
                                        obj.in.shift();
                                    } else {
                                        obj.out.shift();
                                        obj.in.shift();
                                    }
                                }

                                if (obj.in.length == 0) {
                                    delete obj.in;
                                }
                                if (obj.out.length == 0) {
                                    delete obj.out;
                                }
                            }

                            if (obj.in && obj.out) {
                                console.log('errrr process error obj.in && obj.out');
                            }
                            else if (obj.out) {
                                console.log('errrr process error obj.out ' + JSON.stringify(obj.out));
                            }
                            else if (!obj.check) {
                                console.log('errrr uncheck ' + code);
                            }
                            else if (obj.in && obj.check) {
                                //if (!lasting[code]) lasting[code] = obj.in;
                                lasting.push(obj);
                            }
                            else if (obj.check) {
                                lasting.push(obj);
                            }

                        });
                        //console.log(lasting);

                        lasting = _.map(lasting, function (obj) {
                            var item = obj.in;
                            var check = obj.check;
                            if (item) {
                                var result = _.chain(item).groupBy('unit_price')
                                    .map(function (itemPriceGroup) {
                                        var useObj = itemPriceGroup[0];
                                        useObj.unit = _.chain(itemPriceGroup).pluck('unit').reduce(function (memo, num) { return memo + num; }, 0).value();

                                        if (check.unit == 0) {
                                            useObj.last_unit = 0;
                                            useObj.diff_unit = -useObj.unit;
                                        }
                                        else {
                                            var diffUnit = check.unit - useObj.unit;
                                            if (diffUnit >= 0) {
                                                useObj.last_unit = useObj.unit;
                                                check.unit = diffUnit;
                                                useObj.diff_unit = 0;
                                            }
                                            else {
                                                useObj.diff_unit = diffUnit;
                                                useObj.last_unit = check.unit;
                                                check.unit = 0;
                                            }
                                        }

                                        useObj.sum = useObj.unit * useObj.unit_price;
                                        return useObj;
                                    }).value();

                                if (check.unit != 0) {
                                    var lastObj = _.last(result);
                                    lastObj.last_unit += check.unit;
                                    lastObj.diff_unit = lastObj.unit - lastObj.last_unit;
                                }

                                return result
                            }
                            else {
                                return { code: check.code, unit: 0, sum: 0, last_unit: check.unit, diff_unit: check.unit };
                            }
                        });

                        lasting = _.chain(lasting).flatten().map(function (obj) {
                            return _.pick(obj, ['code', 'unit_price', 'unit', 'sum', 'last_unit', 'diff_unit']);
                        }).value();

                        var codes = _.chain(lasting).pluck('code').uniq().value();

                        app.serviceMethod.getProductByCodeArray({ stock_name: stock_selected, codes: codes }, function (products) {

                            lasting = _.map(lasting, function (obj) {
                                var product = _.findWhere(products, { code: obj.code });
                                //console.log(obj.code,product);
                                if (!obj.unit_price) {
                                    obj.unit_price = product.unit_price_default
                                }
                                obj.dif_sum = obj.unit_price * obj.diff_unit;
                                return _.extend(obj, _.pick(product, ['name', 'unit_type']));
                            });
                            //console.log(lasting);
                            self.reset(lasting);
                            if (cb) cb(lasting);
                        });
                        //console.log(lasting);
                    });
                }
            });
        },
        getCheckProduct: function (stock_selected, dateStr, cb) {
            var self = this;

            app.serviceMethod.getCheckProduct({ stock_name: stock_selected, check_date: dateStr }, function (productCheck) {

                console.log('getCheckProduct', productCheck);

                if (productCheck.length > 0) {
                    var start = new Date(-8640000000000000).toISOString().slice(0, 10);
                    //var end = new Date(productCheck[0].createingLog.createDate);
                    var findObj = { stock_name: stock_selected, timeStart: start, timeEnd: dateStr };

                    async.parallel({
                        productIn: function (callback) {
                            app.serviceMethod.getImportProductInPeriod(findObj, function (result) {
                                //console.log(result);
                                callback(null, result);
                            });
                        },
                        productOut: function (callback) {
                            app.serviceMethod.getExportProductInPeriod(findObj, function (result) {
                                //console.log(result);
                                callback(null, result);
                            });
                        },
                        //productCheck: function (callback) {
                        //    app.serviceMethod.getCheckProduct({ stock_name: stock_selected, 'check_date': dateStr }, function (result) {
                        //        callback(null, result);
                        //    });
                        //}
                    }, function (err, results) {

                        console.log('productIn', results.productIn);
                        console.log('productOut', results.productOut);

                        var productInObj = _.groupBy(results.productIn, 'code');
                        var productOutObj = _.groupBy(results.productOut, 'code');
                        var productCheckObj = _.groupBy(productCheck, 'code');

                        console.log('productCheck', productCheckObj);


                        var mapingObj = {};

                        //_.each(productCheckObj, function (list, code) {
                        //    if (!mapingObj[code]) mapingObj[code] = {};
                        //    if (list.length != 1) {
                        //        alert('getCheckProduct list.length != 1');
                        //    }
                        //    mapingObj[code].check = list[0];
                        //});


                        _.each(productInObj, function (list, code) {
                            if (!mapingObj[code]) mapingObj[code] = {};
                            //list = list.reverse();
                            mapingObj[code].in = _.sortBy(list, function (o) {
                                return o.in_date;
                            });
                        });

                        _.each(productOutObj, function (list, code) {
                            if (!mapingObj[code]) mapingObj[code] = {};
                            mapingObj[code].out = _.sortBy(list, function (o) {
                                return o.out_date;
                            });
                        });

                        var lastingObj = {};

                        _.each(mapingObj, function (eachMapObj, code) {
                            var inStock = eachMapObj.in;
                            var outStock = eachMapObj.out;
                            var numOut = 0;
                            var inStockGroup = [];
                            var lastPrice = null;
                            _.each(inStock, function (eachInStock) {
                                var currentPrice = eachInStock.unit_price;
                                var unit = eachInStock.unit;
                                if (inStockGroup.length > 0 && lastPrice == currentPrice) {
                                    inStockGroup[0].unit += unit;
                                } else {
                                    var obj = { price: currentPrice, unit: unit };
                                    inStockGroup.unshift(obj);
                                }
                                lastPrice = currentPrice;
                            });

                            _.each(outStock, function (eachOutStock) {
                                numOut = addition(numOut, eachOutStock.unit);
                            });

                            var i = inStockGroup.length
                            while (i--) {
                                if (numOut > 0) {
                                    var unit = inStockGroup[i].unit;
                                    if (unit < numOut) {
                                        numOut = subtraction(numOut, unit);
                                        inStockGroup.splice(i, 1);
                                    } else if (unit == numOut) {
                                        numOut = 0;
                                        inStockGroup.splice(i, 1);
                                    } else if (unit > numOut) {
                                        inStockGroup[i].unit = subtraction(unit, numOut);
                                        numOut = 0;
                                    } else {
                                        console.log('errr somewhere');
                                    }
                                }
                            }

                            if (numOut > 0 && inStockGroup.length > 0) {
                                console.log('errr somewhere 2');
                            } else if (numOut > 0) {
                                inStockGroup.push({ price: lastPrice, unit: subtraction(0, numOut) });
                            } else if (inStockGroup.length == 0) {
                                inStockGroup.push({ price: lastPrice, unit: 0 });
                            }

                            inStockGroup = inStockGroup.reverse();
                            lastingObj[code] = inStockGroup;
                        });

                        console.log(lastingObj);

                        var lasting = [];
                        _.each(lastingObj, function (eachLastingObj, key) {
                            var eachLastingObjLastId = eachLastingObj.length - 1;
                            _.each(eachLastingObj, function (list, index) {
                                var sum = list.price * list.unit;
                                var obj = {
                                    code: key, unit_price: list.price, unit: list.unit,
                                    sum: precision(sum)//parseFloat(sum.toPrecision(12))
                                };
                                if (_.has(productCheckObj, key)) {
                                    var checkObj = productCheckObj[key][0];

                                    if (index == eachLastingObjLastId) {
                                        obj.last_unit = checkObj.unit;
                                    } else {
                                        if (checkObj.unit >= obj.unit) {
                                            obj.last_unit = obj.unit;
                                            checkObj.unit = subtraction(checkObj.unit, obj.unit);
                                        } else {
                                            obj.last_unit = checkObj.unit;
                                            checkObj.unit = 0;

                                        }
                                    }

                                    obj.diff_unit = subtraction(obj.last_unit, obj.unit);
                                    obj.dif_sum = (obj.diff_unit * list.price);
                                    obj.dif_sum = precision(obj.dif_sum)// parseFloat(obj.dif_sum.toPrecision(12))
                                }

                                lasting.push(obj);
                            });
                        });

                        var codes = _.chain(lasting).pluck('code').uniq().value();

                        app.serviceMethod.getProductByCodeArray({ stock_name: stock_selected, codes: codes }, function (products) {

                            lasting = _.map(lasting, function (obj) {
                                var product = _.findWhere(products, { code: obj.code });

                                //console.log(obj.code,product);
                                return _.extend(obj, _.pick(product, ['name', 'unit_type']));
                            });
                            //console.log(lasting);
                            self.reset(lasting);
                            if (cb) cb(lasting);
                        });

                    });
                }
            });
        },
        saveToXlsx: function (name, saveObjKeyPare) {
            //console.log(this.toJSON());

            //var ws_name = this.ws_name;

            //serchText = serchText ? serchText + '_' : '';

            var fileName = name + '_' + new Date().toISOString()

            var dataObjArray = [];//_.pluck(stooges, ['code', 'name']);

            _.each(this.toJSON(), function (dataObj) {
                var savaDataObj = {};

                for (var key in saveObjKeyPare) {
                    savaDataObj[saveObjKeyPare[key]] = dataObj[key];
                }

                dataObjArray.push(savaDataObj);
            })

            SaveXlsx(dataObjArray, 'data', fileName);
        },

        getDataObjArray: function (saveObjKeyPare) {
            var dataObjArray = [];//_.pluck(stooges, ['code', 'name']);

            _.each(this.toJSON(), function (dataObj) {
                var savaDataObj = {};

                for (var key in saveObjKeyPare) {
                    savaDataObj[saveObjKeyPare[key]] = dataObj[key];
                }

                dataObjArray.push(savaDataObj);
            })
            return dataObjArray;
        },
    });


})(jQuery);
