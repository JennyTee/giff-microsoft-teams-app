/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

module.exports = function(controller) {

    // testing method
    // controller.hears('sample','message,direct_message', async(bot, message) => {
    //     await bot.reply(message, 'I heard a sample message.');
    // });

    // when tagged, return a gif using a provided search term
    controller.on('message, direct_message', async(bot, message) => {
      if (!message.text.replace("<at>giff</at>", "").trim().match(/^[0-9a-zA-Z _!?"',]{1,50}$/)) {
        bot.reply(message, "Invalid request. Request must be alphanumeric string of no more than 50 characters.");
      }
      else if (message.text.replace("<at>giff</at>", "").trim() == "surprised") {
        console.log('***Request received: "surprised".***')
        returnCustomImage(message, bot);
        console.log('***Request received: "rick roll".***')
      } else if (message.text.replace("<at>giff</at>", "").trim() == "rick roll") {
        rickRoll(message, bot);
      } else if (message.text.replace("<at>giff</at>", "").trim() == "tiger king potato") {
        console.log('***Request received: "tiger king potato".***')
        returnCustomImage(message, bot);
      } 
      else {
        console.log('***Request received.***')
        // rickRoll(message, bot);
        var resultLimit = 20;
        var request = require('request');
        var jsonObject;
        var rand = Math.floor((Math.random() * 10) + 1);
        var requestUrl = 'http://api.giphy.com/v1/gifs/search?q=' + message.text.replace('<at>giff</at>', '').trim().replace(/ /gi, '-') + '&api_key=POIdbFm2h7zwQBXrQsoY3u14wP3x5Qj6&rating=pg&offset=' + rand + '&limit=' + resultLimit;
        console.log('Request URL: ' + requestUrl);
        await new Promise(resolve => request.get(requestUrl, {}, async(error, response, body) => {
          console.log('Received response from Giphy API.');
          jsonObject = JSON.parse(body);
          resolve(jsonObject);
        }));
        
        var reply;
        if (jsonObject == 'undefined' || jsonObject.data == 'undefined' || jsonObject.data[0] == 'undefined'|| jsonObject == undefined || jsonObject.data == undefined || jsonObject.data[0] == undefined) 
          {
            reply = "No gifs found, try again.";
          } else {
            for (var i = 0; i < 20; i++) {
              console.log('Looking at index ' + i + ' image.');
              if (jsonObject.data[i] != 'undefined' && jsonObject.data[i] != undefined) {
                var aspectRatio = jsonObject.data[i].images.fixed_height.width / jsonObject.data[i].images.fixed_height.height;
                console.log('Index ' + i + ' image aspect ratio is: ' + aspectRatio);
                if (aspectRatio >= 1.5 && aspectRatio <= 2.34) {
                  var gifUrl = jsonObject.data[i].images.fixed_height.url;
                  console.log('Accepatable aspect ratio found. Breaking out of loop. GIF rating is ' + jsonObject.data[i].rating);
                  break;
                }
              }
            }

            if (gifUrl == undefined) {
              reply = "No gifs found with an acceptable aspect ratio to display in Teams. Try again!"
            } else {
              reply = buildHeroCard(reply, gifUrl);
            }
          }
            
        bot.reply(message, reply);
      }
    });
}

function buildHeroCard(reply, gifUrl) {
  reply = {
    "attachments": [
      {
        "contentType": "application/vnd.microsoft.card.hero",
        "content": {
          "text": "Powered by GIPHY",
          "images": [
            {
              "url": gifUrl,
              "alt": "your gif"
            }
          ],
        }
      }
    ]
  };
  return reply;
}

function returnCustomImage(message, bot) {
  var searchString = message.text.replace("<at>giff</at>", "").trim();
  console.log("message received: " + searchString);
  const fs = require('fs');
  var imageType = 'png';
  const imageData = fs.readFileSync(`/gifbot/images/${searchString}.png`);
  const base64Image = Buffer.from(imageData).toString('base64');
  var response = {
  "attachments": [
      {
        "contentType": "application/vnd.microsoft.card.hero",
        "content": {
          "images": [
            {
              "url": `data:image/${imageType};base64,${base64Image}`,
              "alt": "your custom image"
            }
          ],
        }
      }
    ]
  };
  bot.reply(message, response);
}

function rickRoll(message, bot) {
  console.log("you've been rick rolled");
  var response = {
    "attachments": [
      {
        "contentType": "application/vnd.microsoft.card.hero",
        "content": {
          "text": "You've been rickrolled....happy April Fool's Day!",
          "images": [
            {
              "url": "https://media.giphy.com/media/lgcUUCXgC8mEo/giphy.gif",
              "alt": "rickrolled"
            }
          ],
        }
      }
    ]
  };
  bot.reply(message, response);
}
