/// <reference path="../../../typings/vsts-task-lib/vsts-task-lib.d.ts" />

import path = require("path");
import tl = require("vsts-task-lib/task");

export function deploy(): void {
    var tomcatUrl = tl.getInput("tomcatUrl", true);
    var username = tl.getInput("username", true);
    var password = tl.getInput("password", true);
    var warfile = tl.getInput("warfile", true);
    var context = tl.getInput("context", true);
    var serverVersion = tl.getInput("serverVersion", true);
        
    tl.debug("tomcatUrl: " + tomcatUrl);
    tl.debug("username: " + username);
    tl.debug("password: " + password);
    tl.debug("warfile: " + warfile);
    tl.debug("context: " + context);
    tl.debug("serverVersion: " + serverVersion);
    
    this.deployWarFile(tomcatUrl, username, password, warfile, context, serverVersion);
}

export function deployWarFile(tomcatUrl: string, username: string, password: string, warfile: string, context: string, serverVersion: string): void {
    tomcatUrl = tomcatUrl.trim();
    username = username.trim();
    warfile = warfile.trim();
    context = context.trim();
    serverVersion = serverVersion.trim();
    
    tl.exec(getCurlPath(), getCurlCmdForDeployingWar(username, password, warfile, tomcatUrl));
}

export function getTargetUrlForDeployingWar(tomcatUrl: string, warfile: string, context: string, serverVersion: string): string {
    if (context.charAt(0) != "/") {
        tl.error("Invalid context. Context should start with '/'");
        tl.exit(1);
    }
    
    var warfileBaseName = path.basename(warfile, ".war");
    var context = (context == "/") ? context + warfileBaseName : context;
    
    if (serverVersion == "6.x") {
        return tomcatUrl + "/manager/deploy?path=" + context + "&update=true";
    }
    else {
        return tomcatUrl + "/manager/text/deploy?path=" + context + "&update=true";        
    }
}

export function getCurlPath(): string {
    var curlPath = tl.which("curl", true);
    return curlPath;
}

export function getCurlCmdForDeployingWar(username: string, password: string, warfile: string, url: string): string {
    var args = "--stderr -";
    args += " -i";
    args += " --fail";
    args += " -u " + username + ":\"" + password + "\"";
    args += " -T \"" + warfile + "\"";
    args += " " + url;
    
    return args;
}