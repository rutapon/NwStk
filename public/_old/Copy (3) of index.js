/// <reference path="NwLib/NwLib.js" />
/// <reference path="lib/jquery/jquery-2.1.1.js" />


$(function () {

    // Prevents all jQuery Mobile anchor click handling
    $.mobile.linkBindingEnabled = false;
    // Prevents jQuery Mobile from handling hash changes
    $.mobile.hashListeningEnabled = false;

    $("[data-role='navbar']").navbar();
    $("[data-role='header'], [data-role='footer']").toolbar();

    //$.mobile.changePage("page-b.html", {
    //    transition: "slide",
    //    reverse: true
    //});

    ////// Update the contents of the toolbars
    //$(document).on("pagecontainerchange", function () {
    //    // Each of the four pages in this demo has a data-title attribute
    //    // which value is equal to the text of the nav button
    //    // For example, on first page: <div data-role="page" data-title="Info">
    //    var current = $(".ui-page-active").jqmData("title");

    //    // Change the heading
    //    $("[data-role='header'] h1").text(current);
    //    // Remove active class from nav buttons
    //    $("[data-role='navbar'] a.ui-btn-active").removeClass("ui-btn-active");
    //    // Add active class to current nav button
    //    $("[data-role='navbar'] a").each(function () {
    //        if ($(this).text() === current) {
    //            $(this).addClass("ui-btn-active");
    //        }
    //    });
    //});

    var currentDict = 'lexitron';
    var dictConn = lexitronDictConn;

    //var viewportWidth = $(window).width();
    //if (viewportWidth < 865) {
    //    $("#search-panel").panel("close");
    //} else {
    //    $("#search-panel").panel("open");
    //}


    $('#menu').click(function () {
        $("#menu-panel").panel("toggle");
    });

    $('#seting').click(function () {
        $("#seting-panel").panel("toggle");
    });

    $('.dbselect').click(function () {
        var $this = $(this);
        currentDict = $this.text();

        if (currentDict == 'lexitron') {
            dictConn = lexitronDictConn;
        } else if (currentDict == 'webster') {
            dictConn = websterDictConn;
        } else if (currentDict == 'oxford') {
            dictConn = oxfordDictConn;
        }
        var val = $('#search').val().trim();

        searchWord(val, function () {
            val = $(".searchWord").eq(0).text();
            selectWord(val);
            $('#search').select();

            $('html, body').stop().animate({ scrollTop: 0 }, 500);
        });


        //$this.addClass("ui-btn-active");
    });

    $('#main').on('click', 'nu', function myfunction() {
        var $this = $(this);
        var val = $this.text().toLowerCase();

        $('#search').val(val);
        searchWord(val, function () {
            val = $(".searchWord").eq(0).text();
            selectWord(val);
            $('#search').select();
            $('html, body').stop().animate({ scrollTop: 0 }, 500);
        });
    });

    window.index_search = function (a, b, val) {
        val = val.toLowerCase();
        $('#search').val(val);
        searchWord(val, function () {
            val = $(".searchWord").eq(0).text();
            selectWord(val);

            $('#search').select();
            $('html, body').stop().animate({ scrollTop: 0 }, 500);
        });
    }


    function getSelectionText() {
        var text = "";
        if (window.getSelection) {
            text = window.getSelection().toString();
        } else if (document.selection && document.selection.type != "Control") {
            text = document.selection.createRange().text;
        }
        return text;
    }

    $(document).on("swipeleft swiperight", "[data-role='page']", function (e) {
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

        if (getSelectionText()) {
            //console.log(getSelectionText());
        }
        else
            if (e.type === "swipeleft") {
                $("#menu-panel").panel("close");
            } else if (e.type === "swiperight") {
                $("#menu-panel").panel("open");
                $('#search').select();
            }
    });


    $('#seting').click(function () {
        if (window.require) {
            require('nw.gui').Window.get().showDevTools();
        }

        return false;
    });

    $('#search-panel').on('click', '.searchWord', function () {

        var $this = $(this);

        var val = $this.text();
        selectWord(val);
    });

    function searchWord(val, cb) {

        var val = val.replace(/^\s+/, "");

        try {
            if (val) {
                dictConn.searchWord(val, function (result) {
                    //console.log(result);
                    addSearchWord(result);
                    //alert(result);
                    if (cb) cb();
                });
            }
            else {
                $("#search-panel").find('.searchWord').remove();
                if (cb) cb();
            }
        } catch (e) {
            console.log(e);
        }

    }
    function selectWord(val, cb) {

        if (val) {
            var wordDiv = $('#main').find('[data-word="' + currentDict + val + '"]');

            if (wordDiv.length > 0) {

                $('#main').prepend(wordDiv);
                if (cb) cb();

            } else {

                dictConn.getMeaningHtml(val, function (result) {

                    if (result) {
                        addWord(val, result);
                    }
                    if (cb) cb();
                });
            }

        } else {
            if (cb) cb();
        }
    }

    var tempWordDiv = $('.tempWord');
    tempWordDiv.remove();
    function addWord(esearch, meaning) {

        var wordDiv = tempWordDiv.clone();

        wordDiv.attr("data-word", currentDict + esearch);
        wordDiv.find('h2').html(esearch);
        wordDiv.find('h2').append(' <span  style="color: rgb(215, 151, 0); font-size: 12px;"> [' + currentDict + '] </span>');
        wordDiv.find('div').html(meaning);

        wordDiv.css("visibility", "visible");

        $('#main').prepend(wordDiv);
    }

    var searchWordTemp = $('#searchWordTemp');
    searchWordTemp.remove();
    function addSearchWord(searchWordArray) {

        $("#search-panel").find('.searchWord').remove();

        for (var i in searchWordArray) {
            var searchWordStr = searchWordArray[i];
            var searchWord = searchWordTemp.clone();

            searchWord.find('a').text(searchWordStr);
            searchWord.css("visibility", "visible");
            $("#search-panel").find('ul').append(searchWord);
        }

    }

});

