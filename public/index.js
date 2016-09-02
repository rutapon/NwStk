/// <reference path="NwLib/NwLib.js" />
/// <reference path="lib/jquery/jquery-2.1.1.js" />

/// <reference path="js/views/CreateStockTableView.js" />


$(function () {

    //$("[data-role='navbar']").navbar();
    //$("[data-role='header'], [data-role='footer']").toolbar();


    //$('body').on('click', '.ui-page-active .menu', function () {
    //    console.log('clickMenu');
    //    $(".ui-page-active .menu-panel").panel("toggle");
    //});

    //$('body').on('click', '.ui-page-active .seting', function () {
    //    $(".ui-page-active .seting-panel").panel("toggle");
    //});


    $('body').on('click', '.ui-page-active .menu', function () {
        console.log('clickMenu');
        $(".ui-page-active .menu-panel").panel("toggle");
    });

    $('body').on('click', '.ui-page-active .seting', function () {
        $(".ui-page-active .seting-panel").panel("toggle");
    });

    function getSelectionText() {
        var text = "";
        if (window.getSelection) {
            text = window.getSelection().toString();
        } else if (document.selection && document.selection.type != "Control") {
            text = document.selection.createRange().text;
        }
        return text;
    }

    $('body').on("swipeleft swiperight", "[data-role='page']", function (e) {
        // We check if there is no open panel on the page because otherwise
        // a swipe to close the left panel would also open the right panel (and v.v.).
        // We do this by checking the data that the framework stores on the page element (panel: open).

        //console.log('sw');
        //if ($(".ui-page-active").jqmData("panel") !== "open") {
        //    if (e.type === "swipeleft") {
        //        $("#search-panel").panel("close");
        //    } else if (e.type === "swiperight") {
        //        $("#search-panel").panel("open");
        //    }
        //}

        if (getSelectionText()) { }
        else if (e.type === "swipeleft") {
            $(".menu-panel").panel("close");
        } else if (e.type === "swiperight") {
            $(".menu-panel").panel("open");
            $('.search').select();
        }
    });

    //var viewportWidth = $(window).width();
    //if (viewportWidth < 865) {
    //    $("#menu-panel").panel("close");
    //} else {
    //   $('.ui-panel-animate').css('ui-panel-animat-slow');
    //    $("#menu-panel").panel("open");
    //    //setTimeout(function () {
    //    //    $('.ui-panel-animate').removeClass('ui-panel-animat-slow');
    //    //},1000);

    //}


    //$('#selectTab').click(function () {
    //    $('#editProductNav').trigger('click');
    //});

    //$(document).on('click', "[data-role='navbar'] a", function (ev) {
    //    var thisEl =  $(ev.target);
    //    var friendA = thisEl.parents("[data-role='navbar']").find('a');
    //    friendA.removeClass('ui-state-persist');
    //    thisEl.addClass('ui-state-persist');

    //    //alert($(ev.target).parents("[data-role='navbar']").find('a').length);
    //});
    if (window.require) {
        $('#seting').click(function () {

            require('nw.gui').Window.get().showDevTools();

            return false;
        });
    }

    // Update the contents of the toolbars
    $(document).on("pagecontainerchange", function () {

        //var activePage = $.mobile.pageContainer.pagecontainer("getActivePage");
        //$('[data-role="tabs"] ul:first', activePage).each(function () {
        //    var ul = this;
        //    var as = $('a', ul);
        //    $(as).click(function () {
        //        $(as).removeClass('ui-btn-active');
        //        $(this).addClass('ui-btn-active');
        //    });
        //    $(as).first().click();
        //});

        // Each of the four pages in this demo has a data-title attribute
        // which value is equal to the text of the nav button
        // For example, on first page: <div data-role="page" data-title="Info">
        var current = $(".ui-page-active").jqmData("title");
        console.log('pagecontainerchange by ' + current);

        // Change the heading
        $("[data-role='header'] h1").text('Anda-Stock' + (current == 'Anda-Stock' ? '' : '#' + current));
        // Remove active class from nav buttons
        $(".menu-panel [data-role='listview'] a.ui-btn-active").removeClass("ui-btn-active");
        // Add active class to current nav button
        $(".menu-panel [data-role='listview'] a").each(function () {
            if ($(this).text() === current) {
                $(this).addClass("ui-btn-active");
            }
        });

        if ($('.ui-page-active').attr('inited') == undefined) {

            $('.ui-page-active').attr('inited', true);


            if (current == 'ผู้ขาย') {
                app.initSupplier();
            }
            else if (current == 'ชนิดสินค้า') {
                app.initProduct();

                //$.mobile.pageContainer.pagecontainer("change", "Report.html", {
                //    allowSamePageTransition: true,
                //    transition: 'none',
                //    showLoadMsg: false,
                //    reloadPage: false,
                //    changeHash: true

                //})

                //var activePage = $.mobile.pageContainer.pagecontainer("getActivePage");

                //var tabHtml = _.template($('#tabNavProduct').html())();
                //alert($(activePage).find("[data-role='taps']").find('div').length);
                //$('.productTab').prepend(tabHtml).enhanceWithin();;
                //$(".main .ui-content")
            }
            else if (current == 'สินค้าเข้า') {
                app.initImportProduct();
            }
            else if (current == 'สินค้าออก') {
                app.initExportProduct();
            }
            else if (current == 'รายงาน') {
                app.initReport();
            }
        }
    });

    // Update the contents of the toolbars
    $(document).on("pagecontainerchange", 'Report.html', function () {

        alert('Report.html');
    });



    //$(document).on("pagecontainerload", function () {
    //    var current = $(".ui-page-active").jqmData("title");
    //    console.log("pagecontainerload event fired! from " + current);
    //});


    //$(document).on("pagecontainercreate", function () {
    //    var current = $(".ui-page-active").jqmData("title");
    //    console.log("pagecontainercreate event fired! from " + current);
    //});
});