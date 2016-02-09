/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../../../typings/vsts-task-lib/vsts-task-lib.d.ts" />

import * as tomcat from "../../../src/tasks/tomcatDeployment/tomcatDeployment";

import chai = require("chai");
import sinon = require("sinon");
import sinonChai = require("sinon-chai");
import tl = require("vsts-task-lib/task");

chai.should();
chai.use(sinonChai);

describe("tomcat.deploy", (): void => {
    
    function suppressTaskLibOutput(): void {
        var stdoutmock = {
            write: function(message: string) {}
        };
        tl.setStdStream(stdoutmock);
        tl.setErrStream(stdoutmock);
    }
    
    it("should pass input to deployWarFile", (): void => {
        var sandbox = sinon.sandbox.create();
        var deployWarFileSpy = sandbox.spy(tomcat, "deployWarFile");
        var getInputStub = sandbox.stub(tl, "getInput");
        
        suppressTaskLibOutput();
        
        var tomcatUrl = "http://localhost:8080";
        var username = "dummyusername";
        var password = "dummy password";
        var warfile = "\\users\\dummyusername\\dummywarfile.war";
        var context = "/dummycontext";
        var serverVersion = "6.x";
        
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