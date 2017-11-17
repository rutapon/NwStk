/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/// <reference path="../../lib/backbone/backbone.js" />


var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    app.collections.ImportProductCollection = Backbone.Collection.extend({
        model: app.models.ImportProductModel,

        saveToServer: function (stock_selected, cb) {
            var self = this;
            var numSave = 0;
            async.eachSeries(self.toArray(), function (model, callback) {
                if (model.isValid()) {
                    model.save(stock_selected, function (result, errMsg) {
                        if (result) {
                            numSave++;
                            self.remove(model);
                            callback();

                        } else {
                            callback('Fail to save \n' + errMsg);// + JSON.stringify(model.toJSON()));
                        }
                    });
                }
                else {
                    callback('Invalid Data\n' + JSON.stringify(model.toJSON()));
                }
            }, function (err) {


                if (cb) cb(err, numSave);
            });
        },
        checkValid: function () {
            var self = this;
            var modelArray = self.toArray();
            async.eachSeries(modelArray, function (model, callback) {
                if (model.isValid()) {
                    callback();
                }
                else {
                    callback('Invalid Data\n' + JSON.stringify(model.toJSON()));
                }
            }, function (err) {
                if (err) {
                    if (cb) cb(false, err);
                } else {
                    if (cb) cb(true);
                }
            });
        },
        checkDuplicate: function (stock_selected, prementType, cb) {
            var self = this;
            if (prementType != 'PettyCash') {
                var modelArray = self.toArray();
                async.eachSeries(modelArray, function (model, callback) {
                    model.checkDuplicate(stock_selected, function (result) {
                        if (result) {
                            callback('Fail to save \n' + 'Product is duplicate. \n' + result);// + JSON.stringify(model.toJSON()));
                        } else {
                            callback();
                        }
                    });
                }, function (err) {
                    if (err) {
                        if (cb) cb(false, err);
                    } else {
                        if (cb) cb(true);
                    }
                });
            } else {
                if (cb) cb(true);
            }
        },
        saveToServerAtOnce: function (stock_selected, cb) {
            var self = this;
            var modelArray = self.toArray();
            let saveObjArray = _.map(modelArray, function (model) {
                return model.attributes;
            });
            let paraObj = { stock_name: stock_selected, dataArray: saveObjArray };

            app.serviceMethod.insertImportProduct(paraObj, function (result) {
                console.log('insertImportProductArray', result);
                _.each(modelArray, function (model) {
                    self.remove(model);
                })

                if (cb) cb(null, result.insertedCount);
            });
        },
        getAll: function (stock_selected, cb) {

            var self = this;
            app.serviceMethod.getAllImportProduct({ stock_name: stock_selected }, function (result) {
                //console.log(result);
                self.reset(result);
                if (cb) cb(result);
            });
        },
        getInPeriod: function (stock_selected, timeStart, timeEnd, cb) {

            var self = this;
            app.serviceMethod.getImportProductInPeriod({ stock_name: stock_selected, timeStart: timeStart, timeEnd: timeEnd }, function (result) {
                //console.log(result);

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
        getInPeriodWithSearch: function (stock_selected, timeStart, timeEnd, searchObj, cb) {

            var self = this;
            searchObj = _.extend(searchObj, { stock_name: stock_selected, timeStart: timeStart, timeEnd: timeEnd });
            console.log('getInPeriodWithSearch', searchObj);
            app.serviceMethod.getImportProductInPeriodWithSearch(searchObj, function (result) {
                console.log(result);

                var codes = _.chain(result).pluck('code').uniq().value();

                app.serviceMethod.getProductByCodeArray({ stock_name: stock_selected, codes: codes }, function (products) {

                    result = _.map(result, function (obj) {
                        var product = _.findWhere(products, { code: obj.code });
                        return _.extend(obj, _.pick(product, ['name', 'unit_type']));
                    });

                    self.reset(result);
                    if (cb) cb(result);
                });

                //self.reset(result);
                //if (cb) cb(result);
            });
        },
        getBySessionId: function (sessionId, cb) {
            var self = this;
            console.log('getBySessionId');
            app.serviceMethod.findImportProduct({ sessionId: sessionId }, function (result) {
                if (result.length) {
                    //var stock_name = result[0].stock_name;
                    self.extendItemPropertyToImportItem(result, null, function (result) {

                        self.reset(result);
                        if (cb) cb(result);
                    })
                }
                else {
                    self.reset(result);
                    if (cb) cb(result);
                }
            });
        },
        extendItemPropertyToImportItem: function (imporetItems, stock_selected, cb) {
            var self = this;
            //console.log(result);
            var codes = _.chain(imporetItems).pluck('code').uniq().value();
            var findObj = { codes: codes }

            if (stock_selected) {
                findObj.stock_name = stock_selected;
            }

            app.serviceMethod.getProductByCodeArray(findObj, function (products) {
                imporetItems = _.map(imporetItems, function (obj) {
                    var product = _.findWhere(products, { code: obj.code });
                    return _.extend(obj, _.pick(product, ['name', 'unit_type']));
                });
                //self.reset(imporetItems);
                if (cb) cb(imporetItems);
            });
        }


    });


})(jQuery);
