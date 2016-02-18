# vsts-tomcat
This is the source code repository of Apache Tomcat extension for Visual Studio Team Services.
This extension contains VSTS build tasks for deploying apps to Tomcat.

## Working with this repo
(assuming node is installed)

Once:
```bash
$ npm install
$ npm install gulp -g
```

Build:
```bash
$ gulp build
```

Test:
```bash
$ gulp test
```

Package (vsix will be generated at _build/package):
```bash
$ gulp package
```
