/// <reference path="../../../typings/tsd.d.ts" />

import * as tomcatDeployment from "../../../src/tasks/tomcatDeployment/tomcatDeployment";

describe("TomcatDeployment.Deploy", (): void => {
    it("should pass", (): void => {
        tomcatDeployment.deploy();
    });
});