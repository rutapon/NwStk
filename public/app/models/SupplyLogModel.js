/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/// <reference path="../../lib/backbone/backbone.js" />


var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    // Person Model
    app.models.SupplyLogModel = Backbone.Model.extend({
        defaults: {
            //product_id: '',
            product_code: '',
            supplier_code: '',
            unit_price: 0
        },

        //initialize: function () {
        //    console.log(this.attributes);             
        //},

        validate: function (attrs, options) {

            if (!attrs.product_code || !attrs.supplier_code || isNaN(attrs.unit_price)) {

                alert(" ข้อมูลไม่ครบหรือผิดพลาด \n To err is human, but so, too, is to repent for those mistakes and learn from them.");
                //alert("validate false -> (!attrs.code || !attrs.name) ");
                return "false";
            }
        },

        checkAndUpdate: function (cb) {
            app.serviceMethod.checkForInsertSupplyLog(this.attributes, function (result) {
                if (cb) cb(result);
            })
        },
  
        save: function (cb) {

            //var self = this;

        },
        update: function (cb) {
            //var self = this;


        },
        destroy: function (cb) {


        },

        isEmty: function () {
            var attrs = this.attributes;
            return !(attrs.product_code || attrs.supplier_code || attrs.unit_price);
        }
        //,
        //removeUi: function () {
        //    alert('trigger remove');

        //    this.trigger('removeUi', this);
        //}
    });

})(jQuery);
