/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/// <reference path="../../lib/backbone/backbone.js" />


var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    // Person Model
    app.models.product = Backbone.Model.extend({
        defaults: {
            code: null,
            name: null,
            nameTh: null,
            nameEn: null,
            unit_type: null,
            //unit_size: '',
            description: null,
            //create_by: 'admin',
            stock_name: null,
            supplier_default: null,
            'supplier1': null,
            'unit_price1': null,
            'supplier2': null,
            'unit_price2': null,
            'supplier3': null,
            'unit_price3': null,
            unit_price_default: null,
            //current_supplier: [],
        },

        //initialize: function () {
        //    console.log(this.attributes);             
        //},

        validate: function (attrs, options) {
            if (!attrs.code || !(attrs.nameTh || attrs.nameEn)) {

                //alert("validate false -> (!attrs.code || !attrs.name) ");
                //alert("ข้อมูลไม่ครบหรือผิดพลาด \n To err is human, but so, too, is to repent for those mistakes and learn from them.");
                alert("validate false");
        
                return "false";
            }
        },
        save: function (stockName, cb) {

            var self = this;
            app.serviceMethod.checkDuplicateProduct({ stock_name: stockName, code: self.attributes.code }, function (result) {
                console.log();
                if (!result) {

                    self.attributes.stock_name = stockName;

                    self.attributes.supplier_default = self.attributes.supplier1;
                    self.attributes.unit_price_default = self.attributes.unit_price1;

                    app.serviceMethod.insertProduct(self.attributes, function (result) {

                        if (self.attributes.unit_price_default && self.attributes.supplier_default) {
                            var dataObj = {
                                product_code: self.attributes.code,
                                supplier_code: self.attributes.supplier_default,
                                unit_price: self.attributes.unit_price_default,
                                stock_name: stockName
                            }

                            var supplyLogModel = new app.models.SupplyLogModel(dataObj);
                            supplyLogModel.checkAndUpdate(function () {
                                if (cb) cb(result);
                            });
                        } else {
                            if (cb) cb(result);
                        }

                        //app.serviceMethod.checkForInsertSupplyLog(dataObj, function (result) {
                        //if (cb) cb(result);
                        //})   

                    });
                } else {
                    if (cb) cb(false);
                }
            });
        },
        update: function (cb) {
            var self = this;
            var stockName = this.attributes.stock_name;

            if (!self.attributes.supplier_default) self.attributes.supplier_default = self.attributes.supplier1;
            if (!self.attributes.unit_price_default) self.attributes.unit_price_default = self.attributes.unit_price1;

            app.serviceMethod.updateProduct(this.attributes, function (result) {

                if (self.attributes.unit_price_default && self.attributes.supplier_default) {
                    var dataObj = {
                        product_code: self.attributes.code,
                        supplier_code: self.attributes.supplier_default,
                        unit_price: self.attributes.unit_price_default,
                        stock_name: stockName
                    }

                    var supplyLogModel = new app.models.SupplyLogModel(dataObj);
                    supplyLogModel.checkAndUpdate(function () {
                        if (cb) cb(result);
                    });
                } else {
                    if (cb) cb(result);
                }

                //app.serviceMethod.checkForInsertSupplyLog(dataObj, function (result) {
                //if (cb) cb(result);
                //})
            });
        },
        updateOnly: function (cb) {
            var self = this;
            var updateObj = _.clone(this.attributes);


            for (var i in updateObj) {
                if (_.isNull(updateObj[i])) {
                    delete updateObj[i];
                }
            }

            app.serviceMethod.updateProduct(updateObj, function (result) {
                if (cb) cb(result);
            });
        },
        destroy: function (cb) {

            app.serviceMethod.deleteProduct(this.attributes.stock_name, this.attributes.code, function (result) {
                if (cb) cb(result);
            });

        },

        isEmty: function () {
            var attrs = this.attributes;
            return !(attrs.code || attrs.nameTh || attrs.nameEn || attrs.unit_type || attrs.description);
        }

        //,
        //removeUi: function () {
        //    alert('trigger remove');

        //    this.trigger('removeUi', this);
        //}
    });

})(jQuery);
