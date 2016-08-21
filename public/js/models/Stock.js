/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/// <reference path="../../lib/backbone/backbone.js" />


var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    // Person Model
    app.models.Stock = Backbone.Model.extend({
        defaults: {
            stock: [],
            stock_selected: ""
        },
        //,
        //removeUi: function () {
        //    alert('trigger remove');

        //    this.trigger('removeUi', this);
        //}
        
        update: function (cb) {
            var self = this;
            app.stockMethod.getAllStockName(function myfunction(result) {
                self.set('stock', result);

                if (cb) cb(result);
            });
        }
    });

})(jQuery);
