/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/// <reference path="../../lib/backbone/backbone.js" />


var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    // Person Model
    app.models.ExportProductModel = Backbone.Model.extend({
        defaults: {
            code: '',
            //name: '', unit_type: '', unit_size: '', description: '',
            //product_id: '',
            //supplier_code: '',
            //unit_price: '',
            unit: null,
            requisition_id: '',
            out_date: '',
            //sum: 0,
            job: '',
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
           
            if (_.isEmpty(this.attributes.out_date)) {
                this.attributes.out_date = new Date().toISOString().slice(0, 10);
            }

        },

        //supplierNameChange:function () {

        //},

        validate: function (attrs, options) {
            if (!attrs.code || !attrs.stock_name || !attrs.requisition_id || !attrs.unit) {

                //alert("validate false -> (!attrs.code || !attrs.name || !attrs.unit) ");
                //alert("ข้อมูลไม่ครบ");
                alert("ข้อมูลไม่ครบ \n In item code:"+attrs.code);
                
                //alert("To err is human, but so, too, is to repent for those mistakes and learn from them. ข้อมูลไม่ครบ");

                return "false";
            }
        },
        save: function (stockName, cb) {

            var self = this;
            var dataObj = this.attributes;//_.extend(this.attributes, { stockName: stockName });

            app.serviceMethod.checkDuplicateExportProduct(dataObj, function (result) {
                if (!result) {
                    app.serviceMethod.insertExportProduct(dataObj, function (result) {

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
                        if (cb) cb(result);
                        //});
                    });
                } else {
                    if (cb) cb(false, 'Product is duplicate.');//\n\n' + JSON.stringify(checkDuplicateObj)
                }
            })  
        },
        update: function (cb) {

            //console.log(this.changedAttributes());

            app.serviceMethod.updateExportProduct(this.attributes, function (result) {
                if (cb) cb(result);
            });
        },
        destroy: function (cb) {

            app.serviceMethod.removeExportProduct({ _id: this.attributes._id, stock_name: this.attributes.stock_name }, function (result) {
                if (cb) cb(result);
            });
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
