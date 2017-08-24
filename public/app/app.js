/// <reference path="../lib/jquery/jquery-2.1.1.js" />
/// <reference path="../lib/underscore/underscore.js" />
/// <reference path="../lib/backbone/backbone.js" />

/// <reference path="../NwLib/NwLib.js" />
/// <reference path="../NwConn/NwConn.js" />
/// <reference path="../service_conn/NwServiceConn.js" />
/// <reference path="models/Stock.js" />
var app = app || { models: {}, collections: {}, views: {} };

(function () {

    var host = window.location.hostname;
    //var host = 'andamania.duckdns.org';

    var port = window.location.port
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

        var curTab = 'createSupplier';
        var updateView = function () {

            if (curTab == 'editSupplier') {
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

    app.initProduct = function (listType) {

        //var productsClass = app.Class.Products;

        //alert($('.ui-page-active').attr('inited'));

        //app.hasCalledProdut = true;
        console.log('initProduct');

        var newProductsCollection = new app.collections.products([new app.models.product()]);

        var CreateProduct = new app.views.CreateProduct({ el: '#createItem', collection: newProductsCollection, model: { stockModel: stockModel } });

        var productCollection = new app.collections.products();

        var showProductView = new app.views.ShowProduct({ collection: productCollection, model: { stockModel: stockModel } });

        var editProductsCollection = new app.collections.products();

        var editProductView = new app.views.EditProduct({ collection: editProductsCollection, model: { stockModel: stockModel } });


        var curTab = 'createItem';
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

            if (curTab == 'showItem') {
                showProductView.search();
            } else if (curTab == 'editItem') {
                editProductView.search();
            }
        }
        stockModel.set('stock', []);
        stockModel.update(null, listType);
    };

    app.initImportProduct = function (listType) {

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

        viewSelectProduct.search();

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
            selectProductCollection.setLocalData(stock_selected);
            updateView();
        });


        stockModel.set('stock', []);
        stockModel.update(null, listType);

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

    app.initImportProductPettyCash = function (listType) {

        var pettyCashModel = new app.models.PettyCashModel();
        var selectProductCollection = new app.collections.products();

        var importProductCollection = new app.collections.ImportProductCollection();

        var addImportProductModel = new app.models.AddImportProductModel({
            stockModel: stockModel,
            selectProductCollection: selectProductCollection,
            importProductCollection: importProductCollection
        });

        var addImportProduct = new app.views.ImportProductCreate({
            el: '.importProduct',
            model: addImportProductModel,
           
        });

        addImportProduct.setPettyCashModel(pettyCashModel)

        new app.views.PettyCashFormView({ el: '#PettyCashForm', model: pettyCashModel });


        var viewSelectProduct = new app.views.SelectProduct({
            el: '#popupSelectProduct',
            model: addImportProductModel
        });

        viewSelectProduct.search();

        var importProductCollection = new app.collections.ImportProductCollection();
        var importProductEdit = new app.views.ImportProductEdit({
            el: '.editImportProduct',
            model: stockModel, collection: importProductCollection
        });

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
            selectProductCollection.setLocalData(stock_selected);
            updateView();
        });


        stockModel.set('stock', []);
        stockModel.update(null, listType);
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
            selectProductCollection.setLocalData(stock_selected);
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

    app.initCheckProduct = function () {
        var stockModel = new app.models.Stock();

        var checkProductsCreate = new app.views.CheckProductsCreate({
            el: '.checkProduct',
            model: { stockModel: stockModel }
        });

        var checkProductsEdit = new app.views.CheckProductsEdit({
            el: '.editCheckProduct',
            model: { stockModel: stockModel }
        });

        var updateView = function () {
            if (curTab == 'checkProduct') {
                checkProductsCreate.render();
            }
            else if (curTab == 'editCheckProduct') {
                checkProductsEdit.render();
            }
        };

        var curTab = 'checkProduct';
        $(".ui-page-active [data-role='header'] li a").click(function () {
            //curTab = $(this).text();//.text();
            curTab = $(this).jqmData('value');

            $('.checkProductNav').hide();
            $('.' + curTab).show();
            updateView();
        });


        stockModel.on('change:stock_selected', function (model, stock_selected) {
            console.log('change:stock_selected');
            updateView();
        });


        stockModel.set('stock', []);

        stockModel.update();

    };

    app.initReport = function () {
        console.log('app.initReport');
        var stockModel = new app.models.Stock();


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

        var reportCheckProductView = new app.views.ReportCheckProduct({
            el: '.ReportCheckProduct',
            model: { stockModel: stockModel }
        });

        var viewSelectProduct = new app.views.SelectProduct2({
            el: '#popupSelectProduct',
            model: { stockModel: stockModel }
        });

        viewSelectProduct.on('select', function (selectedModels) {
            //console.log('viewSelectProduct',selectedModels);
            if (selectedModels.length > 0) {
                //$("#popupSelectProduct").popup('close', { transition: 'flow' });

                var selectProduct = selectedModels[0];

                if (curTab == 'ReportStockCard') {
                    $('.SelectTimePeriod').show();
                    reportStockCardView.search(selectedModels);
                    reportStockCardView.render();
                }
                else if (curTab == 'ReportPurchaseProduct') {
                    $('.SelectTimePeriod').show();
                    reportPurchaseProductView.search(selectedModels);
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
            else if (curTab == 'ReportCheckProduct') {
                //$('.ReportCheckProduct').show();
                $('.SelectTimePeriod').hide();
                reportCheckProductView.search();
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
