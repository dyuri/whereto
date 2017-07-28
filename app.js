'use strict';

var aobj, rotX = 0;

function detectCamera(deviceInfos) {
  var cameras = deviceInfos.filter(function (di) { return di.kind === 'videoinput'; });

  return cameras.length ? cameras[cameras.length - 1].deviceId : '';
}

function initAR(sourceId) {
  var vid = document.querySelector('#inputVideo');

  var placeKacsaToTarget = function (e) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var start = {latitude: position.coords.latitude, longitude: position.coords.longitude},
          target = getTarget(),
          distance = window.geolib.getDistance(start, target),
          bearing = window.geolib.getBearing(start, target),
          r = 4000,
          rot = Math.PI * (e.alpha+90+bearing) / 180,
          kacsaX = -Math.cos(rot) * r,
          kacsaZ = -Math.sin(rot) * r;

      // console.log(e.alpha, bearing, whereto.distance, kacsaX, kacsaZ);
      aobj.setAttribute('position', kacsaX+' 0 '+kacsaZ);
    });
  };

  window.cameraSource.start({
    videoElement: vid,
    constraints: {
      video: {
        optional: [{
          sourceId: sourceId
        }]
      },
      facingMode: "environment"
    },
    callback: function() {

      var scene = document.querySelector('#aScene');
      aobj = document.createElement('a-obj-model');
      aobj.setAttribute('id', 'duck');
      aobj.setAttribute('src', '#ducky-obj');
      aobj.setAttribute('position', '0 0 -4000');
      aobj.setAttribute('rotation', '210 -120 180');
      aobj.setAttribute('scale', '4 4 4');
      aobj.setAttribute('material', 'color: orange');
      scene.appendChild(aobj);

      setInterval(function () {
        window.addEventListener('deviceorientationabsolute', placeKacsaToTarget, {once: true});
      }, 1000);

      setInterval(function () {
        rotX = rotX + 10 % 360;
        aobj.setAttribute('rotation', rotX+' -120 180');
      }, 100);
    }
  });

}

function getTarget() {
  var lat = 47.505448,
      lon = 18.9362813,
      hash = window.location.hash.substr(1);

  if (hash) {
    var ll = hash.split(',');
    lat = ll[0];
    lon = ll[1];
  }

  return {
    latitude: lat,
    longitude: lon
  };
}

function onReady() {
  navigator.mediaDevices.enumerateDevices().then(detectCamera).then(initAR);
}

document.addEventListener('DOMContentLoaded', onReady);
