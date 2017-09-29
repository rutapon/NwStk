var app = app || { models: {}, collections: {}, views: {} };

(function () {

    app.initImportProductPettyCash = function (listType) {
        var stockModel = new app.models.Stock();
        var pettyCashModel = new app.models.PettyCashModel();
        var selectProductCollection = new app.collections.products();

        var importProductCollection = new app.collections.ImportProductCollection();

        var supplierCollection = new app.collections.SupplierCollection();

        var addImportProductModel = new app.models.AddImportProductModel({
            stockModel: stockModel,
            selectProductCollection: selectProductCollection,
            importProductCollection: importProductCollection,
            supplierCollection: supplierCollection
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
            model: new Backbone.Model({ stockModel: stockModel, supplierCollection: supplierCollection }),
            collection: importProductCollection
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

        supplierCollection.getAll(null, ['CASH']);
    };

})();
