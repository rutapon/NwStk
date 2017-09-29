
var app = app || { models: {}, collections: {}, views: {} };

(function () {

    //if (!app.Class) app.Class = {};
    //app.Control.Products = {};

    app.initProduct = function (listType) {

        var stockModel = new app.models.Stock();

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

})();

