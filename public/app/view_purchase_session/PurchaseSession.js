/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    $(function () {

        app.views.PurchaseSession = Backbone.View.extend({

            // Instead of generating a new element, bind to the existing skeleton of
            // the App already present in the HTML.
            //el: '#PurchaseSession',

            // Delegated events for creating new items, and clearing completed ones.
            events: {
                'click #PrintFormButton': 'printReport'
            },
            _purchaseSessionDataObj: {},


            initialize: function () {
                var self = this;

                var selectTimePeriodModel = this.selectTimePeriodModel = new Backbone.Model();

                var selectTimePeriodView = new app.views.SelectTimePeriod({
                    el: '.SelectTimePeriod',
                    model: selectTimePeriodModel
                });

                var purchaseSessionSelectedModel = new app.models.PurchaseSessionModel();

                var payment_type = app.url.getUrlParameter('payment_type');
               
                selectTimePeriodModel.on('change', function (model) {
                    self.searchSessionId(payment_type);
                });

                self.$el.find(".select-sessionId").bind("change", function (event, ui) {
                    var selectedId = self.$el.find('.select-sessionId option:selected').select().val();

                    if (selectedId == '###ALLCD###') {
                        purchaseSessionSelectedModel.set('sessionId', '');
                        self.addtPurchaseSessionByPaymentType('Credit');
                    } else if (selectedId == '###ALLPC###') {
                        purchaseSessionSelectedModel.set('sessionId', '');
                        self.addtPurchaseSessionByPaymentType('PettyCash');
                    }
                    else if (selectedId != 'NoSessionValue') {
                        purchaseSessionSelectedModel.set('sessionId', selectedId);
                    }

                    //console.log('stock_selected', stockSelected);
                    //stockModel.set('stock_selected', stockSelected);
                });

                purchaseSessionSelectedModel.on('change:sessionId', function () {
                    var sessionId = this.get('sessionId');
                    console.log('sessionId', sessionId);
                    self.clearAll();
                    if (sessionId) {
                        self.addOne(sessionId);
                    }
                });

                self.searchSessionId(payment_type, function (result) {
                    var selectIdUrlParam = app.url.getUrlParameter('id');
                    if(selectIdUrlParam){
                        //console.log(selectIdUrlParam);
                        var $selectId= self.$el.find("select.select-sessionId")
                        $selectId.val(selectIdUrlParam);
                        $selectId.trigger("change");
                    }
                });
                this.allReportCollection = [];
                // this.collection.on('add', this.addOne, this);
                // this.collection.on('reset', this.resetProduct, this);
            },
            addtPurchaseSessionByPaymentType: function (payment_type) {
                var self = this;
                var purchaseSessionDataOfType = _.where(this._purchaseSessionDataObj, { payment_type: payment_type });
                async.eachSeries(purchaseSessionDataOfType, function (item, callback) {
                    self.addOne(item.sessionId, callback);
                });

                // _.each(this._purchaseSessionDataObj, function (item) {
                //     if (item.payment_type == payment_type) {
                //         addOne
                //     }
                // })
            },
            addOne: function (selectedId, cb) {
                console.log('addOne PurchaseSession', selectedId);
                var self = this;

                var purchaseSessionModel = this.model = new app.models.PurchaseSessionModel();
                var importProductCollection = this.collection = new app.collections.ImportProductCollection();

                purchaseSessionModel.set(self._purchaseSessionDataObj[selectedId])

                if (purchaseSessionModel.get('payment_type') == 'PettyCash') {
                    purchaseSessionModel.setCurrentPettyCashData();
                }

                var sessionId = purchaseSessionModel.get('sessionId');

                var purchaseSessionShowView = new app.views.PurchaseSessionShow({
                    //el: '.PurchaseSessionShow',
                    model: purchaseSessionModel,
                    collection: importProductCollection
                });

                this.allReportCollection.push(purchaseSessionShowView);
                var eachViewEl = purchaseSessionShowView.render();
                $('.PurchaseSessionShowResult').append(purchaseSessionShowView.el);
                importProductCollection.getBySessionId(sessionId, function () { if (cb) cb() })

            },
            clearAll: function () {
                // if (this.purchaseSessionShowView) {
                //     this.purchaseSessionShowView.remove();
                // }

                _.each(this.allReportCollection, function (item) {
                    item.remove();
                })

                this.allReportCollection = [];
            },
            searchSessionId: function (payment_type, cb) {
                var self = this;

                var selectTimePeriodModel = this.selectTimePeriodModel;

                var timeStart = selectTimePeriodModel.get('timeStart');
                var timeEnd = selectTimePeriodModel.get('timeEnd');

                this.getSessionInPeriod(payment_type, timeStart, timeEnd, function (result) {
                    self._purchaseSessionDataObj = {}

                    self.$el.find('.select-sessionId option').remove();

                    if (result.length) {
                        self.$el.find('.select-sessionId').prop('disabled', false);
                        _.each(result, function (item) {
                            var sessionId = item.sessionId;

                            self._purchaseSessionDataObj[sessionId] = item;

                            var name = sessionId + ' (' + item.payment_type + ')';

                            self.$el.find('.select-sessionId')
                                .append('<option value="' + sessionId + '">' + name + '</option>');

                        })
                        if (payment_type == 'Credit') {
                            self.$el.find('.select-sessionId')
                                .append('<option value="###ALLCD###">All Credit</option>');
                        } else if (payment_type == 'PettyCash') {
                            self.$el.find('.select-sessionId')
                                .append('<option value="###ALLPC###">All PettyCash</option>');
                        }

                    } else {
                        self.$el.find('.select-sessionId')
                            .append('<option value="NoSessionValue">No Session</option>');
                        //self.$el.find('.select-sessionId').attr('disabled', 'disabled')
                        self.$el.find('.select-sessionId').prop('disabled', true);
                    }


                    // self.supplierCollection.each(function (model) {
                    //     var code = model.get('code');
                    //     var name = code + ' (' + model.get('name') + ')';

                    //     self.$el.find('.select-supplier-in-edit').append('<option value="' + code + '">' + name + '</option>');
                    // });

                    //self.$el.find('.select-supplier-in-edit').append('<option value="[--All Suppliers--]">[--All Suppliers--]</option>');
                    self.$el.find('.select-sessionId').trigger("change");

                    if (cb) cb(result);
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
            getInPeriod: function (stock_selected, timeStart, timeEnd, cb) {

                var self = this;
                app.serviceMethod.getImportProductInPeriod({ stock_name: stock_selected, timeStart: timeStart, timeEnd: timeEnd }, function (result) {
                    //console.log(result);

                    var codes = _.chain(result).pluck('code').uniq().value();

                    app.serviceMethod.getProductByCodeArray({ stock_name: stock_selected, codes: codes }, function (products) {

                        result = _.map(result, function (obj) {
                            var product = _.findWhere(products, { code: obj.code });
                            return _.extend(obj, _.pick(product, ['name', 'unit_type']));
                        });

                        self.reset(result);
                        if (cb) cb(result);
                    });
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

            printReport: function () {
                var self = this;
                var collection = this.collection;
                var model = this.model;
                var detailStr = 'Create Date: ' + new Date(parseInt(model.get('_id').substring(0, 8), 16) * 1000).toString().split(' (')[0];//new Date().toLocaleString();
                var v = (new Date()).getTime();
                var myWindow = window.open("../report/PurchaseSessionReport.html" + '?v=' + v, 'test', 'width=' + 900 + ',height=' + 500 + '');

                var handle = setInterval(function () {
                    console.log('in', myWindow.window.printFunc);
                    if (myWindow.window.createReportFunc) {
                        clearInterval(handle);

                        let reportObj = {
                            detail: detailStr,
                            allReportCollection: self.allReportCollection
                            //collection: collection,
                            //model: model
                        }

                        myWindow.window.createReportFunc(reportObj);
                    }
                }, 100);
            },

            resetProduct: function (supplier) {
                this.render();
            },

        });
    });

})(jQuery);
