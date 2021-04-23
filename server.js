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
  this.entity = null;
}
io.sockets.on("connection", function(socket) {
  socket.on("initialize", function() {
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
    // Adds the newly created player to the array.

    socket.emit("playerData", { id: id, players: players, pointers: pointers });
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
    socket.on("positionUpdate", function(data) {
      if (!players[data.id]) return;
      players[data.id].x = data.x;
      players[data.id].y = data.y;
      players[data.id].z = data.z;
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
    

  });
});
console.log("Server started");
server.listen(3000);
