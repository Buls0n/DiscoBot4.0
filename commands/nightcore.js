// Final nightcore.js for Railway deployment with play-dl
const { getQueue } = require('../utils/musicUtils');

module.exports = {
  name: 'nightcore',
  description: 'Toggles the nightcore effect (increased pitch/speed)',
  execute(message, args) {
    const queue = getQueue(message.client, message.guild.id);
    
    if (!queue.connection) {
      return message.reply('I\'m not currently playing anything!');
    }
    
    // Toggle nightcore effect
    queue.nightcoreEnabled = !queue.nightcoreEnabled;
    
    // Notify user of the change
    if (queue.nightcoreEnabled) {
      message.channel.send({
        embeds: [{
          color: 0xf1c40f,
          title: '🎛️ Nightcore Effect',
          description: 'Nightcore effect has been **enabled**!',
          footer: { text: 'Effect will apply to the next song' }
        }]
      });
    } else {
      message.channel.send({
        embeds: [{
          color: 0xf1c40f,
          title: '🎛️ Nightcore Effect',
          description: 'Nightcore effect has been **disabled**!',
          footer: { text: 'Effect will apply to the next song' }
        }]
      });
    }
  }
};
