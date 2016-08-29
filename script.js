'use strict';

const _ = require('lodash');
const Script = require('smooch-bot').Script;

const scriptRules = require('./script.json');

module.exports = new Script({
    processing: {
        //prompt: (bot) => bot.say('Beep boop...'),
        receive: () => 'processing'
    },

    start: {
        receive: (bot) => {
            return bot.say('So you want to learn about Eduardo? Just say HELLO to get started.')
                .then(() => 'speak');
        }
    },

    speak: {
        receive: (bot, message) => {

            let upperText = message.text.trim().toUpperCase();

            function updateSilent() {
                switch (upperText) {
                    case "CONNECT ME":
                        return bot.setProp("silent", true);
                    case "DISCONNECT":
                        return bot.setProp("silent", false);
                    default:
                        return Promise.resolve();
                }
            }

            function getSilent() {
                return bot.getProp("silent");
            }

            function processMessage(isSilent) {
                if (isSilent) {
                    return Promise.resolve("speak");
                }

                if (!_.has(scriptRules, upperText)) {
                    return bot.say(`I didn't understand that.`).then(() => 'speak');
                }

                var response = scriptRules[upperText]['message'];
                var response_type = scriptRules[upperText]['type'];
                //var lines = response.split(/(<img src=\'[^>]*\'\/>)/);

                var p = Promise.resolve();
                /*
                _.each(lines, function(line) {
                    line = line.trim();
                    if (!line.startsWith("<")) {
                        p = p.then(function() {
                            return bot.say(line);
                        });
                    } else {
                        // p = p.then(function() {
                        //     var start = line.indexOf("'") + 1;
                        //     var end = line.lastIndexOf("'");
                        //     var imageFile = line.substring(start, end);
                        //     return bot.sendImage(imageFile);
                        // });
                    }
                })
                */
                var line = response.trim();
                switch (response_type) {
                  default:
                  case 'call':

                    var request_call = scriptRules[upperText]['call'];

                    var httpcall = require("https");

                    var options = {
                      host: 'maker.ifttt.com',
                      port: 80,
                      path: '/trigger/' + request_call + '/with/key/d6ylu2gKHAUiSjcX9_1qCw',
                      method: 'POST'
                    };

                    req = httpcall.request(options, function(res) {
                      p = p.then(function() {
                          return bot.say(line);
                      });
                    });
                    break;
                  case 'text':
                    p = p.then(function() {
                        return bot.say(line);
                    });
                    break;

                  case 'image':
                    p = p.then(function() {
                        return bot.sendImage(line);
                    });
                    break;
                }


                return p.then(() => 'speak');
            }

            return updateSilent()
                .then(getSilent)
                .then(processMessage);
        }
    }
});
