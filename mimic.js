// Mimic Me!
// Fun game where you need to express emojis being displayed

// --- Affectiva setup ---

// The affdex SDK Needs to create video and canvas elements in the DOM
var divRoot = $("#camera")[0];  // div node where we want to add these elements
var width = 640, height = 480;  // camera image size
var faceMode = affdex.FaceDetectorMode.LARGE_FACES;  // face mode parameter

// Initialize an Affectiva CameraDetector object
var detector = new affdex.CameraDetector(divRoot, width, height, faceMode);

// Enable detection of all Expressions, Emotions and Emojis classifiers.
detector.detectAllEmotions();
detector.detectAllExpressions();
detector.detectAllEmojis();
detector.detectAllAppearance();

// --- Utility values and functions ---

// Unicode values for all emojis Affectiva can detect
//var emojis = [ 128528, 9786, 128515, 128524, 128527, 128521, 128535, 128539, 128540, 128542, 128545, 128563, 128561 ];
var emojis = [128528, 128539, 128515, 9786];


// Update target emoji being displayed by supplying a unicode value
function setTargetEmoji(code) {
  $("#target").html("&#" + code + ";");
}

// Convert a special character to its unicode value (can be 1 or 2 units long)
function toUnicode(c) {
  if(c.length == 1)
    return c.charCodeAt(0);
  return ((((c.charCodeAt(0) - 0xD800) * 0x400) + (c.charCodeAt(1) - 0xDC00) + 0x10000));
}

// Update score being displayed
function setScore(correct, total) {
  $("#score").html("Score: " + correct + " / " + total);
}

// Display log messages and tracking results
function log(node_name, msg) {
  $(node_name).append("<span>" + msg + "</span><br />")
}

// --- Callback functions ---

// Start button
function onStart() {
  if (detector && !detector.isRunning) {
    $("#logs").html("");  // clear out previous log
    detector.start();  // start detector
  }
  log('#logs', "Start button pressed");
}

// Stop button
function onStop() {
  log('#logs', "Stop button pressed");
  if (detector && detector.isRunning) {
    detector.removeEventListener();
    detector.stop();  // stop detector
  }
};

// Reset button
function onReset() {
  log('#logs', "Reset button pressed");
  if (detector && detector.isRunning) {
    detector.reset();
  }
  $('#results').html("");  // clear out results
  $("#logs").html("");  // clear out previous log

  // TODO(optional): You can restart the game as well
  // <your code here>
  cur_score = 0;
  emoji_to_mimic = emojis[Math.floor(Math.random() * emojis.length)];
  //log('#logs', "emoji="+emoji_to_mimic);
  setTargetEmoji(emoji_to_mimic);
  success_audio.play();
  setScore(cur_score, total_score);

};

// Add a callback to notify when camera access is allowed
detector.addEventListener("onWebcamConnectSuccess", function() {
  log('#logs', "Webcam access allowed");
});

// Add a callback to notify when camera access is denied
detector.addEventListener("onWebcamConnectFailure", function() {
  log('#logs', "webcam denied");
  console.log("Webcam access denied");
});

// Add a callback to notify when detector is stopped
detector.addEventListener("onStopSuccess", function() {
  log('#logs', "The detector reports stopped");
  $("#results").html("");
});

// Add a callback to notify when the detector is initialized and ready for running
detector.addEventListener("onInitializeSuccess", function() {
  log('#logs', "The detector reports initialized");
  //Display canvas instead of video feed because we want to draw the feature points on it
  $("#face_video_canvas").css("display", "block");
  $("#face_video").css("display", "none");

  // TODO(optional): Call a function to initialize the game, if needed
  // <your code here>
  cur_score = 0;
  emoji_to_mimic = emojis[Math.floor(Math.random() * emojis.length)];
  setTargetEmoji(emoji_to_mimic);
  success_audio.play();
  setScore(cur_score, total_score);
  //log('#logs', "emoji="+emoji_to_mimic);


});

