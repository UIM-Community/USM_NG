'use strict';

const http = require('http');
const events = require('events');

/* 
 * HTTP Class 
 */
const IHTTP = {
    protocol: 'http:',
    port: 80,
    method: 'GET',
    headers: {}
}

class Request extends events {

    constructor(opts) {
        super(); 
        Object.assign(opts,IHTTP);
        Object.assign(opts.headers,{
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Basic ' + opts.auth
        });
        this.chunk = "";
        const req = http.request(opts, (res) => {
            res.setEncoding('utf8');

            this.statusCode = res.statusCode;

            res.on('data', (chunk) => {
                this.chunk+=chunk;
            });

            res.on('end', () => {
                try {
                    var body = JSON.parse(this.chunk);
                }
                catch(Exception) {
                    var body = "";
                }
                this.emit('done',body);
            });
        });

        req.on('error', e => {
            this.emit('error',e);
        });

        if(opts.body != null) {
            req.write(opts.body);
        }
        req.end();
    }

}

/*
 * PDS CLASS 
 */
class PDS {

    constructor(esMap) {
        this._inner = "";
        esMap != null && esMap.forEach( (v,k) => this.push(k,v) );
    }

    push(key,element) {
        if(key == null || element == null) return;

        if(typeof element === 'string') {
            this._inner+=`<nimString key="${key}">${element}</nimString>`;
        }
        else if(typeof element === 'number') {
            this._inner+=`<nimInt key="${key}">${element}</nimInt>`;
        }
        else if(element instanceof PDS) {
            this._inner+=element.toString(key);
        }
    }

    toString(key) {
        return key != null ? `<nimPds key="${key}">${this._inner}</nimPds>` : `<nimPds>${this._inner}</nimPds>`;
    }
}

/* 
 * REST Class
 */
const IRestConstructor = {
    hostname: null,
    user: null,
    password: null
}

class REST {

    constructor(opts) {
        Object.assign(this,opts);
        this.auth = new Buffer(`${this.user}:${this.password}`).toString('base64');
        this.alarms = {
            summary: this.summary,
            createAlarm: this.createAlarm
        };
    }

    accounts() {
        return new Promise( (resolve,reject) => {
            const request = new Request({
                auth: this.auth,
                hostname: this.hostname,
                path: "/rest/accounts/",
                timeout: REST.timeout
            });
            
            request.on('done', body => {
                if(request.statusCode != 200) {
                    reject("Request failed");
                }
                else {
                    resolve(body);
                }
            });
            request.on('error', err => reject(err));
        });
    }

    summary() {
        return new Promise( (resolve,reject) => {
            const request = new Request({
                auth: this.auth,
                hostname: this.hostname,
                path: "/rest/alarms/",
                timeout: REST.timeout
            });
            
            request.on('done', body => {
                if(request.statusCode != 200) {
                    reject("Request failed");
                }
                else {
                    resolve(body);
                }
            });
            request.on('error', err => reject(err));
        });
    }

    createAlarm(body) {
        return new Promise( (resolve,reject) => {
            const request = new Request({
                auth: this.auth,
                method: "POST",
                hostname: this.hostname,
                path: "/rest/alarms/createAlarm ",
                body,
                timeout: REST.timeout
            });
            
            request.on('done', body => {
                if(request.statusCode != 200) {
                    reject("Request failed");
                }
                else {
                    resolve(body);
                }
            });
            request.on('error', err => reject(err));
        });
    }

}
REST.timeout = 5000;

// EXPORT CLASSES
module.exports = {REST,PDS};
