module.exports = {
    entry: './src/js/main.js',
    output: {
        filename: './js/bundle.js'
    },
    node: {
        fs: 'empty'
    }
}