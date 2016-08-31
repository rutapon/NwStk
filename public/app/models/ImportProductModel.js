/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/// <reference path="../../lib/backbone/backbone.js" />


var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    // Person Model
    app.models.ImportProductModel = Backbone.Model.extend({
        defaults: {
            code: '',
            //name: '', unit_type: '', unit_size: '', description: '',
            //product_id: '',
            supplier_code: '',
            unit_price: '',
            unit: 1,
            invoid_id: '',
            in_date: '',
            sum: 0,
            stock_name: ''
        },

        initialize: function () {
            //console.log('initialize ImportProductModel');
            this.on('change:unit', this.calSum, this).on('change:unit_price', this.calSum, this);

            //this.on('change:supplier_name', this.supplierNameChange, this);
            //alert('initialize');
            //this.set('in_date', new Date().toISOString().slice(0, 10));
            //this.attributes.product_id = this.attributes.id;
            //this.attributes.code = this.attributes.code;

            if (this.attributes.supplier_default) {

                delete this.attributes._id;

                this.attributes.supplier_code = this.attributes.supplier_default;
                this.attributes.unit_price = this.attributes.unit_price_default;
            }

            //delete this.attributes.supplier_default;
            //delete this.attributes.unit_price_default;

            //console.log(this.attributes);

            if (_.isEmpty(this.attributes.in_date)) {
                this.attributes.in_date = new Date().toISOString().slice(0, 10);
            }

            this.calSum();
        },

        calSum: function () {

            this.attributes.sum = this.attributes.unit * this.attributes.unit_price;
        },

        //supplierNameChange:function () {

        //},

        validate: function (attrs, options) {
            if (!attrs.code || !attrs.stock_name || !attrs.unit_price || !attrs.unit || !attrs.sum) {

                //alert("validate false -> (!attrs.code || !attrs.name) ");
                alert("To err is human, but so, too, is to repent for those mistakes and learn from them. ข้อมูลไม่ครบ");

                return "false";
            }
        },
        save: function (stockName, cb) {

            var self = this;
            var dataObj = _.extend(this.attributes, { stockName: stockName });

            app.serviceMethod.insertImportProduct(dataObj, function (result) {

                if (self.supplier_default != self.attributes.supplier_code ||
                    self.unit_price_default != self.attributes.unit_price) {

                    var productModel = self.getProductModel();
                    productModel.updateOnly();
                }

                var dataObj = {
                    product_code: self.attributes.code,
                    supplier_code: self.attributes.supplier_code,
                    unit_price: self.attributes.unit_price,
                    stock_name: stockName
                }
                var supplyLogModel = new app.models.SupplyLogModel(dataObj);
                supplyLogModel.checkAndUpdate(function () {
                    if (cb) cb();
                });
            });
        },
        update: function (cb) {

            //console.log(this.changedAttributes());

            app.serviceMethod.updateImportProduct(this.attributes, function (result) {
                if (cb) cb(result);
            });
        },
        destroy: function (cb) {

            app.serviceMethod.removeImportProduct({ _id: this.attributes._id, stock_name: this.attributes.stock_name }, function (result) {
                if (cb) cb(result);
            });
        },

        isEmty: function () {
            var attrs = this.attributes;
            return !(attrs.code);
        },
        getProductModel: function () {
            var obj = {
                code: this.attributes.code,
                name: this.attributes.name,
                unit_type: this.attributes.unit_type,
                description: this.attributes.description,
                stock_name: this.attributes.stock_name,
                supplier_default: this.attributes.supplier_code,
                unit_price_default: this.attributes.unit_price
            };
            //console.log('getProductModel', this.attributes, obj);
            return new app.models.product(obj);
        }

        //,
        //removeUi: function () {
        //    alert('trigger remove');

        //    this.trigger('removeUi', this);
        //}
    });

})(jQuery);
