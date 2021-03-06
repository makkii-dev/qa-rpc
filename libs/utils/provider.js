const PATHS = require('./providers/providers_config.json');

class Provider{
	constructor(options){
		if(options===undefined){
			this.type = 'default';
			this.logger = console;
		}
		if(typeof options == "String"){
			this.type = options;
			this.logger = console;
		}else{
			this.type = options.type||'default';
			this.logger = options.logger||console;
		}
		switch(this.type){
			case 'ipc':
				this.provider = require('./providers/ipc_provider');
				break;
			case 'websocket':
				this.provider = require('./providers/socket_provider');
				break;
			default:
				this.provider = require('./providers/http_provider');

		}
		this.rpc_version = "2.0";
		this.path = PATHS[this.type];
		this.self = this;

		return this.self;
	}

	Path(newPath){
		if(newPath==undefined) return this.path;

		if(typeof newPath== 'string'){
			this.path = newPath;
		}
		return this;
	}

	Type(newType){
		if(newType ==undefined) return this.type;
		if(newType == this.type) return this;
		this.type = newType;
		switch(this.type){
			case 'ipc':
				this.provider = require('./providers/ipc_provider');
				break;
			case 'websocket':
				this.provider = require('./providers/socket_provider');
				break;
			default:
				this.provider = require('./providers/http_provider');

		};
		return this;
	}

	sendRequest(id,method,params,log_visible){
		return this.provider.sendRequest(this.path, id, method, params, this.rpc_version, this.logger, log_visible);
	}
	sendRaw(jsonString,log_visible){
		return this.provider.sendRaw(this.path, jsonString,this.logger,log_visible);
	}
}

module.exports = Provider;
