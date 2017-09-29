/// <reference path="NwLib/NwLib.js" />
/// <reference path="lib/jquery/jquery-2.1.1.js" />

var app = app || { models: {}, collections: {}, views: {} };

$(function () {

    window.login = function (user, pass, dpm, cb) {
        if (user && pass && dpm) {
            if (typeof (Storage) !== "undefined") {

                app.userModel = new app.models.UserModel({
                    user: user,
                    pass: pass,
                    dpm: dpm
                });

                app.userModel.login(function (result) {
                    console.log(result);
                    if (result) {
                        sessionStorage.userModelattributes = JSON.stringify(app.userModel.attributes);
                        sessionStorage.user = user;
                        sessionStorage.pass = pass;
                        sessionStorage.dpm = dpm;
                        sessionStorage.type = result.type

                        window.location.href = '/';
                    }
                    if (cb) cb(result);
                });

            } else {
                alert('Sorry! No Web Storage support..');
            }
        }
    }

    window.logout = function () {
        sessionStorage.user = '';
        sessionStorage.pass = '';
        sessionStorage.dpm = '';

        window.location.href = '/'
    }

    if (typeof (Storage) !== "undefined") {
        // Code for localStorage/sessionStorage.

        if (sessionStorage.user) {
            //alert(sessionStorage.user);

            app.userModel = new app.models.UserModel(JSON.parse(sessionStorage.userModelattributes));
            app.userModel.login(function (result) {
                console.log(result);
                if (result) {
                    sessionStorage.userModelattributes = JSON.stringify(app.userModel.attributes);
                    sessionStorage.type = result.type
                }

                pagecontainerchange();
                checkMenuPermission();

                setTimeout(function () {
                    $(".menu-panel").panel("open");
                },300)
            });
            //console.log(app.userModel);

        }
        else {
            app.userModel = new app.models.UserModel({ permission: {} });
            $(".setting-panel").panel("open");

            pagecontainerchange();
            checkMenuPermission();
        }


    } else {
        alert('Sorry! No Web Storage support..');
    }

    function loadLogin() {
        var myWindow = window.open("setting/login.html", 'test', 'width=' + 480 + ',height=' + 420 + '');

        var handle = setInterval(function () {

            if (myWindow.window.setWindow) {
                console.log('setWindow');
                clearInterval(handle);

                myWindow.window.setWindow(window);
            }
        }, 100);
    }

    function loadLogout() {
        var myWindow = window.open("setting/logout.html", 'test', 'width=' + 300 + ',height=' + 260 + '');

        var handle = setInterval(function () {

            if (myWindow.window.setWindow) {
                console.log('setWindow');
                clearInterval(handle);

                myWindow.window.setWindow(window);
            }
        }, 100);
    }


    // Update the contents of the toolbars
    $(document).on("click", '.LogInButton', function () {
        loadLogin();
    });
    $(document).on("click", '.LogOutButton', function () {
        loadLogout();
    });
    $(document).on("click", '.SettingButton', function () {
        window.location.href = '/administrator';
    });


    //$("[data-role='navbar']").navbar();
    //$("[data-role='header'], [data-role='footer']").toolbar();


    //$('body').on('click', '.ui-page-active .menu', function () {
    //    console.log('clickMenu');
    //    $(".ui-page-active .menu-panel").panel("toggle");
    //});

    //$('body').on('click', '.ui-page-active .setting', function () {
    //    $(".ui-page-active .setting-panel").panel("toggle");
    //});


    $('body').on('click', '.ui-page-active .menu', function () {
        console.log('clickMenu');
        $(".ui-page-active .menu-panel").panel("toggle");
    });

    $('body').on('click', '.ui-page-active .setting', function () {
        $(".ui-page-active .setting-panel").panel("toggle");
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
        //alert('window.require');
        //var win = require('nw.gui').Window.get();
        //win.reload(3);
        //require('nw.gui').Window.get().showDevTools();

        //$('#setting').click(function () {

        //    require('nw.gui').Window.get().showDevTools();

        //    return false;
        //});
    }

    function checkMenuPermission() {
        var permissionObj = app.userModel.get('permission');
        //console.log(permissionObj);

        //if (app.userModel.get('type') != 'admin') {

        var current = $('[data-role="page"]').each(function (i, elPage) {
            var $elPage = $(elPage);
            var current = $elPage.jqmData("title");
            if (current) {
                console.log('current', current);
                if (permissionObj[current]) {
                    var subMenuPermission = permissionObj[current];

                    $elPage.find("[data-role='header'] ul a").each(function (i, el) {
                        var $el = $(el);
                        var value = $el.jqmData('value');

                        if (!subMenuPermission[value]) {
                            console.log(value);
                            $el.parent('li').hide();
                        }
                    });
                }

            }
        });

        $("[data-role='panel'].menu-panel a").each(function (i, el) {
            var $el = $(el);
            var name = $el.jqmData('menu');

            if (name != 'HOME') {
                if (!permissionObj[name]) {
                    //console.log(name);
                    $el.parent('li').hide();
                }
            }
        });

        $("[data-role='footer'] a").each(function (i, el) {
            var $el = $(el);
            var name = $el.jqmData('menu');

            if (name != 'HOME') {
                if (!permissionObj[name]) {
                    //console.log(name);
                    $el.parent('li').hide();
                }
            }
        });

        //}

    }

    function pagecontainerchange() {

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
        $("[data-role='header'] h1").text('Anda-Stock' + (current == 'Anda-Stock' ? '' : '#' + current) + ' - by ' + sessionStorage.user);
        // Remove active class from nav buttons
        $(".menu-panel [data-role='listview'] a.ui-btn-active").removeClass("ui-btn-active");
        // Add active class to current nav button
        $(".menu-panel [data-role='listview'] a").each(function () {
            if ($(this).jqmData("menu") === current) {
                $(this).addClass("ui-btn-active");
            }
        });

        if ($('.ui-page-active').attr('inited') == undefined) {

            $('.ui-page-active').attr('inited', true);

            if (current == 'Supplier') {
                app.initSupplier();
            }
            //else if (current == 'OE') {
            //    app.initProduct('OE');
            //}
            else if (current == 'Stock') {
                app.initProduct('All');

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
            //else if (current == 'OE-In') {
            //    app.initImportProduct('OE');
            //}
            else if (current == 'Stock-In') {
                app.initImportProduct('All');
            }

            else if (current == 'Stock-In (PettyCash)') {
                app.initImportProductPettyCash('All');
            }
            //else if (current == 'OE-In (PettyCash)') {
            //    app.initImportProductPettyCash('OE');
            //}
            
            else if (current == 'Stock-Out') {
                app.initExportProduct();
            }
            else if (current == 'Report') {
                app.initReport();
            }
            else if (current == 'Stock-Checking') {
                app.initCheckProduct();
            }
        }

    }

    // Update the contents of the toolbars
    $(document).on("pagechange", function () {
        //alert('pagecontainerchange');

        pagecontainerchange();

    });

    $(document).on("pagebeforeshow", function () {
        //alert('pagebeforeshow');
        checkMenuPermission();
    });



    //document.getElementById("#userNameInput").autocomplete = "off"
    $('#userNameInput').attr('autocomplete', 'off');

    //window.onbeforeunload = function (event) {
    //    var message = 'Sure you want to leave?';
    //    if (typeof event == 'undefined') {
    //        event = window.event;
    //    }
    //    if (event) {
    //        event.returnValue = message;
    //    }
    //    return message;
    //}


    //$(document).on("pagecontainerload", function () {
    //    var current = $(".ui-page-active").jqmData("title");
    //    console.log("pagecontainerload event fired! from " + current);
    //});


    //$(document).on("pagecontainercreate", function () {
    //    var current = $(".ui-page-active").jqmData("title");
    //    console.log("pagecontainercreate event fired! from " + current);
    //});




    //function stopNavigate() {
    //    $(window).off('beforeunload');
    //}

    //$('a').on('mousedown', stopNavigate);

    //$('a').on('mouseleave', function () {
    //    $(window).on('beforeunload', function () {
    //        return 'Are you sure you want to leave?';
    //    });
    //});


    //$(window).on('beforeunload', function () {
    //    return 'Are you sure you want to leave?';
    //});

    $(window).on('unload', function () {

        console.log('exit');

    });
    //$(window).unload(function () {
    //    console.log('exit');
    //});

    //window.onbeforeunload = function () {

    //    return 'Any string';
    //};
});