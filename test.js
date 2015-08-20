
function TurtlebotKeyTeleop(params) {

  var optional = {
    topic : '/cmd_vel_mux/input/teleop', 
    frequency : 10,
    speed: 0.2,
    turn: 1
  };

  var params = $.extend(optional, params);

  var cmdVelocity = new ROSLIB.Topic({
    ros : params.bridge,
    name : params.topic,
    messageType : 'geometry_msgs/Twist'
  });

  var moveBindings = {
    'i' : {active: false, linear: 1, angular: 0},
    'o' : {active: false, linear: 1, angular: -1},
    'j' : {active: false, linear: 0, angular: 1},
    'l' : {active: false, linear: 0, angular: -1},
    'u' : {active: false, linear: 1, angular: 1},
    ',' : {active: false, linear: -1, angular: 0},
    '.' : {active: false, linear: -1, angular: 1},
    'm' : {active: false, linear: -1, angular: -1}
  }; 

  var speedBindings = {
    'q' : [1.1,1.1],
    'z' : [0.9, 0.9],
    'w' : [1.1, 1],
    'x' : [0.9, 1],
    'e' : [1, 1.1],
    'c' : [1, 0.9]
  };

  var target = {
    speed: 0,
    turn: 0
  };

  var rate = setInterval(function(){
    var speed = 0, turn = 0;
    for(var key in moveBindings) {
      binding = moveBindings[key];
      if (binding.active) {
        speed = speed + params.speed * binding.linear;
        turn = turn + params.turn * binding.angular;  
      }
    }
    
    target.speed = target.speed + (speed - target.speed) * 0.5;
    target.turn = target.turn + (turn - target.turn) * 0.5;
    var twist = new ROSLIB.Message({
      linear : {
        x : target.speed,
        y : 0.0,
        z : 0.0
      },
      angular : {
        x : 0.0,
        y : 0.0,
        z : target.turn
      }
    });
  
    cmdVelocity.publish(twist);
  }, 1000.0 / params.frequency);


  $('body').keydown(function(e){
    var c = e.key.toLowerCase();
    if (c in speedBindings) {
      params.speed = params.speed * speedBindings[c][0];
      params.turn = params.turn * speedBindings[c][1];
    }
    if (c in moveBindings) {
      moveBindings[c].active = true;
    }
  });

  $('body').keyup(function(e){
    var c = e.key.toLowerCase();
    if (c in moveBindings) {
      moveBindings[c].active = false;  
    }
  });
}

function Setup(){
  var ros = new ROSLIB.Ros({
    url : 'ws://localhost:9090'
  });

  ros.on('connection', function() {
    console.log('Connected to websocket server.');
  });

  ros.on('error', function(error) {
    console.log('Error connecting to websocket server: ', error);
  });

  ros.on('close', function() {
    console.log('Connection to websocket server closed.');
  });

  var teleop = new TurtlebotKeyTeleop({ 
    bridge: ros
  });
  
}

$(Setup);