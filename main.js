/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, browser: true */
/*global $, define, brackets, Mustache, hljs */

define(function (require, exports, module) {
    "use strict";
    
    var CommandManager          = brackets.getModule("command/CommandManager"),
        Commands                = brackets.getModule("command/Commands"),
        KeyBindingManager       = brackets.getModule("command/KeyBindingManager"),
        Menus                   = brackets.getModule("command/Menus"),
        DocumentManager         = brackets.getModule("document/DocumentManager"),
        EditorManager           = brackets.getModule("editor/EditorManager"),
        ProjectManager          = brackets.getModule("project/ProjectManager"),
        AppInit                 = brackets.getModule("utils/AppInit"),
        ExtensionUtils          = brackets.getModule("utils/ExtensionUtils"),
        NativeApp               = brackets.getModule("utils/NativeApp"),
        NodeConnection          = brackets.getModule("utils/NodeConnection"),
        Dialogs                 = brackets.getModule("widgets/Dialogs"),
        DocTPL                  = require("text!htmlContent/doc.html");
    
    var CMD_APIFY_VIEW   = "apify_view";
    
    var nodeConnection;
    
    // Helper function that chains a series of promise-returning
    // functions together via their done callbacks.
    function chain() {
        var functions = Array.prototype.slice.call(arguments, 0);
        if (functions.length > 0) {
            var firstFunction = functions.shift();
            var firstPromise = firstFunction.call();
            firstPromise.done(function () {
                chain.apply(null, functions);
            });
        }
    }
    
    function _renderTPL(tpl, data) {
        var path = ExtensionUtils.getModulePath(module, "");
        
        return Mustache.render(tpl, {
            data: data,
            path: path
        });
    }
    
    function _viewApify() {
        var currentDoc  = DocumentManager.getCurrentDocument(),
            path        = currentDoc.file.parentPath,
            fileName    = currentDoc.file.name,
            name        = fileName.substring(0, fileName.indexOf("."));
        
        nodeConnection.domains.apify.viewDocs(path, name).done(function (file) {
            Dialogs.showModalDialogUsingTemplate(_renderTPL(DocTPL, {fileName: file}));
        }).fail(function (err) {
            console.error("error:");
            console.error(err);
        });
    }
    
    // Initialize BracketsGH extension and node domain
    AppInit.appReady(function () {
        var menu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);
        
        CommandManager.register("See doc", CMD_APIFY_VIEW, _viewApify);
        menu.addMenuItem(CMD_APIFY_VIEW, "");
        
        nodeConnection = new NodeConnection();
        
        // Helper function that tries to connect to node
        function connect() {
            var connectionPromise = nodeConnection.connect(true);
            
            connectionPromise.fail(function () {
                console.error("[brackets-apify] failed to connect to node");
            });
            
            return connectionPromise;
        }
        
        // Helper function that loads our domain into the node server
        function loadApifyDomain() {
            var path        = ExtensionUtils.getModulePath(module, "node/ApifyDomain"),
                projectPath = ProjectManager.getProjectRoot().fullPath,
                loadPromise = nodeConnection.loadDomains([path], true);

            loadPromise.then(function () {
                //console.log("[brackets-apif] ok");
            }).fail(function (err) {
                console.error("[brackets-apify] error:" + err);
            });

            return loadPromise;
        }

        chain(connect, loadApifyDomain);
    });
});
