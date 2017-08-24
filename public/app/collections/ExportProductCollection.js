/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/// <reference path="../../lib/backbone/backbone.js" />


var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    function precision(a, precision) {
        var x = Math.pow(10, precision || 2);
        return (Math.round(a * x)) / x;
    }

    app.collections.ExportProductCollection = Backbone.Collection.extend({
        model: app.models.ExportProductModel,

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
                        }

                        else {
                            callback('Fail to save \n' + errMsg);// + JSON.stringify(model.toJSON()));
                        }
                    });
                }
                else {
                    callback('Invalid Data\n'+ JSON.stringify(model.toJSON()));
                }
            }, function (err) {
                if (cb) cb(err, numSave);
            });
        },
        getAll: function (stock_selected, cb) {

            var self = this;
            app.serviceMethod.getAllExportProduct({ stock_name: stock_selected }, function (result) {
                //console.log(result);
                self.reset(result);
                if (cb) cb(result);
            });
        },
        getInPeriod: function (stock_selected, timeStart, timeEnd, cb) {

            var self = this;
            app.serviceMethod.getExportProductInPeriod({ stock_name: stock_selected, timeStart: timeStart }, function (result) {
                //console.log(result);
                self.reset(result);
                if (cb) cb(result);
            });
        },
        getInPeriodWithSearch: function (stock_selected, timeStart, timeEnd, searchObj, cb) {

            var self = this;
            searchObj = _.extend(searchObj, { stock_name: stock_selected, timeStart: timeStart, timeEnd: timeEnd });

            app.serviceMethod.getExportProductInPeriodWithSearch(searchObj, function (result) {
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

                //self.reset(result);
                //if (cb) cb(result);
            });
        },
    });


})(jQuery);
