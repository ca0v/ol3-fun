var localhost = false;
var debug = true;
// setup require js packaging system and load the "spec" before running mocha
requirejs.config({
    shim: {
        // no need to wrap ol in a define method when using a shim
        // build this using the "npm run build-legacy" (see ol package.json)
        "openlayers": {
            deps: [],
            exports: "ol"
        }
    },
    paths: {
        "openlayers": localhost ? "../node_modules/ol/build/ol" : "https://cdn.rawgit.com/openlayers/openlayers.github.io/master/en/v5.2.0/build/ol"
    },
    packages: [
        {
            name: 'jquery',
            location: localhost ? '../node_modules/jquery' : "https://code.jquery.com",
            main: localhost ? 'dist/jquery.min' : "jquery-3.3.1.min"
        },
        {
            name: 'mocha',
            location: localhost ? '../node_modules/mocha' : "https://cdnjs.cloudflare.com/ajax/libs/mocha/5.2.0",
            main: localhost ? 'mocha' : "mocha.min"
        }
    ],
    deps: ["spec/index"],
    callback: function () {
        requirejs(["mocha"], function () {
            var Mocha = window["mocha"];
            var mocha = Mocha.setup({
                timeout: 6000,
                ui: 'bdd',
                bail: false
            });
            // execute "describe" and "it" methods before running mocha
            requirejs(["tests/index"], function () { return mocha.run(); });
        });
    }
});
