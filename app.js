const http=require('http');
const fs=require('fs');
const ejs=require('ejs');
const url=require('url');
const qs=require('querystring');

const index_page=fs.readFileSync('./index.ejs','utf-8');
const login_page=fs.readFileSync('./login.ejs','utf-8');

const max_num=10;
const filename='mydata.txt';
let message_data;
readFromFile(filename);

let server=http.createServer(getFromClient).listen(process.env.PORT, process.env.IP);

console.log("Server Start");

function getFromClient(request,response){

    let url_parts=url.parse(request.url,true);
    switch(url_parts.pathname){
        case '/':
            response_index(request,response);
        break;
        case '/login':
            response_login(request,response);
        break;
        default:
            response.writeHead(200,{'Content-Type':'text/plain'});
            response.end('Not Found...');
            break;
    }
}

function response_login(request,response){
    let content=ejs.render(login_page,{});
    response.writeHead(200,{'Content-Type':'text/html'});
    response.write(content);
    response.end();
}

function response_index(request,response){
    if(request.method==='POST'){
        let body='';

        request.on('data',function(data){
            body+=data;
        });
        request.on('end',function(){
            data=qs.parse(body);
            addToData(data.id,data.msg,filename,request);
            write_index(request,response);
        });
    }
    else{
        write_index(request,response);
    }
}

function write_index(request,response){
    let msg="※何かメッセージを書いてください";
    let content=ejs.render(index_page,{
        title:'Index',
        content:msg,
        data:message_data,
        filename:'data_item'
    });
    response.writeHead(200,{'Content-Type':'text/html'});
    response.write(content);
    response.end();
}

function readFromFile(fname){
    fs.readFile(fname,'utf8',(err,data)=>{
        message_data=data.split('\n');
    })
}

function addToData(id,msg,fname,request){
    let obj={'id':id,'msg':msg};
    let obj_str=JSON.stringify(obj);
    console.log('add data:'+obj_str);
    message_data.unshift(obj_str);
    if(message_data.length>max_num){
        message_data.pop();
    }
    saveToFile(fname);
}

function saveToFile(fname){
    let data_str=message_data.join('\n');
    fs.writeFile(fname,data_str,(err)=>{
        if(err){throw err;}
    });
}