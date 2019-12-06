var io = require('socket.io')({
	transports: ['websocket'],
});

io.attach(4567);

var clients = []

var currentUserNum = 0
var maxUserNum = 2

io.on('connection',function(socket){

	var currentUser;
	var sync_data;

	socket.on('USER_CONNECT',function(data){
		//don't send message in this function, but later
		//console.log(JSON.stringify(data));
		// currentUser = {
		// 	id:socket.id,
		// 	name:'Player'+currentUserNum,
		// 	position:data.position
		// }
		
		if(currentUserNum > maxUserNum-1)
		{
			socket.emit('SERVER_BUSY');
		}else
		{
			currentUser = {
				id:socket.id,
				name:'Player'+currentUserNum,
				num:currentUserNum
			}
			clients.push(currentUser);
			console.log(currentUser.id+':'+currentUser.name + ' has connected;now clients num : '+clients.length);
			//tell user about other users that has connected
			socket.emit('USER_CONNECTED',currentUser);
			for(var i=0;i<clients.length;i++)
			{
				if(clients[i].name != currentUser.name)
					socket.emit('OTHER_USER_CONNECTED',clients[i]);
			}
			socket.broadcast.emit('OTHER_USER_CONNECTED',currentUser);
			currentUserNum++;
		}
	});
	socket.on('DISCONNECT',function(){
		for(var i=0;i<clients.length;i++)
		{
			if(clients[i].name === currentUser.name)
			{
				console.log(clients[i].name + " : "+clients[i].id+" disconnected");
				clients.splice(i,1);
			}
		}
		console.log('after disconnected,total user num: '+clients.length);
	});

	socket.on('MOVE',function(data){
		//console.log(data.pos);
		// sync_data = {
		// 	name:currentUser.name,
		// 	pos:data.pos,
		// 	rot:data.rot
		// }
		sync_data = {
			pos:data.pos,
			rot:data.rot
		}
		socket.broadcast.emit('OTHER_USER_MOVED',sync_data);
	});
})

console.log("server running...");