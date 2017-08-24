/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/// <reference path="../../lib/backbone/backbone.js" />


var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    // Person Model
    app.models.SupplierModel = Backbone.Model.extend({
        defaults: {
            code: '',
            name: '',
            address: '',
            credit: 0
        },

        //initialize: function () {
        //    console.log(this.attributes);             
        //},

        validate: function (attrs, options) {

            if (!attrs.code || !attrs.name || isNaN(attrs.credit)) {

                //alert(" ข้อมูลไม่ครบหรือผิดพลาด \n To err is human, but so, too, is to repent for those mistakes and learn from them.");
                alert("validate false -> (!attrs.code || !attrs.name) ");

                return "false";
            }
        },
        save: function (cb) {
            var self = this;
            app.serviceMethod.checkDuplicateSupplier({ code: self.attributes.code, name: self.attributes.name }, function (result) {
                console.log('checkDuplicateSupplier', result);
                if (!result) {

                    app.serviceMethod.insertSupplier(self.attributes, function (insertresult) {
                        if (cb) cb(insertresult);
                    });
                } else {
                    if (cb) cb(false);
                }
            });
        },
        update: function (cb) {
            //var self = this;

            app.serviceMethod.updateSupplier(this.attributes, function (result) {

                if (cb) cb(result);
            });
        },
        destroy: function (cb) {

            app.serviceMethod.deleteSupplier(this.attributes.code, function (result) {
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
