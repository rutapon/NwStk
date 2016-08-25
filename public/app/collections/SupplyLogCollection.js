/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/// <reference path="../../lib/backbone/backbone.js" />

var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    // Person Model
    app.collections.SupplyLogCollection = Backbone.Collection.extend({

        //model: Backbone.Model.extend({
        //    defaults: {
        //        //product_id: '',
        //        code:'',
        //        supplier_code: '',
        //        unit_price: '',
        //        create_by: 'admin', stock_name: ''
        //    }
        //}),
        model: app.models.SupplyLogModel,

        find: function (product_code, stockSelected, cb) {//product_id
            var self = this;
            app.serviceMethod.findeSupplyLog({ stock_name: stockSelected, product_code: product_code }, function (result) {
                if (result.length) {
                    self.reset(result);
                    if (cb) cb(result);
                }
                else {
                    app.serviceMethod.getAllSupplyLog({ stock_name: stockSelected }, function (result) {
                        console.log('getAllSupplyLog');
                        self.reset(result);
                        if (cb) cb(result);
                    });
                }
            });
        },
        findeSupplyLog: function (product_code, stockSelected, cb) {
            var self = this;
            app.serviceMethod.findeSupplyLog({ stock_name: stockSelected, product_code: product_code }, function (result) {
                self.reset(result);
                if (cb) cb(result);
            });
        },
        getAll: function (stockSelected, cb) {
            var self = this;
            app.serviceMethod.getAllSupplyLog({ stock_name: stockSelected }, function (result) {
                console.log('getAllSupplyLog');
                self.reset(result);
                if (cb) cb(result);
            });
        },
        getLastSupplyLog: function (product_code, supplier_code, stockSelected, cb) {
           
            var objDdata = {
                stock_name: stockSelected,
                product_code: product_code,
                supplier_code: supplier_code
            };
        
            app.serviceMethod.getLastSupplyLog(objDdata, function (result) {
                //console.log('getLastSupplyLog', result);
                if (result) {
                    if (cb) cb(new app.models.SupplyLogModel(result));
                } else {
                    if (cb) cb(result);
                }
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
