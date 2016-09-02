/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/// <reference path="../../lib/backbone/backbone.js" />
/// <reference path="../../lib/async/async.js" />


var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';
    function addHours(date, hours) {
        var result = new Date(date);
        result.setHours(result.getHours() + hours);
        return result;
    }
    function addDays(date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
    function addMonths(date, months) {
        var result = new Date(date);
        result.setMonth(result.getMonth() + months);
        return result;
    }
    function addYears(date, years) {
        var result = new Date(date);
        result.setFullYear(result.getFullYear() + years);
        return result;
    }
    function removeTimezoneOffset(now) {
        return addHours(now, -now.getTimezoneOffset() / 60);
    }
    function addTimezoneOffset(now) {
        return addHours(now, now.getTimezoneOffset() / 60);
    }
    app.collections.ReportCollection = Backbone.Collection.extend({
        model: Backbone.Model,


        getStockCard: function (stock_selected, selectProduct, timeStart, timeEnd, cb) {
            var code = selectProduct.get('code');
            var self = this;
            async.parallel({
                //productInfo: function (callback) {

                //    app.serviceMethod.getProduct({ stock_name: stock_selected, code: code}, function (result) {
                //        //console.log(result);
                //        callback(null, result);
                //    });
                //},
                productIn: function (callback) {
                    app.serviceMethod.getImportProductInPeriod({ stock_name: stock_selected, code: code, timeStart: timeStart, timeEnd: timeEnd }, function (result) {
                        //console.log(result);
                        callback(null, result);
                    });
                },
                productOut: function (callback) {
                    app.serviceMethod.getExportProductInPeriod({ stock_name: stock_selected, code: code, timeStart: timeStart, timeEnd: timeEnd }, function (result) {
                        //console.log(result);
                        callback(null, result);
                    });

                }
            }, function (err, results) {
                //console.log(results);

                var objArr = [];

                _.each(results.productIn, function (piObj) {
                    var obj = {
                        date: piObj.createingLog.createDate,//.slice(0, 10)
                        code: piObj.code,
                        description: piObj.supplier_code,
                        doc_id: piObj.invoid_id,
                        doc_date: piObj.in_date,
                        in_unit: piObj.unit
                    };

                    objArr.push(obj);
                });

                _.each(results.productOut, function (poObj) {
                    var obj = {
                        date: poObj.createingLog.createDate,
                        code: poObj.code,
                        description: poObj.job,
                        doc_id: poObj.requisition_id,
                        doc_date: poObj.out_date,
                        out_unit: poObj.unit
                    };

                    objArr.push(obj);
                });

                objArr = _.sortBy(objArr, 'date');

                if (objArr.length > 0) {
                    //console.log(selectProduct);
                    var lastSumUnit = selectProduct.get('unitSum')[stock_selected];

                    var sumUnit = 0;
                    _.each(objArr, function (obj) {
                        if (obj.in_unit) {
                            sumUnit += obj.in_unit;
                        } else if (obj.out_unit) {
                            sumUnit -= obj.out_unit;
                        } else {
                            console.log('errrrorrr');
                        }
                    });
                    sumUnit = lastSumUnit - sumUnit;
                    _.each(objArr, function (obj) {

                        obj.date = (new Date(obj.date)).toISOString().slice(0, 10);//obj.date.slice(0, 19)

                        if (obj.in_unit) {
                            sumUnit += obj.in_unit;
                        } else if (obj.out_unit) {
                            sumUnit -= obj.out_unit;
                        } else {
                            console.log('errrrorrr');
                        }

                        obj.last_unit = sumUnit;
                    });

                }


                // results is now equals to: {one: 1, two: 2}
                self.reset(objArr);
                if (cb) cb(objArr);
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

        getPurchasePupplier: function (stock_selected, supplierSelected, timeStart, timeEnd, cb) {
            console.log('getPurchasePupplier');
            var self = this;
            app.serviceMethod.getImportProductInPeriod({ stock_name: stock_selected, supplier_code: supplierSelected, timeStart: timeStart, timeEnd: timeEnd }, function (result) {

                var codes = _.chain(result).pluck('code').uniq().value();

                app.serviceMethod.getProductByCodeArray({ stock_name: stock_selected, codes: codes }, function (products) {

                    result = _.map(result, function (obj) {
                        var product = _.findWhere(products, { code: obj.code });
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
                        return _.extend(obj, _.pick(product, ['unit_type']));
                    });

                    //console.log(result);
                    //console.log(lasting);
                    self.reset(result);
                    if (cb) cb(result);
                });

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
    });


})(jQuery);
