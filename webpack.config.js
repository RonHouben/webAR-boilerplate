module.exports = {
    target: 'node', // in order to ignore built-in modules like path, fs, etc.
    watch: true,
    devServer: {
        index: 'index.html',
        open: true
        // watchOptions: {
        //     poll: true
        // }
    }
}