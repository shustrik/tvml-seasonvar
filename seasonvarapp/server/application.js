//# sourceURL=application.js

//
//  application.js
//  seasonvar
//
//  Created by shustrik on 7/17/19.
//  Copyright © 2019 shustrik. All rights reserved.
//

/*
 * This file provides an example skeletal stub for the server-side implementation 
 * of a TVML application.
 *
 * A javascript file such as this should be provided at the tvBootURL that is 
 * configured in the AppDelegate of the TVML application. Note that  the various 
 * javascript functions here are referenced by name in the AppDelegate. This skeletal 
 * implementation shows the basic entry points that you will want to handle 
 * application lifecycle events.
 */

/**
 * @description The onLaunch callback is invoked after the application JavaScript
 * has been parsed into a JavaScript context. The handler is passed an object
 * that contains options passed in for launch. These options are defined in the
 * swift or objective-c client code. Options can be used to communicate to
 * your JavaScript code that data and as well as state information, like if the
 * the app is being launched in the background.
 *
 * The location attribute is automatically added to the object and represents
 * the URL that was used to retrieve the application JavaScript.
 */
const localStorageApiKey = "seasonvar.api.key";
let serialsDocument = null;
let proxy = null
let apiUrl = null
App.onLaunch = function (options) {
    const baseURL = options.BASEURL;
    apiUrl = options.APIURL;
    const helperScriptURLs = [
        "login",
        "serials",
        "api",
        "proxy",
        "templates",
        "builder"
    ].map(
        moduleName => `${baseURL}/${moduleName}.js?time=` + (new Date().getMilliseconds())
    );

    if (typeof navigationDocument !== "undefined") {
        replaceDocument(createLoadingDocument())
    }
    evaluateScripts(helperScriptURLs, function (scriptsAreLoaded) {
        if (scriptsAreLoaded) {
            if (localStorage.getItem("seasonvar.api.key")) {
                login(localStorage.getItem("seasonvar.api.key"), function () {
                        localStorage.setItem(localStorageApiKey, localStorage.getItem("seasonvar.api.key"));
                        initialize()
                    },
                    function () {
                        replaceDocument(createLoginDocument())
                        replaceDocument(createAlert("Ошибка", 'Не верный ключ'))
                    }
                )
            } else {
                replaceDocument(createLoginDocument())
            }
        } else {
            replaceDocument(createAlert("Ошибка", "Ошибка запуска приложения"))
            throw new EvalError("TVMLCatalog application.js: unable to evaluate scripts.");
        }
    });
}

App.onWillResignActive = function () {

}

App.onDidEnterBackground = function () {

}

App.onWillEnterForeground = function () {

}

App.onDidBecomeActive = function () {

}

App.onWillTerminate = function () {

}


/**
 * This convenience funnction returns an alert template, which can be used to present errors to the user.
 */
function createAlert(title, description = "") {
    let alertString = `<?xml version="1.0" encoding="UTF-8" ?>
        <document>
          <alertTemplate>
            <title>${title}</title>
            <description>${description}</description>
    <button>
    <text>OK</text>
    </button>
          </alertTemplate>
        </document>`

    const dismiss = function () {
        navigationDocument.dismissModal();
    }
    let alertDoc = new DOMParser().parseFromString(alertString, "application/xml");
    alertDoc.addEventListener("select", dismiss)
    alertDoc.addEventListener("play", dismiss)
    return alertDoc
}

/**
 * Convenience function to create a TVML loading document with a specified title.
 */
function createLoadingDocument(title) {
    // If no title has been specified, fall back to "Loading...".
    title = title || "Loading...";

    const template = `<?xml version="1.0" encoding="UTF-8" ?>
    <document>
    <loadingTemplate>
    <activityIndicator>
    <title>${title}</title>
    </activityIndicator>
    </loadingTemplate>
    </document>
    `;
    return new DOMParser().parseFromString(template, "application/xml");
}

function createLoginDocument() {
    const doc = new DOMParser().parseFromString(loginTemplate, "application/xml");
    doc.addEventListener("select", function (event) {
        let keyboard = doc.getElementById("key").getFeature('Keyboard');
        replaceDocument(createLoadingDocument("Авторизация"))
        login(keyboard.text, function () {
                localStorage.setItem(localStorageApiKey, keyboard.text);
                initialize()
            },
            function () {
                replaceDocument(createLoginDocument())
                replaceDocument(createAlert("Ошибка", 'Не верный ключ'))
            }
        )
    });

    return doc

}

function replaceDocument(document) {
    let currentDoc = getActiveDocument();
    if (currentDoc && currentDoc.getElementsByTagName("alertTemplate").item(0) !== undefined) {
        navigationDocument.dismissModal();
    }
    if (document.getElementsByTagName("alertTemplate").item(0) !== undefined) {
        navigationDocument.presentModal(document);
        return
    }
    if (currentDoc && currentDoc.getElementsByTagName("loadingTemplate").item(0) !== undefined) {
        navigationDocument.replaceDocument(document, currentDoc);
        return
    }
    if (currentDoc && currentDoc.getElementById("login") !== undefined) {
        navigationDocument.replaceDocument(document, currentDoc);
        return
    }
    navigationDocument.pushDocument(document);
}

selectMenuItem = function (target) {
    const menuBarElem = target.parentNode;
    const menuBarFeature = menuBarElem.getFeature("MenuBarDocument");
    const method = target.getAttribute("method")
    switch (method) {
        case "search":
            createSearchDocument(menuBarFeature, target);
            break;
        case "serials":
            createSerialsDocument(menuBarFeature, target);
            break;
        case "my-serials":
            createMySerialsDocument(menuBarFeature, target);
            break;
        case "favorites":
            createFavoritesDocument(menuBarFeature, target);
            break;
    }
}

function initialize() {
    proxy = new ProxyApi(localStorage.getItem("seasonvar.api.key"), apiUrl)
    proxy.register(localStorage.getItem("seasonvar.api.key"), function () {
        const menuDoc = new DOMParser().parseFromString(menu, "application/xml");
        const menuBarElem = menuDoc.getElementsByTagName("menuBar").item(0);
        menuBarElem.addEventListener("select", (event) => {
            this.selectMenuItem(event.target);
        });
        const menuBarFeature = menuBarElem.getFeature("MenuBarDocument");
        serialsDocument = new SerialsDocument(proxy, menuBarFeature)
        replaceDocument(menuDoc);
    }, function (error) {
        replaceDocument(createAlert("Ошибка регистрации", error))
    })
}

function createSerialsDocument(menuBarFeature, menuItem) {
    serialsDocument.serials(menuItem)
}

function createMySerialsDocument(menuBarFeature, menuItem) {
    serialsDocument.mySerials(menuItem)
}

function createFavoritesDocument(menuBarFeature, menuItem) {
    serialsDocument.favorites(menuItem)
}

function createSearchDocument(menuBarFeature, menuItem) {
    serialsDocument.search(menuItem)
}