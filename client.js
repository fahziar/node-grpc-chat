/**
 * Created by fahziar on 27/09/2015.
 */

var grpc = require('grpc');
var chat_proto = grpc.load('./chat.proto').Chat;

var readline = require('readline');
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//Constant
var GET_MESSAGES_INTERVAL = 500;

//Variabel global
var client = new chat_proto.MyChat('localhost:8080', grpc.Credentials.createInsecure());
var username;
var timeoutId;

client.login({username: ""}, function(err, response){
   if (err){
       console.log("Error login in");
   }  else {
       if (response.success == false){
           console.log("Error login in");
       } else {
           console.log("Welcome to GRPC Chat");
           console.log("===============================================");
           console.log("Command List:");
           console.log("/JOIN <channel name>: Join channel");
           console.log("/LEAVE <channel name>: Leave channel");
           console.log("/NICK <your nick>: Change your nick name. Note: Everytime you change your nick, you must rejoin your subscribed channel");
           console.log("@<channel name>: Send message to channel");
           console.log("/EXIT: Exit from application");
           console.log("===============================================");
           console.log("You are logged in as " + response.username);
           console.log("");
           username = response.username;
           timeoutId = setTimeout(getMessages, GET_MESSAGES_INTERVAL);
           readCommand();
       }
   }
});

function readCommand(){
    rl.on('line', function(line){
        if (line.indexOf('/JOIN') == 0){
            client.join({username : username, channel : line.substr(6)}, function (err, response) {
                if (err){
                    console.log("Failed to join channel");
                } else{
                    if (response.success == false){
                        console.log("Failed to join channel");
                    } else {
                        console.log("Success joining channel");
                    }
                }
            });
        } else if (line.indexOf('/LEAVE') == 0){
            var channel = line.substr(7);
            if (channel == ''){
                return;
            }
            client.leave({username : username, channel : line.substr(7)}, function (err, response) {
                if (err){
                    console.log("Failed to leave channel");
                } else{
                    if (response.success == false){
                        console.log("Failed to leave channel");
                    } else {
                        console.log("Success leaving channel");
                    }
                }
            });
            console.log("Leaving channel");
        } else if (line.indexOf('/NICK') == 0){
            client.login({username: line.substr(6)}, function(err, response){
                if (err){
                    console.log("Error login in");
                }  else {
                    if (response.success == false){
                        console.log("Error login in");
                    } else {
                        console.log("Welcome, " + response.username);
                        username = response.username;
                    }
                }
            });
        } else if (line.indexOf('@') == 0){
            var i = line.indexOf(' ');
            var channel = line.substr(1, i - 1);
            var msg = line.substr(i + 1);

            client.sendMessage({username: username, channel: channel, msg: msg}, function(err, response){
                if (err){
                    console.log("Error login in");
                }  else {
                    if (response.success == false){
                        console.log("Error login in");
                    } else {
                        console.log("Message sent");
                    }
                }
            });
        } else if (line.indexOf('/EXIT') == 0){
            rl.close();
            clearTimeout(timeoutId);
            process.exit();
        }

    })
}

function getMessages(){
    client.getMessages({username: username}, function(err, response){
        if (err){
            console.log("Failed to connect to server");
            process.exit()
        } else {
            for (var i = 0; i < response.messages.length; i++) {
                console.log(response.messages[i]);
            }

            timeoutId = setTimeout(getMessages, GET_MESSAGES_INTERVAL);
        }
    });
}