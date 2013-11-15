/*jslint es5: true, vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, node: true */
/*global brackets */
(function () {
    "use strict";

    var defaults    = require("apify/lib/defaults.json"),
        documenter  = require("apify/lib/Documenter"),
        path        = require("path");

    // The node domain manager
    var _domainManager = null;
    
    var templates = Object.keys(defaults.templates);
        
    templates.forEach(function (templateName) {
        defaults.templates[templateName] = path.resolve(__dirname + "/node_modules/apify/bin/" + defaults.templates[templateName]);
    });
    
    defaults.assets = path.resolve(__dirname + "/node_modules/apify/bin/" + defaults.assets);
    
    /**
     * Creates a new issue
     * @param {string} title Title of the new issue
     * @param {string} message Body of the new issue 
     * @param {Function} cb Callback function to notify initialization errors
     */
    function _viewDocs(src, name, cb) {
        // Resolve absolute path for default templates and assets
        
        defaults.source = src;
        defaults.output = path.resolve(process.env.HOME + "/.apify/");
        defaults.title = "";

        documenter.init(defaults).then(function (err) {
            var filePath = path.resolve(defaults.output, "modules", name + ".html");
            cb(err, filePath);
        });
    }
    
    /**
     * Initializes the GH domain with its commands.
     * @param {DomainManager} domainManager The DomainManager
     */
    function init(domainManager) {
        _domainManager = domainManager;

        if (!_domainManager.hasDomain("apify")) {
            _domainManager.registerDomain("apify", {major: 0, minor: 1});
        }
        
        // Creates a new issue
        _domainManager.registerCommand(
            "apify",
            "viewDocs",
            _viewDocs,
            true,
            "ViewDocs",
            [{
                name: "src",
                type: "string",
                description: "source folder"
            }, {
                name: "name",
                type: "string",
                description: "module name"
            }],
            [{
                name: "result",
                type: "object",
                description: "The result of the execution"
            }],
            []
        );
    }
    
    exports.init = init;
    
}());
