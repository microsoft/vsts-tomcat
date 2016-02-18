/// <reference path="../../../typings/vsts-task-lib/vsts-task-lib.d.ts" />

import fs = require("fs");
import os = require("os");
import path = require("path");
import tl = require("vsts-task-lib/task");
import tr = require("vsts-task-lib/toolrunner");

export function deploy(): void {
    var tomcatUrl = tl.getInput("tomcatUrl", true);
    var username = tl.getInput("username", true);
    var password = tl.getInput("password", true);
    var warfile = tl.getInput("warfile", true);
    var context = tl.getInput("context", true);
    var serverVersion = tl.getInput("serverVersion", true);
        
    this.deployWarFile(tomcatUrl, username, password, warfile, context, serverVersion);
}

export function deployWarFile(tomcatUrl: string, username: string, password: string, warfile: string, context: string, serverVersion: string): void {
    tomcatUrl = tomcatUrl.trim();
    username = username.trim();
    warfile = warfile.trim();
    context = context.trim();
    serverVersion = serverVersion.trim();
    
    warfile = warfile.replace(/\\/g, path.sep);
    
    var targetUrl = this.getTargetUrlForDeployingWar(tomcatUrl, warfile, context, serverVersion);
    this.execCurlCmdForDeployingWar(this.getCurlCmdForDeployingWar(username, password, warfile, targetUrl));
}

export function getTargetUrlForDeployingWar(tomcatUrl: string, warfile: string, context: string, serverVersion: string): string {
    if (context.charAt(0) != "/") {
        tl.error("Invalid context. Context should start with '/'");
        tl.exit(1);
    }
    
    var warfileBaseName = path.basename(warfile.replace("\\\\", "\\"), ".war"); // basename doesn't work with \\\\share\\file.war but works with \\sahre\\file.war
    var context = (context == "/") ? context + warfileBaseName : context;
    context = encodeURIComponent(context).replace(/%2F/g, "/"); // encode all characters like space and '&'. Exclude '/' for readability
    
    if (serverVersion == "6.x") {
        return tomcatUrl + "/manager/deploy?path=" + context + "&update=true";
    }
    else {
        return tomcatUrl + "/manager/text/deploy?path=" + context + "&update=true";        
    }
}

export function getCurlCmdForDeployingWar(username: string, password: string, warfile: string, url: string): string {
    var args = "--stderr -";
    args += " --fail";
    args += " -o \"" + this.getTomcatResponseOutputFileName() + "\""; 
    args += " -u " + username + ":\"" + password + "\"";
    args += " -T \"" + warfile + "\"";
    args += " " + url;
 
    if (process.env["system_debug"] == "true") {
        args += " -v";
    }
    
    return args;
}

export function execCurlCmdForDeployingWar(cmdArg: string): any {
    return tl.exec(this.getCurlPath(), cmdArg, <tr.IExecOptions> { failOnStdErr: true })
    .then((code) => {
        var tomcatResponse = this.getTomcatResponse();
        this.cleanTomcatResponseOutputFile();
        if (tomcatResponse.indexOf("FAIL") == 0) {
            tl.error(tomcatResponse);
            tl.exit(1);
        }
        tl.debug(tomcatResponse);
        tl.exit(code);
    }).
    fail((reason) => {
        tl.error(reason);
        tl.exit(1);
    });
}

export function getCurlPath(): string {
    var curlPath = tl.which("curl", true);
    return curlPath;
}

var tomcatResponseOutputFileName: string;
export function getTomcatResponseOutputFileName(): string {
    if (!tomcatResponseOutputFileName) {
        tomcatResponseOutputFileName = path.join(os.tmpdir(), "tomcatResponse_" + Date.now() + ".txt");
    }
    return tomcatResponseOutputFileName;
}

export function getTomcatResponse(): string {
    return fs.readFileSync(this.getTomcatResponseOutputFileName()).toString();
}

export function cleanTomcatResponseOutputFile(): void {
    fs.unlinkSync(this.getTomcatResponseOutputFileName());
}