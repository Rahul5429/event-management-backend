// Redis completely disabled — placeholder to prevent errors
function initRedis() {
  console.log('⚠️ Redis disabled: caching and queues are turned off.');
  return null;
}

module.exports = { initRedis };
