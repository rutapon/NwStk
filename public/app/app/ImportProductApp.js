var app = app || { models: {}, collections: {}, views: {} };

(function () {

    //if (!app.Class) app.Class = {};
    //app.Control.Products = {};

    app.initImportProduct = function (listType) {
        var payment_type = 'Credit';
        var stockModel = new app.models.Stock();
        var stockModelForEditView = new app.models.Stock();

        var purchaseSessionModel = new app.models.PurchaseSessionModel();

        var selectProductCollection = new app.collections.products();

        var importProductCollection = new app.collections.ImportProductCollection();
        var supplierCollection = new app.collections.SupplierCollection();

        var addImportProductModel = new app.models.AddImportProductModel({
            stockModel: stockModel,
            selectProductCollection: selectProductCollection,
            importProductCollection: importProductCollection,
            supplierCollection: supplierCollection,
            purchaseSessionModel: purchaseSessionModel,
            payment_type: payment_type
        });

        var addImportProduct = new app.views.ImportProductCreate({
            el: '.importProduct',
            model: addImportProductModel
        });

        //purchaseSessionModel.setSessionId();

        var viewSelectProduct = new app.views.SelectProduct({
            el: '#popupSelectProduct',
            model: addImportProductModel
        });

        var importProductCollection = new app.collections.ImportProductCollection();
        var importProductEdit = new app.views.ImportProductEdit({
            el: '.editImportProduct',
            model: new Backbone.Model({ stockModel: stockModelForEditView, supplierCollection: supplierCollection, payment_type: payment_type }),
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

        var curTab = 'importProduct';
        $(".ui-page-active [data-role='header'] li a").click(function () {
            //curTab = $(this).text();//.text();
            curTab = $(this).jqmData('value');

            $('.importProductNav').hide();
            $('.' + curTab).show();

            if (curTab == 'editImportProduct') {
                importProductEdit.searchSessionId(payment_type, function () {
                    importProductEdit.search();
                });
            }
        });


        stockModel.on('change:stock_selected', function (model, stock_selected) {
            console.log('change:stock_selected');
            selectProductCollection.setLocalData(stock_selected, function () {
                // viewSelectProduct.search();
            });
        });
        
        stockModelForEditView.on('change:stock_selected', function (model, stock_selected) {
            if (curTab == 'editImportProduct') {
                importProductEdit.search();
            }
        });

        stockModel.set('stock', []);
        stockModelForEditView.set('stock', []);
        stockModel.update(function (result) {
            stockModelForEditView.set('stock', result);
        }, listType);

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
