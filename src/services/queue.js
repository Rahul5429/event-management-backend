// Queue system disabled since Redis is not used
async function initQueues() {
  console.log('⚠️ Queues disabled: Redis not configured.');
}

const emailQueue = {
  add: async () => {
    console.log('⚠️ Email queue skipped (Redis disabled)');
  }
};

module.exports = { initQueues, emailQueue };
