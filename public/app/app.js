/// <reference path="../lib/jquery/jquery-2.1.1.js" />
/// <reference path="../lib/underscore/underscore.js" />
/// <reference path="../lib/backbone/backbone.js" />

/// <reference path="../NwLib/NwLib.js" />
/// <reference path="../NwConn/NwConn.js" />
/// <reference path="../service_conn/NwStockServiceConn.js" />
/// <reference path="models/Stock.js" />


(function () {
    var host = window.location.hostname;
    var port = window.location.port;
    var protocol = 'ws:';
    //var host = 'localhost';
    //var host = 'newww.dyndns.org';
    //alert(window.location.protocol + window.location.port);

    if (window.location.protocol == 'https:') {
        protocol = 'wss:';
        var wsClient = app.wsClient = new NwWsClient(protocol + '//' + host + ":" + port, { secure: true });
    } else {
        var wsClient = app.wsClient = new NwWsClient(protocol + '//' + host + ":" + port);
    }
    var serviceMethod = app.serviceMethod = new NwServiceConn(wsClient);

    wsClient.setOnConnectEventListener(function (socket) {
        var id = wsClient.getId();
        console.log('onConnect ' + id);
    });

    wsClient.setOnDisconnectEventListener(function myfunction() {

    });

    //if (!app.Class) app.Class = {};
    //app.Control.Products = {};

    var stockModel = new app.models.Stock();

    app.initSupplier = function () {
        console.log('initSupplier');

        var supplierCollection = new app.collections.SupplierCollection([new app.models.SupplierModel()]);
        var CreateProduct = new app.views.SupplierCreate({ collection: supplierCollection });

        var editSupplierCollection = new app.collections.SupplierCollection();
        var supplierEditView = new app.views.SupplierEdit({ collection: editSupplierCollection });

        var curTab = 'createNav';
        var updateView = function () {

            if (curTab == 'editNav') {
                console.log('updateView editNav');

                supplierEditView.search();
            }
        }

        $(".ui-page-active [data-role='header'] li a").click(function () {
            //curTab = $(this).text();//.text();
            curTab = $(this).jqmData('value');

            $('.Nav').hide();
            $('#' + curTab).show();

            updateView();
        });

    };

    app.initProduct = function () {

        //var productsClass = app.Class.Products;

        //alert($('.ui-page-active').attr('inited'));

        //app.hasCalledProdut = true;
        console.log('initProduct');

        var newProductsCollection = new app.collections.products([new app.models.product()]);

        var CreateProduct = new app.views.CreateProduct({ collection: newProductsCollection, model: { stockModel: stockModel } });

        var productCollection = new app.collections.products();

        var showProductView = new app.views.ShowProduct({ collection: productCollection, model: { stockModel: stockModel } });

        var editProductsCollection = new app.collections.products();

        var editProductView = new app.views.EditProduct({ collection: editProductsCollection, model: { stockModel: stockModel } });


        var curTab = 'createProdutNav';
        $(".ui-page-active [data-role='header'] li a").click(function () {
            //curTab = $(this).text();//.text();
            curTab = $(this).jqmData('value');

            $('.productNav').hide();
            $('#' + curTab).show();

            updateProductView();
        });

        $(".select-stock").bind("change", function (event, ui) {
            var stockSelected = $('.select-stock option:selected').select().text();
            console.log(stockSelected);
            stockModel.set('stock_selected', stockSelected);
        });

        stockModel.on('change:stock', function (model, stock) {

            if (stock.length > 0) {
                $('.select-stock option').remove();
                _.each(stock, function (item) {
                    $('.select-stock').append('<option>' + item + '</option>');
                });

                $('.select-stock').trigger("change");
            }
        });

        stockModel.on('change:stock_selected', function (model, stock_selected) {
            updateProductView();
        });


        var updateProductView = function () {

            console.log('updateProductView');

            if (curTab == 'showProductNav') {
                showProductView.search();
            } else if (curTab == 'editProductNav') {
                editProductView.search();
            }
        }
        stockModel.set('stock', []);
        stockModel.update();
    };

    app.initImportProduct = function () {

        var selectProductCollection = new app.collections.products();
        var importProductCollection = new app.collections.ImportProductCollection();

        var addImportProductModel = new app.models.AddImportProductModel({
            stockModel: stockModel,
            selectProductCollection: selectProductCollection,
            importProductCollection: importProductCollection
        });

        var addImportProduct = new app.views.ImportProductCreate({
            el: '.importProduct',
            model: addImportProductModel
        });

        var viewSelectProduct = new app.views.SelectProduct({
            el: '#popupSelectProduct',
            model: addImportProductModel
        });

        var importProductCollection = new app.collections.ImportProductCollection();
        var importProductEdit = new app.views.ImportProductEdit({
            el: '.editImportProduct',
            model: stockModel, collection: importProductCollection
        });


        //var viewImportProduct = new app.views.ImportProduct({ el: '#popupImportProduct', model: { stockModel: stockModel } });

        //viewSelectProduct.on('select', function (selectedModels) {
        //    for (var i in selectedModels) {
        //        var product = selectedModels[i];
        //        viewImportProduct.addProduct(product);
        //    }
        //    //if (selectedModels.length) {

        //    //}
        //});

        var updateView = function () {
            if (curTab == 'editImportProduct') {
                importProductEdit.search();
            }
        };

        var curTab = 'importProduct';
        $(".ui-page-active [data-role='header'] li a").click(function () {
            //curTab = $(this).text();//.text();
            curTab = $(this).jqmData('value');

            $('.importProductNav').hide();
            $('.' + curTab).show();
            updateView();
        });


        stockModel.on('change:stock_selected', function (model, stock_selected) {
            console.log('change:stock_selected');
            updateView();
        });


        stockModel.set('stock', []);
        stockModel.update();

        //stockModel.on('change:stock', function (model, stock) {

        //    if (stock.length > 0) {
        //        $('.select-stock option').remove();
        //        _.each(stock, function (item) {
        //            $('.select-stock').append('<option>' + item + '</option>');
        //            $('.select-stock').trigger("change");
        //        });
        //    }
        //});

        //stockModel.on('change:stock_selected', function (model, stock_selected) {
        //    updateView();
        //});
    };

    app.initExportProduct = function () {

        var selectProductCollection = new app.collections.products();
        var exportProductCollection = new app.collections.ExportProductCollection();

        var addImportProductModel = new app.models.AddImportProductModel({
            stockModel: stockModel,
            selectProductCollection: selectProductCollection,
            importProductCollection: exportProductCollection
        });

        var addExportProduct = new app.views.ExportProductCreate({
            el: '.exportProduct',
            model: addImportProductModel
        });

        var viewSelectProduct = new app.views.SelectProduct({
            el: '#popupSelectProduct',
            model: addImportProductModel
        });

        var exportProductCollection = new app.collections.ExportProductCollection();
        var exportProductEdit = new app.views.ExportProductEdit({
            el: '.editExportProduct',
            model: stockModel, collection: exportProductCollection
        });


        //var viewImportProduct = new app.views.ImportProduct({ el: '#popupImportProduct', model: { stockModel: stockModel } });

        //viewSelectProduct.on('select', function (selectedModels) {
        //    for (var i in selectedModels) {
        //        var product = selectedModels[i];
        //        viewImportProduct.addProduct(product);
        //    }
        //    //if (selectedModels.length) {

        //    //}
        //});

        var updateView = function () {
            if (curTab == 'editExportProduct') {
                exportProductEdit.search();
            }
        };

        var curTab = 'exportProduct';
        $(".ui-page-active [data-role='header'] li a").click(function () {
            //curTab = $(this).text();//.text();
            curTab = $(this).jqmData('value');

            $('.exportProductNav').hide();
            $('.' + curTab).show();
            updateView();
        });


        stockModel.on('change:stock_selected', function (model, stock_selected) {
            console.log('change:stock_selected');
            updateView();
        });


        stockModel.set('stock', []);
        stockModel.update();

        //stockModel.on('change:stock', function (model, stock) {

        //    if (stock.length > 0) {
        //        $('.select-stock option').remove();
        //        _.each(stock, function (item) {
        //            $('.select-stock').append('<option>' + item + '</option>');
        //            $('.select-stock').trigger("change");
        //        });
        //    }
        //});

        //stockModel.on('change:stock_selected', function (model, stock_selected) {
        //    updateView();
        //});
    };

    app.initReport = function () {
        console.log('app.initReport');
        var selectTimePeriodModel = new Backbone.Model();

        var selectTimePeriodView = new app.views.SelectTimePeriod({
            el: '.SelectTimePeriod',
            model: selectTimePeriodModel
        });

        var reportStockCardView = new app.views.ReportStockCard({
            el: '.ReportStockCard',
            model: { stockModel: stockModel, selectTimePeriodModel: selectTimePeriodModel }
        });

        var reportStockLastingView = new app.views.ReportStockLasting({
            el: '.ReportStockLasting',
            model: { stockModel: stockModel }
        });

        var reportPurchaseSupplierView = new app.views.ReportPurchaseSupplier({
            el: '.ReportPurchaseSupplier',
            model: { stockModel: stockModel, selectTimePeriodModel: selectTimePeriodModel }
        });

        var reportPurchaseProductView = new app.views.ReportPurchaseProduct({
            el: '.ReportPurchaseProduct',
            model: { stockModel: stockModel, selectTimePeriodModel: selectTimePeriodModel }
        });
        


        var viewSelectProduct = new app.views.SelectProduct2({
            el: '#popupSelectProduct',
            model: { stockModel: stockModel }
        });

        viewSelectProduct.on('select', function (selectedModels) {
            if (selectedModels.length > 0) {
                $("#popupSelectProduct").popup('close', { transition: 'flow' });

                var selectProduct = selectedModels[0];

                if (curTab == 'ReportStockCard') {
                    $('.SelectTimePeriod').show();
                    reportStockCardView.search(selectProduct);
                    reportStockCardView.render();
                }
                else if (curTab == 'ReportPurchaseProduct') {
                    $('.SelectTimePeriod').show();
                    reportPurchaseProductView.search(selectProduct);
                    reportPurchaseProductView.render();
                }
            }
            //for (var i in selectedModels) {
            //    var product = selectedModels[i];
            //    //this.model.addImportProduct(product);
            //    console.log(product.toJSON());
            //}
        })



        var curTab = 'ReportStockCard';
        var updateView = function () {

            if (curTab == 'ReportStockCard') {
                $('.SelectTimePeriod').show();
                reportStockCardView.search();
            } else if (curTab == 'ReportStockLasting') {
                $('.SelectTimePeriod').hide();
                reportStockLastingView.search();
            } else if (curTab == 'ReportPurchaseSupplier') {
                $('.SelectTimePeriod').show();
                reportPurchaseSupplierView.search();
            }
            else if (curTab == 'ReportPurchaseProduct') {
                $('.SelectTimePeriod').show();
            }
        };

        $(".ui-page-active [data-role='header'] li a").click(function () {
            //curTab = $(this).text();//.text();
            curTab = $(this).jqmData('value');

            $('.reportNav').hide();
            $('.' + curTab).show();
            updateView();
        });

        stockModel.on('change:stock_selected', function (model, stock_selected) {
            console.log('change:stock_selected');
            updateView();
        });

        stockModel.set('stock', []);
        stockModel.update();
    }

})();
