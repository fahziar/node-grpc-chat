/**
 * Created by fahziar on 27/09/2015.
 */

var grpc = require('grpc');
var chat_proto = grpc.load('./chat.proto').Chat;

var userList = [];
var channellList = {};
var inbox = {};
var anonymousCount = 0;

// Implementasi endpoint
function Login(call, callback){
    var user;
    if (call.request.username === ''){
        anonymousCount++;
        user = "user" + anonymousCount;
        userList.push(user);
    } else {
        user = call.request.username;
        userList.push(user);
    }

    console.log("User " + user + ' logged in.');

    callback(null, {success : true, username : user});
}

function Join(call, callback){
    var username = call.request.username;
    if (userList.indexOf(username) == -1)
    {
        callback(null, {success: false});
    } else {
        var channel = call.request.channel;
        if (!(channel in channellList)) {
            channellList[channel] = [];
        }

        channellList[channel].push(call.request.username);

        callback(null, {success: true});
        console.log("User " + username + " joined channel " + channel);
    }
}

function Leave(call, callback){
    var username = call.request.username;
    var channel = call.request.channel;

    if ((userList.indexOf(username) == -1) || !(channel in channellList))
    {
        callback(null, {success: false});
    } else {
        var channel = call.request.channel;

        var i = channellList[channel].indexOf(username);
        if (i != -1){
            channellList[channel].splice(i, 1);
        }

        callback(null, {success: true});
    }
}

function Send(call, callback){
    var username = call.request.username;
    var channel = call.request.channel;
    var msg = call.request.msg;

    if ((userList.indexOf(username) == -1) || !(channel in channellList)){
        callback(null, {success: false});
    } else {
        var members = channellList[channel];
        for (var i = 0; i < members.length; i++){
            if (members[i] != username){
                if (!(members[i] in inbox)){
                    inbox[members[i]] = [];
                }
                inbox[members[i]].push("@" + channel + " " + username + " : " + msg);
            }
        }
        callback(null, {success: true});
    }
}


function getMessages(call, callback){
    var user = call.request.username;

    if (userList.indexOf(user) == -1) {
        callback(null, {success: false});
    } else {
        if (!(user in inbox)){
            inbox[user] = [];
        }

        var temp = inbox[user];
        inbox[user] = [];
        callback(null, {messages : temp});
    }
}


//Main
var server = new grpc.Server();
server.addProtoService(chat_proto.MyChat.service, {
    login : Login,
    join : Join,
    leave : Leave,
    sendMessage : Send,
    getMessages : getMessages
});

server.bind('0.0.0.0:8080', grpc.ServerCredentials.createInsecure());
server.start();
