var app = app || { models: {}, collections: {}, views: {} };

(function () {

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
})();
