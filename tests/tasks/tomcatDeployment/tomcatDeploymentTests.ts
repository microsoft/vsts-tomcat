/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../../../typings/vsts-task-lib/vsts-task-lib.d.ts" />

import * as tomcat from "../../../src/tasks/tomcatDeployment/tomcatDeployment";

import assert = require("assert");
import chai = require("chai");
import fs = require("fs");
import path = require("path");
import Q = require("q");
import sinon = require("sinon");
import sinonChai = require("sinon-chai");
import tl = require("vsts-task-lib/task");
import tr = require("vsts-task-lib/toolrunner");

chai.should();
chai.use(sinonChai);

var tomcatUrl = "http://localhost:8080";
var username = "dummyusername";
var password = "dummypassword";
var warfile = "\\users\\dummyusername\\dummywarfile.war";
var context = "/dummycontext";
var serverVersion = "6.x";

// block Process Exit by task-lib in case of negative test cases
var processExitStub = sinon.stub(process, "exit");
redirectTaskLibOutputFromConsole();

describe("tomcat.deploy", (): void => {
    var sandbox;
    var deployWarFileStub;
    var getInputStub;
    
    beforeEach((): void => {
        sandbox = sinon.sandbox.create();
        deployWarFileStub = sandbox.stub(tomcat, "deployWarFile");
        getInputStub = sandbox.stub(tl, "getInput");
    });
    
    afterEach((): void => {
        sandbox.restore();
    });
    
    it("should pass input to deployWarFile", (): void => {
        getInputStub.withArgs("tomcatUrl").returns(tomcatUrl);
        getInputStub.withArgs("username").returns(username);
        getInputStub.withArgs("password").returns(password);
        getInputStub.withArgs("warfile").returns(warfile);
        getInputStub.withArgs("context").returns(context);
        getInputStub.withArgs("serverVersion").returns(serverVersion);
            
        tomcat.deploy();
        
        deployWarFileStub.withArgs(tomcatUrl, username, password, warfile, context, serverVersion).should.have.been.calledOnce;
    });
});

describe("tomcat.deployWarFile", (): void => {
    var sandbox;
    var execStub;
    var getResponseFileStub;
    var getUrlStub;

    beforeEach((): void => {
        sandbox = sinon.sandbox.create();
        execStub = sandbox.stub(tomcat, "execCurlCmdForDeployingWar");
        getResponseFileStub = sandbox.stub(tomcat, "getTomcatResponseOutputFileName");
        getUrlStub = sandbox.stub(tomcat, "getTargetUrlForDeployingWar");
        
        getResponseFileStub.returns("c:\\agent\\_diag\\tomcatResponse_12345.txt");
        getUrlStub.withArgs(tomcatUrl, warfile, context, serverVersion).returns("dummyUrl");       
    });
    
    afterEach((): void => {
        sandbox.restore();
    });
    
    it("should call curl with correct arguments", (): void => {
        tomcat.deployWarFile(tomcatUrl, username, password, warfile, context, serverVersion);
        
        getUrlStub.withArgs(tomcatUrl, warfile, context, serverVersion).should.have.been.calledOnce;
        execStub.withArgs(tomcat.getCurlCmdForDeployingWar(username, password, warfile, "dummyUrl")).should.have.been.calledOnce;
    });
    
    it("should trim inputs before passing to curl", (): void => {
        tomcat.deployWarFile(" " + tomcatUrl + " ", " " + username + " ", password, " " + warfile + " ", " " + context + " ", " " + serverVersion + " ");
        
        getUrlStub.withArgs(tomcatUrl, warfile, context, serverVersion).should.have.been.calledOnce;
        execStub.withArgs(tomcat.getCurlCmdForDeployingWar(username, password, warfile, "dummyUrl")).should.have.been.calledOnce;        
    });
    
    it("should not trim password", (): void => {
        tomcat.deployWarFile(tomcatUrl, username, " " + password + " ", warfile, context, serverVersion);
        
        getUrlStub.withArgs(tomcatUrl, warfile, context, serverVersion).should.have.been.calledOnce;
        execStub.withArgs(tomcat.getCurlCmdForDeployingWar(username, " " + password + " ", warfile, "dummyUrl")).should.have.been.calledOnce;
    });
});

