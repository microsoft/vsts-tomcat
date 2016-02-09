/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../../../typings/vsts-task-lib/vsts-task-lib.d.ts" />

import * as tomcat from "../../../src/tasks/tomcatDeployment/tomcatDeployment";

import assert = require("assert");
import chai = require("chai");
import sinon = require("sinon");
import sinonChai = require("sinon-chai");
import tl = require("vsts-task-lib/task");

chai.should();
chai.use(sinonChai);

var tomcatUrl = "http://localhost:8080";
var username = "dummyusername";
var password = "dummypassword";
var warfile = "\\users\\dummyusername\\dummywarfile.war";
var context = "/dummycontext";
var serverVersion = "6.x";

function redirectTaskLibOutputFromConsole(): void {
    var stdoutmock = {
        write: function(message: string) {}
    };
    tl.setStdStream(stdoutmock);
    tl.setErrStream(stdoutmock);
}

describe("tomcat.deploy", (): void => {
    var sandbox;
    var deployWarFileStub;
    var getInputStub;
    
    beforeEach((): void => {
        sandbox = sinon.sandbox.create();
        deployWarFileStub = sandbox.stub(tomcat, "deployWarFile");
        getInputStub = sandbox.stub(tl, "getInput");
        redirectTaskLibOutputFromConsole();
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
    
    beforeEach((): void => {
        sandbox = sinon.sandbox.create();
        execStub = sandbox.stub(tl, "exec");
    });
    
    afterEach((): void => {
        sandbox.restore();
    });
    
    it("should call curl with correct arguments", (): void => {
        tomcat.deployWarFile(tomcatUrl, username, password, warfile, context, serverVersion);
        
        execStub.withArgs(tomcat.getCurlPath(), tomcat.constructCurlCmdArgsString(username, password, warfile, tomcatUrl)).should.have.been.calledOnce;
    });
    
    it("should trim inputs before passing to curl", (): void => {
        tomcat.deployWarFile(" " + tomcatUrl + " ", " " + username + " ", password, " " + warfile + " ", " " + context + " ", " " + serverVersion + " ");
        
        execStub.withArgs(tomcat.getCurlPath(), tomcat.constructCurlCmdArgsString(username, password, warfile, tomcatUrl)).should.have.been.calledOnce;
    });
    
    it("should not trim password", (): void => {
        tomcat.deployWarFile(tomcatUrl, username, " " + password + " ", warfile, context, serverVersion);
        
        execStub.withArgs(tomcat.getCurlPath(), tomcat.constructCurlCmdArgsString(username, " " + password + " ", warfile, tomcatUrl)).should.have.been.calledOnce;
    });
});

describe("tomcat.constructCurlCmdArgsString", (): void => {
    it("should properly construct the curl cmd arg", (): void => {
        var arg = tomcat.constructCurlCmdArgsString("username", "password", "warfile", "http://url/warfile");
        
        /* tslint:disable:quotemark */
        assert.strictEqual(arg, '--stderr - -i --fail -u username:"password" -T "warfile" http://url/warfile');
        /* tslint:enable:quotemark */    
    });
});

describe("tomcat.getCurlPath", (): void => {
    var sandbox;
    var whichStub;
    var exitStub;
    
    beforeEach((): void => {
        sandbox = sinon.sandbox.create();
        whichStub = sandbox.stub(tl, "which"); 
        exitStub = sandbox.stub(process, "exit");
    });
    
    afterEach((): void => {
        sandbox.restore();
    });
    
    it("should return curl path if exists", (): void => {
        var mockPath = "c:\\program files\\cURL\\bin\\curl.exe";
        whichStub.returns(mockPath);
        
        var curlPath = tomcat.getCurlPath();
        
        assert.strictEqual(curlPath, mockPath);
    });
    
    it("should halt execution if curl doesnot exit", (): void => {
        whichStub.restore();
        whichStub.withArgs("curl", true).returns(tl.which("NoToolShouldExistWithThisName.SoActualBehaviorOf-tl.which", true));
        
        tomcat.getCurlPath();
        
        exitStub.should.have.been.calledOnce;
    });
});