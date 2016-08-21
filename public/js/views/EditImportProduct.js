/// <reference path="../../lib/underscore/underscore.js" />
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


    app.views.EditImportProduct = Backbone.View.extend({

        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        //el: '#showProductNav',

        // Delegated events for creating new items, and clearing completed ones.
        events: {

            'click .SelectProductPopUpButton': 'SelectProductPopUpButtonClick',

            //'keyup .select_product_search': 'search',
            //'change .select_product_search': 'search',
            //'click .selectClick': 'selectClick',
            //'click .cancelClick': 'cancelClick',

            'click .ClearNewProductRow': 'clearNewProductRowClick',
            'click .SaveImportProduct': 'saveImportProductClick'
        },
        initialize: function () {

            var self = this;

         
            // selectImportProductTable = $(".select-result");
            this.select_product_search = this.$el.find('.select_product_search');

            var stockModel = this.model.get('stockModel');
            var importProductCollection = this.importProductCollection = this.model.get('importProductCollection');

          
            var supplyLogCollection = new app.collections.SupplyLogCollection();


            self.$el.find(".select-stock").bind("change", function (event, ui) {
                var stockSelected = self.$el.find('.select-stock option:selected').select().text();
                console.log('stock_selected', stockSelected);
                stockModel.set('stock_selected', stockSelected);
            });

            stockModel.on('change:stock', function (model, stock) {

                if (stock.length > 0) {
                    self.$el.find('.select-stock option').remove();
                    _.each(stock, function (item) {
                        self.$el.find('.select-stock').append('<option>' + item + '</option>');
                        self.$el.find('.select-stock').trigger("change");
                    });
                }
            });

            //stockModel.on('change:stock_selected', function (model, stock_selected) {
            //    //viewSelectProduct.clear();
            //});

        },

        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function () {

        },
        SelectProductPopUpButtonClick: function () {
            $("#popupSelectProduct").popup('open', { transition: 'pop' });

            $("#popupSelectProduct .select_product_search").focus();
        },

        //search: function (ev) {
        //    var searchText = this.select_product_search.val();// $(ev.target).val();

        //    if (searchText) {
        //        var self = this;
        //        var stockSelected = this.stockModel.get('stock_selected'); //$('.select-stock  option:selected').select().text();
        //        console.log(searchText + ' product ' + stockSelected);

        //        app.stockMethod.findeProductStartWith(stockSelected, searchText, 100, function (result) {
        //            self.resetFromService(result, stockSelected);
        //        });
        //    } else {
        //        this.collection.reset();
        //    }
        //},
        clearNewProductRowClick: function () {
            this.importProductCollection.reset();
        },
        saveImportProductClick: function () {
            var self = this;
            var stockModel = this.model.get('stockModel');
            var numSave = 0;
            areYouSure("Are you sure?", "Save data to server?", "Ok", function () {
                //console.log(self.importProductCollection.toArray());
                var numSave = 0;
                async.eachSeries(self.importProductCollection.toArray(), function (model, callback) {
                    model.save(stockModel.get('stock_selected'), function () {
                        numSave++;
                        self.importProductCollection.remove(model);
                        callback();
                    });
                },
                function (err) {

                    if (err) {
                        //alert(err);
                    } else {
                        self.ClearNewProductRow();
                    }

                    alert('Data has save to stock "' + stockSelectedName + '" ' + numSave + ' row');
                });

                //self.importProductCollection.forEach(function (model) {
                //    //console.log(model.toJSON());

                //    model.save(stockModel.get('stock_selected'), function () {

                //    });

                //});
            });
        }
    });

})(jQuery);
