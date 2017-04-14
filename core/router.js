class Router {

    constructor() {
        this.methods = new Map(); 
        this.middleware = {};
    }

    use(midllewareFN) {
        if(typeof midllewareFN === "function") {
            this.middleware[midllewareFN.name] = midllewareFN;
        }
    }

    get(routeName,callback) {
        this.methods.set(`get::${routeName}`,callback);
    }

    post(routeName,callback) {
        this.methods.set(`post::${routeName}`,callback);
    }

    getBody(request) {
        return new Promise( (resolve,reject) => {
            const body = [];
            request.on('data', Buf => {
                body.push(Buf);
            })
            .on('error', err => reject(err) )
            .on('end', () => resolve(Buffer.concat(body).toString()) );
        });
    }

    send(request,response) {
        return new Promise( async (resolve,reject) => {
            const method = request.method.toLowerCase();
            const routeStr = `${method}::${request.url}`;
            console.log(routeStr);
            if(this.methods.has(routeStr)) {
                if(request.method === 'POST') {
                    var body = await this.getBody(request);
                    body = JSON.parse(body);
                }
                const ctx = {
                    request,
                    response,
                    body
                };
                Object.assign(ctx,this.middleware);
                await this.methods.get(routeStr)(ctx);
                resolve();
            }
            else {
                reject();
            }
        });
    }

}

module.exports = Router;
