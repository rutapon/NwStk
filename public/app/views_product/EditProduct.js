/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    function areYouSure(text1, text2, button, callback) {
        console.log('areYouSure');
        $("#sure .sure-1").text(text1);
        $("#sure .sure-2").text(text2);
        $("#sure .sure-do").text(button).on("click", function () {
            callback();
            $(this).off("click");
        });
        $("#sure").popup('open');
    }

    $(function () {
        app.views.EditProduct = Backbone.View.extend({

            // Instead of generating a new element, bind to the existing skeleton of
            // the App already present in the HTML.
            el: '#editItem',

            // Delegated events for creating new items, and clearing completed ones.
            events: {
                'keyup .show_product_search': 'search',
                'click .editAllButton': 'editAllButtonClick',
                'click .saveAllButton': 'saveAllButtonClick',
                //'change .show_product_search': 'search',
            },

            initialize: function () {
                this.collection.on('add', this.addOne, this);
                this.collection.on('reset', this.resetProduct, this);

                this.supplierCollection = new app.collections.SupplierCollection();
                this.supplierCollection.getAll();

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
            showAllProduct: function (cb) {
                var self = this;
                var stockSelected = this.model.stockModel.get('stock_selected'); //$('.select-stock  option:selected').select().text();
                app.serviceMethod.getAllProducts(stockSelected, function (result) {
                    //console.log(result);
                    _.each(result, function (item) {
                        item['stock_name'] = stockSelected;
                    });

                    self.resetFromService(result, stockSelected);
                    if (cb) cb();

                    //self.$el.find('table').table("refresh");
                });
            },
            resetFromService: function (result, stockSelected) {
                var self = this;
                self.collection.reset(result);
            },
            search: function (ev) {
                var self = this;
                var searchText = this.$el.find('.show_product_search').val();
                if (searchText) {

                    var stockSelected = this.model.stockModel.get('stock_selected'); //$('.select-stock  option:selected').select().text();
                    app.serviceMethod.findeProductStartWith(stockSelected, searchText, 100, function (result) {

                        _.each(result, function (item) {
                            item['stock_name'] = stockSelected;
                        });

                        self.resetFromService(result, stockSelected);
                        self.$el.find("#EditProductTable").tableHeadFixer({ "left": 1, "right": 2 });
                    });

                } else {
                    this.showAllProduct(function () {
                        self.$el.find("#EditProductTable").tableHeadFixer({ "left": 1, "right": 2 });
                    });
                }

            },

            isEditing: false,
            editAllButtonClick: function () {

                var self = this;

                var theme = $.mobile.loader.prototype.options.theme;
                var msgText = "processing";
                var textVisible = true;
                var textonly = false;
                var html = "";

                $.mobile.loading("show", {
                    text: msgText,
                    textVisible: textVisible,
                    theme: theme,
                    textonly: textonly,
                    html: html
                });

                setTimeout(function () {
                    if (self.isEditing) {

                        self.$el.find('.editAllButton').val('EditAll').button('refresh');
                        self.isEditing = false;
                        self.collection.each(function (productModel) {
                            productModel.trigger('cancelEdit');
                        }, self);

                        $("#EditProductTable").tableHeadFixer({ "left": 1, "right": 2 });

                        $.mobile.loading("hide");
                    } else {

                        self.$el.find('.editAllButton').val('CancelAll').button('refresh');
                        self.isEditing = true;

                        self.collection.each(function (productModel) {
                            productModel.trigger('edit');

                        }, self);

                        $("#EditProductTable").tableHeadFixer({ "left": 1, "right": 2 });
                        $.mobile.loading("hide");
                    }
                }, 500)

            },
            saveAllButtonClick: function () {
                var self = this;
                var numEdit = 0;
                self.collection.each(function (productModel) {
                    if (productModel.isEditing) numEdit++;

                }, self);


                if (numEdit) {
                    areYouSure("Are you sure?", "Save data to server?", "Ok", function () {

                        var theme = $.mobile.loader.prototype.options.theme;
                        var msgText = "processing";
                        var textVisible = true;
                        var textonly = false;
                        var html = "";

                        $.mobile.loading("show", {
                            text: msgText,
                            textVisible: textVisible,
                            theme: theme,
                            textonly: textonly,
                            html: html
                        });


                        async.eachSeries(self.collection.models, function (productModel, callback) {

                            if (productModel.isEditing) {
                                productModel.trigger('saveEdit', function () {
                                    console.log('saveEdit');
                                    callback();
                                });
                            } else {
                                callback();
                            }
                            //console.log(productModel.isEditing);

                        }, function (err) {
                            $("#EditProductTable").tableHeadFixer({ "left": 1, "right": 2 });
                            $.mobile.loading("hide");
                        });
                    });
                }

            },

            addOne: function (product) {
                var productView = new app.views.EditProductTableTr({ model: product, collection: this.supplierCollection });
                var productEl = productView.render().el;
                this.$el.find('tbody').append(productEl);
            },
            resetProduct: function (product) {
                this.render();
            },

        });
    });

})(jQuery);
