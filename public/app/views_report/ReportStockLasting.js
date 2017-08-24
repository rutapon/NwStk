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
                'click #downloadReportStockLastingFile': 'downloadReportStockLastingFile',
                'click #printReportStockLastingFile': 'printReportStockLastingFile'
            },

            initialize: function () {
                var self = this;
                var stockModel = this.model.stockModel;

                stockModel.on('change:stock', function (model, stock) {

                    if (stock.length > 0) {
                        self.$el.find('.select-stock option').remove();
                        _.each(stock, function (item) {
                            self.$el.find('.select-stock').append('<option value="' + item + '">' + item + '</option>');
                        });
                        self.$el.find('.select-stock').trigger("change");
                    }
                });
                stockModel.on('change:stock_selected', function (model, stock_selected) {

                    //self.$el.find('.select-stock select').val(stock_selected).trigger("change");
                    var stockSelectedInner = self.$el.find('.select-stock option:selected').select().text();
                    if (stock_selected != stockSelectedInner) {
                        //console.log('change:stock_selected iner');
                        self.$el.find('.select-stock option[value=' + stock_selected + ']').prop('selected', true).trigger("change");;
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
                    return model.get('code');
                }

                //this.CreateProductTable = new app.views.CreateProductTable({ collection: this.collection }).render();

               var columns = [
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
                   name: "name",
                   label: "Description",
                   cell: "string",
                   editable: false
               },
                {
                    name: "unit_type",
                    label: "UnitType",
                    cell: "string",
                    editable: false
                },

               {
                   name: "unit_price",
                   label: "Price/Unit",
                   cell: "string",
                   editable: false
               },

                {
                    name: "unit",
                    label: "Unit-Balance",
                    cell: "string",
                    editable: false
                },
                {
                    name: "sum",
                    label: "Amount-Balance",
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
                ];

                if (app.userModel.get('type') == 'staff_support') {
                    var rejects = ['unit_price', 'sum']
                    columns = _.reject(columns, function (elem) {
                        return rejects.indexOf(elem.name) > -1
                    });
                }

                var allProductTable = new Backgrid.Grid({
                    columns: columns,

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

            downloadReportStockLastingFile: function () {

                this.collection.saveToXlsx("StockCard", {
                    code: 'code',
                    name: 'description',
                    unit_type: 'unit type',
                    unit_price: 'price/unit',
                    unit: 'unit-balance',
                    sum: 'amount-balance',

                });
            },
            printReportStockLastingFile: function () {
                var stockSelected = this.model.stockModel.get('stock_selected');
                var collection = this.collection;

                var allSum = collection.reduce(function (memo, obj) { return memo + obj.get('sum'); }, 0);

                var detailStr = 'Date: ' + this.dateStr.replace(/-/g, '/') +
                     ' store: ' + stockSelected + ' ### amount: ' + allSum;

                var myWindow = window.open("../report/ReportStockLastingReport.html", 'test', 'width=' + 900 + ',height=' + 500 + '');

                //new Date().to

                var handle = setInterval(function () {
                    console.log('in', myWindow.window.printFunc);
                    if (myWindow.window.createReportFunc) {
                        clearInterval(handle);
                        var reportObj = {
                            detail: detailStr,
                            collection: collection
                        }

                        myWindow.window.createReportFunc(reportObj);
                    }
                }, 100);
            },
           
            search: function () {
                console.log('search');
                var self = this;

                var stockSelected = this.model.stockModel.get('stock_selected'); //$('.select-stock  option:selected').select().text();
                var dateStr = this.dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '/');

                this.collection.getStockLasting(stockSelected, function (result) {
                    //console.log(result);
                    var infoText = 'Ending Stock Date: ' + dateStr ;
                    if (app.userModel.get('type') != 'staff_support') {
                        var allSum = _.reduce(result, function (memo, obj) { return memo + obj.sum; }, 0);
                        infoText += ' ### amount: ' + allSum.toFixed(2) + '฿';
                    }
                 
                    self.$el.find(".productInfo h2").text(infoText);
                });
            }
        });
    });

})(jQuery);
