/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/// <reference path="../../lib/backbone/backbone.js" />


var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    app.collections.ExportProductCollection = Backbone.Collection.extend({
        model: app.models.ExportProductModel,

        saveToServer: function (stock_selected, cb) {
            var self = this;
            var numSave = 0;
            async.eachSeries(self.toArray(), function (model, callback) {
                model.save(stock_selected, function () {
                    numSave++;
                    self.remove(model);
                    callback();
                });
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
    });


})(jQuery);
