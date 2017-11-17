/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    $(function () {
        app.views.ImportProductEdit = Backbone.View.extend({

            // Instead of generating a new element, bind to the existing skeleton of
            // the App already present in the HTML.
            el: '#editNav',

            // Delegated events for creating new items, and clearing completed ones.
            events: {
                'keyup .import_product_search': 'search',
                'keyup .import_product_searchPurchaseID': 'search',
                //'change .import_product_search': 'search',
                //'click #downLoadFile': 'downLoadFile',
                //'change .select-time': 'selectTimeChange'
                'change select.select-supplier-in-edit': 'supplierChange',

            },

            initialize: function () {
                var self = this;

                this.supplierCollection = this.model.get('supplierCollection'); //new app.collections.SupplierCollection();

                var stockModel = this.stockModel = this.model.get('stockModel');

                var selectTimePeriodModel = this.selectTimePeriodModel = new Backbone.Model();

                var selectTimePeriodView = new app.views.SelectTimePeriod({
                    el: '.SelectTimePeriod',
                    model: selectTimePeriodModel
                });

                var payment_type = this.model.get('payment_type');

                self.searchSessionId(payment_type, function () {
                    self.$el.find(".select-sessionId").bind("change", function (event, ui) {
                        self.search();
                    });
                });

                selectTimePeriodModel.on('change', function (model) {
                    self.searchSessionId(payment_type, function () {
                        self.search();
                    });
                });

                stockModel.on('change:stock', function (model, stock) {

                    if (stock.length > 0) {
                        self.$el.find('.select-stock option').remove();
                        _.each(stock, function (item) {
                            self.$el.find('.select-stock').append('<option value="' + item + '">' + item + '</option>');
                        });

                        self.$el.find('.select-stock').append('<option value="">All List</option>');                        
                        self.$el.find('.select-stock').trigger("change");
                    }
                });
                stockModel.on('change:stock_selected', function (model, stock_selected) {

                    //self.$el.find('.select-stock select').val(stock_selected).trigger("change");
                    var stockSelectedInner = self.$el.find('.select-stock option:selected').select().val();

                    if (stock_selected != stockSelectedInner) {
                        console.log('change:stock_selected iner');
                        self.$el.find('.select-stock option[value=' + stock_selected + ']').prop('selected', true).trigger("change");
                    }
                });
                //var stock_selected = stockModel.get('stock_selected');
                //console.log(stock_selected);

                self.$el.find(".select-stock").bind("change", function (event, ui) {
                    //var stockSelected = self.$el.find('.select-stock option:selected').select().text();
                    var stockSelected = self.$el.find('.select-stock option:selected').select().val();                    

                    //console.log('stock_selected', stockSelected);
                    stockModel.set('stock_selected', stockSelected);
                });

                this.collection.on('add', this.addOne, this);
                this.collection.on('reset', this.resetProduct, this);

                this.render();

                if (app.userModel.get('type') == 'staff_support') {
                    self.$el.find('.div-select-supplier-in-edit').remove();//select-supplier-in
                }
                else {

                    this.supplierCollection.on('reset', function () {
                        self.$el.find('.select-supplier-in-edit option').remove();
                        self.supplierCollection.each(function (model) {
                            var code = model.get('code');
                            var name = code + ' (' + model.get('name') + ')';

                            self.$el.find('.select-supplier-in-edit').append('<option value="' + code + '">' + name + '</option>');
                        });

                        self.$el.find('.select-supplier-in-edit').append('<option value="[--All Suppliers--]">[--All Suppliers--]</option>');
                        self.$el.find('.select-supplier-in-edit').trigger("change");
                    });
                }
            },

            // Re-rendering the App just means refreshing the statistics -- the rest
            // of the app doesn't change.
            render: function () {
                //console.log('ImportProductEdit:render');
                this.collection.comparator = function (model) {
                    return model.get('code');
                }

                this.$el.find('.EditTableTr').remove();
                this.collection.each(this.addOne, this);

                if (app.userModel.get('type') == 'staff_support') {
                    this.$el.find('td:nth-child(5),th:nth-child(5)').hide();
                    this.$el.find('td:nth-child(7),th:nth-child(7)').hide();
                }

                return this;
            },
            showAll: function () {
                var self = this;

                var stockSelected = this.stockModel.get('stock_selected'); //$('.select-stock  option:selected').select().text();
                //app.serviceMethod.getAllProducts(stockSelected, function (result) {
                //    _.each(result, function (item) {
                //        item['stock_name'] = stockSelected;
                //    });
                //    self.resetFromService(result, stockSelected);
                //});

                //app.serviceMethod.getAllSupplier(function (result) {
                //    //_.each(result, function (item) {
                //    //    item['stock_name'] = stockSelected;
                //    //});
                //    self.resetFromService(result);
                //});

                this.collection.getAll(stockSelected);

            },
            showInPeriod: function (timeStart, timeEnd) {
                var stockSelected = this.stockModel.get('stock_selected');
                this.collection.getInPeriod(stockSelected, timeStart, timeEnd);
            },
            resetFromService: function (result, stockSelected) {
                var self = this;
                self.collection.reset(result);
            },

            search: function (ev) {

                //var searchText = this.$el.find('.show_search').val();
                var searchText = this.$el.find('.import_product_search').val().trim();
                var purchaseID = this.getSearchSession();// this.$el.find('.import_product_searchPurchaseID').val().trim();

                var supplierSelected = null

                if (app.userModel.get('type') != 'staff_support') {
                    supplierSelected = this.$el.find('select.select-supplier-in-edit').val(); // self.supplierSelected;
                }

                if (supplierSelected == '[--All Suppliers--]') {
                    supplierSelected = null;
                }


                var selectTimePeriodModel = this.selectTimePeriodModel;

                var timeStart = selectTimePeriodModel.get('timeStart');
                var timeEnd = selectTimePeriodModel.get('timeEnd');

                var stockSelected = this.stockModel.get('stock_selected');


                //this.showInPeriod(timeStart, timeEnd);

                if (!searchText && !supplierSelected && !purchaseID) {
                    this.collection.getInPeriod(stockSelected, timeStart, timeEnd);
                } else {
                    var searchObj = {};
                    if (searchText) {
                        searchObj.invoid_id = searchText;
                    }
                    if (supplierSelected) {
                        searchObj.supplier_code = supplierSelected;
                    }
                    if (purchaseID) {
                        searchObj.sessionId = purchaseID;
                    }

                    //console.log('search', stockSelected, timeStart, timeEnd, searchObj);

                    this.collection.getInPeriodWithSearch(stockSelected, timeStart, timeEnd, searchObj);// code: searchText, supplier_code: searchText, 
                }
                //this.getInPeriodWithSearch(timeStart, timeEnd);
            },

            addOne: function (model) {
                //console.log('ImportProductEdit:addOne');

                var view = new app.views.ImportProductEditTableTr({ model: model, collection: this.supplierCollection });
                var El = view.render().el;
                this.$el.find('tbody').append(El);
            },
            resetProduct: function (supplier) {
                this.render();
            },
            downLoadFile: function () {

                this.collection.saveToXlsx("#" + this.$el.find('.show_search').val());
            },
            selectTimeChange: function (ev) {
                //var $el = $(ev.target);
                //var selected = $el.val();
                //var selected = $('.select-time').val();

                this.search();
            },
            supplierChange: function () {
                this.search();
            },
            getSearchSession: function () {
                var selectedId = this.$el.find('.select-sessionId option:selected').select().val();

                if (selectedId == '###ALL###') {
                    selectedId = null;
                }

                return selectedId;
            },
            searchSessionId: function (payment_type, cb) {
                var self = this;

                var selectTimePeriodModel = this.selectTimePeriodModel;

                var timeStart = selectTimePeriodModel.get('timeStart');
                var timeEnd = selectTimePeriodModel.get('timeEnd');


                this.getSessionInPeriod(payment_type, timeStart, timeEnd, function (result) {
                    self._purchaseSessionDataObj = {}

                    self.$el.find('.select-sessionId option').remove();

                    self.$el.find('.select-sessionId').append('<option value="###ALL###">All</option>');

                    if (result.length) {
                        self.$el.find('.select-sessionId').prop('disabled', false);
                        _.each(result, function (item) {
                            var sessionId = item.sessionId;

                            self._purchaseSessionDataObj[sessionId] = item;

                            var name = sessionId + ' (' + item.payment_type + ')';

                            self.$el.find('.select-sessionId')
                                .append('<option value="' + sessionId + '">' + name + '</option>');

                        })

                    } else {

                        self.$el.find('.select-sessionId').prop('disabled', true);
                    }

                    // self.supplierCollection.each(function (model) {
                    //     var code = model.get('code');
                    //     var name = code + ' (' + model.get('name') + ')';

                    //     self.$el.find('.select-supplier-in-edit').append('<option value="' + code + '">' + name + '</option>');
                    // });

                    //self.$el.find('.select-supplier-in-edit').append('<option value="[--All Suppliers--]">[--All Suppliers--]</option>');
                    self.$el.find('.select-sessionId').trigger("change");

                    if (cb) { cb() };
                });
            },

            getSessionInPeriod: function (payment_type, timeStart, timeEnd, cb) {
                console.log('getSessionIdInPeriod', timeStart, timeEnd);
                var self = this;
                app.serviceMethod.getPurchaseSessionInPeriod({ timeStart: timeStart, timeEnd: timeEnd }, function (result) {

                    if (payment_type) {
                        result = _.where(result, { payment_type: payment_type })
                    }
                    // var sessionIds = _.chain(result).pluck('sessionId').value();
                    // console.log(sessionIds);
                    result = result.reverse()
                    if (cb) cb(result);
                });
            },
        });
    });

})(jQuery);
