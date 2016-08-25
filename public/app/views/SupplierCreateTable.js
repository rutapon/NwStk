/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    $(function () {
        app.views.SupplierCreateTable = Backbone.View.extend({

        el: '#CreateTable',

        initialize: function () {
            //this.el = $(this.el);
            this.collection.on('add', this.addOne, this);
            this.collection.on('reset', this.resetSupplier, this);
        },

        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function () {

            this.$el.find('.CreateTableTr').remove();
            this.collection.each(this.addOne, this);
            return this;
        },

        addOne: function (supplier) {
            var supplierView = new app.views.SupplierCreateTableTr({ model: supplier });
            var supplierEl = supplierView.render().el;
            this.$el.find('.lastTr').removeClass('lastTr');
            $(supplierEl).addClass('lastTr');
            this.$el.find('tbody').append(supplierEl);
        },
        resetSupplier: function (supplier) {

            this.render();
        }
    });
});
})(jQuery);
