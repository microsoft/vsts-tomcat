/// <reference path="../../../typings/vsts-task-lib/vsts-task-lib.d.ts" />

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
    tl.exec("curl", constructCurlCmdArgsString(username, password, warfile, tomcatUrl));
}

export function constructCurlCmdArgsString(username: string, password: string, warfile: string, url: string): string {
    var args = "--stderr -";
    args += " -i";
    args += " --fail";
    args += " -u " + username + ":\"" + password + "\"";
    args += " -T \"" + warfile + "\"";
    args += " " + url;
    
    return args;
}