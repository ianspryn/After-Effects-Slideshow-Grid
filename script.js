
// Control variables
var RANDOMIZE_ORDER = true; // Set to true to randomize the order of the photos from beginning to end
var RANDOMIZE_ORDER_IN_PLANE = true; // Set to true to randomize the order within each plane
var REVERSE_ORDER = false; // Set to true to reverse the order of the photos
var X_SPACING = 4000; // Set the spacing between photos on the X-axis
var Y_SPACING = 4000; // Set the spacing between photos on the Y-axis
var Z_SPACING = 7500; // Set the spacing between photos on the Z-axis
var PHOTOS_PER_ROW = 5; // Set the number of photos per row
var PHOTOS_PER_COLUMN = 4; // Set the number of photos per column
var XY_OFFSET = 0; // Set the randomization offset for the XY plane
var Z_OFFSET = 1000; // Set the randomization offset for the Z plane
var TRANSITION_TIME = 2; // seconds to transition between photos
var HOLD_TIME = 5; // seconds each photo is displayed
var CREATE_CUBE = false; // Set to true to duplicate the photos and create a cube

// Function to find a folder by name
function getFolderByName(name) {
    for (var i = 1; i <= app.project.rootFolder.numItems; i++) {
        if (app.project.rootFolder.item(i).name === name && app.project.rootFolder.item(i) instanceof FolderItem) {
            return app.project.rootFolder.item(i);
        }
    }
    return null;
}

// Function to shuffle an array
function shuffleArray(array) {
    var shuffledArray = array.slice(); // Create a copy of the array
    for (var i = shuffledArray.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = shuffledArray[i];
        shuffledArray[i] = shuffledArray[j];
        shuffledArray[j] = temp;
    }
    return shuffledArray;
}

