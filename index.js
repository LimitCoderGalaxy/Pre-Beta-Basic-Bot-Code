require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const CHANNEL_ID = process.env.CHANNEL_ID; // Get the channel ID from environment variables

// Economy data storage
const economy = {}; // Stores user balances
let startTime; // To track when the bot started

const facts = [
    "Did you know? Honey never spoils!",
    "Octopuses have three hearts.",
    "Bananas are berries, but strawberries aren't!",
    "A group of flamingos is called a 'flamboyance'.",
    "There are more stars in the universe than grains of sand on all the Earth's beaches."
];

const quotes = [
    "Believe you can and you're halfway there. - Theodore Roosevelt",
    "Act as if what you do makes a difference. It does. - William James",
    "Success is not the key to happiness. Happiness is the key to success. - Albert Schweitzer",
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Life is what happens when you're busy making other plans. - John Lennon"
];

// Owner ID (replace with your actual Discord user ID)
const OWNER_ID = 'YOUR_DISCORD_USER_ID'; // Change this to your Discord user ID

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    startTime = Date.now(); // Record the bot's start time

    // Send a periodic message every 10 minutes
    setInterval(() => {
        const channel = client.channels.cache.get(CHANNEL_ID);
        if (channel) {
            channel.send("Don't forget to check in and say hi!");
        }
    }, 10 * 60 * 1000); // 10 minutes in milliseconds
});

