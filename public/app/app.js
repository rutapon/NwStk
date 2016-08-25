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

            console.log('updateView');

            if (curTab == 'editNav') {
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
            stockModel.set('stock_selected', stockSelected);
        });


        stockModel.on('change:stock', function (model, stock) {

            if (stock.length > 0) {
                $('.select-stock option').remove();
                _.each(stock, function (item) {
                    $('.select-stock').append('<option>' + item + '</option>');
                    $('.select-stock').trigger("change");
                });
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

        var curTab = 'importProduct';
        $(".ui-page-active [data-role='header'] li a").click(function () {
            //curTab = $(this).text();//.text();
            curTab = $(this).jqmData('value');

            $('.importProductNav').hide();
            $('.' + curTab).show();

            //updateProductView();
        });

        stockModel.set('stock', []);
        stockModel.update();

        var selectProductCollection = new app.collections.products();
        var importProductCollection = new app.collections.ImportProductCollection();

        var addImportProductModel = new app.models.AddImportProductModel({
            stockModel: stockModel,
            selectProductCollection: selectProductCollection,
            importProductCollection: importProductCollection
        });

        var addImportProduct = new app.views.AddImportProduct({
            el: '.importProduct',
            model: addImportProductModel
        });

        var viewSelectProduct = new app.views.SelectProduct({
            el: '#popupSelectProduct',
            model: addImportProductModel
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

    };

})();
