 /// <reference path="lib/jquery/jquery-2.1.1.js" />
/// <reference path="NwActor/NwActorRemote.js" />

$(function () {


    var actorRemote = new NwActorRemote();
    var actorNodeType = "tcp";

    //var ip = 'newww.dyndns.org';//'192.168.137.100';
    var ip ='192.168.137.100';
    //var ip = '192.168.8.100';
    //var ip = window.location.hostname;

    var lastSocketId = null;
    var pinStateObj = null;

    actorRemote.connectToActor(ip, function () {

        actorRemote.setOnActorNodeConnectListener(ip, function (data) {
            console.log('connnnnnnnn ' + JSON.stringify(data));

            lastSocketId = data.socketId;

            actorRemote.getPinsState(ip, lastSocketId, 'tcp', function (result) {
                console.log('getPinsState ' + JSON.stringify(result));

                pinStateObj = toPinStateObj(result);

                setSwitchState('4', pinStateObj['4']);
                setSwitchState('5', pinStateObj['5']);
            });

        });

        actorRemote.setOnActorNodeDisconnectListener(ip, function (data) {
            console.log('dis con ' + JSON.stringify(data));

            lastSocketId = null;

            //actorRemote.getNodeIds(ip, 'tcp', function myfunction(ids) {
            //    if (ids.length > 0) {
            //        lastSocketId = ids[0];
            //    }
            //});
        });

        actorRemote.setOnActorNodeMessage(ip, function (data) {
            console.log('OnActorNodeMessage' + JSON.stringify(data));

            pinStateObj = toPinStateObj(data.data);


            setSwitchState('4', pinStateObj['4']);
            setSwitchState('5', pinStateObj['5']);
            //actorRemote.getNodeIds(ip, 'tcp', function myfunction(ids) {
            //    if (ids.length > 0) {
            //        lastSocketId = ids[0];
            //    }
            //});
        });

        actorRemote.getNodeInfo(ip, actorNodeType, function (value) {
            console.log(JSON.stringify(value));

            if (value.length > 0) {
                lastSocketId = value[0].nodeId;
            }

            if (lastSocketId != null) {
                actorRemote.getPinsState(ip, lastSocketId, 'tcp', function (result) {
                    console.log('getPinsState ' + JSON.stringify(result));

                    pinStateObj = toPinStateObj(result);

                    setSwitchState('4', pinStateObj['4']);
                    setSwitchState('5', pinStateObj['5']);
                });
            }

        });

        //actorRemote.getNodeIds(ip, 'tcp', function myfunction(ids) {
        //    if (ids.length > 0) {
        //        lastSocketId = ids[0];
        //    }

        //    if (lastSocketId != null) {
        //        actorRemote.getPinsState(ip, lastSocketId, 'tcp', function (result) {
        //            console.log('getPinsState ' + JSON.stringify(result));

        //            pinStateObj = toPinStateObj(result);

        //            setSwitchState('4', pinStateObj['4']);
        //            setSwitchState('5', pinStateObj['5']);
        //        });
        //    }
        //});

        setInterval(function () {
            if (lastSocketId != null) {
                //actorRemote.readDtPin(ip, lastSocketId, 4, 'tcp', function (result) {
                //    console.log('readDtPin ' + JSON.stringify(result));

                //    pinStateObj = toPinStateObj(result);

                //    setSwitchState('4', pinStateObj['4']);
                //    setSwitchState('5', pinStateObj['5']);
                //});
            }

            //actorRemote.readDtPin(ip, lastSocketId, 5, 'tcp', function (result) {
            //    console.log('readDtPin ' + JSON.stringify(result));

            //    var name = result.split(';')[0];
            //    var st = result.split(';')[1] == '1' ? 0 : 1;

            //    setSwitchState(name, st);
            //});

        }, 5000);

    });

    actorRemote.setOnConnectEventListener(function () {

    });

    function toPinStateObj(pinStateStr) {
        var pinStateObj = {};
        var allPinState = pinStateStr.split(',');
        for (var i in allPinState) {
            var pinStateValuePair = allPinState[i].split(';');

            pinStateObj[pinStateValuePair[0]] = pinStateValuePair[1] == '1' ? 0 : 1;
        }

        return pinStateObj;
    }

    $('body').on("change", '.SwitchInput', function (e) {
        var $target = $(e.target);
        var name = $target.attr('name');
        var checked = $target.is(":checked");


        var isExternalChange = $target.attr('isExternalChange');
        $target.attr('isExternalChange', false)

        if (isExternalChange == "true") {
            //programmatic change
            //$target.attr('changeAuto', false);
            console.log('isExternalChange');
        }
        else {
            $target.flipswitch('disable');
            //manual change
            var timeOut = setTimeout(function () {

                //setSwitchState(name, !checked);
                if (pinStateObj) {
                    setSwitchState('4', pinStateObj['4']);
                    setSwitchState('5', pinStateObj['5']);
                }

                $target.flipswitch('enable');
            }, 2000);

            writePin(name, checked, function (value) {
                $target.flipswitch('enable');
                if (timeOut) {
                    clearTimeout(timeOut);
                }
                else {


                }

                pinStateObj = toPinStateObj(value);
                setSwitchState('4', pinStateObj['4']);
                setSwitchState('5', pinStateObj['5']);

            });
        }

        //console.log(name, checked, isExternalChange);

    });
    // var state = 1;

    var writePin = function (name, state, cb) {

        state = state ? 0 : 1;
        actorRemote.writeDtPin(ip, lastSocketId, name, actorNodeType, state, function (value) {

            console.log(value);
            cb(value);
            //setSensorDeviceValue(name, id, value);
        });
    };

    var setSwitchState = function (switchName, state) {

        var currentState = getSwitchState(switchName);
        if (currentState != state) {
            $elem = $("[name='" + switchName + "']");
            $elem.attr('isExternalChange', true)
            $elem.prop('checked', state).flipswitch('refresh');
        }
    };

    var getSwitchState = function (switchName) {
        $elem = $("[name='" + switchName + "']");
        var checked = $elem.is(":checked");

        return checked;
    };

    $('#test').click(function () {

        //var checked = getSwitchState('{0}');
        //SwitchState[i].updated = true;

        //var state = checked ? 0 : 1;

        //setSwitchState('{0}', state);

        //actorRemote.getDeviceModel(ip, lastSocketId, actorNodeType, function (value) {

        //    console.log(value);

        //    //setSensorDeviceValue(name, id, value);
        //});

        actorRemote.getNodeInfo(ip, actorNodeType, function (value) {
            console.log(JSON.stringify(value));
        });

        //var audio = document.createElement('audio');
        //audio.setAttribute('src', 'http://translate.google.com/translate_tts?tl=en&q=' + encodeURIComponent("bourgeois"));
        //audio.load();
        //audio.play();

        //var msg = new SpeechSynthesisUtterance('bourgeois');
        //window.speechSynthesis.speak(msg);

        //alert('http://translate.google.com/translate_tts?tl=en&q=bourgeois');
    });
});