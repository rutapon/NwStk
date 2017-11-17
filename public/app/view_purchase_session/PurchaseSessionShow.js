/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    $(function () {
        app.views.PurchaseSessionShow = Backbone.View.extend({

            // Instead of generating a new element, bind to the existing skeleton of
            // the App already present in the HTML.
            //el:'#showProductNav',
            // Delegated events for creating new items, and clearing completed ones.

            tagName: 'div',
            className: 'ReportEach jqm-content',

            events: {

            },

            initialize: function () {
                var self = this;

                this.ReportStockCardResultTemplate = _.template($('.PurchaseSessionShowResult-template').html());

                //this.model.selectTimePeriodModel.on('change', function (model) {
                //    self.search();
                //});

                //this.collection = new app.collections.ReportCollection();
                // this.collection.comparator = function (model) {
                //     return model.get('code');
                // }

                //this.CreateProductTable = new app.views.CreateProductTable({ collection: this.collection }).render();
                //new app.views.PettyCashFormView({ el: '#PettyCashForm', model: self.model });

                self.collection.on('reset', self.render, this);

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
                    },  {
                        name: "in_date",
                        label: "Bill Date",
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
                        label: "Price/U",
                        cell: "string",
                        editable: false
                    },

                    {
                        name: "unit",
                        label: "Unit",
                        cell: "string",
                        editable: false
                    },

                    {
                        name: "sum",
                        label: "Amount",
                        cell: "string",
                        editable: false
                    },

                    {
                        name: "stock_name",
                        label: "List",
                        cell: "string",
                        editable: false
                    },

                    {
                        name: "supplier_code",
                        label: "Supplier",
                        cell: "string",
                        editable: false
                    },
 {
                        name: "remark",
                        label: "Remark",
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


                var allProductTable = this.allProductTable = new Backgrid.Grid({
                    columns: columns,

                    collection: this.collection
                });


                //this.productInfoTemplate = _.template($('#supplierInfo-template').html());
            },

            // Re-rendering the App just means refreshing the statistics -- the rest
            // of the app doesn't change.
            render: function () {
                var self = this;

                var sumAmount = 0;
                self.collection.forEach(function (modelEach, index) {
                    sumAmount += parseFloat(modelEach.attributes['sum']) ;
                });
                self.model.set('sumAmount', sumAmount);
                var modelJson = this.model.toJSON();
                if (!modelJson.chqueData) {
                    modelJson.chqueData = '-';
                }

                modelJson.BF = app.math.precision(modelJson.BF);
                modelJson.balance = app.math.precision(modelJson.balance);
                modelJson.moneyAddAmount = app.math.precision(modelJson.moneyAddAmount);
                modelJson.sumAmount = app.math.precision(modelJson.sumAmount);


                this.$el.html(this.ReportStockCardResultTemplate(modelJson));

                var payment_type = self.model.get('payment_type');
                if (payment_type == 'PettyCash') {
                    //self.renderPettyCashForm();
                    this.$el.find('.PettyCashForm').show();
                } else {
                    this.$el.find('.PettyCashForm').hide();
                }
                
                this.$el.enhanceWithin();

                this.$el.find(".PurchaseSessionShowTable").append(this.allProductTable.render().el);
                return this;
            },

            render0: function () {
                var self = this;
                var sumAmount = 0;
                self.collection.forEach(function (modelEach, index) {
                    sumAmount += modelEach.attributes['sum'];
                });

                $('#sum-amount-label').text('All Amount: ' + sumAmount + '฿');
                $('#SessionId').text(self.model.get('sessionId'))
                $('#userId').text(self.model.get('userId'));
                var payment_type = self.model.get('payment_type');
                $('#payment_type').text(payment_type);

                if (payment_type == 'PettyCash' && self.model.get('moneyAddAmount')) {
                    self.renderPettyCashForm();
                    $('#PettyCashForm').show();
                } else {
                    $('#PettyCashForm').hide();
                }
            },
            renderPettyCashForm: function name(params) {
                var self = this;
                var moneyAddAmount = self.model.get('moneyAddAmount');
                var chqueData = self.model.get('chqueData');
                if (moneyAddAmount) {
                    self.$el.find('#moneyAddAmount').text(moneyAddAmount);
                } else {
                    self.$el.find('#moneyAddAmount').text('');
                }
                if (chqueData) {
                    self.$el.find('#chqueData').text(chqueData);
                } else {
                    self.$el.find('#chqueData').text('-');
                }

            },
        });
    });

})(jQuery);
