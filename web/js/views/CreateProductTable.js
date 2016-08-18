/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    $(function () {
    app.views.CreateProductTable = Backbone.View.extend({

        el: '#CreateStockTable',

        initialize: function () {
            //this.el = $(this.el);
            this.collection.on('add', this.addOne, this);
            this.collection.on('reset', this.resetProduct, this);
        },

        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function () {


            this.$el.find('.CreateProductTableTr').remove();
            this.collection.each(this.addOne, this);
            return this;
        },

        addOne: function (product) {
            var productView = new app.views.CreateProductTableTr({ model: product });
            var productEl = productView.render().el;

            this.$el.find('.lastTr').removeClass('lastTr');

            $(productEl).addClass('lastTr');

            this.$el.find('tbody').append(productEl);
        },
        resetProduct: function (product) {

            this.render();
        }
    });
});
})(jQuery);
