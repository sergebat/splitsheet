#!/usr/bin/env node
var shelljs = require("shelljs");
var jsonfile = require("jsonfile");
var jimp = require("jimp");


shelljs.config.verbose = true;

var userArgs = process.argv.slice(2);
if (userArgs.length === 0) {
    console.log("splitshee spritesheetjson.json");
    process.exit(2);
}

var jsonFileName = userArgs[0];

var json = jsonfile.readFileSync(jsonFileName);

var frames = json.frames;
var animations = json.animations;
var imageFiles = json.images;

jimp.read(imageFiles[0]).then( (originalImage) => {
    for (var animationName in animations) {
        var animation = animations[animationName];
        var frameIndex = animation.frames[0];
        var frame = frames[frameIndex];

        var imageNameIndex = frame[4];
        var imageFile = imageFiles[imageNameIndex];

        var x = frame[0], y = frame[1], w = frame[2], h = frame[3];

        originalImage.clone().crop(x, y, w, h).write(animationName + ".png");

        console.log("Extracting image ", animationName, " from ", imageFile, " at ", x, y, w, h);

        //shelljs.exec(`magick ${imageFile} -crop ${w}x${h}+${x}+${y} ${animationName}.png`);
    }
}).catch(function (err) {
    console.error(err);
});

