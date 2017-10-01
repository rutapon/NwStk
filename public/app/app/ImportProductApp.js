var app = app || { models: {}, collections: {}, views: {} };

(function () {

    //if (!app.Class) app.Class = {};
    //app.Control.Products = {};

    app.initImportProduct = function (listType) {
        var stockModel = new app.models.Stock();
        var purchaseSessionModel = new app.models.PurchaseSessionModel();

        var selectProductCollection = new app.collections.products();

        var importProductCollection = new app.collections.ImportProductCollection();
        var supplierCollection = new app.collections.SupplierCollection();

        var addImportProductModel = new app.models.AddImportProductModel({
            stockModel: stockModel,
            selectProductCollection: selectProductCollection,
            importProductCollection: importProductCollection,
            supplierCollection: supplierCollection,
            purchaseSessionModel:purchaseSessionModel
        });

        var addImportProduct = new app.views.ImportProductCreate({
            el: '.importProduct',
            model: addImportProductModel
        });

        purchaseSessionModel.setNewSessionId();

        var viewSelectProduct = new app.views.SelectProduct({
            el: '#popupSelectProduct',
            model: addImportProductModel
        });

        viewSelectProduct.search();

        var importProductCollection = new app.collections.ImportProductCollection();
        var importProductEdit = new app.views.ImportProductEdit({
            el: '.editImportProduct',
            model: new Backbone.Model({ stockModel: stockModel, supplierCollection: supplierCollection }),
            collection: importProductCollection
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

        supplierCollection.getAll();

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

})();
