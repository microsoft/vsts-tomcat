/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../../../typings/vsts-task-lib/vsts-task-lib.d.ts" />

import * as tomcat from "../../../src/tasks/tomcatDeployment/tomcatDeployment";

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
    var deployWarFileSpy;
    var getInputStub;
    
    beforeEach((): void => {
        sandbox = sinon.sandbox.create();
        deployWarFileSpy = sandbox.spy(tomcat, "deployWarFile");
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
        
        deployWarFileSpy.withArgs(tomcatUrl, username, password, warfile, context, serverVersion).should.have.been.calledOnce;
    });
});

describe("tomcat.deployWarFile", (): void => {
    var sandbox;
    
    beforeEach((): void => {
        sandbox = sinon.sandbox.create();
    });
    
    afterEach((): void => {
        sandbox.restore();
    });
    
    it("should pass", (): void => {
        tomcat.deployWarFile(tomcatUrl, username, password, warfile, context, serverVersion);
    });
});