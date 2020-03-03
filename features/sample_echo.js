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
      if (!message.text.replace("<at>giff</at>", "").trim().match(/^[0-9a-zA-Z _!?"',]{1,25}$/)) {
        bot.reply(message, "Invalid request. Request must be alphanumeric string of no more than 25 characters.");
      } else {
        var resultLimit = 20;
        var request = require('request');
        var jsonObject;
        var rand = Math.floor((Math.random() * 10) + 1);
        var requestUrl = 'http://api.giphy.com/v1/gifs/search?q=' + message.text.replace('<at>giff</at>', '').trim().replace(/ /gi, '-') + '&api_key=POIdbFm2h7zwQBXrQsoY3u14wP3x5Qj6&rating=pg&offset=' + rand + '&limit=' + resultLimit;
        await new Promise(resolve => request.get(requestUrl, {}, async(error, response, body) => {
          console.log('Request URL: ' + requestUrl);
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
            }
          }
            
        bot.reply(message, reply);
      }
    });
}