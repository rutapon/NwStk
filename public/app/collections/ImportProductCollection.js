/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/// <reference path="../../lib/backbone/backbone.js" />


var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    // Person Model
    app.collections.ImportProductCollection = Backbone.Collection.extend({
        model: app.models.ImportProductModel,

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
        }
    });


})(jQuery);
