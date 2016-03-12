function Window(parameters) {

	// @if NODE_ENV='development'
	c.log('INIT WINDOW');
	// @endif

	this.id = parameters.id;
	if(parameters.url != null) {
		// @if NODE_ENV='development'
		c.log(parameters.url);
		// @endif
		this.url = parameters.url;
	}

	this.onFocusCallback = parameters.onFocus;
	this.onCloseCallback = parameters.onClose;

	this.handle = UserManager.getPreferenceByName('show_title_bar');
	this.omnibox = true;
	this.console = false;
	this.isAlwaysOnTop = false;
	
	app.commandLine.appendSwitch('enable-webvr');
	app.commandLine.appendSwitch('enable-web-bluetooth');

	this.browser = new BrowserWindow({
	  width: UserManager.getPreferenceByName('default_window_width'),
	  height: UserManager.getPreferenceByName('default_window_height'),
	  frame: false,
	  backgroundColor: '#000',
	  show: false,
	  x: parameters.x ? parameters.x : 890,
	  y: parameters.y ? parameters.y : 660,
	  minWidth: 600,
	  minHeight: 350,
	  webPreferences: {
	  	"experimentalFeatures": true,
	  	"experimentalCanvasFeatures": true
	  }
	});

	// @if NODE_ENV='development'
	c.log('file://' + __dirname + '/src/html/index.html');
	// @endif

	this.attachEvents();
	this.browser.loadURL('file://' + __dirname + '/src/html/index.html');

	// @if NODE_ENV='development'
	this.browser.webContents.openDevTools();
	// @endif
	// this.setAlwaysOnTopToggle();
}

Window.prototype.attachEvents = function() {
	this.browser.webContents.on('dom-ready', this.onReady.bind(this));
	this.browser.on('focus', this.onFocus.bind(this));
	this.browser.on('closed', this.onClosed.bind(this));

	ipcMain.on('setOmniboxShow', this.setOmniboxShow.bind(this));
	ipcMain.on('setOmniboxHide', this.setOmniboxHide.bind(this));
}

Window.prototype.onReady = function() {
	this.browser.webContents.send('ready');
	if(this.url) this.load(this.url);
	this.browser.show();
}

Window.prototype.onFocus = function() {
	this.onFocusCallback(this);
}

Window.prototype.close = function() {
	this.browser.close();
}

Window.prototype.onClosed = function() {
	CommandManager.unregisterAll(this.browser);
	this.browser = null;
	this.onCloseCallback();
}

Window.prototype.toggleDevTools = function() {
	this.browser.webContents.send('toggleDevTools');
}

Window.prototype.setOmniboxShow = function() {
	this.omnibox = true;
}

Window.prototype.setOmniboxHide = function() {
	this.omnibox = false;
}

Window.prototype.showOmnibox = function() {
	// @if NODE_ENV='development'
	c.log('Showing Omnibox');
	// @endif
	this.omnibox = true;
	this.browser.webContents.send('showOmnibox');
}

Window.prototype.hideOmnibox = function() {
	// @if NODE_ENV='development'
	c.log('Hiding Omnibox');
	// @endif
	this.omnibox = false;
	this.browser.webContents.send('hideOmnibox');
}

Window.prototype.toggleHandle = function() {
	if(this.handle) {
		// @if NODE_ENV='development'
		c.log('Hiding handle!');
		// @endif
		this.handle = false;
		this.browser.webContents.send('hideHandle');
		this.browser.setSize(
			this.browser.getSize()[0],
			this.browser.getSize()[1] - 22
		);
	}
	else {
		// @if NODE_ENV='development'
		c.log('Showing handle');
		// @endif
		this.handle = true;
		this.browser.webContents.send('showHandle');
		this.browser.setSize(
			this.browser.getSize()[0],
			this.browser.getSize()[1] + 22
		);
	}
}

Window.prototype.toggleConsole = function() {
	// @if NODE_ENV='development'
	c.log(this.console);
	// @endif
	if(this.console) {
		// @if NODE_ENV='development'
		c.log('Hiding console');
		// @endif
		this.console = false;
		this.browser.webContents.send('hideConsole');
	}
	else {
		// @if NODE_ENV='development'
		c.log('Showing console');
		// @endif
		this.console = true;
		this.browser.webContents.send('showConsole');
	}
}

Window.prototype.toggleOmnibox = function() {
	// @if NODE_ENV='development'
	c.log('Toggling Omnibox');
	// @endif
	if(this.omnibox) {
		this.hideOmnibox();
	}
	else {
		this.showOmnibox();
	}
}

Window.prototype.reload = function() {
	this.browser.webContents.send('reload');
}

Window.prototype.load = function(url) {
	this.browser.webContents.send('load', url);
}

Window.prototype.navigateBack = function() {
	this.browser.webContents.send('goBack');
}

Window.prototype.navigateForward = function() {
	this.browser.webContents.send('goForward');
}

Window.prototype.setAlwaysOnTopToggle = function() {
	this.isAlwaysOnTop =! this.isAlwaysOnTop;
	this.browser.setAlwaysOnTop(this.isAlwaysOnTop);
	CommandManager.toggleChecked('Window', 'Float on Top');
}