var request = require('co-request');
var cheerio = require('cheerio');

var j = request.jar();
var ageCheck = request.cookie('birthtime=-1000000000');
j.setCookie(ageCheck, 'http://store.steampowered.com');
request = request.defaults({jar:j});
birthtime=-2145887999;

module.exports = function(notifier) {

  var SteamStore = {};

  var getGameInfo = function(dom) {
    var result = {};

    result.title = dom('.apphub_AppName').text().trim();
    var firstPrice = dom('.game_area_purchase_game').first();

    result.originalPrice = firstPrice.find('.discount_original_price').text().trim();
    result.currentPrice = firstPrice.find('.discount_final_price, .game_purchase_price').text().trim();

    result.image = dom('meta[itemprop="image"]').first().attr('content');
    result.reviews = dom('.game_review_summary').first().text().trim();

    return result;
  };

  SteamStore.fetchGameInfo = function *(gameid) {
    var url = 'http://store.steampowered.com/app/' + parseInt(gameid);

    var response = yield request(url);
    if (response.statusCode == 200 && response.body) {
        var dom = cheerio.load(response.body);
        var gameInfo = getGameInfo(dom);
        gameInfo.url = url;
        
        if(gameInfo.title) {
          yield notifier.sendTemplate('game', gameInfo);
        }
    }
  };

  return SteamStore;
}