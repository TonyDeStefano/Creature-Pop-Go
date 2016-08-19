$(function(){

    $('#battle-overlay-x').click(function(){
        $('#battle-overlay').hide();
        $('#modal-block').hide();
    });

    $('#tracker-btn').click(function(e){
        e.preventDefault();
        var overlay = $('#tracker-overlay');
        if (overlay.css('display') == 'none') {
            overlay.show();
            $(this).addClass('btn-success');
            $(this).removeClass('btn-default');
        } else {
            overlay.hide();
            $(this).removeClass('btn-success');
            $(this).addClass('btn-default');
        }
    });

    $('#caught-btn').click(function(e){
        e.preventDefault();
        var overlay = $('#caught-overlay');
        if (overlay.css('display') == 'none') {
            overlay.show();
            $(this).addClass('btn-success');
            $(this).removeClass('btn-default');
        } else {
            overlay.hide();
            $(this).removeClass('btn-success');
            $(this).addClass('btn-default');
        }
    });

    $('#address').on('keypress', function(e){
        if (e.keyCode == 13) {
            e.preventDefault();
            searchAddress();
        }
    });

    $('#start').click(function(e){
        e.preventDefault();
        searchAddress();
    });

    $(document).keydown(function(e) {

        if (me.lat == null) {
            return;
        }

        switch(e.which) {

            case 37:
                move('w');
                break;

            case 38:
                move('n');
                break;

            case 39:
                move('e');
                break;

            case 40:
                move('s');
                break;

            default: return; // exit this handler for other keys
        }

        e.preventDefault();
    });

});

var map;
var bounds;

function searchAddress(){

    var address = $('#address').val();

    if (address.length == 0) {

        alert('Please enter an address');

    } else {

        var geocoder = new google.maps.Geocoder();

        if (geocoder) {

            geocoder.geocode({
                address: address
            }, function (results, status) {

                if (status == google.maps.GeocoderStatus.OK) {

                    me.lat = results[0].geometry.location.lat();
                    me.lng = results[0].geometry.location.lng();

                    start();

                } else {

                    alert('There was a problem with the address you entered. Please try again.');
                }
            });

        } else {

            alert('There was a problem with the address you entered. Please try again.');
        }
    }
}

function start() {

    $('#buttons').show();
    $('.jumbotron').hide();

    var x = $(window).width();
    var y = $(window).height() - 50;

    $('#map')
        .width(x)
        .height(y);

    var center = new google.maps.LatLng(me.lat, me.lng);

    var options = {
        center: center,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
        scrollwheel: false,
        navigationControl: false,
        mapTypeControl: false,
        scaleControl: false,
        draggable: false
    };

    map = new google.maps.Map(document.getElementById('map'), options);

    var marker = new google.maps.Marker({
        position: center,
        animation: google.maps.Animation.DROP,
        icon: 'img/blob-sm.png'
    });

    var shadow_icon = {
        url: 'img/shadow.png',
        size: new google.maps.Size(32, 30),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(16, 15)
    };

    var shadow = new google.maps.Marker({
        position: center,
        icon: shadow_icon
    });

    shadow.setMap(map);
    marker.setMap(map);

    var tooltip = new Tooltip(marker, 'Use the arrow keys on your keyboard to move me!');

    me.marker = marker;
    me.shadow = shadow;

    google.maps.event.addListener(map,'idle', function() {
        if (bounds == null) {
            bounds = map.getBounds();
            creatureInit();
        }
    });
}

function creatureInit() {

    for (var c=0; c<creatures.length; c++) {

        var north = Math.round((bounds.getNorthEast().lat() - .00055) * 100000);
        var south = Math.round((bounds.getSouthWest().lat() + .00015) * 100000);
        var east = Math.round((bounds.getNorthEast().lng() - .00015) * 100000);
        var west = Math.round((bounds.getSouthWest().lng() + .00015) * 100000);

        var lat = getRandomInt(south, north) / 100000;
        var lng = getRandomInt(east, west) / 100000;

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            icon: creatures[c].ico,
            visible: false,
            indexNumber: c
        });

        marker.setMap(map);

        google.maps.event.addListener(marker, 'click', function() {
            battle(this.indexNumber);
        });

        creatures[c].lat = lat;
        creatures[c].lng = lng;
        creatures[c].marker = marker;

        $('#tracker-overlay').find('.row').append('<div class="col-md-4" id="tracker-creature-'+c+'"><div class="creature"><img src="' + creatures[c].img + '"><br><span></span></div></div>')
    }

    nearby();
}

function battle(c) {

    if (creatures[c].visible && !creatures[c].caught) {

        var modal_block = $('#modal-block');
        modal_block
            .css({
                width: $(window).width(),
                height: $(window).height()
            })
            .show();

        var battle_overlay = $('#battle-overlay');
        var streetview = 'https://maps.googleapis.com/maps/api/streetview?size=600x400&location='+creatures[c].lat+','+creatures[c].lng+'&key=AIzaSyDj8i3P_9tONkyNR7sRL3DojZtpOUJlqlg';

        battle_overlay
            .css({
                'background-image': 'url('+streetview+')',
                left: ($(window).width()/2)-300
            })
            .show();

        $('#battle-creature').html('<img src="'+creatures[c].img+'">');
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1);
    var a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}

function move(direction){

    switch(direction) {

        case 'n':
            me.lat += .00005;
            break;

        case 's':
            me.lat -= .00005;
            break;

        case 'e':
            me.lng += .00005;
            break;

        case 'w':
            me.lng -= .00005;
            break;
    }

    if (me.lat > bounds.getNorthEast().lat()) {
        me.lat = bounds.getNorthEast().lat();
    }

    if (me.lat < bounds.getSouthWest().lat()) {
        me.lat = bounds.getSouthWest().lat();
    }

    if (me.lng > bounds.getNorthEast().lng()) {
        me.lng = bounds.getNorthEast().lng();
    }

    if (me.lng < bounds.getSouthWest().lng()) {
        me.lng = bounds.getSouthWest().lng();
    }

    me.marker.setPosition(new google.maps.LatLng(me.lat, me.lng));
    me.shadow.setPosition(new google.maps.LatLng(me.lat, me.lng));

    nearby();
}

function nearby() {

    for (var c=0; c<creatures.length; c++) {

        if (!creatures[c].caught) {

            var tracker_creature = $('#tracker-creature-'+c);
            var meters = Math.round(getDistanceFromLatLonInKm(me.lat, me.lng, creatures[c].lat, creatures[c].lng) * 1000);

            if (meters <= 80) {
                creatures[c].visible = true;
                creatures[c].marker.setVisible(true);
            } else {
                creatures[c].visible = false;
                creatures[c].marker.setVisible(false);
            }

            if (meters <= 100) {
                tracker_creature.show();
                tracker_creature.find('span')
                    .css('color', '#3c763d')
                    .html('<i class="fa fa-bullseye"></i>');
            } else if (meters <= 200) {
                tracker_creature.show();
                tracker_creature.find('span')
                    .css('color', '#aa6708')
                    .html('<i class="fa fa-bullseye"></i><i class="fa fa-bullseye"></i>');
            } else if (meters <= 300) {
                tracker_creature.show();
                tracker_creature.find('span')
                    .css('color', '#a94442')
                    .html('<i class="fa fa-bullseye"></i><i class="fa fa-bullseye"></i><i class="fa fa-bullseye"></i>');
            } else {
                tracker_creature.hide();
            }
        }
    }
}