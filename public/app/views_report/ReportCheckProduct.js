/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    function addHours(date, hours) {
        var result = new Date(date);
        result.setHours(result.getHours() + hours);
        return result;
    }
    function addDays(date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
    function addMonths(date, months) {
        var result = new Date(date);
        result.setMonth(result.getMonth() + months);
        return result;
    }
    function addYears(date, years) {
        var result = new Date(date);
        result.setFullYear(result.getFullYear() + years);
        return result;
    }
    function removeTimezoneOffset(now) {
        return addHours(now, -now.getTimezoneOffset() / 60);
    }
    function addTimezoneOffset(now) {
        return addHours(now, now.getTimezoneOffset() / 60);
    }

    function removeTimezoneOffset(now) {
        return addHours(now, -now.getTimezoneOffset() / 60);
    }
    $(function () {
        app.views.ReportCheckProduct = Backbone.View.extend({

            // Instead of generating a new element, bind to the existing skeleton of
            // the App already present in the HTML.
            //el:'#showProductNav',
            // Delegated events for creating new items, and clearing completed ones.
            events: {
                //'keyup .show_product_search': 'search',
                'change select.select-checking-date': 'checkingDateChange',
                'click #printReportCheckProduct': 'printReportCheckProduct',
                'click #downloadReportCheckProduct': 'downloadReportCheckProduct'
            },

            initialize: function () {
                var self = this;
                var stockModel = this.model.stockModel;
                self.CheckProductDate = [];
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
                        self.$el.find('.select-stock option[value=' + stock_selected + ']').prop('selected', true).trigger("change");
                    }

                    self.collection.getCheckProductDate(stock_selected, function (result) {

                        self.CheckProductDate = result;
                        self.updateSelectCheckingDate();
                    });
                });

                self.$el.find(".select-stock").bind("change", function (event, ui) {
                    var stockSelected = self.$el.find('.select-stock option:selected').select().text();
                    //console.log('stock_selected', stockSelected);
                    stockModel.set('stock_selected', stockSelected);
                });

                var stockChekingMonthModel = this.stockChekingMonthModel = new Backbone.Model();

                stockChekingMonthModel.on('change:stockChekingMonth', function (model, stockChekingMonth) {
                    self.updateSelectCheckingDate();
                });

                var now = new Date();
                for (var i = 0; i < 12; i++) {
                    var timeStr = addMonths(now, -i).toISOString().slice(0, 7);
                    self.$el.find('.select-cheking-month').append('<option value="' + timeStr + '" >' + timeStr + '</option>');
                }

                self.$el.find('.select-cheking-month').bind("change", function (event, ui) {
                    var stockChekingMonth = self.$el.find('.select-cheking-month option:selected').select().text();
                    stockChekingMonthModel.set('stockChekingMonth', stockChekingMonth)
                });

                self.$el.find('.select-cheking-month').trigger("change");

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
                   {
                       name: "last_unit",
                       label: "Check-Unit",
                       cell: "string",
                       editable: false
                   },
                   {
                       name: "diff_unit",
                       label: "Diff-Unit",
                       cell: "string",
                       editable: false
                   },
                    {
                        name: "dif_sum",
                        label: "Diff-Amount",
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
                ];

                if (app.userModel.get('type') == 'staff_support') {
                    var rejects = ['unit_price', 'sum', 'dif_sum']
                    columns = _.reject(columns, function (elem) {
                        return rejects.indexOf(elem.name) > -1
                    });
                }

                var allProductTable = new Backgrid.Grid({
                    columns: columns,
                    collection: this.collection
                });

                $("#ReportCheckProductTable").append(allProductTable.render().el);

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

            updateSelectCheckingDate: function () {
                var self = this;
                var stockChekingMonth = self.stockChekingMonthModel.get('stockChekingMonth');
                var CheckProductDate = self.CheckProductDate;

                self.$el.find('select.select-checking-date option').remove();

                var dataArray = [];

                var stockChekingMonthDate = new Date(stockChekingMonth);
                var item = stockChekingMonthDate.toISOString().slice(8, 10);
                var dateStr = stockChekingMonthDate.toISOString().slice(0, 10);



                var nowDateStr = removeTimezoneOffset(new Date()).toISOString().slice(0, 10);

                do {

                    if (nowDateStr < dateStr) {
                        break;
                    }

                    dataArray.push({ item: item, dateStr: dateStr });

                    stockChekingMonthDate = addDays(stockChekingMonthDate, 1);
                    item = stockChekingMonthDate.toISOString().slice(8, 10);
                    dateStr = stockChekingMonthDate.toISOString().slice(0, 10);

                } while (item != '01');

                dataArray = dataArray.reverse();

                _.each(dataArray, function (obj) {
                    var itemText = CheckProductDate.indexOf(obj.dateStr) > -1 ? obj.item + ' [Checked]' : obj.item + ' [Uncheck]';
                    self.$el.find('select.select-checking-date').append('<option value="' + obj.dateStr + '">' + itemText + '</option>');

                });

                self.$el.find('select.select-checking-date').trigger("change");


                //self.$el.find('select.select-checking-date option').remove();
                //if (CheckProductDate.length) {
                //    _.each(result, function (item) {
                //        //  self.$el.find('select.select-checking-date').append('<option value="' + item + '">' + item + '</option>');
                //    });
                //} else {
                //    // self.$el.find('select.select-checking-date').append('<option value="[--No Report--]">[--No Report--]</option>');
                //}

                //self.$el.find('select.select-checking-date').trigger("change");

            },
            downloadReportCheckProduct: function () {

                this.collection.saveToXlsx("CheckProduct", {
                    code: 'code',
                    name: 'description',
                    unit_type: 'unit type',
                    unit_price: 'price/unit',
                    unit: 'unit-balance',
                    sum: 'amount-balance',
                    last_unit: 'check-unit',
                    diff_unit: 'diff-unit',
                    dif_sum: 'diff-amount'
                });
            },
            checkingDateChange: function () {
                this.search();
            },

            printReportCheckProduct: function () {
                var stockSelected = this.model.stockModel.get('stock_selected');
                var dateSelect = this.$el.find('select.select-checking-date').val();

                var collection = this.collection;

                var allSum = collection.reduce(function (memo, obj) { return memo + obj.get('dif_sum'); }, 0);

                var detailStr = 'Date: ' + dateSelect.replace(/-/g, '/') +
                     ' store: ' + stockSelected + ' ### different amount: ' + allSum;

                var myWindow = window.open("../report/ReportCheckProductReport.html", 'test', 'width=' + 900 + ',height=' + 500 + '');

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

                var self = this;
                var dateSelect = self.$el.find('select.select-checking-date').val();
                var dateSelectText = self.$el.find('select.select-checking-date option:selected').select().text();

                var checked = dateSelectText.indexOf('[Checked]') > -1;

                var stockSelected = this.model.stockModel.get('stock_selected'); //$('.select-stock  option:selected').select().text();

                if (stockSelected && dateSelect && dateSelect) {//!= '[--No Report--]'

                    if (checked) {

                        this.collection.getCheckProduct(stockSelected, dateSelect, function (result) {

                            //console.log(result);

                            var infoText = 'For: ' + dateSelect.replace(/-/g, '/');

                            if (app.userModel.get('type') != 'staff_support') {

                                var allSum = _.reduce(result, function (memo, obj) { return memo + obj.sum; }, 0);
                                var diffSum = _.reduce(result, function (memo, obj) { return memo + obj.dif_sum; }, 0);

                                infoText += ' ### amount: ' + allSum.toFixed(2) + '฿ defferent amount: ' + diffSum.toFixed(2) + '฿';
                            }

                            self.$el.find(".productInfo h2").text(infoText);
                        });
                    } else {
                        this.collection.getStockLastingDate(stockSelected, dateSelect, function (result) {
                            //console.log(result);
                            var infoText = 'For: ' + dateSelect.replace(/-/g, '/');
                            if (app.userModel.get('type') != 'staff_support') {

                                var allSum = _.reduce(result, function (memo, obj) { return memo + obj.sum; }, 0);

                                infoText += ' ### amount: ' + allSum.toFixed(2) + '฿';
                            }

                            self.$el.find(".productInfo h2").text(infoText);
                        });
                    }
                } else {
                    self.$el.find(".productInfo h2").text('Amount: ' + 0 + '฿ Defferent Amount : ' + 0 + '฿');
                    if (self.collection) self.collection.reset();
                }
            }
        });
    });

})(jQuery);