describe("tomcat.getCurlCmdForDeployingWar", (): void => {
    var sandbox;
    var getResponseFileStub;
    var responseFileName = "c:\\agent\\_diag\\tomcatResponse_12345.txt";
    
    beforeEach((): void => {
        sandbox = sinon.sandbox.create();
        getResponseFileStub = sandbox.stub(tomcat, "getTomcatResponseOutputFileName");
        
        getResponseFileStub.returns(responseFileName);
        process.env["system_debug"] = false;
    });
    
    afterEach((): void => {
        sandbox.restore();
        process.env["system_debug"] = false;
    });
    
    /* tslint:disable:quotemark */
    it("should properly construct the curl cmd arg", (): void => {
        var arg = tomcat.getCurlCmdForDeployingWar("username", "password", "warfile", "http://url/warfile");
        
        assert.strictEqual(arg, '--stderr - --fail -o "c:\\agent\\_diag\\tomcatResponse_12345.txt" -u username:"password" -T "warfile" http://url/warfile');
            
    });
    
    it("should append -v to the cmd arg if system_debug is set to true", (): void => {
        process.env["system_debug"] = true;
        
        var arg = tomcat.getCurlCmdForDeployingWar("username", "password", "warfile", "http://url/warfile");
        
        assert.strictEqual(arg, '--stderr - --fail -o "c:\\agent\\_diag\\tomcatResponse_12345.txt" -u username:"password" -T "warfile" http://url/warfile -v');
    });
    /* tslint:enable:quotemark */
});

describe("tomcat.getCurlPath", (): void => {
    var sandbox;
    
    beforeEach((): void => {
        sandbox = sinon.sandbox.create();     
    });
    
    afterEach((): void => {
        sandbox.restore();
    });
    
    it("should return curl path if exists", (): void => {
        var mockPath = "c:\\program files\\cURL\\bin\\curl.exe";
        var whichStub = sandbox.stub(tl, "which");        
        whichStub.returns(mockPath);
        
        var curlPath = tomcat.getCurlPath();
        
        assert.strictEqual(curlPath, mockPath);
    });
    
    it("should halt execution if curl doesnot exist", (): void => {
        var whichStub = sandbox.stub(tl, "which", (tool: string, check?: boolean): string => {
            whichStub.restore();
            return tl.which("NoToolShouldExistWithThisName.SoActualBehaviorOf-tl.which-likeCurlDoesnotExixst", true);
        });
        
        tomcat.getCurlPath();
        
        processExitStub.should.have.been.calledOnce;
    });
});

