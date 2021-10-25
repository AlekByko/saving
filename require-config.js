var require = {
    baseUrl: './built/client',
    paths: {
        'text': '../../node_modules/requirejs-plugins/lib/text',
        'json': '../../node_modules/requirejs-plugins/src/json',
        'noext': '../../node_modules/requirejs-plugins/src/noext',
        'react': '../../node_modules/react/umd/react.production.min',
        'react-dom': '../../node_modules/react-dom/umd/react-dom.production.min',
        '@tensorflow/tfjs': '../../node_modules/@tensorflow/tfjs/dist/tf.min',
        '@tensorflow/tfjs-vis': '../../node_modules/@tensorflow/tfjs-vis/dist/tfjs-vis.umd.min',
    },
    map: {
        '*': {
            'tf': '@tensorflow/tfjs'
        }
    },
    packages: [
        { name: 'configs', location: '../', main: 'configs' }
    ]
};
