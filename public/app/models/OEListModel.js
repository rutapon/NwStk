/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/// <reference path="../../lib/backbone/backbone.js" />


var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    // Person Model
    app.models.OEListModel = Backbone.Model.extend({
        defaults: {
            OEList: [],
            selected: ""
        },
        //,
        //removeUi: function () {
        //    alert('trigger remove');

        //    this.trigger('removeUi', this);
        //}

        update: function (cb) {
            var self = this;
            var result = app.userModel.getListsName('OE');
            self.set('OEList', result);
            if (cb) cb(result);

            //app.serviceMethod.getAllStockName({}, function (result) {
            //    console.log(result);
            //    self.set('stock', result);
            //    if (cb) cb(result);
            //});
        }
    });

})(jQuery);