describe("tomcat.getTargetUrlForDeployingWar", (): void => {
    var version6 = "6.x";
    var version7 = "7OrAbove";
    var sandbox;
    var errorStub;
    var exitStub;
    
    beforeEach((): void => {
        sandbox = sinon.sandbox.create();
        errorStub = sandbox.stub(tl, "error"); 
        exitStub = sandbox.stub(tl, "exit");
    });
    
    afterEach((): void => {
        sandbox.restore();
    });
    
    it("should construct url for tomcat 6.x versions", (): void => {
        var targetUrl = tomcat.getTargetUrlForDeployingWar("http://localhost:8080", "java_demo.war", "/", version6);
        
        assert.strictEqual(targetUrl, "http://localhost:8080/manager/deploy?path=/java_demo&update=true");
    });
    
    it("should construct url for tomcat 7.0 and above versions", (): void => {
        var targetUrl = tomcat.getTargetUrlForDeployingWar("http://localhost:8080", "c:\\java_demo.war", "/", version7);
        
        assert.strictEqual(targetUrl, "http://localhost:8080/manager/text/deploy?path=/java_demo&update=true");
    });
    
    it("should work with windows path", (): void => {
        var warfileValues: string[] = ["c:\\windows\\java_demo.war", "c:\\\\windows\\\\java_demo.war", "c:\\\\windows\\\\java_demo", "\\\\buildshare\\java_demo.war"];
        warfileValues.forEach(function(warfile: string) {
            var targetUrl = tomcat.getTargetUrlForDeployingWar("http://localhost:8080", warfile, "/", version6);
        
            assert.strictEqual(targetUrl, "http://localhost:8080/manager/deploy?path=/java_demo&update=true");
        });
    });
        
    it("should work with linux path", (): void => {
        var warfileValues: string[] = ["/usr/bin/java_demo.war", "/usr/bin/java_demo"];
        warfileValues.forEach(function(warfile: string) {
            var targetUrl = tomcat.getTargetUrlForDeployingWar("http://localhost:8080", warfile, "/", version6);
            
            assert.strictEqual(targetUrl, "http://localhost:8080/manager/deploy?path=/java_demo&update=true");
        });
    });
    
    it("should use context instead of warfile when context is provided", (): void => {
        var targetUrl = tomcat.getTargetUrlForDeployingWar("http://localhost:8080", "usr/bin/java_demo.war", "/Demo", version7);
        
        assert.strictEqual(targetUrl, "http://localhost:8080/manager/text/deploy?path=/Demo&update=true");
    });
    
    it("should write error and halt execution when context does not start with '/'", (): void => {
        tomcat.getTargetUrlForDeployingWar("http://localhost:8080", "/usr/bin/java_demo.war", "context", version6);
        
        errorStub.withArgs("Invalid context. Context should start with '/'").should.have.been.calledOnce;
        exitStub.should.have.been.calledOnce;
    });
    
    it("should URL encode context", (): void => {
        var targetUrl = tomcat.getTargetUrlForDeployingWar("http://localhost:8080", "usr/bin/java_demo.war", "/Context/Value With-Space&SpecialChar", version7);
        
        assert.strictEqual(targetUrl, "http://localhost:8080/manager/text/deploy?path=/Context/Value%20With-Space%26SpecialChar&update=true");
    });
    
    it("should URL encode warfile", (): void => {
        var targetUrl = tomcat.getTargetUrlForDeployingWar("http://localhost:8080", "usr/bin/java_demo with-space&specialChar%.war", "/", version7);
        
        assert.strictEqual(targetUrl, "http://localhost:8080/manager/text/deploy?path=/java_demo%20with-space%26specialChar%25&update=true");
    });
});

describe("tomcat.execCurlCmdForDeployingWar", (): void => {
    var sandbox;
    var debugStub;
    var errorStub;
    var execStub;
    var exitStub;
    var getCurlPathStub;
    var getTomcatResponseStub;
    var execOptions = <tr.IExecOptions> { failOnStdErr: true };
    
    beforeEach((): void => {
        sandbox = sinon.sandbox.create();
        debugStub = sandbox.stub(tl, "debug");
        errorStub = sandbox.stub(tl, "error");
        execStub = sandbox.stub(tl, "exec");
        exitStub = sandbox.stub(tl, "exit");
        getCurlPathStub = sandbox.stub(tomcat, "getCurlPath");
        getTomcatResponseStub = sandbox.stub(tomcat, "getTomcatResponse");
        
        getCurlPathStub.returns("dummyCurlPath");
        getTomcatResponseStub.returns("OK - Deployment succeeded");
        execStub.returns(Q.Promise<number>((complete, failure) => { complete (0); }));
    });
    
    afterEach((): void => {
        sandbox.restore();
    });
    
    it("should pass correct parameters to tl.exec", (): void => {
        tomcat.execCurlCmdForDeployingWar("dummyCmdArg");
        
        execStub.withArgs(tomcat.getCurlPath(), "dummyCmdArg", execOptions).should.have.been.calledOnce;
    });
    
    it("should succeed if tl.exec succeeds", (done): void => {
        var mockExitCode = 10;
        var mockResponse = "OK - Deployment succeeded";
        var mockResult = Q.Promise<number>((complete, failure) => { complete (mockExitCode); });
        execStub.returns(mockResult);
        getTomcatResponseStub.returns(mockResponse);
        
        tomcat.execCurlCmdForDeployingWar("dummyCmdArg").then((code) => {
            execStub.withArgs(tomcat.getCurlPath(), "dummyCmdArg", execOptions).should.have.been.calledOnce;
            debugStub.withArgs(mockResponse).should.have.been.calledOnce;
            exitStub.withArgs(mockExitCode).should.have.been.calledOnce;
        }).done(done);
    });
    
    it("should fail if tl.exec fails", (done): void => {
        var mockReason = "just failed";
        var mockResult = Q.Promise<number>((complete, failure) => { failure(mockReason); });   
        execStub.returns(mockResult);        
         
        tomcat.execCurlCmdForDeployingWar("dummyCmdArg").then((code) => {
            execStub.withArgs(tomcat.getCurlPath(), "dummyCmdArg", execOptions).should.have.been.calledOnce;
            exitStub.withArgs(1).should.have.been.calledOnce;
            errorStub.withArgs(mockReason).should.have.been.calledOnce;
        }).done(done);
    });
    
    it("should pass if the response from tomcat is OK", (done): void => {
        getTomcatResponseStub.returns("OK - deployment succeeded");
        
        tomcat.execCurlCmdForDeployingWar("dummyCmdArg").then((code) => {
            execStub.withArgs(tomcat.getCurlPath(), "dummyCmdArg", execOptions).should.have.been.calledOnce;
            exitStub.withArgs(0).should.have.been.calledOnce;
        }).done(done);
    });
    
    it("should fail if the response from tomcat is FAIL", (done): void => {
        var mockFailureMessage = "FAIL - deployment failed";
        getTomcatResponseStub.returns(mockFailureMessage);
        
        tomcat.execCurlCmdForDeployingWar("dummyCmdArg").then((code) => {
            execStub.withArgs(tomcat.getCurlPath(), "dummyCmdArg", execOptions).should.have.been.calledOnce;
            errorStub.withArgs(mockFailureMessage).should.have.been.calledOnce;
            exitStub.withArgs(1).should.have.been.calledOnce;
        }).done(done);
    });
});

