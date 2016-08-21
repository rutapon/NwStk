/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/// <reference path="../../lib/backbone/backbone.js" />


var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    // Person Model
    app.models.product = Backbone.Model.extend({
        defaults: {
            code: '', name: '', unit_type: '', unit_size: '', description: '',
            create_by: 'admin', stock_name: '',
            supplier_name_default: '', unit_price_default: 0
        },

        //initialize: function () {
        //    console.log(this.attributes);             
        //},

        validate: function (attrs, options) {
            if (!attrs.code || !attrs.name) {

                //alert("validate false -> (!attrs.code || !attrs.name) ");
                alert("To err is human, but so, too, is to repent for those mistakes and learn from them. ข้อมูลไม่ครบ");

                return "false";
            }
        },
        save: function (stockName, cb) {

            var self = this;
            app.stockMethod.insertProduct(stockName, this.attributes, function (result) {

                var dataObj = {
                    stockName: stockName,
                    //product_id: result,
                    code: self.attributes.code,
                    supplier_name: self.attributes.supplier_name_default,
                    unit_price: self.attributes.unit_price_default,
                    create_by: 'admin'
                }

                app.stockMethod.checkForInsertSupplyLog(dataObj, function (result) {
                    if (cb) cb(result);
                })
            });
        },
        update: function (cb) {
            var self = this;
            var stockName = this.attributes.stock_name;
            app.stockMethod.updateProduct(this.attributes.stock_name, this.attributes, function (result) {
                var dataObj = {
                    stockName: stockName,
                    code: self.attributes.code,
                    supplier_name: self.attributes.supplier_name_default,
                    unit_price: self.attributes.unit_price_default,
                    create_by: 'admin'
                }

                app.stockMethod.checkForInsertSupplyLog(dataObj, function (result) {
                    if (cb) cb(result);
                })
            });
        },
        destroy: function (cb) {

            app.stockMethod.deleteProduct(this.attributes.stock_name, this.attributes.code, function (result) {
                if (cb) cb(result);
            });

        },

        isEmty: function () {
            var attrs = this.attributes;
            return !(attrs.code || attrs.name || attrs.unit_type || attrs.description);
        }
        //,
        //removeUi: function () {
        //    alert('trigger remove');

        //    this.trigger('removeUi', this);
        //}
    });

})(jQuery);
