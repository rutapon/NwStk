/// <reference path="../../report/ReportStockCardReport.html" />
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
                'click .ClearAll': 'ClearAllButtonClick',
                'click #downLoadReportStockCardFile': 'downLoadReportStockCardFile',
                'click #downLoadReportStockCardReport': 'downLoadReportStockCardReport'
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
                    //console.log('change:stock_selected iner');
                    //self.$el.find('.select-stock select').val(stock_selected).trigger("change");
                    var stockSelectedInner = self.$el.find('.select-stock option:selected').select().text();
                    if (stock_selected != stockSelectedInner) {
                        self.$el.find('.select-stock option[value=' + stock_selected + ']').prop('selected', true).trigger("change");;
                    }
                });

                self.$el.find(".select-stock").bind("change", function (event, ui) {
                    var stockSelected = self.$el.find('.select-stock option:selected').select().text();
                    console.log('stock_selected change', stockSelected);
                    stockModel.set('stock_selected', stockSelected);
                });

                this.model.selectTimePeriodModel.on('change', function (model) {
                    self.search();
                });

                this.productCollection = new app.collections.products();

                this.productCollection.on('add', this.addOne, this);
                this.productCollection.on('reset', this.resetProduct, this);

                this.allReportCollection = [];

                //this.collection = new app.collections.ReportCollection();
                //this.collection.comparator = function (model) {
                //    return model.get('date');
                //}
            },
            SelectProductPopUpButtonClick: function () {
                $("#popupSelectProduct").popup('open', { transition: 'pop' });
                $("#popupSelectProduct .select_product_search").focus();
            },

            addOne: function (product) {

                var collection = new app.collections.ReportCollection();

                collection.comparator = function (model) {
                    return model.get('doc_date');
                };

                this.allReportCollection.push(collection);

                var eachView = new app.views.ReportStockCardEach({ collection: collection, model: product });

                var eachViewEl = eachView.render().el;
                this.$el.find('.ReportStockCardResult').append(eachViewEl);

            },


            ClearAllButtonClick: function () {
                //this.$el.find('.ReportStockCardEach').remove();
                this.allReportCollection = [];
                this.productCollection.reset();
            },

            resetProduct: function (col, opts) {
                _.each(opts.previousModels, function (model) {
                    model.trigger('remove');
                });
            },
            // Re-rendering the App just means refreshing the statistics -- the rest
            // of the app doesn't change.
            render: function () {
                //this.$el.find('.productInfo').html(this.productInfoTemplate(this.selectProduct.toJSON()));
                //this.$el.find('.productInfo').enhanceWithin();
                //this.productCollection.each(this.addOne, this);
                return this;
            },

            downLoadReportStockCardFile: function () {
                var data = [];
                _.each(this.allReportCollection, function (collection) {

                    var code = collection.selectProduct.get('code');
                    var name = collection.selectProduct.get('name');
                    var unit_type = collection.selectProduct.get('unit_type');

                    var dataArrayObject = collection.getDataObjArray({
                        //date: 'date',
                        doc_date: 'date',
                        description: 'description',
                        doc_id: 'doc number',
                       
                        in_unit: 'unit-in',
                        out_unit: 'unit-out',
                        last_unit: 'unit-balance',

                    });

                    var dataArray = ArrayObjectToDataArray(dataArrayObject);
                    data.push(['code: ' + code + ' name: ' + name + ' unit_type: ' + unit_type]);
                    data = data.concat(dataArray);
                    data.push([]);
                });

                SaveXlsxFromDataArray(data, 'data', 'StockCard');
            },
            downLoadReportStockCardReport: function () {

                var selectTimePeriodModel = this.model.selectTimePeriodModel;
                var timeStart = selectTimePeriodModel.get('timeStart');
                var timeEnd = selectTimePeriodModel.get('timeEnd');
                var stockSelected = this.model.stockModel.get('stock_selected');

                var detailStr = 'For: ' + timeStart.replace(/-/g, '/') + ' - ' + timeEnd.replace(/-/g, '/') + ' store: ' + stockSelected;

                var myWindow = window.open("../report/ReportStockCardReport.html", 'test', 'width=' + 900 + ',height=' + 500 + '');
                var allReportCollection = this.allReportCollection;
                //new Date().to

                var handle = setInterval(function () {
                    console.log('in', myWindow.window.printFunc);
                    if (myWindow.window.createReportFunc) {
                        clearInterval(handle);
                        var reportObj = {
                            detail: detailStr,
                            allReportCollection: allReportCollection
                        }

                        myWindow.window.createReportFunc(reportObj);
                    }
                }, 100);
            },
            search: function (selectedModels) {
                //console.log('search');
                var self = this;
                _.each(selectedModels, function (selectProduct) {
                    var hasProduct = self.productCollection.find(function (model) {
                        return model.attributes['code'] == selectProduct.attributes['code'];
                    });
                    if (!hasProduct) {
                        self.productCollection.add(selectProduct);
                    }
                });

                var selectTimePeriodModel = this.model.selectTimePeriodModel;

                var timeStart = selectTimePeriodModel.get('timeStart');
                var timeEnd = selectTimePeriodModel.get('timeEnd');
                var stockSelected = this.model.stockModel.get('stock_selected'); //$('.select-stock  option:selected').select().text();

                self.productCollection.each(function (model) {
                    model.trigger('search', stockSelected, timeStart, timeEnd);
                });
            }
        });

        app.views.ReportStockCardEach = Backbone.View.extend({
            tagName: 'div',
            className: 'ReportStockCardEach jqm-content',

            initialize: function () {
                var self = this;

                this.ReportStockCardResultTemplate = _.template($('.ReportStockCardResult-template').html());

                //this.$el.html(this.ReportStockCardResultTemplate(templateObj));

                this.selectProduct = this.model;

                this.listenTo(this.selectProduct, 'search', function (stockSelected, timeStart, timeEnd) {

                    self.search(stockSelected, timeStart, timeEnd);
                });

                this.listenTo(this.selectProduct, 'remove', this.destroy_view, this);
                //this.listenTo(this.selectProduct, 'destroy', this.remove, this);

                //this.selectProduct.on('search',);

                //this.CreateProductTable = new app.views.CreateProductTable({ collection: this.collection }).render();

                this.allProductTable = new Backgrid.Grid({
                    columns: [
                    //    {
                    //    // name is a required parameter, but you don't really want one on a select all column
                    //    name: "",
                    //    // Backgrid.Extension.SelectRowCell lets you select individual rows
                    //    cell: "select-row",
                    //    // Backgrid.Extension.SelectAllHeaderCell lets you select all the row on a page
                    //    headerCell: "select-all",
                    //},
                    //{
                    //    name: "date",
                    //    label: "Date",
                    //    cell: "string",
                    //    editable: false
                    //},
                    {
                        name: "doc_date",
                        label: "Date",
                        cell: "string",
                        editable: false
                    },
                    {
                        name: "description",
                        label: "Description",
                        cell: "string",
                        editable: false
                    },
                    {
                        name: "doc_id",
                        label: "Doc Number",
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
                         name: "in_unit",
                         label: "Unit-in",
                         cell: "string",
                         editable: false
                     },
                     {
                         name: "out_unit",
                         label: "Unit-Out",
                         cell: "string",
                         editable: false
                     },
                      {
                          name: "last_unit",
                          label: "Unit-Balance",
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
                this.$el.html(this.ReportStockCardResultTemplate(this.selectProduct.toJSON()));
                if (this.$el.find('.productInfo').enhanceWithin) {
                    this.$el.find('.productInfo').enhanceWithin();
                }
                this.$el.find(".ReportStockCardTable").append(this.allProductTable.render().el);
            },

            render: function () {
                return this;
            },

            search: function (stockSelected, timeStart, timeEnd) {
                console.log('search');
                var self = this;
                var selectProduct = this.selectProduct;

                if (selectProduct && stockSelected && timeStart && timeEnd) {
                    this.collection.getStockCard(stockSelected, selectProduct, timeStart, timeEnd, function (objArr) {
                        //console.log('objArr.length', objArr.length);

                        if (objArr.length == 0) {
                            self.$el.hide();
                            //$(self.$el).hide();
                        } else {
                            self.$el.show();
                        }
                    });
                }
            },
            remove: function () {
                this.$el.remove();
            },
            destroy_view: function () {

                // COMPLETELY UNBIND THE VIEW
                this.undelegateEvents();

                this.$el.removeData().unbind();

                // Remove view from DOM
                this.remove();
                Backbone.View.prototype.remove.call(this);

            }
        });
    });

})(jQuery);
