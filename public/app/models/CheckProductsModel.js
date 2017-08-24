/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/// <reference path="../../lib/backbone/backbone.js" />


var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    // Person Model
    app.models.CheckProductsModel = Backbone.Model.extend({
        defaults: {
            code: '',
            unit: '',
            check_date: '',
            stock_name: ''
        },

        initialize: function () {

            //this.on('change:unit', this.calSum, this).on('change:unit_price', this.calSum, this);

            //this.on('change:supplier_name', this.supplierNameChange, this);
            //alert('initialize');
            //this.set('in_date', new Date().toISOString().slice(0, 10));
            //this.attributes.product_id = this.attributes.id;
            //this.attributes.code = this.attributes.code;

            //delete this.attributes.supplier_default;
            //delete this.attributes.unit_price_default;

            //console.log(this.attributes);

            if (_.isEmpty(this.attributes.check_date)) {
                this.attributes.check_date = new Date().toISOString().slice(0, 10);
            }

        },

        //supplierNameChange:function () {

        //},

        validate: function (attrs, options) {
            if (!attrs.code || !attrs.stock_name || !_.isNumber(attrs.unit)) {

                alert("validate false -> (!attrs.code || !attrs.name) ");
                //alert("To err is human, but so, too, is to repent for those mistakes and learn from them. ข้อมูลไม่ครบ");

                return "false";
            }
        },
        save: function (stockName, cb) {

            var self = this;
            var dataObj = this.attributes;
            console.log(dataObj);
            app.serviceMethod.insertCheckProduct(dataObj, function (result) {

                //if (self.supplier_default != self.attributes.supplier_code ||
                //    self.unit_price_default != self.attributes.unit_price) {

                //    var productModel = self.getProductModel();
                //    productModel.updateOnly();
                //}

                //var dataObj = {
                //    product_code: self.attributes.code,
                //    supplier_code: self.attributes.supplier_code,
                //    unit_price: self.attributes.unit_price,
                //    stock_name: stockName
                //}
                //var supplyLogModel = new app.models.SupplyLogModel(dataObj);
                //supplyLogModel.checkAndUpdate(function () {
                if (cb) cb();
                //});
            });
        },
        update: function (cb) {

            //console.log(this.changedAttributes());

            app.serviceMethod.updateExportProduct(this.attributes, function (result) {
                if (cb) cb(result);
            });
        },
        destroy: function (cb) {

            //app.serviceMethod.removeExportProduct({ _id: this.attributes._id, stock_name: this.attributes.stock_name }, function (result) {
            //    if (cb) cb(result);
            //});
        },

        isEmty: function () {
            var attrs = this.attributes;
            return !(attrs.code);
        }

        //,
        //removeUi: function () {
        //    alert('trigger remove');

        //    this.trigger('removeUi', this);
        //}
    });

})(jQuery);
