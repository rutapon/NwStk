/// <reference path="../lib/jquery/jquery-2.1.1.js" />
/// <reference path="../lib/underscore/underscore.js" />
/// <reference path="../lib/backbone/backbone.js" />

/// <reference path="../NwLib/NwLib.js" />
/// <reference path="../NwConn/NwConn.js" />
/// <reference path="../service_conn/NwServiceConn.js" />
/// <reference path="models/Stock.js" />
var app = app || { models: {}, collections: {}, views: {} };

(function () {

    var host = window.location.hostname;
    //var host = 'andamania.duckdns.org';

    var port = window.location.port
    var protocol = 'ws:';
    //var host = 'localhost';
    //var host = 'newww.dyndns.org';
    //alert(window.location.protocol + window.location.port);

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


    app.time = {
        addHours: function (date, hours) {
            var result = new Date(date);
            result.setHours(result.getHours() + hours);
            return result;
        },
        addDays: function (date, days) {
            var result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        },
        addMonths: function (date, months) {
            var result = new Date(date);
            result.setMonth(result.getMonth() + months);
            return result;
        },
        addYears: function (date, years) {
            var result = new Date(date);
            result.setFullYear(result.getFullYear() + years);
            return result;
        },
        removeTimezoneOffset: function (now) {
            return this.addHours(now, -now.getTimezoneOffset() / 60);
        },
        addTimezoneOffset: function (now) {
            return this.addHours(now, now.getTimezoneOffset() / 60);
        }
    };
    app.math = {
        subtraction: function (a, b, fix) {
            if (!fix) fix = 10000000;
            return (a * fix - b * fix) / fix;
            // Math.floor((-0.2-0.1)*SIGDIG)/SIGDIG 
        },
        addition: function (a, b, fix) {
            if (!fix) fix = 10000000;
            return (a * fix + b * fix) / fix;
        },
        add: function (a, b, precision) {
            var x = Math.pow(10, precision || 2);
            return (Math.round(a * x) + Math.round(b * x)) / x;
        },
        precision: function (a, precision) {
            var x = Math.pow(10, precision || 2);
            return (Math.round(a * x)) / x;
        }
    };
    app.url = {
        getUrlParameter: function (sParam) {
            var sPageURL = decodeURIComponent(window.location.search.substring(1)),
                sURLVariables = sPageURL.split('&'),
                sParameterName,
                i;

            for (i = 0; i < sURLVariables.length; i++) {
                sParameterName = sURLVariables[i].split('=');

                if (sParameterName[0] === sParam) {
                    return sParameterName[1] === undefined ? true : sParameterName[1];
                }
            }
        }
    }


    $(function () {

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

                    // pagecontainerchange();
                    checkMenuPermission();

                    // setTimeout(function () {
                    //     $(".menu-panel").panel("open");
                    // },300)
                });
                //console.log(app.userModel);

            }
            else {
                app.userModel = new app.models.UserModel({ permission: {} });
                //$(".setting-panel").panel("open");

                //pagecontainerchange();
                checkMenuPermission();
            }


        } else {
            alert('Sorry! No Web Storage support..');
        }

        function checkMenuPermission() {
            var permissionObj = app.userModel.get('permission');
            //console.log(permissionObj);
            //if (app.userModel.get('type') != 'admin') {

            var current = $('[data-role="page"]').each(function (i, elPage) {

                var $elPage = $(elPage);
                var current = $elPage.jqmData("title");
                //console.log('current page:', current);
                if (current) {
                    $("[data-role='header'] h1").text('Anda-Stock' + (current == 'Anda-Stock' ? '' : '#' + current) + ' - by ' + sessionStorage.user);

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
                    else {
                        console.log('No permission');
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



        }
    });
})();
