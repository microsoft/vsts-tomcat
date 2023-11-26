# Apache Tomcat Deployment Task

### Overview

Deploy your Java web application with Tomcat 6,7 or 8. This task uses HTTP-based scripting interface to the Tomcat manager application that ships with Tomcat.
 
### Features

* Deploy / Re-deploy to Tomcat manager. Copies the war file to the target automatically.
* Use pre-defined Build / Release Variables or your own custom variables.
 
### Prerequisites

* cURL should be installed on the Build/Release agent.
* Tomcat should be configured with the manager up and running.

### Compatibility

* Supports Tomcat 6.x, 7.x and 8.x

### Task Parameters

|  Parameter Name                       |  Description                                                                                                                                                                      |
|---------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|  Tomcat Server URL                    | The URL for the Tomcat Server e.g. http://localhost:8080<br>"/manager" will be appended to your Server URL to talk to the Tomcat manager.                        |
|  Tomcat Manager Username And Password | These should match the credentials set in conf/tomcat-users.xml when you configured Tomcat.<br>The user should have "manager-script" role set.             |
|  Application Context                  | Specifies where the application should sit on the Tomcat server once deployed e.g. /Test                                                                                          |
|  WAR File                             | The absolute path to the WAR file.<br>Use pre-defined variables in [Build](http://go.microsoft.com/fwlink/?LinkId=550988)/[Release](http://go.microsoft.com/fwlink?linkid=615899) for the path to the WAR file e.g. $(Agent.BuildDirectory)\$(Build.Repository.Name)\Demo.war, $(Agent.ReleaseDirectory)\Deploy\Demo.war |
|  Tomcat Server Version                | Choose the appropriate Tomcat Server Version.<br>Supports: Tomcat 6.x, 7.x and 8.x.                                                                       |
|  Artifact Version                     | Version of the artifact in case if the Tomcat parallel deployment is used. |
### Notes

* Response from Tomcat is written to a temp file under OS temporary directory.

### Known Issues

* 'cURL' demand may not be detected automatically on Windows agents. Add it manually.
 
