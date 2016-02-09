/// <reference path="../../../typings/tsd.d.ts" />

import * as tomcat from "../../../src/tasks/tomcatDeployment/tomcatDeployment";

import chai = require("chai");
import sinon = require("sinon");
import sinonChai = require("sinon-chai");

chai.should();
chai.use(sinonChai);

describe("tomcat.deploy", (): void => {
    it("should call deployWarFile", (): void => {
        var sandbox = sinon.sandbox.create();
        var deployWarFileSpy = sinon.spy(tomcat, "deployWarFile");
        
        tomcat.deploy();
        
        deployWarFileSpy.should.have.been.calledOnce;
    });
});