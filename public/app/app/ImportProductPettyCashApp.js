var app = app || { models: {}, collections: {}, views: {} };

(function () {

    app.initImportProductPettyCash = function (listType) {
        var payment_type = 'PettyCash';
        var stockModel = new app.models.Stock();
        var stockModelForEditView = new app.models.Stock();
        var purchaseSessionModel = new app.models.PurchaseSessionModel();
        var selectProductCollection = new app.collections.products();

        //var importProductCollection = new app.collections.ImportProductCollection();

        var supplierCollection = new app.collections.SupplierCollection();

        var addImportProductModel = new app.models.AddImportProductModel({
            stockModel: stockModel,
            selectProductCollection: selectProductCollection,
            importProductCollection: new app.collections.ImportProductCollection(),
            supplierCollection: supplierCollection,
            purchaseSessionModel: purchaseSessionModel,
            payment_type: payment_type
        });

        var addImportProduct = new app.views.ImportProductCreate({
            el: '.importProduct',
            model: addImportProductModel,

        });
        //addImportProduct.setPurchaseSessionModel(purchaseSessionModel)
        new app.views.PettyCashFormView({ el: '#PettyCashForm', model: purchaseSessionModel });

        var viewSelectProduct = new app.views.SelectProduct({
            el: '#popupSelectProduct',
            model: addImportProductModel
        });

        //purchaseSessionModel.setSessionId();
        purchaseSessionModel.setLastPettyCashData();


        //var importProductCollection = new app.collections.ImportProductCollection();
        var importProductEdit = new app.views.ImportProductEdit({
            el: '.editImportProduct',
            model: new Backbone.Model({ stockModel: stockModelForEditView, supplierCollection: supplierCollection, payment_type: payment_type }),
            collection: new app.collections.ImportProductCollection()
        });

        var updateView = function () {


        };

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

            } else {
                purchaseSessionModel.setLastPettyCashData();
            }

        });


        stockModel.on('change:stock_selected', function (model, stock_selected) {
            console.log('change:stock_selected');
            selectProductCollection.setLocalData(stock_selected, function () {
                //viewSelectProduct.search();
            });

            purchaseSessionModel.setLastPettyCashData();
        });

        stockModelForEditView.on('change:stock_selected', function (model, stock_selected) {
            importProductEdit.search();
        });


        stockModel.set('stock', []);
        stockModelForEditView.set('stock', []);
        stockModel.update(function (result) {
            stockModelForEditView.set('stock', result);
        }, listType);

        supplierCollection.getAll(null, ['CASH']);
    };

})();
