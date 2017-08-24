/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/// <reference path="../../lib/backbone/backbone.js" />


var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    app.collections.CheckProductsCollection = Backbone.Collection.extend({
        model: app.models.CheckProductsModel,

        saveToServer: function (stock_selected, cb) {
            var self = this;
            var numSave = 0;
            var allGreen = true;
            self.each(function (model) {
                if (model.isValid()) {
                    model.set('hi', true);
                } else {
                    allGreen = false;
                }
            });
            if (allGreen) {
                async.eachSeries(self.toArray(), function (model, callback) {

                    model.save(stock_selected, function () {
                        numSave++;
                        //self.remove(model);
                        //model.set('hi', true);
                        callback();
                    });

                }, function (err) {
                    if (cb) cb(err, numSave);
                });
            }
        },

        getCheckProduct: function (stock_selected, dateStr, cb) {

            var self = this;
            app.serviceMethod.getAllProducts(stock_selected, function (result) {
                //console.log(result);
                _.each(result, function (item) {
                    item['stock_name'] = stock_selected;
                    item['check_date'] = dateStr;
                    item['hi'] = false;
                });
                //self.each(function (model) {
                //    self.remove(model);
                //});
                self.reset(result);
                if (cb) cb(result);
            });
        },

        getInPeriod: function (stock_selected, timeStart, timeEnd, cb) {

            var self = this;
            app.serviceMethod.getExportProductInPeriod({ stock_name: stock_selected, timeStart: timeStart }, function (result) {
                console.log(result);
                self.reset(result);
                if (cb) cb(result);
            });
        },
        getCheckProductDate: function (stock_selected, cb) {
            app.serviceMethod.getCheckProductDate({ stock_name: stock_selected }, cb);
        },
        getCheckProductForEdit: function (stock_selected, dateStr, cb) {
            var self = this;

            app.serviceMethod.getCheckProduct({ stock_name: stock_selected, check_date: dateStr }, function (result) {
                var codes = _.chain(result).pluck('code').uniq().value();

                app.serviceMethod.getProductByCodeArray({ stock_name: stock_selected, codes: codes }, function (products) {

                    result = _.map(result, function (obj) {
                        var product = _.findWhere(products, { code: obj.code });
                        //console.log(obj.code,product);

                        return _.extend(obj, _.pick(product, ['name', 'unit_type']));
                    });
                    //console.log(lasting);
                    self.reset(result);
                    if (cb) cb(result);
                });

                //self.reset(result);
                //if (cb) cb(result);
            });
        },

        editCheckProductDate: function (stock_selected, editDate, editDateTo, cb) {
            var self = this;
            var editObj = { stock_name: stock_selected, check_date: editDate, check_dateEdit: editDateTo };
            app.serviceMethod.editCheckProductDate(editObj, function (result) {
                if (cb) cb(result);
            });
        },
        deleteCheckProducts: function (stock_selected, deleteDate, cb) {
            var self = this;
            var deleteObj = { stock_name: stock_selected, check_date: deleteDate };
            app.serviceMethod.deleteCheckProducts(deleteObj, function (result) {
                if (cb) cb(result);
            });
        },

    });


})(jQuery);
