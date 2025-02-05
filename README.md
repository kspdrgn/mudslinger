MudSlinger Contd, aka untitled muck client project.

# Getting started #
1. Have Node 20 or higher. Use "Node Version Manager for Windows" or "Node Version Manager [for Linux]" to install Node if needing to work on other Node projects.
2. Run `npm start` in the root directory to install dependencies, build both projects and serve the proxy/webclient.
3. Open `localhost/index.html` in browser to view web client, as served from the proxy server. Launch with browser debugger to enable debugging.

Customize `configClient.js` and/or `configServer.js` before build to hard-code behavior.

# Architecture #

The web-app (currently) only supports connecting to a MU* through a proxy server, which optionally can host the web-app files.

## `client` - Web App MU Client ##
Web-app that provides MU* interface and connection to proxy server.
* Framework is old-school pure JS and jQuery.
* Widgets UX uses `jqwidgets-framework`.
* Terminal UX uses `codemirror`.
* Build/bundle uses `rollup`.
* Client connection uses `socket-io`.

## `server` - MU Proxy Server ##
Node server app that proxies connections to an external MU* server.
* Framework is `express`.
* Build is `tsc`.
* Listen/proxy connection uses `socket-io`.
* Serves bundled web-app HTML/JS through http-server.


# Old Docs #
Mudslinger is a web based MUD client written in Typescript. 
It consists of a Node.js / Express web server and a HTML/CSS/Javascript frontend.

The Node.js server makes telnet connections to the target host/port and acts as a telnet proxy for the frontend application.

It can be configured to connect only to a specific host/port or allow connections to any host/port.

Live version at: [http://mudslinger.rooflez.com](http://mudslinger.rooflez.com)

# Features #
* ANSI color
* XTERM 256 colors
* MXP support (`<image>`, `<send>`, `<a>`, `<i>`, `<b>`, `<u>`, and `<s>` tags)
* Triggers (basic and regex)
* Aliases (basic and regex)
* Scripting support (Javascript)

# License
See ``LICENSE`` file.
