/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    $(function () {
        app.views.EditProduct = Backbone.View.extend({

            // Instead of generating a new element, bind to the existing skeleton of
            // the App already present in the HTML.
            el: '#editProductNav',

            // Delegated events for creating new items, and clearing completed ones.
            events: {
                'keyup .show_product_search': 'search',
                'change .show_product_search': 'search',
            },

            initialize: function () {
                this.collection.on('add', this.addOne, this);
                this.collection.on('reset', this.resetProduct, this);
                this.render();
            },

            // Re-rendering the App just means refreshing the statistics -- the rest
            // of the app doesn't change.
            render: function () {

                this.collection.comparator = function (model) {
                    return model.get('code');
                }

                this.$el.find('.EditProductTableTr').remove();
                this.collection.each(this.addOne, this);
                return this;
            },
            showAllProduct: function () {
                var self = this;
                var stockSelected = this.model.stockModel.get('stock_selected'); //$('.select-stock  option:selected').select().text();
                app.serviceMethod.getAllProducts(stockSelected, function (result) {
                    _.each(result, function (item) {
                        item['stock_name'] = stockSelected;
                    });
                    self.resetFromService(result, stockSelected);
                });
            },
            resetFromService: function (result, stockSelected) {
                var self = this;
                self.collection.reset(result);
            },
            search: function (ev) {

                var searchText = this.$el.find('.show_product_search').val();
                if (searchText) {
                    var self = this;
                    var stockSelected = this.model.stockModel.get('stock_selected'); //$('.select-stock  option:selected').select().text();
                    app.serviceMethod.findeProductStartWith(stockSelected, searchText, 100, function (result) {

                        _.each(result, function (item) {
                            item['stock_name'] = stockSelected;
                        });

                        self.resetFromService(result, stockSelected);
                    });

                } else {
                    this.showAllProduct();
                }
            },

            addOne: function (product) {
                var productView = new app.views.EditProductTableTr({ model: product });
                var productEl = productView.render().el;
                this.$el.find('tbody').append(productEl);
            },
            resetProduct: function (product) {
                this.render();
            },

        });
    });

})(jQuery);
