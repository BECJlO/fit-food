module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            install : {
                files: [
                    'src/*.js'
                ],
                tasks: ['jshint', 'concat', 'uglify']
            }
        },
        jshint: {
            files: [
                'src/*.js'
            ],
            options: {
                bitwise : true,
                camelcase : true,
                curly: true,
                eqeqeq: true,
                eqnull: true,
                forin : true,
                indent : 4,
                quotmark : 'single',
                browser: true,
                undef :true,
                unused : true,
                globals: {
                    console : true,
                    jQuery : true
                }
            }
        },
        concat: {
            jsdist: {
                src: [
                    'src/*.js'
                ],
                dest: 'tmp/jquery.blink.min.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                preserveComments: true
            },
            build: {
                files: [{
                    expand: true,
                    src: '*.js',
                    dest: 'dist/',
                    cwd: 'tmp/'
                }]
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');

    // Default task.
    grunt.registerTask('install', ['jshint', 'concat', 'uglify']);
};
