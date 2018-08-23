/* eslint-env node, es6 */

import path from 'path';

module.exports = function (karma) {
    karma.set({
        browserDisconnectTolerance: 2,
        frameworks: ['mocha'],
        client: {
            runInParent: true,
            mocha: {
                timeout: 2500
            }
        },
        files: [
            {
                pattern: '**/*',
                included: true,
                watched: false
            }
        ],
        exclude: [
        ],
        proxies: {
            '/rendering/': '/base/rendering/',
            '/spec/': '/base/spec/'
        },
        preprocessors: {
            '**/*.js': ['webpack', 'sourcemap']
        },
        reporters: ['progress'],
        webpack: {
            devtool: 'inline-source-map',
            mode: 'development',
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        use: {
                            loader: 'buble-loader'
                        }
                    }
                ]
            }
        },
        webpackMiddleware: {
            noInfo: true
        }
    });

    karma.set({
        browsers: ['Chrome']
    });

};