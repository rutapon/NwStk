/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    $(function () {
        app.views.ShowProduct = Backbone.View.extend({

            // Instead of generating a new element, bind to the existing skeleton of
            // the App already present in the HTML.
            el: '#showItem',

            // Delegated events for creating new items, and clearing completed ones.
            events: {
                'keyup .show_product_search': 'search',
                'change .show_product_search': 'search',
                'click #downLoadProductFile': 'downLoadProductFile'
            },

            initialize: function () {

                this.collection.comparator = function (model) {
                    return model.get('code');
                }

                //this.CreateProductTable = new app.views.CreateProductTable({ collection: this.collection }).render();

                var allProductTable = new Backgrid.Grid({
                    columns: [
                    //    {

                    //    // name is a required parameter, but you don't really want one on a select all column
                    //    name: "",

                    //    // Backgrid.Extension.SelectRowCell lets you select individual rows
                    //    cell: "select-row",

                    //    // Backgrid.Extension.SelectAllHeaderCell lets you select all the row on a page
                    //    headerCell: "select-all",

                    //},
                    {
                        name: "code",
                        label: "Code",
                        cell: "string",
                        editable: false
                    },
                    {
                        name: "nameTh",
                        label: "DescriptionTh",
                        cell: "string",
                        editable: false
                    },
                     {
                         name: "nameEn",
                         label: "DescriptionEn",
                         cell: "string",
                         editable: false
                     },
                    {
                        name: "unit_type",
                        label: "UnitType",
                        cell: "string",
                        editable: false
                    },
                    //{
                    //    name: "unit_size",
                    //    label: "ขนาด",
                    //    cell: "string",
                    //    editable: false
                    //},
                     {
                         name: "supplier1",
                         label: "Supplier1",
                         cell: "string",
                         editable: false
                     },
                     {
                         name: "unit_price1",
                         label: "Price1",
                         cell: "string",
                         editable: false
                     },

                      {
                          name: "supplier2",
                          label: "Supplier2",
                          cell: "string",
                          editable: false
                      },
                     {
                         name: "unit_price2",
                         label: "Price2",
                         cell: "string",
                         editable: false
                     },

                      {
                          name: "supplier3",
                          label: "Supplier3",
                          cell: "string",
                          editable: false
                      },
                     {
                         name: "unit_price3",
                         label: "Price3",
                         cell: "string",
                         editable: false
                     },
                     {
                         name: "description",
                         label: "Remark",
                         cell: "string",
                         editable: false
                     },
                     //{
                     //    name: "edit",
                     //    label: "edit",
                     //    cell: Backgrid.SelectCell.extend({
                     //        // It's possible to render an option group or use a
                     //        // function to provide option values too.
                     //        optionValues: [["Male", "m"], ["Female", "f"]]
                     //    })
                     //}
                    ],

                    collection: this.collection
                });

                $("#select-all-result").append(allProductTable.render().el);
            },

            // Re-rendering the App just means refreshing the statistics -- the rest
            // of the app doesn't change.
            render: function () {

            },

            downLoadProductFile: function () {

                this.collection.saveToXlsx(this.model.stockModel.get('stock_selected') + "#" + this.$el.find('.show_product_search').val());
            },

            showAllProduct: function () {
                var self = this;
                var stockSelected = this.model.stockModel.get('stock_selected'); //$('.select-stock  option:selected').select().text();
                app.serviceMethod.getAllProducts(stockSelected, function (result) {
                    self.resetFromService(result, stockSelected);
                });
            },
            resetFromService: function (result, stockSelected) {
                var self = this;
                self.collection.reset(result);

                //for (var i in result) {
                //    result[i]['stock_name'] = stockSelected;
                //    result[i]['id_instock'] = result[i]['id'];
                //    delete result[i]['id'];
                //    //$('body').append(JSON.stringify(result[i]) + '<br>');
                //    self.collection.add(result[i]);
                //}
            },
            search: function (ev) {
                var searchText = this.$el.find('.show_product_search').val();// $(ev.target).val();
                if (searchText) {
                    var self = this;
                    var stockSelected = this.model.stockModel.get('stock_selected'); //$('.select-stock  option:selected').select().text();

                    console.log(searchText + ' product ' + stockSelected);

                    app.serviceMethod.findeProductStartWith(stockSelected, searchText, 100, function (result) {
                        self.resetFromService(result, stockSelected);
                    });
                } else {
                    this.showAllProduct();
                }
            }
        });
    });

})(jQuery);
