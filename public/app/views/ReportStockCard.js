/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    $(function () {
        app.views.ReportStockCard = Backbone.View.extend({

            // Instead of generating a new element, bind to the existing skeleton of
            // the App already present in the HTML.
            //el:'#showProductNav',
            // Delegated events for creating new items, and clearing completed ones.
            events: {
                //'keyup .show_product_search': 'search',
                //'change .show_product_search': 'search',
                'click .SelectProductPopUpButton': 'SelectProductPopUpButtonClick',
                'click #downLoadReportStockCardFile': 'downLoadReportStockCardFile'
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

                this.model.selectTimePeriodModel.on('change', function (model) {
                    self.search();
                });

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
                        name: "date",
                        label: "วันที่",
                        cell: "string",
                        editable: false
                    },
                    {
                        name: "description",
                        label: "รานละเอียด",
                        cell: "string",
                        editable: false
                    },
                    {
                        name: "doc_id",
                        label: "เลชที่เอกสาร",
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
                         name: "doc_date",
                         label: "วันที่เอกส่าร",
                         cell: "string",
                         editable: false
                     },
                     {
                         name: "in_unit",
                         label: "รับ(จำนวน)",
                         cell: "string",
                         editable: false
                     },
                     {
                         name: "out_unit",
                         label: "จ่าย(จำนวน)",
                         cell: "string",
                         editable: false
                     },
                      {
                          name: "last_unit",
                          label: "คงเหลือ",
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

                $("#ReportStockCardTable").append(allProductTable.render().el);

                this.productInfoTemplate = _.template($('#productInfo-template').html());

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

            downLoadReportStockCardFile: function () {

                this.collection.saveToXlsx("StockCard", {
                    date: 'วันที่',
                    description: 'รานละเอียด',
                    doc_id: 'เลชที่เอกสาร',
                    doc_date: 'วันที่เอกส่าร',
                    in_unit: 'รับ',
                    out_unit: 'จ่าย',
                    last_unit: 'คงเหลือ',

                });
            },

            search: function (selectProduct) {
                console.log('search');
                var self = this;
                self.selectProduct = selectProduct;

                var selectTimePeriodModel = this.model.selectTimePeriodModel;

                var timeStart = selectTimePeriodModel.get('timeStart');
                var timeEnd = selectTimePeriodModel.get('timeEnd');
                var stockSelected = this.model.stockModel.get('stock_selected'); //$('.select-stock  option:selected').select().text();

                if (selectProduct && stockSelected && timeStart && timeEnd) {
                    this.collection.getStockCard(stockSelected, selectProduct, timeStart, timeEnd);
                }
            }
        });
    });

})(jQuery);
