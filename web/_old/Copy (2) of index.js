/// <reference path="NwLib/NwLib.js" />
/// <reference path="lib/jquery/jquery-2.1.1.js" />

/// <reference path="js/views/CreateStockTableView.js" />

try {
    //require('nw.gui').Window.get().showDevTools();

    //var NwDictProcessProxy = require('./node/NwDict/ProcessBridge/NwDictProcessProxy.js');
    var lexitronDictConn = new NwDictProcessProxy('lexitron');
    var oxfordDictConn = new NwDictProcessProxy('oxd7');
    var websterDictConn = new NwDictProcessProxy('webster');

    //var static = require('node-static');
    //var file = new static.Server('./www');

    //require('http').createServer(function (request, response) {
    //    request.addListener('end', function () {
    //        //
    //        // Serve files!
    //        //
    //        file.serve(request, response);
    //    }).resume();
    //}).listen(80);
} catch (e) {

}

$(function () {

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

    //$(document).keydown(function (e) {

    //    //if (!(e.keyCode == 37 || e.keyCode == 39)) {
    //    if (e.keyCode != 13) {
    //        $("#search-panel").panel("open");
    //    }
    //    $('#search').focus();
    //    //}
    //});


    //$('#search').keydown(function (e) {

    //    if (e.keyCode == 13) {
    //        //var val = $('#search').val().trim();
    //        var val = $(".searchWord").eq(0).text();

    //        selectWord(val);
    //        $('#search').select();
    //        var viewportWidth = $(window).width();
    //        if (viewportWidth < 865) {
    //            $("#search-panel").panel("close");
    //        } else {

    //        }
    //    }

    //    //else {
    //    //    if (val) {
    //    //        dictConn.searchWord(val, function (result) {
    //    //            console.log(result);
    //    //            addSearchWord(result);
    //    //            //alert(result);
    //    //        });
    //    //    }
    //    //}
    //});

    //$('#search').bind('keyup', function (e) {
    //    if (e.keyCode != 13) {

    //        //serchDely(200);
    //        var val = $('#search').val();
    //        searchWord(val);
    //    }
    //});


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
    $('#test').click(function () {

        //console.log('test');
        //var audio = document.createElement('audio');
        //audio.setAttribute('src', 'http://translate.google.com/translate_tts?tl=en&q=' + encodeURIComponent("bourgeois"));
        //audio.load();
        //audio.play();

        //var msg = new SpeechSynthesisUtterance('abc');
        //window.speechSynthesis.speak(msg);

        //var tts = document.getElementById('say');
        //tts.value = "hello world";
        //tts.play();

    });
    //var timeLast;
    //$(document).on('keyup', '#search', function (e) {
    //    alert(e.keyCode);
    //});

    var grid = new Backgrid.Grid({
        columns: [
        //    {

        //    // name is a required parameter, but you don't really want one on a select all column
        //    name: "",

        //    // Backgrid.Extension.SelectRowCell lets you select individual rows
        //    cell: "select-row",

        //    // Backgrid.Extension.SelectAllHeaderCell lets you select all the row on a page
        //    headerCell: "select-all",

        //},
        {
            name: "code",
            label: "Code",
            cell: "string",
            editable: false
        }, {
            name: "name",
            label: "ชื่อ",
            cell: "string",
            editable: false
        },
        {
            name: "unitType",
            label: "หน่วย",
            cell: "string",
            editable: false
        }
        , {
            name: "description",
            label: "รายละเอียด",
            cell: "string",
            editable: false
        },
         //{
         //    name: "edit",
         //    label: "edit",
         //    cell: Backgrid.SelectCell.extend({
         //        // It's possible to render an option group or use a
         //        // function to provide option values too.
         //        optionValues: [["Male", "m"], ["Female", "f"]]
         //    })
         //}
        ],

        collection: new Backbone.Collection([
          {
              "name": "Afghanistan", "code": 1, edit: 'f'
          },
          { "name": "Albania", "code": 2 }
        ])
    });

    $("#select-all-example-1-result").append(grid.render().el);
});

