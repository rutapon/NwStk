/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    $(function () {
        app.views.ExportProductEdit = Backbone.View.extend({

            // Instead of generating a new element, bind to the existing skeleton of
            // the App already present in the HTML.
            el: '#editNav',

            // Delegated events for creating new items, and clearing completed ones.
            events: {
                'keyup .export_product_search': 'search',
                //'change .show_search': 'search',
                //'click #downLoadFile': 'downLoadFile',
                //'change .select-time': 'selectTimeChange'
            },

            initialize: function () {
                var self = this;

                var stockModel = this.model;

                var selectTimePeriodModel = this.selectTimePeriodModel = new Backbone.Model();

                var selectTimePeriodView = new app.views.SelectTimePeriod({
                    el: '.SelectTimePeriod',
                    model: selectTimePeriodModel
                });

                selectTimePeriodModel.on('change', function (model) {
                    self.search();
                });

                stockModel.on('change:stock', function (model, stock) {

                    if (stock.length > 0) {
                        self.$el.find('.select-stock option').remove();
                        _.each(stock, function (item) {
                            self.$el.find('.select-stock').append('<option value="' + item + '">' + item + '</option>');
                            self.$el.find('.select-stock').trigger("change");
                        });
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
                var stock_selected = stockModel.get('stock_selected');
                console.log(stock_selected);

                self.$el.find(".select-stock").bind("change", function (event, ui) {
                    var stockSelected = self.$el.find('.select-stock option:selected').select().text();
                    //console.log('stock_selected', stockSelected);
                    stockModel.set('stock_selected', stockSelected);
                });

                this.collection.on('add', this.addOne, this);
                this.collection.on('reset', this.resetProduct, this);

                this.supplierCollection = new app.collections.SupplierCollection();
                this.supplierCollection.getAll();

                this.render();
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
                return this;
            },
            showAll: function () {
                var self = this;

                var stockSelected = this.model.get('stock_selected'); //$('.select-stock  option:selected').select().text();
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
                var stockSelected = this.model.get('stock_selected');
                this.collection.getInPeriod(stockSelected, timeStart, timeEnd);
            },
            resetFromService: function (result, stockSelected) {
                var self = this;
                self.collection.reset(result);
            },
            search: function (ev) {

                //var searchText = this.$el.find('.show_search').val();
                //var selectTime = $('.select-time option:selected').select().val();

                var searchText = this.$el.find('.docNumberSearch').val().trim();
                var job = this.$el.find('.deptSaerch').val().trim(); // self.supplierSelected;

                var selectTimePeriodModel = this.selectTimePeriodModel;

                var timeStart = selectTimePeriodModel.get('timeStart');
                var timeEnd = selectTimePeriodModel.get('timeEnd');

                var stockSelected = this.model.get('stock_selected');

                //if (!searchText && !job) {
                //    this.collection.getInPeriod(stockSelected, timeStart, timeEnd);
                //} else
                {
                    var searchObj = {};
                    if (searchText) {
                        searchObj.requisition_id = searchText;
                    }
                    if (job) {
                        searchObj.job = job;
                    }

                    this.collection.getInPeriodWithSearch(stockSelected, timeStart, timeEnd, searchObj);//{ code: searchText, requisition_id: searchText, job: searchText }
                }

                //if (selectTime) {
                //    var now = new Date();
                //    var timeStart;
                //    var timeEnd = now;

                //    var selectTimeMap = {
                //        oneDay: function () {
                //            timeStart = addDays(now, -1);
                //        },
                //        sevenDay: function () {
                //            timeStart = addDays(now, -7);
                //        },
                //        oneMonth: function () {
                //            timeStart = addMonths(now, -1);
                //        },
                //        oneYear: function () {
                //            timeStart = addYears(now, -1);
                //        }
                //    }

                //    selectTimeMap[selectTime]();

                //    //var stockSelected = this.model.stockModel.get('stock_selected'); //$('.select-stock  option:selected').select().text();
                //    //app.serviceMethod.findeProductStartWith(stockSelected, searchText, 100, function (result) {

                //    //    _.each(result, function (item) {
                //    //        item['stock_name'] = stockSelected;
                //    //    });

                //    //    self.resetFromService(result, stockSelected);
                //    //});
                //    this.showInPeriod(timeStart, timeEnd);

                //} else {
                //    this.showAll();
                //}
            },

            addOne: function (model) {
                //console.log('ImportProductEdit:addOne');

                var view = new app.views.ExportProductEditTableTr({ model: model, collection: this.supplierCollection });
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
            }
        });
    });

})(jQuery);
