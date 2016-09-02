/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    $(function () {
        app.views.ReportStockLasting = Backbone.View.extend({

            // Instead of generating a new element, bind to the existing skeleton of
            // the App already present in the HTML.
            //el:'#showProductNav',
            // Delegated events for creating new items, and clearing completed ones.
            events: {
                //'keyup .show_product_search': 'search',
                //'change .show_product_search': 'search',
                //'click .SelectProductPopUpButton': 'SelectProductPopUpButtonClick',
                'click #downLoadReportStockLastingFile': 'downLoadReportStockLastingFile'
            },

            initialize: function () {
                var self = this;
                var stockModel = this.model.stockModel;

                stockModel.on('change:stock', function (model, stock) {

                    if (stock.length > 0) {
                        self.$el.find('.select-stock option').remove();
                        _.each(stock, function (item) {
                            self.$el.find('.select-stock').append('<option>' + item + '</option>');
                            self.$el.find('.select-stock').trigger("change");
                        });
                    }
                });

                self.$el.find(".select-stock").bind("change", function (event, ui) {
                    var stockSelected = self.$el.find('.select-stock option:selected').select().text();
                    //console.log('stock_selected', stockSelected);
                    stockModel.set('stock_selected', stockSelected);
                });

                //this.model.selectTimePeriodModel.on('change', function (model) {
                //    self.search();
                //});

                this.collection = new app.collections.ReportCollection();
                this.collection.comparator = function (model) {
                    return model.get('date');
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
                        label: "รหัสสินค้า",
                        cell: "string",
                        editable: false
                    },
                    {
                        name: "name",
                        label: "รายการสืนค้า",
                        cell: "string",
                        editable: false
                    },
                     {
                         name: "unit_type",
                         label: "หน่วยนับ",
                         cell: "string",
                         editable: false
                     },

                    {
                        name: "unit_price",
                        label: "ราคา/หน่วย",
                        cell: "string",
                        editable: false
                    },

                     {
                         name: "unit",
                         label: "คงเหลือ(จำนวน)",
                         cell: "string",
                         editable: false
                     },
                     {
                         name: "sum",
                         label: "มูลค่าสินค้าคงหลือ",
                         cell: "string",
                         editable: false
                     },
                      //{
                      //    name: "last_unit",
                      //    label: "ตรวจนับจริง(จำนวน)",
                      //    cell: "string",
                      //    editable: false
                      //},
                      //{
                      //    name: "last_unit",
                      //    label: "ผลต่าง(จำนวน)",
                      //    cell: "string",
                      //    editable: false
                      //},
                      // {
                      //     name: "last_unit",
                      //     label: "ผลต่าง(บาท)",
                      //     cell: "string",
                      //     editable: false
                      // },
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

                $("#ReportStockLastingTable").append(allProductTable.render().el);

                //this.productInfoTemplate = _.template($('#supplierInfo-template').html());
            },
            SelectProductPopUpButtonClick: function () {
                $("#popupSelectProduct").popup('open', { transition: 'pop' });
                $("#popupSelectProduct .select_product_search").focus();
            },

            // Re-rendering the App just means refreshing the statistics -- the rest
            // of the app doesn't change.
            render: function () {
                this.$el.find('.productInfo').html(this.productInfoTemplate(this.selectProduct.toJSON()));
                this.$el.find('.productInfo').enhanceWithin();
            },

            downLoadReportStockLastingFile: function () {

                this.collection.saveToXlsx("StockCard", {
                    code: 'รหัสสินค้า',
                    name: 'รายการสืนค้า',
                    unit_type: 'หน่วยนับ',
                    unit_price: 'ราคา/หน่วย',
                    unit: 'คงเหลือ(จำนวน)',
                    sum: 'มูลค่าสินค้าคงหลือ',

                });
            },

            search: function () {
                console.log('search');
                var self = this;

                var stockSelected = this.model.stockModel.get('stock_selected'); //$('.select-stock  option:selected').select().text();

                this.collection.getStockLasting(stockSelected);
            }
        });
    });

})(jQuery);