// Add a callback to receive the results from processing an image
// NOTE: The faces object contains a list of the faces detected in the image,
//   probabilities for different expressions, emotions and appearance metrics
detector.addEventListener("onImageResultsSuccess", function(faces, image, timestamp) {
  var canvas = $('#face_video_canvas')[0];
  if (!canvas)
    return;

  // Report how many faces were found
  $('#results').html("");
  log('#results', "Timestamp: " + timestamp.toFixed(2));
  log('#results', "Number of faces found: " + faces.length);
  if (faces.length > 0) {
    // Report desired metrics
    log('#results', "Appearance: " + JSON.stringify(faces[0].appearance));
    log('#results', "Emotions: " + JSON.stringify(faces[0].emotions, function(key, val) {
      return val.toFixed ? Number(val.toFixed(0)) : val;
    }));
    log('#results', "Expressions: " + JSON.stringify(faces[0].expressions, function(key, val) {
      return val.toFixed ? Number(val.toFixed(0)) : val;
    }));
    log('#results', "Emoji: " + faces[0].emojis.dominantEmoji);

    // Call functions to draw feature points and dominant emoji (for the first face only)
    drawFeaturePoints(canvas, image, faces[0]);
    drawEmoji(canvas, image, faces[0]);

    // TODO: Call your function to run the game (define it first!)
    // <your code here>
	// check if dominant emoji is the correct one
	if (cur_score < total_score) {
	  if (toUnicode(faces[0].emojis.dominantEmoji) === emoji_to_mimic) {
		  cur_score += 1;
		  setScore(cur_score, total_score);
		  success_audio.play();
          emoji_to_mimic = emojis[Math.floor(Math.random() * emojis.length)];
		  setTargetEmoji(emoji_to_mimic);
		  //log('#logs', "emoji="+emoji_to_mimic);

		  if (cur_score === total_score) {
	        game_over_audio.play();
			$("#score").html("Score: " + cur_score + " / " + total_score + "- Game Over. You took " + timestamp.toFixed(2) +" secs. Press RESET to play again");
		    log('#logs', "PRESS RESET to play the game again");
		  }
	  }
	}
  }
});


// --- Custom functions ---

// Draw the detected facial feature points on the image
function drawFeaturePoints(canvas, img, face) {
  // Obtain a 2D context object to draw on the canvas
  var ctx = canvas.getContext('2d');

  // TODO: Set the stroke and/or fill style you want for each feature point marker
  // See: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D#Fill_and_stroke_styles
  // <your code here>
  ctx.strokeStyle = 'yellow';
  //console.log(face);
  
  // Loop over each feature point in the face
  for (var id in face.featurePoints) {


    // TODO: Draw feature point, e.g. as a circle using ctx.arc()
    // See: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/arc
    // <your code here>
	var featurePoint = face.featurePoints[id];
	ctx.beginPath();
    ctx.arc(featurePoint.x, featurePoint.y, 3, 0, 2*Math.PI);
    ctx.stroke();

  }
}

// Draw the dominant emoji on the image
function drawEmoji(canvas, img, face) {
  // Obtain a 2D context object to draw on the canvas
  var ctx = canvas.getContext('2d');

  // TODO: Set the font and style you want for the emoji
  // <your code here>
  // Default size of Emoji. Will adjust the size based on size of face detected
  var face_size = 48;
  
  // TODO: Draw it using ctx.strokeText() or fillText()
  // See: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillText
  // TIP: Pick a particular feature point as an anchor so that the emoji sticks to your face
  // <your code here>
  
  var x_min = Number.POSITIVE_INFINITY;
  var x_max = Number.NEGATIVE_INFINITY;
  var y = Number.POSITIVE_INFINITY; 

  for (var id in face.featurePoints) {
    var featurePoint = face.featurePoints[id];

    if (featurePoint.y < y) {
      y = featurePoint.y;
    }
	
	if (featurePoint.x > x_max) {
		x_max = featurePoint.x;
    }
	
	if (featurePoint.x < x_min) {
		x_min = featurePoint.x;
    }
	
  }

  var x = x_max;
  
  ctx.font = 48*(x_max-x_min)/250 + "px serif";

  
  //ctx.font = "48px serif";

  ctx.fillText(face.emojis.dominantEmoji, x, y);
}

// TODO: Define any variables and functions to implement the Mimic Me! game mechanics



// NOTE:
// - Remember to call your update function from the "onImageResultsSuccess" event handler above
// - You can use setTargetEmoji() and setScore() functions to update the respective elements
// - You will have to pass in emojis as unicode values, e.g. setTargetEmoji(128578) for a simple smiley
// - Unicode values for all emojis recognized by Affectiva are provided above in the list 'emojis'
// - To check for a match, you can convert the dominant emoji to unicode using the toUnicode() function

// Optional:
// - Define an initialization/reset function, and call it from the "onInitializeSuccess" event handler above
// - Define a game reset function (same as init?), and call it from the onReset() function above

// <your code here>

var cur_score = 0;
var total_score = 5;
var success_audio = new Audio('beep-08b.mp3');
var game_over_audio = new Audio("applause-01.mp3");
var emoji_to_mimic = null;

