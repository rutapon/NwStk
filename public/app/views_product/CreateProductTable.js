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

                this.supplierCollection = new app.collections.SupplierCollection();
                this.supplierCollection.getAll();

                this.collection.on('add', this.addOne, this);
                this.collection.on('reset', this.resetProduct, this);


                this.$el.tableHeadFixer();
            },

            // Re-rendering the App just means refreshing the statistics -- the rest
            // of the app doesn't change.
            render: function () {

                //this.$el.find('.CreateProductTableTr').remove();
                this.collection.each(this.addOne, this);
                return this;
            },

            addOne: function (product) {
                var productView = new app.views.CreateProductTableTr({ model: product, collection: this.supplierCollection });
                var productEl = productView.render().el;

                this.$el.find('.lastTr').removeClass('lastTr');

                $(productEl).addClass('lastTr');

                this.$el.find('tbody').append(productEl);
            },
            resetProduct: function (col, opts) {
                _.each(opts.previousModels, function (model) {
                    model.trigger('remove');
                });
                this.render();
            }
        });
    });
})(jQuery);
