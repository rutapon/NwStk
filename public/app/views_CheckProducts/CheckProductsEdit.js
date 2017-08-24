/// <reference path="../../lib/underscore/underscore.js" />
/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || { models: {}, collections: {}, views: {} };

(function ($) {
    'use strict';

    function areYouSure(text1, text2, button, callback) {
        console.log('areYouSure');
        $("#sure .sure-1").text(text1);
        $("#sure .sure-2").text(text2);
        if (!button) {
            $("#sure .sure-do").hide();
        } else {
            $("#sure .sure-do").show();
            $("#sure .sure-do").text(button).on("click", function () {
                callback();
                $(this).off("click");
            });
        }

        $("#sure").popup('open');
    }
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

    app.views.CheckProductsEdit = Backbone.View.extend({

        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        //el: '#showProductNav',

        // Delegated events for creating new items, and clearing completed ones.
        events: {

            'click .SaveCheckProducts': 'SaveCheckProducts',
            'click .EditCheckProducts': 'EditCheckProducts',
            'click .DeleteCheckProducts': 'DeleteCheckProducts',
            'change select.select-checking-date': 'checkingDateChange'
        },

        initialize: function () {

            var self = this;

            //this.$el.find('.info h2').text('ตรวจนับ ณ วันที่: ' + dateStr.replace(/-/g, '/'));


            var exportProductTable = this.$el.find('#ReportCheckProductEditTable').get(0);

            var stockModel = this.model.stockModel;
            var collection = this.collection = new app.collections.CheckProductsCollection();

            collection.comparator = function (model) {
                return model.get('code');
            };
            collection.splice = hackedSplice;

            self.$el.find(".select-stock").bind("change", function (event, ui) {
                var stockSelected = self.$el.find('.select-stock option:selected').select().text();
                console.log('stock_selected', stockSelected);
                stockModel.set('stock_selected', stockSelected);
            });

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

                self.updateCheckDate(stock_selected);
            });


            //stockModel.on('change:stock_selected', function (model, stock_selected) {
            //    //viewSelectProduct.clear();
            //});



            var importDataTable = new Handsontable(exportProductTable, {
                data: collection,
                //stretchH: 'all',
                multiSelect: false,
                //dataSchema: makeCar,
                contextMenu: true,
                height: 400,
                columns: [
                 { readOnly: true, data: attr('code') },
                 { readOnly: true, data: attr('name') },
                 { readOnly: true, data: attr('unit_type') },
                  {
                      data: attr('unit'),
                      type: 'numeric',
                      //strict: true
                  },

                ],
                colHeaders: [
                    'code',
                    'Description',
                    'UnitType',
                    'UnitCount',
                ]

            });

            collection.on('reset', function () {
                importDataTable.render();
            })

                .on('remove', function () {
                    importDataTable.render();
                });


            // normally, you'd get these from the server with .fetch()
            function attr(attr) {
                // this lets us remember `attr` for when when it is get/set
                return function (m, value) {
                    if (_.isUndefined(value)) {
                        return m.get(attr);
                    } else {
                        //console.log('set', value);
                        m.set(attr, value);
                    }
                };
            }

            function hackedSplice(index, howMany /* model1, ... modelN */) {
                var args = _.toArray(arguments).slice(2).concat({ at: index }),
                  removed = this.models.slice(index, index + howMany);

                this.remove(removed).add.apply(this, args);

                return removed;
            }

            self.$el.find('.editCheckProductButon').hide();
        },

        updateCheckDate: function (stock_selected) {
            var self = this;
            self.collection.getCheckProductDate(stock_selected,
                     function (result) {

                         self.$el.find('select.select-checking-date option').remove();
                         if (result.length) {
                             self._checkProductDates = result;
                             _.each(result, function (item) {
                                 self.$el.find('select.select-checking-date').append('<option value="' + item + '">' + item + '</option>');
                             });
                             self.$el.find('.editCheckProductButon').show();
                         } else {
                             self._checkProductDates = null;
                             self.$el.find('select.select-checking-date').append('<option value="[--No Report--]">[--No Report--]</option>');
                             self.$el.find('.editCheckProductButon').hide();
                         }

                         self.$el.find('select.select-checking-date').trigger("change");
                     });
        },

        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function () {
            var stockSelected = this.model.stockModel.get('stock_selected');
            //var dateSelect = self.$el.find('select.select-checking-date').val();

            if (stockSelected) {
                this.updateCheckDate(stockSelected);
                //this.search();
                //this.collection.getCheckProduct(stockSelected, this.dateStr);
            }
        },

        search: function () {

            var self = this;
            var dateSelect = self.$el.find('select.select-checking-date').val();
            var stockSelected = this.model.stockModel.get('stock_selected'); //$('.select-stock  option:selected').select().text();

            if (stockSelected && dateSelect && dateSelect != '[--No Report--]') {
                this.collection.getCheckProductForEdit(stockSelected, dateSelect, function (result) {

                    //console.log(result);
                    //var allSum = _.reduce(result, function (memo, obj) { return memo + obj.sum; }, 0);
                    //var diffSum = _.reduce(result, function (memo, obj) { return memo + obj.dif_sum; }, 0);

                    //self.$el.find(".productInfo h2").text('For: ' + dateSelect.replace(/-/g, '/') + ' ### amount: ' + allSum + ' defferent amount' + diffSum);
                });
            } else {
                //self.$el.find(".productInfo h2").text('Amount: ' + 0 + ' Defferent Amount' + 0);

                self.collection.reset();
            }
        },
        SaveCheckProducts: function () {

            var self = this;

            areYouSure("Are you sure?", "Save data to server?", "Ok", function () {

                var stock_selected = self.model.stockModel.get('stock_selected');
                //console.log(self.exportProductCollection.toArray());
                self.collection.saveToServer(stock_selected, function (err, numSave) {
                    if (err) {
                        alert(err);
                    } else {
                        //self.clearNewProductRow();
                        setTimeout(function () {
                            alert('Data has save to stock "' + stock_selected + '" ' + numSave + ' row');
                        }, 1);
                    }
                 
                });

            });
        },
        EditCheckProducts: function () {
            var self = this;
            var dateSelect = self.$el.find('select.select-checking-date').val();

            var db = $("<input>").datebox({
                mode: "calbox"
            });
            db.val(dateSelect);
            db.bind('datebox', function (e, p) {
                if (p.method == 'set') {
                    //e.stopImmediatePropagation();
                    var dateBoxSelected = db.val();

                    if (dateBoxSelected != dateSelect) {
                        var findResult = _.find(self._checkProductDates, function (date) {
                            return date == dateBoxSelected;
                        });

                        if (findResult) {
                            setTimeout(function () {
                                areYouSure('Edit Problem', 'Date ' + dateBoxSelected + ' is duplicate.');
                            }, 300);

                        } else {
                            setTimeout(function () {
                                areYouSure("Are you sure?", "Change checking date " + dateSelect + " to " + dateBoxSelected, "Ok", function () {
                                    var stock_selected = self.model.stockModel.get('stock_selected');

                                    self.collection.editCheckProductDate(stock_selected, dateSelect, dateBoxSelected, function () {
                                        setTimeout(function () {
                                            areYouSure('Change checking date has Change', dateSelect + " to " + dateBoxSelected);
                                        }, 300);

                                        self.render();
                                    });

                                });
                            }, 300);
                        }
                        console.log(findResult);
                    }

                }

                e.stopPropagation();
            });

            db.datebox('open');

            //someDate = db.datebox("parseDate", someDateFormat, someDateString);
        },
        DeleteCheckProducts: function () {
            var self = this;
            var dateSelect = self.$el.find('select.select-checking-date').val();
            var stockSelected = self.model.stockModel.get('stock_selected'); //$('.select-stock  option:selected').select().text();

            areYouSure("Are you sure?", "Delete checking data " + stockSelected + "_" + dateSelect + " from server?", "Ok", function () {
                self.collection.deleteCheckProducts(stockSelected, dateSelect, function () {
                    self.render();
                });
                // self.$el.remove();
            });
        },
        //search: function (ev) {
        //    var searchText = this.select_product_search.val();// $(ev.target).val();

        //    if (searchText) {
        //        var self = this;
        //        var stockSelected = this.stockModel.get('stock_selected'); //$('.select-stock  option:selected').select().text();
        //        console.log(searchText + ' product ' + stockSelected);

        //        app.serviceMethod.findeProductStartWith(stockSelected, searchText, 100, function (result) {
        //            self.resetFromService(result, stockSelected);
        //        });
        //    } else {
        //        this.collection.reset();
        //    }
        //},
        saveExportProduct: function () {
            var self = this;

            areYouSure("Are you sure?", "Save data to server?", "Ok", function () {
                var stockModel = self.model.get('stockModel');
                var stock_selected = stockModel.get('stock_selected');
                //console.log(self.collection.toArray());
                self.collection.saveToServer(stock_selected, function (err, numSave) {
                    if (err) {
                        //alert(err);
                    } else {
                        self.clearNewProductRow();
                    }

                    setTimeout(function () {
                        alert('Data has save to stock "' + stock_selected + '" ' + numSave + ' row');
                    }, 1);
                });


                //self.collection.forEach(function (model) {
                //    //console.log(model.toJSON());

                //    model.save(stockModel.get('stock_selected'), function () {

                //    });

                //});
            });
        },
        checkingDateChange: function () {
            this.search();
        },

    });

})(jQuery);
