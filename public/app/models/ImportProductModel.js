/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/// <reference path="../../lib/backbone/backbone.js" />


var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';
    function precision(a, precision) {
        var x = Math.pow(10, precision || 2);
        return (Math.round(a * x)) / x;
    }
    // Person Model
    app.models.ImportProductModel = Backbone.Model.extend({
        defaults: {
            code: '',
            //name: '', unit_type: '', unit_size: '', description: '',
            //product_id: '',
            supplier_code: '',
            unit_price: '',
            unit: null,
            invoid_id: '',
            in_date: '',
            sum: 0,
            stock_name: '',
            remark: null,
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
                //this.setLastInvoidId();
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

            var sum = this.attributes.unit * this.attributes.unit_price;
            sum = precision(sum)
            this.set('sum', sum);
        },

        //supplierNameChange:function () {

        //},

        validate: function (attrs, options) {
            console.log('validate', options);
            // if (!attrs.code || !attrs.stock_name || !attrs.unit_price || !attrs.unit || !attrs.invoid_id || !attrs.sum) {
            var isInvalid = !attrs.code || !attrs.stock_name || !attrs.invoid_id;

            if (!isInvalid && attrs.stock_name.split('-')[0] != 'OE') {
                isInvalid = isInvalid || !attrs.unit || !attrs.unit_price;
            }

            if (isInvalid) {

                //alert("validate false -> (!attrs.code || !attrs.name || !attrs.unit || !attrs.unit_price) ");
                alert("ข้อมูลไม่ครบ");

                //alert(" ข้อมูลไม่ครบหรือผิดพลาด \n To err is human, but so, too, is to repent for those mistakes and learn from them.");

                return "false";
            }
        },
        save: function (stockName, cb) {

            var self = this;
            var dataObj = this.attributes;// _.extend(this.attributes, { stockName: stockName });
            var checkDuplicateObj = { stock_name: stockName, code: self.attributes.code, invoid_id: self.attributes.invoid_id };
            app.serviceMethod.checkDuplicateImportProduct(checkDuplicateObj, function (result) {
                if (!result) {
                    app.serviceMethod.insertImportProduct(dataObj, function (result) {

                        if (self.supplier_default != self.attributes.supplier_code ||
                            self.unit_price_default != self.attributes.unit_price) {

                            var productModel = self.getProductModel();
                            productModel.updateOnly();
                        }

                        //var dataObj = {
                        //    product_code: self.attributes.code,
                        //    supplier_code: self.attributes.supplier_code,
                        //    unit_price: self.attributes.unit_price,
                        //    stock_name: stockName
                        //}
                        //var supplyLogModel = new app.models.SupplyLogModel(dataObj);
                        //supplyLogModel.checkAndUpdate(function () {
                        //    if (cb) cb(result);
                        //});

                        if (cb) cb(result);
                    });

                } else {
                    if (cb) cb(false, 'Product is duplicate.');//\n\n' + JSON.stringify(checkDuplicateObj)
                }
            });
        },
        update: function (cb) {

            //console.log(this.changedAttributes());

            app.serviceMethod.updateImportProduct(this.attributes, function (result) {
                if (cb) cb(result);
            });
        },
        setLastInvoidId: function (cb) {
            var self = this;
            var stock_name = this.attributes.stock_name;
            var code = this.attributes.code;
            var supplier_code = this.attributes.supplier_code;

            app.serviceMethod.getLastImportProduct({ stock_name: stock_name, code: code, supplier_code: supplier_code }, function (result) {
                //console.log(result);
                //self.reset(result);
                if (result && result.invoid_id) {
                    self.set('invoid_id', result.invoid_id);
                }

                if (cb) cb(result.invoid_id);
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

            var productDataField = [
                'code',
                'name',
                'unit_type',
                'description',
                'stock_name',
                'supplier_default',
                'unit_price_default',
                'supplier1',
                'unit_price1',
                'supplier2',
                'unit_price2',
                'supplier3',
                'unit_price3'
            ];


            var obj = _.pick(this.attributes, productDataField);

            obj.supplier_default = this.attributes.supplier_code;
            obj.unit_price_default = this.attributes.unit_price;

            //var obj = {
            //    code: this.attributes.code,
            //    name: this.attributes.name,
            //    unit_type: this.attributes.unit_type,
            //    description: this.attributes.description,
            //    stock_name: this.attributes.stock_name,
            //    supplier_default: this.attributes.supplier_code,
            //    unit_price_default: this.attributes.unit_price,
            //    'supplier1': this.attributes.supplier1,
            //    'unit_price1': this.attributes.unit_price1,
            //    'supplier2': this.attributes.supplier2,
            //    'unit_price2': this.attributes.unit_price2,
            //    'supplier3': this.attributes.supplier3,
            //    'unit_price3': this.attributes.unit_price3
            //};

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