client.on('messageCreate', (message) => {
    if (message.author.bot) return; // Ignore bot messages

    const userId = message.author.id;

    // Initialize user's economy data if it doesn't exist
    if (!economy[userId]) {
        economy[userId] = { balance: 0 };
    }

    // Respond to &help command
    if (message.content === '&help') {
        const helpEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Help Menu')
            .setDescription('Here are the commands you can use:')
            .addFields(
                { name: 'General Commands', value: '`&hello`\n`&joke`\n`&fact`\n`&quote`\n`&ping`', inline: true },
                { name: 'Economy Commands', value: '`&balance`\n`&daily`\n`&work`\n`&guess <number>`\n`&leaderboard`', inline: true },
                { name: 'Member Commands', value: '`&setnickname <new_nickname>`\n`&serverinfo`\n`&poll <question>`\n`&avatar`\n`&8ball <question>`', inline: true },
                { name: 'Fun Commands', value: '`&rps <rock/paper/scissors>`\n`&cat`\n`&dog`', inline: true },
                { name: 'Mod Commands', value: '`&kick <user>`\n`&ban <user>`\n`&warn <user> <reason>`\n`&mute <user>`\n`&unmute <user>`', inline: true },
                { name: 'Owner Commands', value: '`&owner balance <user>`\n`&owner reset <user>`\n`&owner serverstats`\n`&owner shutdown`\n`&owner update <user> <new_balance>`', inline: true },
                { name: 'Usage Tips', value: 'Use the commands above to interact with me!' }
            )
            .setFooter({ text: 'Need further assistance? Just ask!' });

        const helpButtonRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('help_close')
                    .setLabel('Close Help')
                    .setStyle(ButtonStyle.Danger)
            );

        message.channel.send({ embeds: [helpEmbed], components: [helpButtonRow] });
        return;
    }

    // Respond to &ping command
    if (message.content === '&ping') {
        const latency = Date.now() - startTime; // Calculate latency
        const apiLatency = Math.round(client.ws.ping); // Get API ping

        const uptime = Math.floor((Date.now() - startTime) / 1000); // Uptime in seconds
        const uptimeString = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s`; // Format uptime

        const pingEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('Bot Status')
            .addFields(
                { name: 'Latency', value: `🏓 Latency: ${latency}ms`, inline: true },
                { name: 'API Ping', value: `🌐 API Ping: ${apiLatency}ms`, inline: true },
                { name: 'Uptime', value: `⏳ Uptime: ${uptimeString}`, inline: true }
            )
            .setFooter({ text: 'I am here to assist you!' });

        message.channel.send({ embeds: [pingEmbed] });
        return;
    }

    // Respond to &hello command
    if (message.content === '&hello') {
        message.channel.send('Hello! How can I help you today?');
    }

    // Respond to &joke command
    if (message.content === '&joke') {
        message.channel.send('Why did the scarecrow win an award? Because he was outstanding in his field!');
    }

    // Respond to &fact command
    if (message.content === '&fact') {
        const randomFact = facts[Math.floor(Math.random() * facts.length)];
        message.channel.send(randomFact);
    }

    // Respond to &quote command
    if (message.content === '&quote') {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        message.channel.send(randomQuote);
    }

    // Respond to &balance command
    if (message.content === '&balance') {
        message.channel.send(`Your balance is: 💰 ${economy[userId].balance}`);
    }

    // Respond to &daily command
    if (message.content === '&daily') {
        const dailyReward = 100; // Reward amount for daily check-in
        economy[userId].balance += dailyReward;
        message.channel.send(`You've claimed your daily reward of 💰 ${dailyReward}! Your new balance is: 💰 ${economy[userId].balance}`);
    }

    // Respond to &work command
    if (message.content === '&work') {
        const earnings = Math.floor(Math.random() * 100) + 50; // Random earnings between 50 and 150

        // Create an embed message for the work result
        const workEmbed = new EmbedBuilder()
            .setColor('#4CAF50')
            .setTitle('Work Results')
            .setDescription(`You worked hard and earned 💰 ${earnings}!`)
            .addFields(
                { name: 'New Balance', value: `💰 ${economy[userId].balance + earnings}`, inline: true }
            )
            .setFooter({ text: 'Keep working to earn more!' });

        economy[userId].balance += earnings; // Update user balance
        message.channel.send({ embeds: [workEmbed] });
    }

    // Respond to &guess command
    if (message.content.startsWith('&guess')) {
        const number = Math.floor(Math.random() * 100) + 1; // Generate a number between 1 and 100
        message.channel.send("I've picked a number between 1 and 100! Try to guess it by typing &guess <your_number>");

        const filter = m => m.author.id === message.author.id && m.content.startsWith('&guess');
        const collector = message.channel.createMessageCollector({ filter, time: 30000 }); // 30 seconds to guess

        collector.on('collect', m => {
            const guess = parseInt(m.content.split(' ')[1]);
            if (guess === number) {
                message.channel.send(`Congratulations <@${m.author.id}>! You've guessed the right number: ${number}.`);
                collector.stop();
            } else {
                message.channel.send(`Wrong guess! Try again.`);
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                message.channel.send("Time's up! The number was: " + number);
            }
        });
    }

    // Respond to &leaderboard command
    if (message.content === '&leaderboard') {
        const sortedUsers = Object.entries(economy).sort(([, a], [, b]) => b.balance - a.balance).slice(0, 10);
        const leaderboardEmbed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🏆 Leaderboard 🏆')
            .setDescription('Top 10 users by balance:')
            .addFields(
                ...sortedUsers.map(([id, { balance }], index) => ({
                    name: `#${index + 1} <@${id}>`,
                    value: `💰 ${balance}`,
                    inline: true
                }))
            );

        message.channel.send({ embeds: [leaderboardEmbed] });
    }

    // Respond to &setnickname command
    if (message.content.startsWith('&setnickname')) {
        const nickname = message.content.split(' ').slice(1).join(' ');
        if (!nickname) return message.reply('Please provide a new nickname!');

        message.member.setNickname(nickname)
            .then(() => message.reply(`Your nickname has been changed to **${nickname}**`))
            .catch(err => message.reply('I cannot change your nickname.'));
    }

    // Respond to &serverinfo command
    if (message.content === '&serverinfo') {
        const serverInfoEmbed = new EmbedBuilder()
            .setColor('#00BFFF')
            .setTitle('Server Info')
            .addFields(
                { name: 'Server Name', value: message.guild.name, inline: true },
                { name: 'Total Members', value: message.guild.memberCount.toString(), inline: true },
                { name: 'Created At', value: message.guild.createdAt.toDateString(), inline: true },
                { name: 'Region', value: message.guild.region, inline: true },
                { name: 'Owner', value: `<@${message.guild.ownerId}>`, inline: true }
            );

        message.channel.send({ embeds: [serverInfoEmbed] });
    }

    // Respond to &poll command
    if (message.content.startsWith('&poll')) {
        const pollQuestion = message.content.split(' ').slice(1).join(' ');
        if (!pollQuestion) return message.reply('Please provide a question for the poll!');

        message.channel.send(`📊 **Poll:** ${pollQuestion}`).then(pollMessage => {
            pollMessage.react('👍'); // Add thumbs up reaction
            pollMessage.react('👎'); // Add thumbs down reaction
        });
    }

    // Respond to &avatar command
    if (message.content === '&avatar') {
        message.channel.send(`Your avatar: ${message.author.displayAvatarURL({ dynamic: true })}`);
    }

    // Respond to &8ball command
    if (message.content.startsWith('&8ball')) {
        const answers = [
            "Yes, definitely.",
            "It is certain.",
            "Don't count on it.",
            "Yes, in due time.",
            "My sources say no.",
            "Outlook not so good."
        ];
        const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
        message.channel.send(`🎱 ${randomAnswer}`);
    }

    // Respond to &rps command
    if (message.content.startsWith('&rps')) {
        const userChoice = message.content.split(' ')[1].toLowerCase();
        const choices = ['rock', 'paper', 'scissors'];
        const botChoice = choices[Math.floor(Math.random() * choices.length)];

        if (!choices.includes(userChoice)) return message.reply('Please choose rock, paper, or scissors!');

        const result = (userChoice === botChoice) ? "It's a tie!" :
            (userChoice === 'rock' && botChoice === 'scissors') || 
            (userChoice === 'paper' && botChoice === 'rock') || 
            (userChoice === 'scissors' && botChoice === 'paper') ? "You win!" : "You lose!";

        message.channel.send(`You chose: ${userChoice}\nI chose: ${botChoice}\n${result}`);
    }

    // Moderation commands for server admins
    if (message.member.permissions.has("KICK_MEMBERS") && message.content.startsWith('&kick')) {
        const member = message.mentions.members.first();
        if (!member) return message.reply('Please mention a user to kick.');

        member.kick()
            .then(() => message.reply(`Kicked ${member.displayName}`))
            .catch(err => message.reply('I was unable to kick that user.'));
    }

    if (message.member.permissions.has("BAN_MEMBERS") && message.content.startsWith('&ban')) {
        const member = message.mentions.members.first();
        if (!member) return message.reply('Please mention a user to ban.');

        member.ban()
            .then(() => message.reply(`Banned ${member.displayName}`))
            .catch(err => message.reply('I was unable to ban that user.'));
    }

    // Owner commands for the bot owner
    if (message.author.id === OWNER_ID) {
        // Respond to &owner balance command
        if (message.content.startsWith('&owner balance')) {
            const userId = message.content.split(' ')[2];
            if (!userId || !economy[userId]) return message.reply('Please provide a valid user ID.');

            message.channel.send(`User <@${userId}> has a balance of 💰 ${economy[userId].balance}`);
        }

        // Respond to &owner reset command
        if (message.content.startsWith('&owner reset')) {
            const userId = message.content.split(' ')[2];
            if (!userId || !economy[userId]) return message.reply('Please provide a valid user ID.');

            economy[userId].balance = 0;
            message.channel.send(`Reset the balance for <@${userId}> to 💰 0.`);
        }

        // Respond to &owner serverstats command
        if (message.content === '&owner serverstats') {
            const serverStatsEmbed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('Server Stats')
                .addFields(
                    { name: 'Total Members', value: message.guild.memberCount.toString(), inline: true },
                    { name: 'Server Name', value: message.guild.name, inline: true },
                    { name: 'Owner', value: `<@${message.guild.ownerId}>`, inline: true },
                );

            message.channel.send({ embeds: [serverStatsEmbed] });
        }

        // Respond to &owner shutdown command
        if (message.content === '&owner shutdown') {
            message.channel.send('Shutting down the bot...')
                .then(() => {
                    client.destroy();
                    process.exit(0);
                });
        }

        // Respond to &owner update command
        if (message.content.startsWith('&owner update')) {
            const userId = message.content.split(' ')[2];
            const newBalance = parseInt(message.content.split(' ')[3]);
            if (!userId || isNaN(newBalance)) return message.reply('Please provide a valid user ID and new balance.');

            economy[userId].balance = newBalance;
            message.channel.send(`Updated <@${userId}>'s balance to 💰 ${newBalance}.`);
        }
    }

    // Music commands
    if (message.content.startsWith('&play')) {
        const url = message.content.split(' ')[1];
        const ytdl = require('ytdl-core');

        if (!ytdl.validateURL(url)) {
            return message.reply('Please provide a valid YouTube URL.');
        }

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply('You need to be in a voice channel to play music!');
        }

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
        });

        const resource = createAudioResource(ytdl(url, { filter: 'audioonly' }));
        player.play(resource);
        connection.subscribe(player);

        player.on('error', error => {
            console.error(`Error: ${error.message}`);
            message.reply('An error occurred while trying to play the music.');
        });

        player.on('idle', () => {
            connection.disconnect();
        });

        message.channel.send(`Now playing: ${url}`);
    }

    if (message.content === '&stop') {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply('You need to be in a voice channel to stop music!');
        }
        player.stop();
        message.channel.send('Music stopped.');
    }

    // Trivia command
    if (message.content === '&trivia') {
        const triviaQuestions = [
            { question: "What is the capital of France?", answer: "paris" },
            { question: "What is 2 + 2?", answer: "4" },
            { question: "What is the largest planet in our solar system?", answer: "jupiter" },
        ];

        const trivia = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];
        message.channel.send(trivia.question);

        const filter = m => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector({ filter, time: 30000 });

        collector.on('collect', m => {
            if (m.content.toLowerCase() === trivia.answer) {
                message.channel.send(`Correct! 🎉`);
                collector.stop();
            } else {
                message.channel.send(`Wrong answer! Try again.`);
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                message.channel.send(`Time's up! The correct answer was: ${trivia.answer}`);
            }
        });
    }
});

client.login(process.env.TOKEN);