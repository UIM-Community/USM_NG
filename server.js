const http  = require('http');
const fs    = require('fs');
const path  = require('path');

const serve     = require('./core/serve.js');
const render    = require('./core/render.js');
const router    = require('./core/router.js');
const api       = require('./core/rest.js');

process.on('uncautghException', console.log.bind(console) );

const config = require('./configuration.json');
const Router = new router(); 

Router.get('/',async (ctx) => {
    const body = await ctx.render('login');

    ctx.response.writeHead(200,{
        'Content-Type': 'text/html'
    });
    ctx.response.end(body);
});

Router.get('/main',async (ctx) => {
    const body = await ctx.render('main');

    ctx.response.writeHead(200,{
        'Content-Type': 'text/html'
    });
    ctx.response.end(body);
});

Router.post('/auth', async(ctx) => {
    console.log('Auth request triggered'); 
    const options = {
        hostname : config.usm_addr
    }
    Object.assign(options,ctx.body);
    const Rest = new api.REST(options);
    try {
        const accountsArray = await Rest.accounts();

        ctx.response.writeHead(200,{
            'Content-Type': 'application/json'
        });
        ctx.response.end(JSON.stringify({state : 'ok'},null,4));
    }
    catch(Exception) {
        console.log('request failed');
        ctx.response.writeHead(403,{
            'Content-Type': 'application/json'
        });
        ctx.response.end(JSON.stringify({err : Exception}));
    }
});

Router.get('/test', async(ctx) => {
    ctx.response.writeHead(200,{
        'Content-Type': 'application/json'
    });
    ctx.response.end(JSON.stringify({ msg: "helloworld"},null,4));
});

Router.use(render);

const server = http.createServer( async (request,response) => {

    try {
        await serve(request,response);
    }
    catch(Exception) {   
        console.log('serve routing!');
        try {
            await Router.send(request,response);
        }
        catch(Ex) {

        }
    }

});
server.listen(3000);
console.log('Server started...');
