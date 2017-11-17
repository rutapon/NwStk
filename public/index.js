/// <reference path="NwLib/NwLib.js" />
/// <reference path="lib/jquery/jquery-2.1.1.js" />

var app = app || { models: {}, collections: {}, views: {} };

$(function () {
    var host = window.location.hostname;
    var port = window.location.port
    var protocol = 'ws:';

    $('#idmenu').mnmenu({ responsiveMenuEnabled: false });
    if (window.location.protocol == 'https:') {
        protocol = 'wss:';
        var wsClient = app.wsClient = new NwWsClient(protocol + '//' + host + ":" + port, { secure: true });
    } else {
        var wsClient = app.wsClient = new NwWsClient(protocol + '//' + host + ":" + port);
    }

    var serviceMethod = app.serviceMethod = new NwServiceConn(wsClient);

    wsClient.setOnConnectEventListener(function (socket) {
        var id = wsClient.getId();
        console.log('onConnect ' + id);
    });

    wsClient.setOnDisconnectEventListener(function myfunction() {

    });

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


    function loadUpdate() {
        var myWindow = window.open("update.html");

        var handle = setInterval(function () {

            if (myWindow.window.setWindow) {
                console.log('setWindow');
                clearInterval(handle);

                myWindow.window.setWindow(window);
            }
        }, 100);
    }



    $('.permissible').hide();
    $('#logout').hide();
    $('#setting').hide();

    if (sessionStorage.user) {
        //alert(sessionStorage.user);

        app.userModel = new app.models.UserModel(JSON.parse(sessionStorage.userModelattributes));
        app.userModel.login(function (result) {
            console.log(result);
            if (result) {
                sessionStorage.userModelattributes = JSON.stringify(app.userModel.attributes);
                sessionStorage.type = result.type

            }
            else {
                sessionStorage.userModelattributes = null;
                sessionStorage.user = null;
                sessionStorage.type = null
            }

            checkMenuPermission();
        });
        //console.log(app.userModel);
    }
    else {
        app.userModel = new app.models.UserModel({ permission: {} });
        checkMenuPermission();
    }

    function checkMenuPermission() {

        var permissionObj = app.userModel.get('permission');

        console.log('permissionObj', permissionObj);

        var permitRoot = {};
        _.each(permissionObj, function (item, key) {
            //console.log(item);
            var root = key.split('->')[0];
            permitRoot[root] = true;
        })

        $('.permissible').each(function (id, el) {
            var $el = $(el);
            var root = $el.find('span').eq(0).text();
            //console.log(root);
            if (permitRoot[root]) {
                $el.show();
                var subMenus = $el.find('li');
                //subMenus.hide();
                subMenus.each(function (id, sub) {
                    var $sub = $(sub);
                    var subMenu = $sub.find('span').text();
                    if (!permissionObj[root + '->' + subMenu]) {
                        $sub.hide();
                    }
                });

            }
        })


        if (app.userModel.get('user')) {
            $('#logout').show();
        }

        if (app.userModel.get('type') == 'admin') {
            $('#setting').show();
        }
    }


    var v = (new Date()).getTime();

    var loadMainFrameHref = function (href) {
        $('#mainFrame').attr('src', href + '?v=' + v)
    }

    $(document).on('click', "#idmenu li", function (ev) {
        ev.preventDefault();
        var thisEl = $(ev.target);
        //var href = thisEl.parents("a").attr('href');
        var href = thisEl.attr('data-href');
        href = href ? href : thisEl.parents("li").attr('data-href');

        console.log('cl', href);
        if (href) {
            console.log(href);
            if (href.indexOf('.html') != -1) {

                let herfSp = href.split('?');
                let hrefWithPara = herfSp[0] + '?v=' + v;
                if (herfSp[1]) {
                    hrefWithPara = hrefWithPara + '&' + herfSp[1];
                }
                $('#mainFrame').attr('src', hrefWithPara)
            }
            else if (href == '#update') {
                window.location = 'update.html?v=' + v;
            }
            else if (href == '#logging') {
                loadLogin();
            }
            else if (href == '#logout') {
                loadLogout();
            }
        }


        //friendA.removeClass('ui-state-persist');
        //thisEl.addClass('ui-state-persist');

        //alert($(ev.target).parents("[data-role='navbar']").find('a').length);
        return false;
    });

    // $.get("test/index.html", function (data) {
    //     //$( ".result" ).html( data );
    //     //alert( "Load was performed." );
    //     console.log(data);
    //     $('#mainFrame').contents().find("html").html(data);
    //     //document.getElementById('mainFrame').contentWindow.document.body.innerHTML =data;
    //     //$('#mainFrame').contents().find("html").html('<button>test</button>');
    //     //$('#mainFrame').attr('src', "Home.html" )
    // });

    $('#mainFrame').attr('src', "Home.html")
    $('#userNameInput').attr('autocomplete', 'off');
});