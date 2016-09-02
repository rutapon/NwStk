/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
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
                'click .SelectProductPopUpButton': 'SelectProductPopUpButtonClick',
                'click .downLoadReport': 'downLoadReport',
                'change select.select-supplier': 'supplierChange'
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
                        name: "supplier_name",
                        label: "ชื่อผู้ขาย",
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
                        name: "invoid_id",
                        label: "เลขที่ใบส่งของ",
                        cell: "string",
                        editable: false
                    },
                     {
                         name: "in_date",
                         label: "วันที่เอกส่าร",
                         cell: "string",
                         editable: false
                     },
                     {
                         name: "unit",
                         label: "จำนวน",
                         cell: "string",
                         editable: false
                     },
                     {
                         name: "sum",
                         label: "จำนวนเงิน",
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

                $("#ReportPurchaseProductTable").append(allProductTable.render().el);

                this.productInfoTemplate = _.template(self.$el.find('.productInfo-template').html());

                this.supplierCollection = new app.collections.SupplierCollection();
                this.supplierCollection.getAll();
            },
            SelectProductPopUpButtonClick: function () {
                $("#popupSelectProduct").popup('open', { transition: 'pop' });
                $("#popupSelectProduct .select_product_search").focus();
            },

            // Re-rendering the App just means refreshing the statistics -- the rest
            // of the app doesn't change.
            render: function () {
                if (this.renderObj)
                    this.$el.find('.productInfo').html(this.productInfoTemplate(this.renderObj));
                this.$el.find('.productInfo').enhanceWithin();
            },

            downLoadReport: function () {

                this.collection.saveToXlsx("PurchaseProduct", {
                    supplier_name: 'ชื่อผู้ขาย',
                    unit_type: 'หน่วยนับ',
                    unit_price: 'ราคา/หน่วย',
                    invoid_id: 'เลขที่ใบส่งชอง',
                    in_date: 'วันที่เอกส่าร',
                    unit: 'จำนวน',
                    sum: 'จำนวนเงิน'
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

                var supplierSelected = self.$el.find('select.select-supplier').val(); // self.supplierSelected;
                var allSupplier = self.supplierCollection.toJSON();

                if (selectProduct && stockSelected && timeStart && timeEnd) {
                    this.collection.getPurchaseProduct(stockSelected, selectProduct, timeStart, timeEnd, allSupplier, function (result) {
                        self.renderObj = self.selectProduct.toJSON();
                        self.renderObj.sum = _.chain(result).pluck('sum').reduce(function (memo, num) { return memo + num; }, 0).value();
                        self.render();
                    });
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
    });

})(jQuery);
