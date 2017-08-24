/// <reference path="../lib/jquery/jquery-2.1.1.js" />
/// <reference path="app.js" />

//app.userModel = {
//    getUserObj: function () {
//        return {
//            user: 'admin',
//            pass: 'admin'
//        };
//    }
//};


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
                    window.location.href = '/administrator'
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

    window.location.href = '/administrator'
}


function loadLogin() {
    var myWindow = window.open("../setting/login.html", 'test', 'width=' + 480 + ',height=' + 420 + '');

    var handle = setInterval(function () {

        if (myWindow.window.setWindow) {
            console.log('setWindow');
            clearInterval(handle);

            myWindow.window.setWindow(window);
        }
    }, 100);
}

function loadLogout() {
    var myWindow = window.open("../setting/logout.html", 'test', 'width=' + 300 + ',height=' + 260 + '');

    var handle = setInterval(function () {

        if (myWindow.window.setWindow) {
            console.log('setWindow');
            clearInterval(handle);

            myWindow.window.setWindow(window);
        }
    }, 100);
}

$(function () {


    $(document).on("click", '#LogInButton', function () {
        loadLogin();
    });
    $(document).on("click", '#LogOutButton', function () {
        loadLogout();
    });


    if (typeof (Storage) !== "undefined") {
        // Code for localStorage/sessionStorage.

        if (sessionStorage.user) {
            //alert(sessionStorage.user);

            app.userModel = new app.models.UserModel(JSON.parse(sessionStorage.userModelattributes));
            //console.log(app.userModel);
            console.log('app.userModel', app.userModel.getListsName('OE'));
            $('#menu').show();

        }
        else {
            //app.userModel = new app.models.UserModel({ permission: {} });
            //$(".setting-panel").panel("open");
            $('#menu').hide();
        }

        //pagecontainerchange();
        //checkMenuPermission();

    } else {
        alert('Sorry! No Web Storage support..');
    }
})