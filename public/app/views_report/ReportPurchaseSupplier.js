/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    function precision(a, precision) {
        var x = Math.pow(10, precision || 2);
        return (Math.round(a * x)) / x;
    }

    $(function () {

        app.views.ReportPurchaseSupplier = Backbone.View.extend({

            // Instead of generating a new element, bind to the existing skeleton of
            // the App already present in the HTML.
            //el:'#showProductNav',
            // Delegated events for creating new items, and clearing completed ones.
            events: {
                'click .ClearAll': 'ClearAllButtonClick',
                'click .downLoadReport': 'downLoadReport',
                'click #printReportPurchaseSupplier': 'printReportPurchaseSupplier',
                'change select.select-supplier-report': 'supplierChange'
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

                this.model.selectTimePeriodModel.on('change', function (model) {
                    self.search();
                });

                //this.collection = new app.collections.ReportCollection();
                //this.collection.comparator = function (model) {
                //    return model.get('date');
                //}

                ////this.CreateProductTable = new app.views.CreateProductTable({ collection: this.collection }).render();


                //$("#ReportPurchaseSupplierTable").append(allProductTable.render().el);

                //this.productInfoTemplate = _.template(self.$el.find('.supplierInfo-template').html());

                this.supplierCollection = new app.collections.SupplierCollection();
                this.supplierCollection.getAll();

                this.supplierCollection.on('reset', function () {

                    self.$el.find('.select-supplier-report option').remove();

                    self.supplierCollection.each(function (model) {
                        var code = model.get('code');
                        var name = code + ' (' + model.get('name') + ')';

                        self.$el.find('.select-supplier-report').append('<option value="' + code + '">' + name + '</option>');
                    });

                    self.$el.find('.select-supplier-report').append('<option value="[--All Suppliers--]">[--All Suppliers--]</option>');
                    self.$el.find('.select-supplier-report').trigger("change");
                });

                //this.productCollection = new app.collections.products();

                //this.productCollection.on('add', this.addOne, this);
                //this.productCollection.on('reset', this.resetProduct, this);

                this.allViewEach = [];
                this.allReportCollection = [];
            },
            addOne: function () {

                var collection = new app.collections.ReportCollection();

                collection.comparator = function (model) {
                    return model.get('date');
                };


                this.allReportCollection.push(collection);

                var eachView = new app.views.ReportPurchaseSupplierEach({ collection: collection });

                var eachViewEl = eachView.render().el;
                this.$el.find('.ReportPurchaseSupplierResult').append(eachViewEl);
                return eachView;
            },
            // Re-rendering the App just means refreshing the statistics -- the rest
            // of the app doesn't change.
            render: function () {

                return this;
            },

            downLoadReport: function () {

                //this.collection.saveToXlsx("PurchaseSupplier", {
                //    code: 'รหัสสินค้า',
                //    name: 'รายการสินค้า',
                //    unit_type: 'หน่วยนับ',
                //    unit_price: 'ราคา/หน่วย',
                //    invoid_id: 'เลขที่ใบส่งชอง',
                //    in_date: 'วันที่เอกส่าร',
                //    unit: 'จำนวน',
                //    sum: 'จำนวนเงิน'
                //});

                var data = [];
                _.each(this.allReportCollection, function (collection) {

                    var code = collection.renderObj.code;
                    var name = collection.renderObj.name;

                    var dataArrayObject = collection.getDataObjArray({
                        code: 'code',
                        name: 'description',
                        unit_type: 'unit type',
                        unit_price: 'price/unit',
                        invoid_id: 'doc number',
                        in_date: 'doc date',
                        unit: 'unit-in',
                        sum: 'amount'
                    });


                    var amount = _.chain(dataArrayObject).pluck('amount').reduce(function (memo, num) { return memo + num; }, 0).value();

                    var dataArray = ArrayObjectToDataArray(dataArrayObject);
                    data.push(['code: ' + code + ' name: ' + name + ' ### amount: ' + precision(amount)]);
                    data = data.concat(dataArray);
                    data.push([]);
                });

                SaveXlsxFromDataArray(data, 'data', 'PurchaseSupplier');
            },
            printReportPurchaseSupplier: function () {
                var selectTimePeriodModel = this.model.selectTimePeriodModel;
                var timeStart = selectTimePeriodModel.get('timeStart');
                var timeEnd = selectTimePeriodModel.get('timeEnd');
                var stockSelected = this.model.stockModel.get('stock_selected');

                var detailStr = 'For: ' + timeStart.replace(/-/g, '/') + ' - ' + timeEnd.replace(/-/g, '/') + ' store: ' + stockSelected;

                var myWindow = window.open("../report/ReportPurchaseSupplierReport.html", 'test', 'width=' + 900 + ',height=' + 500 + '');
                var allReportCollection = this.allReportCollection;
                //new Date().to

                var handle0 = setInterval(function () {
                    console.log('in', myWindow.window.createReportFunc);
                    if (myWindow.window.createReportFunc) {
                        clearInterval(handle0);
                        var reportObj = {
                            detail: detailStr,
                            allReportCollection: allReportCollection
                        }

                        myWindow.window.createReportFunc(reportObj);
                    }
                }, 100);
            },
            search: function () {
                console.log('search');
                var self = this;
                var selectTimePeriodModel = this.model.selectTimePeriodModel;

                var timeStart = selectTimePeriodModel.get('timeStart');
                var timeEnd = selectTimePeriodModel.get('timeEnd');
                var stockSelected = this.model.stockModel.get('stock_selected'); //$('.select-stock  option:selected').select().text();

                var supplierSelected = self.$el.find('select.select-supplier-report').val(); // self.supplierSelected;

                if (supplierSelected && stockSelected && timeStart && timeEnd) {
                    this.allReportCollection = [];

                    if (self.allViewEach && self.allViewEach.length > 0) {
                        _.each(self.allViewEach, function (view) {
                            view.destroy_view();
                        });
                    }
                    self.allViewEach = [];

                    var sumTalal = 0;

                    if (supplierSelected == '[--All Suppliers--]') {
                        self.supplierCollection.each(function (supplierModel) {

                            var eachView = self.addOne();
                            self.allViewEach.push(eachView);

                            eachView.search(stockSelected, supplierModel.toJSON(), timeStart, timeEnd, function (result, sum) {
                                if (result.length == 0) {
                                    eachView.$el.hide();
                                } else {
                                    eachView.$el.show();
                                }
                                sumTalal += sum;
                                sumTalal = precision(sumTalal);
                                self.$el.find('.sumTotal h3').text('Grand Total #' + sumTalal + ' ฿');
                            });
                        });


                    } else {

                        var eachView = self.addOne();
                        self.allViewEach.push(eachView);

                        var supplierObj = self.supplierCollection.findWhere({ code: supplierSelected }).toJSON();
                        eachView.search(stockSelected, supplierObj, timeStart, timeEnd, function (result, sum) {
                            sumTalal += sum;
                            sumTalal = precision(sumTalal);
                            self.$el.find('.sumTotal h3').text('Grand Total #' + sumTalal + ' ฿');
                        });


                    }
                }


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

        app.views.ReportPurchaseSupplierEach = Backbone.View.extend({
            tagName: 'div',
            className: 'ReportPurchaseSupplierEach jqm-content',

            initialize: function () {
                var self = this;

                this.ReportStockCardResultTemplate = _.template($('.ReportPurchaseSupplier-template').html());

                //this.$el.html(this.ReportStockCardResultTemplate(templateObj));

                //this.selectProduct = this.model;

                //this.listenTo(this.selectProduct, 'search', function (stockSelected, timeStart, timeEnd) {

                //    self.search(stockSelected, timeStart, timeEnd);
                //});

                //this.listenTo(this.selectProduct, 'remove', this.destroy_view, this);
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

                this.$el.html(this.ReportStockCardResultTemplate());//this.selectProduct.toJSON()
                if (this.$el.find('.productInfo').enhanceWithin) {
                    this.$el.find('.productInfo').enhanceWithin();
                }


                this.$el.find(".ReportPurchaseSupplierTable").append(this.allProductTable.render().el);
            },

            render: function () {

                if (this.renderObj) {
                    var detailStr = _.template('<%- code %>: <%- name %> - credit:  <%- credit %> days ### amount:  <%- sum %> ฿')(this.renderObj);
                    this.$el.find('.productInfo h2').html(detailStr);
                    if (this.$el.find('.productInfo').enhanceWithin) this.$el.find('.productInfo').enhanceWithin();
                }

                return this;
            },

            search: function (stockSelected, supplierObj, timeStart, timeEnd, cb) {
                console.log('search');
                var supplierSelected = supplierObj.code;
                var self = this;
                //var selectProduct = this.selectProduct;

                //if (selectProduct && stockSelected && timeStart && timeEnd) {
                //    this.collection.getStockCard(stockSelected, selectProduct, timeStart, timeEnd);
                //}


                this.collection.getPurchasePupplier(stockSelected, supplierSelected, timeStart, timeEnd, function (result) {
                    //self.renderObj = {};
                    self.renderObj = supplierObj;//self.supplierCollection.findWhere({ code: supplierSelected }).toJSON();
                    //var supplier = _.findWhere(self.supplierCollection.toJSON(), { code: stockSelected });
                    self.renderObj.sum = _.chain(result).pluck('sum').reduce(function (memo, num) { return memo + num; }, 0).value();
                    self.renderObj.sum = precision(self.renderObj.sum);
                    self.collection.renderObj = self.renderObj

                    self.render();
                    if (cb) cb(result, self.renderObj.sum);

                    //console.log(self.renderObj);
                });
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
