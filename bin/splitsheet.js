#!/usr/bin/env node
var shelljs = require("shelljs");
var jsonfile = require("jsonfile");
var Jimp = require("jimp");

function createjsSplitSheet(json) {
    var frames = json.frames;
    var animations = json.animations;
    var imageFiles = json.images;

    Jimp.read(imageFiles[0]).then( (originalImage) => {
        for (var animationName in animations) {
            var animation = animations[animationName];
            var frameIndex = animation.frames[0];
            var frame = frames[frameIndex];

            var imageNameIndex = frame[4];
            var imageFile = imageFiles[imageNameIndex];

            var x = frame[0], y = frame[1], w = frame[2], h = frame[3], xr = Math.floor(frame[5]), yr = Math.floor(frame[6]);

            var wTarget = Math.max(w - xr, xr) * 2 + 50;
            var hTarget = Math.max(h - yr, yr) * 2 + 50;

            console.log("Extracting image ", animationName, " from ", imageFile, " at ", x, y, w, h, xr, yr );
            (new Jimp(wTarget, hTarget))
                .blit(originalImage, wTarget / 2 - xr, hTarget / 2 - yr, x, y, w, h)
                .write(animationName + ".png");
        }
    }).catch(function (err) {
        console.error(err);
    });
};
/*
"victoryparticles/victory_confetti_22.png":
{
	"frame": {"x":957,"y":420,"w":33,"h":34},
	"rotated": false,
	"trimmed": true,
	"spriteSourceSize": {"x":25,"y":24,"w":33,"h":34},
	"sourceSize": {"w":82,"h":82}
}
*/
function pixiSplitSheet(json) {
    var frames = json.frames;
    var animations = json.animations;
    // var imageFiles = Object.keys(frames);
    // console.log("imageFiles", imageFiles);

    Jimp.read(json.meta.image).then( (originalImage) => {
        for (let imageName in frames) {
            const imageDef = frames[imageName];
            const frame = imageDef.frame;
            var imageFile = imageName;

            // var animation = animations[animationName];
            // var frameIndex = animation.frames[0];
            // var frame = frames[frameIndex];
            var x = frame.x, y = frame.y, w = frame.w, h = frame.h;//, xr = Math.floor(frame[5]), yr = Math.floor(frame[6]);

            const trimmed = imageDef.trimmed;
            const spriteSourceSize = imageDef.spriteSourceSize;
            const sourceSize = imageDef.sourceSize;

            var wTarget = sourceSize.w;
            // var wTarget = Math.max(w - xr, xr) * 2 + 50;
            // var hTarget = Math.max(h - yr, yr) * 2 + 50;
            var hTarget = sourceSize.h;

            console.log("Extracting image ", imageName, " from ", imageFile, " at ", x, y, w, h, sourceSize.w, sourceSize.h);
            (new Jimp(wTarget, hTarget))
                .blit(originalImage, spriteSourceSize.x, spriteSourceSize.y, x, y, w, h)
                .write(imageName);
        }
    }).catch(function (err) {
        console.error(err);
    });
};

shelljs.config.verbose = true;

var userArgs = process.argv.slice(2);
if (userArgs.length === 0) {
    console.log("Usage: splitsheet <json_file> <json_format>");
    console.log("Supported formats: createjs | pixijs");
    console.log("I.e.: splitsheet spritesheet.json pixijs");
    process.exit(2);
}

var jsonFileName = userArgs[0];
var format = userArgs[1] || "createjs";
const splitterDictionary = {
    "createjs": createjsSplitSheet,
    "pixijs"  : pixiSplitSheet
}

var json = jsonfile.readFileSync(jsonFileName);
splitterDictionary[format](json);
