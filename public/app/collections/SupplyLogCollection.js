/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/// <reference path="../../lib/backbone/backbone.js" />

var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    // Person Model
    app.collections.SupplyLogCollection = Backbone.Collection.extend({

        model: Backbone.Model.extend({
            defaults: {
                //product_id: '',
                code:'',
                supplier_name: '',
                unit_price: '',
                create_by: 'admin', stock_name: ''
            }
        }),

        find: function (code, stockSelected, cb) {//product_id
            var self = this;
            app.serviceMethod.findeSupplyLog({ stockName: stockSelected, code: code }, function (result) {
                if (result.length) {
                    self.reset(result);
                    if (cb) cb(result);
                } 
                else {
                    app.serviceMethod.getAllSupplyLog({ stockName: stockSelected }, function (result) {
                        console.log('getAllSupplyLog');
                        self.reset(result);
                        if (cb) cb(result);
                    });
                }
            });
        },
        findeSupplyLog: function (code, stockSelected, cb) {
            var self = this;
            app.serviceMethod.findeSupplyLog({ stockName: stockSelected, code: code }, function (result) {
                self.reset(result);
                if (cb) cb(result);
            });
        },
        getAll: function (stockSelected, cb) {
            var self = this;
            app.serviceMethod.getAllSupplyLog({ stockName: stockSelected }, function (result) {
                console.log('getAllSupplyLog');
                self.reset(result);
                if (cb) cb(result);
            });
        },
        checkForInsert: function (dataObj, stockSelected, cb) {
            dataObj.stockName = stockSelected;
            app.serviceMethod.checkForInsertSupplyLog(dataObj, function (result) {
                if (cb) cb(result);
            })
        }
    });

})(jQuery);
