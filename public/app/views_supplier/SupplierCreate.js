﻿/// <reference path="../../lib/jquery/jquery-2.1.1.js" />
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

    $(function () {
        app.views.SupplierCreate = Backbone.View.extend({

            // Instead of generating a new element, bind to the existing skeleton of
            // the App already present in the HTML.
            el: '#createSupplier',

            // Delegated events for creating new items, and clearing completed ones.
            events: {

                //'dragover #dropFileInput': 'dragoverFileInput',
                //'dragleave #dropFileInput': 'dragleaveFileInput',
                //'drop #dropFileInput': 'dropFileInput',

                'click #chooseFileButton': function () {
                    $("#chooseFileInput").trigger('click');
                },
                'change #chooseFileInput': 'chooseFileInput',

                'keyup .lastTr input': 'selectInput',

                //'click .CreateNewProductRow': 'CreateNewProduct',
                'click .SaveNewCreateRows': 'SaveNew',
                'click .ClearNewCreateRow': 'ClearNewCreateRow',
            },


            initialize: function () {
                //this.el = $(this.el);
                var self = this;
                this.SupplierCreateTable = new app.views.SupplierCreateTable({ collection: this.collection }).render();

                var dropEl = this.$el.find("#dropFileInput").on("dragover", function (event) {
                    event.originalEvent.preventDefault();
                    event.originalEvent.stopPropagation();
                    event.originalEvent.dataTransfer.dropEffect = 'copy';
                    $(this).addClass('dragging');
                }).on("dragleave", function (event) {
                    event.originalEvent.preventDefault();
                    event.originalEvent.stopPropagation();
                    $(this).removeClass('dragging');
                }).on("drop", function (event) {
                    event.originalEvent.preventDefault();
                    event.originalEvent.stopPropagation();
                    $(this).removeClass('dragging');

                    self.dropFileInput(event);
                });

                //for ie 
                var handleDragover = function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';
                }

                var drop = dropEl.get(0);
                if (drop.addEventListener) {
                    drop.addEventListener('dragenter', handleDragover, false);
                    drop.addEventListener('dragover', handleDragover, false);
                }

            },

            // Re-rendering the App just means refreshing the statistics -- the rest
            // of the app doesn't change.
            render: function () {

            },

            AddProduct: function (productObj) {
                var product = new app.models.SupplierModel(productObj);

                //this.el.find('tbody').append(this.CreateStockTableTrTemplate(rowObj));
                this.collection.add(product);
                //this.el.find('.CreateStockTable-tr input').textinput();
            },

            dropFileInput: function (e) {
                if (e.originalEvent.dataTransfer) {
                    if (e.originalEvent.dataTransfer.files.length) {
                        //e.preventDefault();
                        //e.stopPropagation();
                        /*UPLOAD FILES HERE*/

                        //alert("Dropped! " + e.originalEvent.dataTransfer.files);

                        var files = e.originalEvent.dataTransfer.files;
                        this.importFileData(files);
                    }
                }

            },
            chooseFileInput: function (ev) {
                var files = ev.target.files;

                this.importFileData(files);

                this.$el.find('#chooseFileInput').val('');
            },

            importFileData: function (files) {

                var self = this;
                var f = files[0];
                var name = f.name;

                var checkSupportedFile = function (fileName) {
                    var supportFilesType = ['xlsx', 'xlsm', 'xls', 'xlsb', 'ods', 'xml'];

                    for (var i in supportFilesType) {
                        var fileType = supportFilesType[i];

                        if (fileName.toLowerCase().lastIndexOf('.' + fileType) == (fileName.length - fileType.length - 1)) {
                            return true;
                        }
                    }
                    return false;
                }

                if (checkSupportedFile(name)) {
                    this.$el.find('#chooseFileName').val(name);

                    readXlsxToJson(f, true, function (resultObj) {
                        self.collection.reset();
                        self.collection.importXlsxObj(resultObj);
                        self.CreateNewProduct();
                    });
                }
                else {
                    alert('Unsupported file "' + name + '"');
                }
            },

            selectInput: function (ev) {

                if ($(ev.target).val()) {
                    this.CreateNewProduct();
                }
            },

            CreateNewProduct: function () {
                //event.preventDefault();
                //alert('CreateNewProductRow');
                //console.log('CreateNewProduct');
                var rowObj = {};// new app.models.SupplierModel();  //{ code: '', name: '', unit_type: '', unit_size: '', description: '' };
                this.AddProduct(rowObj);
            },
            ClearNewCreateRow: function () {
                this.collection.reset();
                this.CreateNewProduct();
                this.$el.find('#chooseFileName').val("No file select");
            },
            SaveNew: function () {

                console.log('SaveNew');
                //console.log($('.CreateStockTable-tr').length);
                //var dataElem = $('.CreateStockTable-tr');
                //for (var i in dataElem) {
                //    var inputs = $(dataElem[i]).find('input');

                //    console.log(inputs.length);
                //}

                //console.log(JSON.stringify(this.collection.toJSON()));

                var self = this;

                //_.each(this.collection.toArray(), function (item) {
                //    this.collection.remove(item);
                //},this)

                //_.invoke(this.collection.toArray(), 'remove');

                areYouSure("Are you sure?", "Save data to server?", "Ok", function () {

                    var numSave = 0;
                    async.eachSeries(self.collection.toArray(), function (eachModel, callback) {

                        var jsonObj = eachModel.toJSON();

                        //jsonObj.create_by = 'admin';

                        if (eachModel.isEmty()) {
                            self.collection.remove(eachModel);
                            callback();
                        }
                        else {
                            eachModel.attributes.credit = parseInt(eachModel.attributes.credit);

                            if (eachModel.isValid()) {
                                eachModel.save(function (result) {
                                    if (result) {
                                        self.collection.remove(eachModel);
                                        numSave++;
                                        console.log('remove', numSave);
                                        callback();
                                    } else {
                                        callback('Fail to save ' + JSON.stringify(eachModel.toJSON()));

                                    }
                                });
                            } else {
                                callback('Fail to save ' + JSON.stringify(eachModel.toJSON()));

                            }
                        }

                    }, function (err) {
                        //console.log('end');
                        if (err) {
                            alert(err);
                        } else {
                            self.ClearNewCreateRow();
                        }

                        setTimeout(function () {
                            alert('Data has save ' + numSave + ' row');
                        }, 1);

                    });

                });
            }

        });
    });

})(jQuery);
