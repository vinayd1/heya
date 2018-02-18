var emoji = require('node-emoji');

function searchEmoji(query) {
    return emoji.search(query);
}

module.exports = {
  searchEmoji
};