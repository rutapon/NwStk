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
        $("#sure .sure-do").text(button).on("click", function () {
            callback();
            $(this).off("click");
        });
        $("#sure").popup('open');
    }

    function savedAlert(text1, text2, button, callback) {
        console.log('savedAlert');
        $("#savedAlert .sure-1").text(text1);
        $("#savedAlert .sure-2").text(text2);
        $("#savedAlert .sure-do").text(button).on("click", function () {
            callback();
            $(this).off("click");
        });
        $("#savedAlert").popup('open');
    }

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

    app.views.ImportProductCreate = Backbone.View.extend({

        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        //el: '#showProductNav',

        // Delegated events for creating new items, and clearing completed ones.
        events: {

            'click .SelectProductPopUpButton': 'SelectProductPopUpButtonClick',

            //'keyup .select_product_search': 'search',
            //'change .select_product_search': 'search',
            //'click .selectClick': 'selectClick',
            //'click .cancelClick': 'cancelClick',
            'change select.select-supplier-in': 'supplierChange',
            'click .ClearNewProductRow': 'clearNewProductRow',
            'click .SaveImportProduct': 'saveImportProduct',
            'click #PrintFormButton': 'printReport'
        },
        initialize: function () {

            var self = this;


            this.supplierCollection = this.model.get('supplierCollection'); //new app.collections.SupplierCollection();

            this.importProductTable = this.$el.find('#popupImportProduct').get(0);
            var selectImportProductTable = $(".select-result");
            this.select_product_search = this.$el.find('.select_product_search');

            var stockModel = this.model.get('stockModel');
            var importProductCollection = this.importProductCollection = this.model.get('importProductCollection');
            var purchaseSessionModel = this.purchaseSessionModel = this.model.get('purchaseSessionModel');
            purchaseSessionModel.set('payment_type', this.model.get('payment_type'))

            importProductCollection.splice = hackedSplice;

            var supplyLogCollection = new app.collections.SupplyLogCollection();

            self.currentListType = null;
            self.$el.find(".select-stock").bind("change", function (event, ui) {

                var stockSelected = self.$el.find('.select-stock option:selected').select().val();
                console.log('stock_selected', stockSelected);
                if (stockSelected) {
                    stockModel.set('stock_selected', stockSelected);
                    var listType = stockSelected.split('-')[0];

                    if (self.currentListType != listType) {
                        self.currentListType = listType;

                        //importProductCollection.reset();
                    }
                }
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
                var stockSelectedInner = self.$el.find('.select-stock option:selected').select().val();

                if (stock_selected != stockSelectedInner) {
                    //console.log('change:stock_selected iner');
                    self.$el.find('.select-stock option[value=' + stock_selected + ']').prop('selected', true).trigger("change");;
                }
            });
            //stockModel.on('change:stock_selected', function (model, stock_selected) {
            //    //viewSelectProduct.clear();
            //});

            //var supplierCollection = new app.collections.SupplierCollection();
            //supplierCollection.getAll();

            if (app.userModel.get('type') == 'staff_support') {
                self.$el.find('.div-select-supplier-in').remove();//select-supplier-in
            }
            else {

                this.supplierCollection.on('reset', function () {

                    self.$el.find('.select-supplier-in option').remove();
                    self.supplierCollection.each(function (model) {
                        var code = model.get('code');
                        var name = code + ' (' + model.get('name') + ')';

                        self.$el.find('.select-supplier-in').append('<option value="' + code + '">' + name + '</option>');
                    });

                    self.$el.find('.select-supplier-in').trigger("change");
                });
            }

            //$('#sum-amount-label').text('All Amount: ''฿');
            this.initImportProductCollectionEventHandle();
            self.initTable();

            // this.purchaseSessionModel.on('change:sessionId', function (model) {
            //     self.$el.find("#SessionId").val(model.get('sessionId'))
            // })

        },

        initImportProductCollectionEventHandle: function () {
            var self = this;
            var importProductCollection = self.importProductCollection;

            importProductCollection.on('change:sum', function (model) {

                var sumAmount = 0;
                importProductCollection.forEach(function (modelEach, index) {
                    sumAmount += modelEach.attributes['sum'];
                });

                if (self.purchaseSessionModel) {
                    self.purchaseSessionModel.set('sum', sumAmount)
                }

                $('#sum-amount-label').text('All Amount: ' + sumAmount + '฿');
            });

            self.invoid_id_last = null;

            importProductCollection.on('change:invoid_id', function (model) {
                self.invoid_id_last = model.get('invoid_id');
                //console.log('change:invoid_id',invoid_id);
                importProductCollection.forEach(function (modelEach, index) {
                    if (!modelEach.attributes['invoid_id'] && model.cid != modelEach.cid) {
                        modelEach.attributes['invoid_id'] = self.invoid_id_last;
                    }
                });

            });
            importProductCollection.on('change:in_date', function (model) {
                var in_date = model.get('in_date');
                //console.log('change:invoid_id',invoid_id);
                importProductCollection.forEach(function (modelEach, index) {
                    if (model.cid != modelEach.cid) {
                        modelEach.attributes['in_date'] = in_date;
                    }
                });
            });

            importProductCollection.on('change:sum', function (model) {
                var numPrice = 0;

                for (var i = 1; i <= 3; i++) {
                    if (model.get('unit_price' + i)) {
                        numPrice++;
                    }
                }

                if (numPrice != 0) {
                    var sum = model.attributes.unit * model.attributes.unit_price;
                    if (sum != model.get('sum')) {
                        alert('Can not set amount directly.')
                        model.calSum();
                    }
                }


            });

            importProductCollection.on('change:unit', function (model) {
                if (model.get('unit') != '') {
                    var numPrice = 0;

                    for (var i = 1; i <= 3; i++) {
                        if (model.get('unit_price' + i)) {
                            numPrice++;
                        }
                    }
                    //var stock_name = ImportProductModel.get('stock_name')
                    // console.log(stock_name);
                    if (numPrice == 0) {//(stock_name.split('-')[0] == 'OE') {
                        alert('Can not set unit number')
                        model.set('unit', '')
                    }

                    //    // var stock_name = model.get('stock_name');
                    //     if (stock_name.split('-')[0] == 'OE') {
                    //         alert('Can not set unit number for OE')
                    //         model.set('unit', '')
                    //     }
                }

            });

            importProductCollection.on('all', function () {
                self.importDataTable.render();
            }).on('add', function (model) {

                var supplierSelected = self.$el.find('select.select-supplier-in').val(); // self.supplierSelected;

                //var foundSupplier = false;
                for (var i = 1; i <= 3; i++) {
                    if (model.get('supplier' + i) == supplierSelected) {
                        model.set('unit_price', model.get('unit_price' + i));
                        break;
                    }
                }
                //if (!foundSupplier) {
                //    model.set('unit_price', model.get());
                //}

                if (self.invoid_id_last) {
                    model.attributes['invoid_id'] = self.invoid_id_last;
                }

                self.importDataTable.render();
            }).on('remove', function () {
                self.importDataTable.render();
            });

        },
        initTable: function () {
            console.log('initTable');
            //var importDataTable;
            var self = this;
            var importProductTable = self.importProductTable;
            $(importProductTable).html('');

            var importProductCollection = self.importProductCollection;
            var columns;
            var colHeaders;

            var setCol = function (colName, colObj, newColName) {
                var colId = colHeaders.indexOf(colName);
                columns[colId] = colObj;
                if (newColName) colHeaders[colId] = newColName;
            }
            var removeCol = function (colName) {
                var colId = colHeaders.indexOf(colName);
                colHeaders.splice(colId, 1);
                columns.splice(colId, 1);
            }

            var unit_priceConDition = function () {
                // this lets us remember `attr` for when when it is get/set
                return function (m) {
                    m.get('')
                    // if (_.isUndefined(value)) {
                    //     return m.get(attr);
                    // } else {
                    //     //console.log('set', value);
                    //     m.set(attr, value);
                    // }
                };
            }

            columns = [
                { readOnly: true, data: attr('code') },
                { readOnly: true, data: attr('nameTh') },
                { readOnly: true, data: attr('nameEn') },
                { readOnly: true, data: attr('unit_type') },
                {

                    data: attr('unit_price'),
                    //type: 'autocomplete',
                    type: 'dropdown',
                    //allowInvalid: false,
                    //strict: true,
                    source: function (query, process) {
                        //    //console.log(this.row);

                        var ImportProductModel = importProductCollection.at(this.row);

                        var priceArr = [];

                        for (var i = 1; i <= 3; i++) {
                            if (ImportProductModel.get('unit_price' + i)) {
                                priceArr.push(ImportProductModel.get('unit_price' + i));
                            }
                        }
                        //var stock_name = ImportProductModel.get('stock_name')
                        // console.log(stock_name);
                        if (priceArr.length == 0) {//(stock_name.split('-')[0] == 'OE') {
                            priceArr.push('')
                        }

                        //    console.log(stockModel.get('stock_selected'), ImportProductModel.get('code'));

                        //    var code = ImportProductModel.get('code')
                        //    supplyLogCollection.findeSupplyLog(code, stockModel.get('stock_selected'), function () {

                        //        process(_.uniq(supplyLogCollection.pluck('unit_price')).reverse().splice(0, 6));
                        //    });
                        process(priceArr);
                        //    //process([10, 50, 100]);

                    },
                    //filter: false
                },
                {
                    data: attr('invoid_id'),
                },

                {
                    data: attr('in_date'),
                    type: 'date',
                    dateFormat: 'YYYY-MM-DD',
                    correctFormat: true,
                    strict: true
                },
                {

                    data: attr('unit'),
                    type: 'numeric',
                    format: '0,0.00',
                    //strict: true
                },
                {
                    data: attr('sum'),
                    //readOnly: true,
                    type: 'numeric',
                    format: '0,0.00',
                    //strict: true
                },
                { data: attr('remark') }
            ];

            colHeaders = [
                'code',
                'DescriptionTh',
                'DescriptionEn',
                'UnitType',
                //'ขนาด',
                //'ผู้ขาย',
                'Price/Unit',
                'Bill Number',
                'Bill Date',
                'Unit-In',
                'Amount',
                'Remark'
            ];

            if (app.userModel.get('type') == 'staff_main') {
                setCol('DescriptionTh', { readOnly: true, data: attr('name') }, 'Description')
                removeCol('DescriptionEn');
            }

            // if (self.currentListType == 'OE') {

            //     setCol('Amount', {
            //         data: attr('sum'),

            //         type: 'numeric',
            //         format: '0,0.00',
            //         //strict: true
            //     })
            //     removeCol('Price/Unit');
            //     removeCol('Unit-In');
            // }

            var importDataTable = this.importDataTable = new Handsontable(importProductTable, {
                data: importProductCollection,
                //stretchH: 'all',
                multiSelect: false,
                //dataSchema: makeCar,
                //contextMenu: ['remove_row'],
                height: 400,
                columns: columns,
                colHeaders: colHeaders,
                // cells: function (row, col, prop) {
                //     //console.log(row);

                //     if (col === 1) {
                //         var model = importProductCollection.at(row);
                //         if(model)
                //         console.log('in cell ', row, col, prop(model));

                //         // if (model && model.get('hi')) {
                //         //     this.renderer = greenRenderer;
                //         //     return;
                //         // }

                //     }

                // }
                //afterChange: function (e) {
                //    console.log('afterChange', JSON.stringify(e));
                //},

                // minSpareRows: 1 //see notes on the left for `minSpareRows`
            });

            importDataTable.updateSettings({
                contextMenu: {
                    callback: function (key, options) {
                        if (key === 'delete') {
                            //console.log(options.start.row);
                            var ProductModel = importProductCollection.at(options.start.row);
                            importProductCollection.remove(ProductModel);
                        }
                    },
                    items: {
                        "delete": { name: 'Remove this row' }
                    }
                }
            })
            //importProductCollection.on('change:supplier_code', function (model) {
            //    //console.log('afterChange', JSON.stringify(e));
            //    //supplyLogCollection.findeSupplyLog(model.get('code'), stockModel.get('stock_selected'), function (result) {

            //    //    if (result.length) {
            //    //        var supplier = model.get('supplier_name');
            //    //        result = result.reverse();
            //    //        var findObj = _.find(result, function (obj) {
            //    //            return supplier == obj.supplier_name;
            //    //        });

            //    //        if (findObj) {
            //    //            model.set('unit_price', findObj.unit_price);
            //    //        }
            //    //    }

            //    //});

            //    //console.log(model.get('code'), model.get('supplier_code'), stockModel.get('stock_selected'));

            //    //var code = model.get('code');
            //    //var supplier_code = model.get('supplier_code');
            //    //var stock_selected = stockModel.get('stock_selected');

            //    //supplyLogCollection.getLastSupplyLog(code, supplier_code, stock_selected, function (supplyLogModel) {
            //    //    var unit_price = '';
            //    //    if (supplyLogModel) {
            //    //        unit_price = supplyLogModel.get('unit_price');
            //    //    }
            //    //    model.set('unit_price', unit_price);
            //    //});

            //});        
        },
        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function () {

        },
        // setPurchaseSessionModel: function (model) {
        //     this.purchaseSessionModel = model;
        // },

        SelectProductPopUpButtonClick: function () {
            $("#popupSelectProduct").popup('open', { transition: 'pop' });
            $("#popupSelectProduct .select_product_search").focus();
        },
        supplierChange: function (ev) {

            //console.log('supplierChange');
            //var $el = $(ev.target);
            //var value = $el.val();

            //this.supplierSelected = value;

            //this.editingModel.set('supplier_default', value);
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
        clearNewProductRow: function () {
            this.importProductCollection.reset();
            if (this.purchaseSessionModel) {
                this.purchaseSessionModel.set('sum', 0)
            }
            $('#sum-amount-label').text('All Amount: ' + 0 + '฿');
        },
        saveImportProduct: function () {
            var self = this;

            areYouSure("Are you sure?", "Save data to server?", "Ok", function () {
                var stockModel = self.model.get('stockModel');
                var stock_selected = stockModel.get('stock_selected');
                //console.log(self.importProductCollection.toArray());

                //var sessionId = self.purchaseSessionModel.get('sessionId');
                var userId = self.purchaseSessionModel.get('userId');

                var prementType = self.model.get('payment_type');
                if (!prementType) {
                    prementType = 'Credit'
                }
                self.purchaseSessionModel.set('payment_type', prementType)

                var supplierSelected = self.$el.find('select.select-supplier-in').val(); // self.supplierSelected;

                var isAllValid = true;

                self.importProductCollection.each(function (model) {

                    if (app.userModel.get('type') != 'staff_support') {
                        model.attributes['supplier_code'] = supplierSelected;
                    } else {
                        model.attributes['supplier_code'] = 'undefinded'
                    }

                    if (isAllValid && !model.isValid()) {
                        isAllValid = false;
                    } else {

                        model.set('userId', userId)
                        //model.set('payment_type', prementType)
                    }

                });

                if (isAllValid) {
                    self.importProductCollection.checkDuplicate(stock_selected, prementType, function (result, err) {
                        if (result) {
                            self.purchaseSessionModel.setNewSessionId(function (sessionId) {

                                self.importProductCollection.each(function (model) {
                                    model.set('sessionId', sessionId)
                                });

                                self.importProductCollection.saveToServerAtOnce(stock_selected, function (err, numSave) {
                                    async.series([
                                        function (callback) {
                                            if (numSave > 0) {
                                                self.purchaseSessionModel.save(stock_selected, function (result) {
                                                    callback(null);
                                                });
                                            } else {
                                                callback(null);
                                            }

                                        },
                                        function (callback) {
                                            if (err) {
                                                setTimeout(function () {
                                                    alert(err);
                                                }, 10);

                                            } else {
                                                setTimeout(function () {
                                                    savedAlert('Data has save to "' + stock_selected + '" ' + numSave + ' row',
                                                        'Purchase ID: ' + sessionId,
                                                        'Purchase Summary', function () {
                                                            self.goToPurchaseSessionPage(sessionId);
                                                        })

                                                }, 1);

                                                self.invoid_id_last = null;

                                                // if (self.purchaseSessionModel) {
                                                //     //self.purchaseSessionModel.setInItemArray(self.importProductCollection.toJSON());
                                                //     self.purchaseSessionModel.save(stock_selected, function () {
                                                //         self.clearNewProductRow();
                                                //     });
                                                // } else {

                                                // }

                                                self.clearNewProductRow();
                                                self.purchaseSessionModel.clearInItem();
                                                //self.purchaseSessionModel.setNewSessionId();

                                                if (prementType == 'PettyCash') {
                                                    self.purchaseSessionModel.setLastPettyCashData();
                                                }
                                            }
                                        }
                                    ])

                                });

                            })


                        } else {
                            setTimeout(function () {
                                alert(err);
                            }, 10);
                        }
                    });
                }

                //self.importProductCollection.forEach(function (model) {
                //    //console.log(model.toJSON());

                //    model.save(stockModel.get('stock_selected'), function () {

                //    });

                //});
            });
        },
        printReport: function () {
           this.goToPurchaseSessionPage();
        },
        goToPurchaseSessionPage:function (id) {
            var v = (new Date()).getTime();
            var prementType = this.model.get('payment_type');
            var urlPara = 'payment_type=' + prementType;

            if (id) {
                urlPara += '&id=' + id;
            }
            window.location = 'PurchaseSession.html?' + urlPara + '#' + v;
        },

        printReport0: function () {
            console.log('printReport');
            var collection = this.importProductCollection;
            var model = this.purchaseSessionModel;
            var detailStr = 'Presave Date: ' + new Date().toString().split(' (')[0];

            var myWindow = window.open("../report/PurchaseSessionReport.html", 'test', 'width=' + 900 + ',height=' + 500 + '');

            var handle = setInterval(function () {
                console.log('in', myWindow.window.printFunc);
                if (myWindow.window.createReportFunc) {
                    clearInterval(handle);
                    var reportObj = {
                        detail: detailStr,
                        collection: collection,
                        model: model
                    }

                    myWindow.window.createReportFunc(reportObj);
                }
            }, 100);
        },

    });

})(jQuery);
