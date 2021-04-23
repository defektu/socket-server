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
  //this.px = 0;
  //this.py = 0;
  //this.pz = 0;
  this.entity = null;
}

function Pointer(id) {
  this.id = id;
  this.x = 0;
  this.y = 0;
  this.z = 0;
  this.entity = null;
}

io.sockets.on("connection", function(socket) {
  socket.on("initialize", function() {
    var id = socket.id;
    var newPlayer = new Player(id);
    var newPointer = new Pointer(id);
    // Creates a new player object with a unique ID number.

    players[id] = newPlayer;
    pointers[id] = newPointer;
    // Adds the newly created player to the array.

    socket.emit("playerData", { id: id, players: players, pointers: pointers});
    // Sends the connecting client his unique ID, and data about the other players already connected.

    socket.broadcast.emit("playerJoined", newPlayer);
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
      pointers.px = data.px;
      pointers.py = data.py;
      pointers.pz = data.pz;
      socket.broadcast.emit("playerMoved", data);
      socket.broadcast.emit("pointerMoved", data);
      //console.log('pz' + data);
    });
    

    socket.on("pointerUpdate", function(data2) {

      socket.broadcast.emit("pointerMoved", data2);
      //console.log('pz' + data);
    });

    socket.on("disconnect", function() {
      if (!players[socket.id]) return;
      delete players[socket.id];
      // Update clients with the new player killed
      socket.broadcast.emit("killPlayer", socket.id);
    });
  });
});

console.log("Server started");
server.listen(3000);
