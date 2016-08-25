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
            invoid_id: '',
            supplier_code: '',
            unit: 1,
            unit_price: '',
            in_date: '',
            sum: 0,
            create_by: 'admin',
            stock_name: ''
        },

        initialize: function () {
            this.on('change:unit', this.calSum, this).on('change:unit_price', this.calSum, this);

            //this.on('change:supplier_name', this.supplierNameChange, this);
            //alert('initialize');
            //this.set('in_date', new Date().toISOString().slice(0, 10));
            //this.attributes.product_id = this.attributes.id;
            this.attributes.code = this.attributes.code;

            delete this.attributes.id;

            this.attributes.supplier_code = this.attributes.supplier_default;
            this.attributes.unit_price = this.attributes.unit_price_default;

            delete this.attributes.supplier_default;
            delete this.attributes.unit_price_default;

            //console.log(this.attributes);
            this.attributes.in_date = new Date().toISOString().slice(0, 10);

            this.calSum();
        },

        calSum: function () {
            this.attributes.sum = this.attributes.unit * this.attributes.unit_price;
        },

        //supplierNameChange:function () {

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
            var dataObj = _.extend(this.attributes, { stockName: stockName });

            app.serviceMethod.insertImportProduct(dataObj, function (result) {

                var supplyLogObj = {
                    stockName: stockName,
                    //product_id: self.attributes.product_id,
                    code: self.attributes.code,
                    supplier_name: self.attributes.supplier_name,
                    unit_price: self.attributes.unit_price,
                    create_by: 'admin'
                }

                app.serviceMethod.checkForInsertSupplyLog(supplyLogObj, function (result) {
                    if (cb) cb(result);
                })
            });
        },
        update: function (cb) {

            //app.serviceMethod.updateProduct(this.attributes.stock_name, this.attributes, function (result) {
            //    if (cb) cb(result);
            //});
        },
        destroy: function (cb) {

            //app.serviceMethod.deleteProduct(this.attributes.stock_name, this.id, function (result) {
            //    if (cb) cb(result);
            //});
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
