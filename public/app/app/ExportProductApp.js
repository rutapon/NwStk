var app = app || { models: {}, collections: {}, views: {} };

(function () {

    app.initExportProduct = function () {
        var stockModel = new app.models.Stock();
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
})();
