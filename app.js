const http=require('http');
const fs=require('fs');
const ejs=require('ejs');
const url=require('url');
const qs=require('querystring');

const index_page=fs.readFileSync('./index.ejs','utf8');
const other_page=fs.readFileSync('./other.ejs','utf8');
const style_css=fs.readFileSync('./style.css','utf8');

http.createServer(getFromClient).listen(3000);
//.listen(process.env.PORT, process.env.IP);
console.log('SERVER OPEN');

function getFromClient(request,response){
    const url_parts=url.parse(request.url,true);
    switch(url_parts.pathname){
        case '/':
            response_index(request,response);
            break;
        case '/other':
            response_other(request,response);
            break;
        case '/style.css':
            response.writeHead(200,{'Contetnt-Type':'text/css'});
            response.write(style_css);
            response.end();
            break;
        default:
            response.writeHead(200,{'Content-Type':'text/plain'});
            response.end("No Find...");
            break;
    }
}

let data={msg: 'no message....'};
function response_index(request,response){
    if(request.method==='POST'){
        let body='';
        request.on('data',(data)=>{
            body+=data;
        });
        request.on('data',()=>{
            data=qs.parse(body);
            setCookie('msg',data.msg,response);
            write_index(request,response);
        });
    }
    else{
        write_index(request,response);
    }
}
function write_index(request,response){
    let msg="伝言を表示します";
    let cookie_data=getCookie('msg',request);
    console.log(cookie_data);
    let content=ejs.render(index_page,{
        title:"Index",
        content:msg,
        data:data,
        cookie_data:cookie_data
    });
    response.writeHead(200,{'Content-Type':'text/html'});
    response.write(content);
    response.end();
}
function setCookie(key,value,response){
    let cookie=escape(value);
    response.setHeader('Set-Cookie',[key+'='+cookie]);
}
function getCookie(key,request){
    let cookie_data=request.headers.cookie!=undefined?request.headers.cookie:'';
    var data=cookie_data.split(':');
    for(let i in data){
        if(data[i].trim().startsWith(key+'=')){
            let result=data[i].trim().substring(key.length+1);
            return unescape(result);
        }
    }
    return '';
}


function response_other(request,response){
    let msg='Other page';
    response.writeHead(200,{'Content-Type':'text/plain'});
    response.write(msg);
    response.end();
}