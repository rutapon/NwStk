﻿/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    $(function () {
        app.views.ReportPurchaseProduct = Backbone.View.extend({

            // Instead of generating a new element, bind to the existing skeleton of
            // the App already present in the HTML.
            //el:'#showProductNav',
            // Delegated events for creating new items, and clearing completed ones.
            events: {
                'click .ClearAll': 'ClearAllButtonClick',
                'click .SelectProductPopUpButton': 'SelectProductPopUpButtonClick',
                'click #dowloadReportPurchaseProduct': 'downLoadReport',
                'click #printReportPurchaseProduct': 'printReportPurchaseProduct',
                'change select.select-supplier': 'supplierChange'
            },

            initialize: function () {
                var self = this;

                var stockModel = this.model.stockModel;

                stockModel.on('change:stock', function (model, stock) {
                    console.log('change:stock');
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

                    stockModel.set('stock_selected', stockSelected);
                });

                this.model.selectTimePeriodModel.on('change', function (model) {
                    self.search();
                });

                //this.collection = new app.collections.ReportCollection();
                //this.collection.comparator = function (model) {
                //    return model.get('date');
                //}
                ////this.CreateProductTable = new app.views.CreateProductTable({ collection: this.collection }).render();

                //$("#ReportPurchaseProductTable").append(allProductTable.render().el);

                //this.productInfoTemplate = _.template(self.$el.find('.productInfo-template').html());

                this.supplierCollection = new app.collections.SupplierCollection();
                this.supplierCollection.getAll();
                //this.allSupplier = this.supplierCollection.toJSON();

                this.productCollection = new app.collections.products();

                this.productCollection.on('add', this.addOne, this);
                this.productCollection.on('reset', this.resetProduct, this);

                this.allReportCollection = [];
            },
            SelectProductPopUpButtonClick: function () {
                $("#popupSelectProduct").popup('open', { transition: 'pop' });
                $("#popupSelectProduct .select_product_search").focus();
            },

            addOne: function (product) {

                var collection = new app.collections.ReportCollection();

                collection.comparator = function (model) {
                    return model.get('date');
                };

                this.allReportCollection.push(collection);

                var eachView = new app.views.ReportPurchaseProductEach({ collection: collection, model: product });

                var eachViewEl = eachView.render().el;
                this.$el.find('.ReportPurchaseProductResult').append(eachViewEl);

            },

            ClearAllButtonClick: function () {
                //this.$el.find('.ReportStockCardEach').remove();
                this.allReportCollection = [];
                this.productCollection.reset();
            },

            printReportPurchaseProduct: function () {
                var selectTimePeriodModel = this.model.selectTimePeriodModel;
                var timeStart = selectTimePeriodModel.get('timeStart');
                var timeEnd = selectTimePeriodModel.get('timeEnd');
                var stockSelected = this.model.stockModel.get('stock_selected');

                var detailStr = 'For: ' + timeStart.replace(/-/g, '/') + ' - ' + timeEnd.replace(/-/g, '/') + ' store: ' + stockSelected;

                var myWindow = window.open("../report/ReportPurchaseProductReport.html", 'test', 'width=' + 900 + ',height=' + 500 + '');
                var allReportCollection = this.allReportCollection;
                //new Date().to

                var handle = setInterval(function () {
                    console.log('in', myWindow.window.createReportFunc);
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

            resetProduct: function (col, opts) {
                _.each(opts.previousModels, function (model) {
                    model.trigger('remove');
                });
            },

            // Re-rendering the App just means refreshing the statistics -- the rest
            // of the app doesn't change.
            render: function () {
                //console.log('render');
                return this;
            },

            downLoadReport: function () {

                //this.collection.saveToXlsx("PurchaseProduct", {
                //    supplier_name: 'ชื่อผู้ขาย',
                //    unit_type: 'หน่วยนับ',
                //    unit_price: 'ราคา/หน่วย',
                //    invoid_id: 'เลขที่ใบส่งชอง',
                //    in_date: 'วันที่เอกส่าร',
                //    unit: 'จำนวน',
                //    sum: 'จำนวนเงิน'
                //});

                var data = [];
                _.each(this.allReportCollection, function (collection) {

                    //if (collection.renderObj) {
                        var code = collection.renderObj.code;
                        var name = collection.renderObj.name;

                        var dataArrayObject = collection.getDataObjArray({
                            supplier_name: 'supplier name',
                            unit_type: 'unit type',
                            unit_price: 'price/unit',
                            invoid_id: 'doc number',
                            in_date: 'doc date',
                            unit: 'unit-in',
                            sum: 'amount'
                        });
                        var amount = _.chain(dataArrayObject).pluck('amount').reduce(function (memo, num) { return memo + num; }, 0).value();

                        var dataArray = ArrayObjectToDataArray(dataArrayObject);
                        data.push(['code: ' + code + ' name: ' + name + ' ### amount: ' + app.math.precision(amount)]);
                        data = data.concat(dataArray);
                        data.push([]);
                    //}

                });

                SaveXlsxFromDataArray(data, 'data', 'PurchaseProduct');
            },

            search: function (selectedModels) {
                console.log('search');
                //var self = this;
                //self.selectProduct = selectProduct;
                //var selectTimePeriodModel = this.model.selectTimePeriodModel;
                //var timeStart = selectTimePeriodModel.get('timeStart');
                //var timeEnd = selectTimePeriodModel.get('timeEnd');
                //var stockSelected = this.model.stockModel.get('stock_selected'); //$('.select-stock  option:selected').select().text();

                //var supplierSelected = self.$el.find('select.select-supplier').val(); // self.supplierSelected;
                var allSupplier = this.supplierCollection.toJSON();

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

                var sumTalal = 0;

                self.productCollection.each(function (model) {
                    model.trigger('search', stockSelected, timeStart, timeEnd, allSupplier, function (result, sum) {
                        sumTalal += sum;
                        self.$el.find('.sumTotal h3').text('Grand Total #' + sumTalal + ' ฿');
                    });
                });
            },
            supplierChange: function (ev) {
                this.search();
                //console.log('supplierChange');
                //var $el = $(ev.target);
                //var value = $el.val();

                //this.supplierSelected = value;

                //this.editingModel.set('supplier_default', value);
            }
        });

        app.views.ReportPurchaseProductEach = Backbone.View.extend({
            tagName: 'div',
            className: 'ReportPurchaseProductEach jqm-content',

            initialize: function () {
                var self = this;

                this.ReportStockCardResultTemplate = _.template($('.ReportPurchaseProductResult-template').html());

                //this.$el.html(this.ReportStockCardResultTemplate(templateObj));

                this.selectProduct = this.model;

                this.listenTo(this.selectProduct, 'search', function (stockSelected, timeStart, timeEnd, allSupplier, cb) {

                    self.search(stockSelected, timeStart, timeEnd, allSupplier, cb);
                });

                this.listenTo(this.selectProduct, 'remove', this.destroy_view, this);
                //this.listenTo(this.selectProduct, 'destroy', this.remove, this);

                //this.selectProduct.on('search',);

                //this.CreateProductTable = new app.views.CreateProductTable({ collection: this.collection }).render();

                this.collection.comparator = function (model) {
                    return model.get('in_date');
                }


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
                    {
                        name: "in_date",
                        label: "Date",
                        cell: "string",
                        editable: false
                    },
                   {
                       name: "invoid_id",
                       label: "Doc Number",
                       cell: "string",
                       editable: false
                   },

                   {
                       name: "supplier_name",
                       label: "Supplier Name",
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
                         name: "unit_type",
                         label: "UnitType",
                         cell: "string",
                         editable: false
                     },
                    {
                        name: "unit",
                        label: "Unit-In",
                        cell: "string",
                        editable: false
                    },
                    {
                        name: "sum",
                        label: "Amount",
                        cell: "string",
                        editable: false
                    }
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

                this.$el.html(this.ReportStockCardResultTemplate());
                if (this.$el.find('.productInfo').enhanceWithin) {
                    this.$el.find('.productInfo').enhanceWithin();
                }

                this.$el.find(".ReportPurchaseProductTable").append(this.allProductTable.render().el);
            },

            render: function () {
                if (this.renderObj) {
                    var detailStr = _.template('<%- code %>: <%- name %> - unit type: <%- unit_type %> ### amount:  <%- sum %> ฿')(this.renderObj);
                    this.$el.find('.productInfo h2').html(detailStr);
                    this.$el.find('.productInfo').enhanceWithin && this.$el.find('.productInfo').enhanceWithin();
                }

                return this;
            },

            search: function (stockSelected, timeStart, timeEnd, allSupplier, cb) {
                console.log('search');
                var self = this;
                var selectProduct = this.selectProduct;

                //if (selectProduct && stockSelected && timeStart && timeEnd) {
                //    this.collection.getStockCard(stockSelected, selectProduct, timeStart, timeEnd);
                //}

                if (selectProduct && stockSelected && timeStart && timeEnd) {
                    this.collection.getPurchaseProduct(stockSelected, selectProduct, timeStart, timeEnd, allSupplier, function (result) {
                        self.renderObj = self.selectProduct.toJSON();
                        self.collection.renderObj = self.renderObj;

                        if (result.length > 0) {
                            self.renderObj.sum = _.chain(result).pluck('sum').reduce(function (memo, num) { return memo + num; }, 0).value();   

                            self.render();
                            self.$el.show();

                            if (cb) cb(result, self.renderObj.sum);
                        } else {
                            self.$el.hide();

                            if (cb) cb(result, 0);
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
