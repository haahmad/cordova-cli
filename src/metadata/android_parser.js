var fs   = require('fs'),
    path = require('path'),
    et = require('elementtree'),
    util = require('../util'),
    shell = require('shelljs'),
    config_parser = require('../config_parser');

module.exports = function android_parser(project) {
    if (!fs.existsSync(path.join(project, 'AndroidManifest.xml'))) {
        throw 'The provided path is not an Android project.';
    }
    this.path = project;
    this.strings = path.join(this.path, 'res', 'values', 'strings.xml')
};

module.exports.prototype = {
    update_from_config:function(config) {
        if (config instanceof config_parser) {
        } else throw 'update_from_config requires a config_parser object';

        var name = config.name();
        var strings = new et.ElementTree(et.XML(fs.readFileSync(this.strings, 'utf-8')));
        strings.find('string[@name="app_name"]').text = name;
        fs.writeFileSync(this.strings, strings.write({indent: 4}), 'utf-8');
    },
    update_www:function() {
        var projectRoot = util.isCordova(process.cwd());
        var www = path.join(projectRoot, 'www');
        var platformWww = path.join(this.path, 'assets');
        shell.cp('-rf', www, platformWww);
        var jsPath = path.join(__dirname, '..', '..', 'lib', 'android', 'framework', 'assets', 'js', 'cordova.android.js');
        fs.writeFileSync(path.join(platformWww, 'www', 'cordova.js'), fs.readFileSync(jsPath, 'utf-8'), 'utf-8');
    },
    update_project:function(cfg) {
        this.update_from_config(cfg);
        this.update_www();
    }
};
