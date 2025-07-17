const Sentiment = require('sentiment');
const sentiment = new Sentiment();

function analyzeMood(sentence) {
  if (!sentence || typeof sentence !== 'string') {
    return 'neutral'; // Default fallback
  }

  const result = sentiment.analyze(sentence);
  const score = result.score;

  if (score > 1) return 'positive';
  if (score < -1) return 'negative';
  return 'neutral';
}

module.exports = analyzeMood;