describe("tomcat.getTomcatResponseOutputFileName", (): void => {
    var sandbox;
    var dateNowStub;
    var agentHomeDirectory = "c:\\agent";
    
    beforeEach((): void => {
        sandbox = sinon.sandbox.create();
        dateNowStub = sandbox.stub(Date, "now");
        
        process.env["AGENT_HOMEDIRECTORY"] = agentHomeDirectory;
    });
    
    afterEach((): void => {
        sandbox.restore();
    });
    
    it("should contain current timestamp", (): void => {
        var dateNow = 12345;
        dateNowStub.returns(dateNow);
        
        var fileName = tomcat.getTomcatResponseOutputFileName();
        
        assert.strictEqual(fileName, path.join(agentHomeDirectory, "_diag", "tomcatResponse_" + dateNow.toString() + ".txt"));
    });
    
    it("should return the same value always", (): void => {
        var dateNow = 12345;
        dateNowStub.onFirstCall().returns(dateNow);
        dateNowStub.onSecondCall().returns(dateNow + 100);
        
        var fileName1 = tomcat.getTomcatResponseOutputFileName();
        var fileName2 = tomcat.getTomcatResponseOutputFileName();
        
        assert.strictEqual(fileName1, fileName2);
    });
});

describe("tomcat.getTomcatResponse", (): void => {
    var sandbox;
    var getResponseFileStub;
    var fsReadStub;
    
    beforeEach((): void => {
        sandbox = sinon.sandbox.create();
        getResponseFileStub = sandbox.stub(tomcat, "getTomcatResponseOutputFileName");
        fsReadStub = sandbox.stub(fs, "readFileSync");
    });
    
    afterEach((): void => {
        sandbox.restore();
    });
    
    it("should pass return content from the tomcatResponseOutputFile", (): void => {
        var mockFileName = "/home/user/logs/tomcatResponse.txt";
        getResponseFileStub.returns(mockFileName);
        var mockResponse = "OK - Deployment succeeded";
        fsReadStub.withArgs(mockFileName).returns(new Buffer(mockResponse));
         
        var response = tomcat.getTomcatResponse();
         
        getResponseFileStub.should.have.been.calledOnce;
        fsReadStub.withArgs(mockFileName).should.have.been.calledOnce;
        assert.strictEqual(response, mockResponse);
    }); 
});

function redirectTaskLibOutputFromConsole(): void {
    var stdoutmock = {
        write: function(message: string) {}
    };
    tl.setStdStream(stdoutmock);
    tl.setErrStream(stdoutmock);
}