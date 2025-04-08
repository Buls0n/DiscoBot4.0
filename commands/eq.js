const { getQueue } = require('../utils/musicUtils');
const { applyEqualizerSettings } = require('../utils/audioEffects');

module.exports = {
  name: 'eq',
  description: 'Opens a table or interface where users can input custom equalizer settings',
  execute(message, args) {
    const queue = getQueue(message.client, message.guild.id);
    
    if (!queue.connection) {
      return message.reply('There is no song currently playing!');
    }
    
    if (!message.member.voice.channel) {
      return message.reply('You need to be in a voice channel to use this command!');
    }
    
    if (!args.length) {
      // Display current EQ settings with rich embed
      const embed = {
        color: 0x3498db,
        title: '🎚️ Equalizer Settings',
        description: 'Current equalizer configuration:',
        fields: [
          { name: 'Bass', value: `${queue.equalizer.bass}`, inline: true },
          { name: 'Mid', value: `${queue.equalizer.mid}`, inline: true },
          { name: 'Treble', value: `${queue.equalizer.treble}`, inline: true }
        ],
        footer: { text: 'To adjust settings, use !eq <bass> <mid> <treble> (values from -10 to 10)' }
      };
      
      if (queue.currentSong && queue.currentSong.thumbnail) {
        embed.thumbnail = { url: queue.currentSong.thumbnail };
      }
      
      return message.channel.send({ embeds: [embed] });
    }
    
    // Parse arguments
    if (args.length !== 3) {
      return message.reply('Please provide all three values: bass, mid, and treble.');
    }
    
    const bass = parseInt(args[0]);
    const mid = parseInt(args[1]);
    const treble = parseInt(args[2]);
    
    // Validate input
    if (isNaN(bass) || isNaN(mid) || isNaN(treble)) {
      return message.reply('All values must be numbers.');
    }
    
    if (bass < -10 || bass > 10 || mid < -10 || mid > 10 || treble < -10 || treble > 10) {
      return message.reply('All values must be between -10 and 10.');
    }
    
    // Update equalizer settings
    queue.equalizer.bass = bass;
    queue.equalizer.mid = mid;
    queue.equalizer.treble = treble;
    
    // Apply equalizer settings (placeholder in this implementation)
    applyEqualizerSettings(null, queue.equalizer);
    
    // Create rich embed for updated settings
    const embed = {
      color: 0x3498db,
      title: '🎚️ Equalizer Updated',
      description: 'New equalizer configuration:',
      fields: [
        { name: 'Bass', value: `${bass}`, inline: true },
        { name: 'Mid', value: `${mid}`, inline: true },
        { name: 'Treble', value: `${treble}`, inline: true }
      ],
      footer: { text: `Updated by ${message.author.tag}` }
    };
    
    if (queue.currentSong && queue.currentSong.thumbnail) {
      embed.thumbnail = { url: queue.currentSong.thumbnail };
    }
    
    message.channel.send({ embeds: [embed] });
    
    // Note: For the effect to actually apply to the current song,
    // we would need to restart playback with the new effect settings
    message.channel.send('*Note: The settings will apply to the next song or when the current song is restarted.*');
  }
};
