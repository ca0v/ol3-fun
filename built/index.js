define("ol3-fun/common",["require","exports"],function(e,t){"use strict";function o(e,t){if("string"==typeof t)return e;if("number"==typeof t)return parseFloat(e);if("boolean"==typeof t)return"1"===e||"true"===e;if(Array.isArray(t))return e.split(",").map(function(e){return o(e,t[0])});throw"unknown type: "+t}function i(e,t){void 0===t&&(t=window.location.href),e=e.replace(/[\[\]]/g,"\\$&");var n=new RegExp("[?&]"+e+"(=([^&#]*)|&|#|$)").exec(t);return n?n[2]?decodeURIComponent(n[2].replace(/\+/g," ")):"":null}function u(e,t){null!=e&&t(e)}Object.defineProperty(t,"__esModule",{value:!0}),t.uuid=function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(e){var t=16*Math.random()|0;return("x"==e?t:3&t|8).toString(16)})},t.asArray=function(e){for(var t=new Array(e.length),n=0;n<e.length;n++)t[n]=e[n];return t},t.toggle=function(e,t,n){var r=e.classList.contains(t);return r&&!0!==n?(e.classList.remove(t),!1):r||!1===n?r:(e.classList.add(t),!0)},t.parse=o,t.getQueryParameters=function(e,t){void 0===t&&(t=window.location.href);var r=e;Object.keys(r).forEach(function(n){u(i(n,t),function(e){var t=o(e,r[n]);void 0!==t&&(r[n]=t)})})},t.getParameterByName=i,t.doif=u,t.mixin=function(t,n){return Object.keys(n).forEach(function(e){return t[e]=n[e]}),t},t.defaults=function(n){for(var e=[],t=1;t<arguments.length;t++)e[t-1]=arguments[t];return e.forEach(function(t){Object.keys(t).filter(function(e){return void 0===n[e]}).forEach(function(e){return n[e]=t[e]})}),n},t.cssin=function(e,t){var n="style-"+e,r=document.getElementById(n);r||((r=document.createElement("style")).id=n,r.type="text/css",document.head.appendChild(r),r.appendChild(document.createTextNode(t)));var o=r.dataset;return o.count=parseInt(o.count||"0")+1+"",function(){o.count=parseInt(o.count||"0")-1+"","0"===o.count&&r.remove()}},t.debounce=function(r,o,i){var u;return void 0===o&&(o=50),void 0===i&&(i=!1),function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];var n=i&&!u;clearTimeout(u),u=window.setTimeout(function(){u=null,i||r.apply({},e)},o),n&&r.apply({},e)}},t.html=function(e){var t=document.createElement("div");return t.innerHTML=e,t.firstElementChild||t.firstChild},t.pair=function(e,n){var r=new Array(e.length*n.length),o=0;return e.forEach(function(t){return n.forEach(function(e){return r[o++]=[t,e]})}),r},t.range=function(e){for(var t=new Array(e),n=0;n<e;n++)t[n]=n;return t},t.shuffle=function(e){for(var t,n,r=e.length;0!==r;)n=Math.floor(Math.random()*r),t=e[r-=1],e[r]=e[n],e[n]=t;return e}}),define("ol3-fun/navigation",["require","exports","openlayers","ol3-fun/common"],function(e,t,c,f){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.zoomToFeature=function(t,e,n){n=f.defaults(n||{},{duration:1e3,padding:256,minResolution:2*t.getView().getMinResolution()});var r=t.getView(),o=r.calculateExtent(t.getSize()),i=e.getGeometry().getExtent(),u=function(e){r.fit(i,{size:t.getSize(),padding:[n.padding,n.padding,n.padding,n.padding],minResolution:n.minResolution,duration:e})};if(c.extent.containsExtent(o,i))u(n.duration);else if(c.extent.containsExtent(o,i))u(n.duration);else{var a=c.extent.createEmpty();c.extent.extend(a,o),c.extent.extend(a,i),c.extent.getWidth(a),c.extent.getWidth(o);var d=.5*n.duration;r.fit(a,{size:t.getSize(),padding:[n.padding,n.padding,n.padding,n.padding],minResolution:n.minResolution,duration:d}),setTimeout(function(){return u(.5*n.duration)},d)}}}),define("ol3-fun/parse-dms",["require","exports"],function(e,t){"use strict";function d(e){var t,n,r,o,i,u={"-":-1,N:1,S:-1,E:1,W:-1},a={"-":"",N:"lat",S:"lat",E:"lon",W:"lon"};if(o=u[e[2]]||u[e[1]]||u[e[6]]||1,t=Number(e[3]),n=e[4]?Number(e[4]):0,r=e[5]?Number(e[5]):0,i=a[e[1]]||a[e[6]],!c(t,0,180))throw"Degrees out of range";if(!c(n,0,60))throw"Minutes out of range";if(!c(r,0,60))throw"Seconds out of range";return{decDeg:o*(t+n/60+r/3600),latLon:i}}function c(e,t,n){return t<=e&&e<=n}Object.defineProperty(t,"__esModule",{value:!0}),t.parse=function(e){var t,n,r=/([NSEW])?(-)?(\d+(?:\.\d+)?)[°º:d\s]?\s?(?:(\d+(?:\.\d+)?)['’‘′:]\s?(?:(\d{1,2}(?:\.\d+)?)(?:"|″|’’|'')?)?)?\s?([NSEW])?/i,o=(e=e.trim()).match(r);if(!o)throw"Could not parse string";o[1]?(o[6]=void 0,n=e.substr(o[0].length-1).trim()):n=e.substr(o[0].length).trim();var i=d(o),u=n.match(r),a=u&&d(u);if(void 0===i.latLon){if(!isNaN(i.decDeg)&&a&&isNaN(a.decDeg))return i.decDeg;if(isNaN(i.decDeg)||!a||isNaN(a.decDeg))throw"Could not parse string";i.latLon="lat",a.latLon="lon"}return void 0===a.latLon&&(a.latLon="lat"===i.latLon?"lon":"lat"),(t={})[i.latLon]=i.decDeg,t[a.latLon]=a.decDeg,t}}),define("index",["require","exports","ol3-fun/common","ol3-fun/navigation","ol3-fun/parse-dms"],function(e,t,n,r,o){"use strict";return n.defaults(n,{dms:o,navigation:r})});
//# sourceMappingURL=index.js.map