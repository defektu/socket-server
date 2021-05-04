var server = require("http").createServer();
var options = {
  cors: true
};

var io = require("socket.io")(server, options);
var players = {};
var pointers = {};

function Player(id) {
  this.id = id;
  this.x = 0;
  this.y = 0;
  this.z = 0;
  this.r = 0;
  this.g = 0;
  this.b = 0;
  this.rx = 0;
  this.ry = 0;
  this.rz = 0;
  this.avatar = "a";
  this.animState = "idle generic";
  this.username = "";
  this.entity = null;
}

function Pointer(id) {
  this.id = id;
  this.x = 0;
  this.y = 0;
  this.z = 0;
  this.r = 0;
  this.g = 0;
  this.b = 0;
  this.state = null;
  this.entity = null;
}
io.sockets.on("connection", function(socket) {
  socket.on("initialize", function(userdata) {
    var id = socket.id;
    var newPlayer = new Player(id);
    var newPointer = new Pointer(id);
    // Creates a new player object with a unique ID number.
    console.log("New client has connected with id:", socket.id);
    var r = Math.random();
    var g = Math.random();
    var b = Math.random();
    players[id] = newPlayer;
    pointers[id] = newPointer;
    players[id].r = r;
    players[id].g = g;
    players[id].b = b;
    pointers[id].r = r;
    pointers[id].g = g;
    pointers[id].b = b;

    players[id].username = userdata.username;
    console.log(
      "New client has connected with username:",
      players[id].username
    );

    //socket.on("username", function(data){
    //  //console.log("New client has connected with username:", players[socket.id].username);
    //  //players[data.id].username = data.username;
    //  players[id].username = data.username;
    //  console.log("New client has connected with username:", players[id].username);
    //});

    // Adds the newly created player to the array.

    socket.emit("playerData", { id: id, players: players, pointers: pointers });
    //console.log(players);
    // Sends the connecting client his unique ID, and data about the other players already connected.

    socket.broadcast.emit("playerJoined", newPlayer);
    socket.broadcast.emit("addPointer", newPointer);
    //socket.broadcast.emit("playerJoined", newPlayer);

    // Sends everyone except the connecting player data about the new player.
    /*
    socket.on("initialize", function() {
      var id = socket.id;
      //console.log(socket.id);
      var newPlayer = new Player(id);
      players[id] = newPlayer;

      socket.emit("playerData", { id: id, players: players });
      socket.broadcast.emit("playerJoined", newPlayer);
    });
*/

    socket.on("updateName", function(data) {
      if (!players[data.id]) return;
      players[data.id].username = data.username;
      socket.broadcast.emit("updatedName", data);
      //socket.broadcast.emit("pointerMoved", data);
      //console.log('pz' + data);
    });

    socket.on("updateAvatar", function(data) {
      if (!players[data.id]) return;
      players[data.id].avatar = data.avatar;
      socket.broadcast.emit("updatedAvatar", data);
      //socket.broadcast.emit("pointerMoved", data);
      //console.log('pz' + data);
    });
    
    socket.on("updateAnimState", function(data) {
      if (!players[data.id]) return;
      players[data.id].animState = data.animState;
      socket.broadcast.emit("updatedAnimState", data);
      //socket.broadcast.emit("pointerMoved", data);
      //console.log('pz' + data);
    });

    socket.on("positionUpdate", function(data) {
      if (!players[data.id]) return;
      players[data.id].x = data.x;
      players[data.id].y = data.y;
      players[data.id].z = data.z;
      players[data.id].rx = data.rx;
      players[data.id].ry = data.ry;
      players[data.id].rz = data.rz;
      socket.broadcast.emit("playerMoved", data);
      //socket.broadcast.emit("pointerMoved", data);
      //console.log('pz' + data);
    });

    socket.on("pointerUpdate", function(data) {
      if (!pointers[data.id]) return;
      pointers[data.id].x = data.px;
      pointers[data.id].y = data.py;
      pointers[data.id].z = data.pz;
      
      socket.broadcast.emit("pointerMoved", data);
      //console.log('pz' + data);
    });

    socket.on("disconnect", function() {
      if (!players[socket.id]) return;
      delete players[socket.id];
      console.log("client disconnected: ", socket.id);
      // Update clients with the new player killed
      socket.broadcast.emit("killPlayer", socket.id);
    });

    // socket.on("ping", function(data) {
    //   console.log("received ping, sending reply"); //no log shown???
    //   socket.emit("pong"); //client receives event ~25 seconds after request
    // });
  });
});
console.log("Server started");
server.listen(3000);