// Retrieve the existing "Photos" folder
var folder = getFolderByName("Photos");
if (folder === null) {
    alert("Folder named 'Photos' not found in the project.");
} else {
    // Create a new composition
    var comp = app.project.items.addComp("Main", 3840, 2160, 1, 30, 30);

    var numPhotos = folder.numItems;
    var photoIndices = [];

    // Create an array of photo indices
    for (var i = 0; i < numPhotos; i++) {
        photoIndices.push(i);
    }

    // Reverse the order if the user selected it
    if (REVERSE_ORDER) {
        photoIndices.reverse();
    }

    // Shuffle the order if the user selected it
    if (RANDOMIZE_ORDER) {
        photoIndices = shuffleArray(photoIndices);
    }

    // Shuffle the order within each plane if the user selected it
    if (RANDOMIZE_ORDER_IN_PLANE) {
        for (var plane = 0; plane < Math.ceil(numPhotos / (PHOTOS_PER_ROW * PHOTOS_PER_COLUMN)); plane++) {
            var start = plane * PHOTOS_PER_ROW * PHOTOS_PER_COLUMN;
            var end = Math.min(start + PHOTOS_PER_ROW * PHOTOS_PER_COLUMN, numPhotos);
            var currentPlaneIndices = photoIndices.slice(start, end);
            currentPlaneIndices = shuffleArray(currentPlaneIndices);
            for (var j = 0; j < currentPlaneIndices.length; j++) {
                photoIndices[start + j] = currentPlaneIndices[j];
            }
        }
    }

    // Function to calculate a random offset
    var randomOffset = function (max) { return Math.random() * (2 * max) - max; };

    // Now you can proceed with the rest of your script to place the photos
    for (var i = 0; i < numPhotos; i++) {
        var index = photoIndices[i];
        var photo = folder.item(i + 1); // 1-based index

        // Add the photo to the composition
        var photoLayer = comp.layers.add(photo);

        // Set the 3D position of the photo
        photoLayer.threeDLayer = true;
        // Set the motion blur for the photo layer
        photoLayer.motionBlur = true;

        // Calculate the scale to fit the photo within the camera view
        var compWidth = comp.width;
        var compHeight = comp.height;
        var photoWidth = photo.width;
        var photoHeight = photo.height;

        var scaleX = (compWidth * 0.85) / photoWidth;
        var scaleY = (compHeight * 0.85) / photoHeight;
        var scale = Math.min(scaleX, scaleY) * 100;

        photoLayer.property("Scale").setValue([scale, scale, scale]);

        // Set the position of the photo layer
        var planeIndex = Math.floor(index / (PHOTOS_PER_ROW * PHOTOS_PER_COLUMN));
        var planePosition = index % (PHOTOS_PER_ROW * PHOTOS_PER_COLUMN);
        var xPos = (planePosition % PHOTOS_PER_ROW) * X_SPACING + randomOffset(XY_OFFSET);
        var yPos = Math.floor(planePosition / PHOTOS_PER_ROW) % PHOTOS_PER_COLUMN * Y_SPACING + randomOffset(XY_OFFSET);
        var zPos = planeIndex * Z_SPACING + randomOffset(Z_OFFSET);
        photoLayer.property("Position").setValue([xPos, yPos, zPos]);
    }

    // Create the camera
    var camera = comp.layers.addCamera("Camera", [0, 0]);
    camera.autoOrient = AutoOrientType.NO_AUTO_ORIENT;
    // Enable Depth of Field
    camera.property("ADBE Camera Options Group").property("ADBE Camera Depth of Field").setValue(true);
    // 300 is a nice blur. 100 is F1.4. Idk what 300 is, but it looks nice.
    camera.property("ADBE Camera Options Group").property("ADBE Camera Aperture").setValue(300);


    // Create the null objects for controlling the camera
    var cameraController = comp.layers.addNull();
    cameraController.name = "Camera Controller";

    var positionController = comp.layers.addNull();
    positionController.threeDLayer = true;
    positionController.name = "Position";

    var wiggleController = comp.layers.addNull();
    wiggleController.name = "Wiggle";

    // Parent the null objects
    camera.parent = positionController;
    positionController.parent = wiggleController;

    // Add checkbox to the camera controller to enable wiggle
    cameraController.property("Effects").addProperty("ADBE Checkbox Control").name = "Enable Wiggle";

    // Re-initialize all variables to get valid references
    var enableWiggle = cameraController.effect('Enable Wiggle')('Checkbox');

    // Set default values for sliders
    enableWiggle.setValue(1);

    // Apply wiggle to the wiggle controller
    wiggleController.transform.position.expression = "if (thisComp.layer('Camera Controller').effect('Enable Wiggle')('Checkbox').value == 1) { wiggle(1, 10); } else { value; }";

    // Get the photo layers and sort them by name
    var photoLayers = [];
    for (var i = 1; i <= comp.numLayers; i++) {
        var layer = comp.layer(i);
        if (layer instanceof AVLayer && layer.source instanceof FootageItem) {
            var nameMatch = layer.name.match(/\d+/);
            if (nameMatch) {
                photoLayers.push({ layer: layer, index: parseInt(nameMatch[0]) });
            }
        }
    }

    photoLayers.sort(function (a, b) {
        return a.index - b.index;
    });

    var incomingSpeed = 0;
    var outgoingSpeed = 0;
    var incomingInfluence = 70;
    var outgoingInfluence = 90;

    // Set up keyframes for the camera movement
    var totalTime = 0;
    for (var i = 0; i < photoLayers.length; i++) {
        var layer = photoLayers[i].layer;
        var position = layer.transform.position.value;

        // Determine hold time from the filename
        var match = layer.name.match(/T(\d+)/);
        var layerHoldTime = match ? parseInt(match[1]) : HOLD_TIME;

        // Set keyframes for position controller
        positionController.transform.position.setValueAtTime(totalTime, position);
        positionController.transform.position.setTemporalEaseAtKey(i * 2 + 1, [new KeyframeEase(outgoingSpeed, outgoingInfluence)], [new KeyframeEase(incomingSpeed, incomingInfluence)]);
        totalTime += layerHoldTime;
        positionController.transform.position.setValueAtTime(totalTime, position);
        positionController.transform.position.setTemporalEaseAtKey(i * 2 + 2, [new KeyframeEase(outgoingSpeed, outgoingInfluence)], [new KeyframeEase(incomingSpeed, incomingInfluence)]);
        totalTime += TRANSITION_TIME;
    }

    totalTime += 2; // Add extra time for the last photo

    // Create a loop back to the first photo
    var firstPosition = photoLayers[0].layer.transform.position.value;
    positionController.transform.position.setValueAtTime(totalTime, firstPosition);
    positionController.transform.position.setTemporalEaseAtKey(photoLayers.length * 2 + 1, [new KeyframeEase(0, 100)], [new KeyframeEase(0.75, incomingInfluence)]);

    // Set the composition's duration to the total time
    comp.duration = totalTime;

    // Make everything in the comp the same duration as the comp
    for (var i = 1; i <= comp.numLayers; i++) {
        comp.layer(i).outPoint = comp.duration;
    }

    // Create a composition from all the photos
    var photoIndices = [];
    for (var i = 0; i < photoLayers.length; i++) {
        photoIndices.push(photoLayers[i].layer.index);
    }

    // layerIndicies, name, and moveAllAttributes
    var photoComp = comp.layers.precompose(photoIndices, "Photos", true);
    var photoCompLayer = comp.layer("Photos");
    photoCompLayer.threeDLayer = true;
    photoCompLayer.motionBlur = true;
    photoCompLayer.collapseTransformation = true; // Make it stick out in 3D space again after precomposing

    if (CREATE_CUBE) {
        var numPlanesZ = Math.ceil(numPhotos / (PHOTOS_PER_ROW * PHOTOS_PER_COLUMN));
        var mainPosition = photoCompLayer.position.value;
        function duplicateAndAdjust(name, position) {
            var duplicate = photoCompLayer.duplicate();
            duplicate.name = name;
            duplicate.threeDLayer = true;
            duplicate.collapseTransformation = true;
            duplicate.position.setValue(position);
        }
        duplicateAndAdjust("Photos Behind", [mainPosition[0], mainPosition[1], mainPosition[2] + Z_SPACING * numPlanesZ])
        duplicateAndAdjust("Photos Top", [mainPosition[0], mainPosition[1] - Y_SPACING * PHOTOS_PER_COLUMN, mainPosition[2]])
        duplicateAndAdjust("Photos Bottom", [mainPosition[0], mainPosition[1] + Y_SPACING * PHOTOS_PER_COLUMN, 0])
        duplicateAndAdjust("Photos Left", [mainPosition[0] - X_SPACING * PHOTOS_PER_ROW, mainPosition[1], mainPosition[2]])
        duplicateAndAdjust("Photos Right", [mainPosition[0] + X_SPACING * PHOTOS_PER_ROW, mainPosition[1], mainPosition[2]])
    }
}