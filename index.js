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
                ...sortedUsers.map(([id, data], index) => ({ name: `${index + 1}. <@${id}>`, value: `💰 ${data.balance}`, inline: true }))
            )
            .setFooter({ text: 'Keep earning to climb the ranks!' });

        message.channel.send({ embeds: [leaderboardEmbed] });
    }

    // Respond to &8ball command
    if (message.content.startsWith('&8ball')) {
        const responses = [
            "Yes.",
            "No.",
            "Maybe.",
            "Ask again later.",
            "Definitely!",
            "Absolutely not."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const question = message.content.split(' ').slice(1).join(' ');
        message.channel.send(`🎱 **${question}** - ${randomResponse}`);
    }

    // Respond to &setnickname command
    if (message.content.startsWith('&setnickname')) {
        const newNickname = message.content.split(' ').slice(1).join(' ');
        message.member.setNickname(newNickname)
            .then(() => message.channel.send(`Your nickname has been changed to: ${newNickname}`))
            .catch(err => message.channel.send('I cannot change your nickname.'));
    }

    // Respond to &serverinfo command
    if (message.content === '&serverinfo') {
        const serverEmbed = new EmbedBuilder()
            .setColor('#00ff99')
            .setTitle('Server Info')
            .addFields(
                { name: 'Server Name', value: message.guild.name, inline: true },
                { name: 'Total Members', value: message.guild.memberCount.toString(), inline: true },
                { name: 'Server Creation Date', value: message.guild.createdAt.toDateString(), inline: true }
            )
            .setFooter({ text: 'Server details fetched!' });

        message.channel.send({ embeds: [serverEmbed] });
    }

    // Respond to &poll command
    if (message.content.startsWith('&poll')) {
        const pollQuestion = message.content.split(' ').slice(1).join(' ');
        message.channel.send(`Poll: **${pollQuestion}**\nReact with 👍 for Yes and 👎 for No!`);
    }

    // Respond to &kick command (Admin only)
    if (message.content.startsWith('&kick')) {
        if (!message.member.permissions.has('KICK_MEMBERS')) return message.reply("You don't have permission to kick members.");
        const userToKick = message.mentions.members.first();
        if (userToKick) {
            userToKick.kick()
                .then(() => message.channel.send(`Successfully kicked ${userToKick.user.tag}`))
                .catch(err => message.channel.send('I cannot kick this member.'));
        } else {
            message.reply('Please mention a valid user to kick.');
        }
    }

    // Respond to &ban command (Admin only)
    if (message.content.startsWith('&ban')) {
        if (!message.member.permissions.has('BAN_MEMBERS')) return message.reply("You don't have permission to ban members.");
        const userToBan = message.mentions.members.first();
        if (userToBan) {
            userToBan.ban()
                .then(() => message.channel.send(`Successfully banned ${userToBan.user.tag}`))
                .catch(err => message.channel.send('I cannot ban this member.'));
        } else {
            message.reply('Please mention a valid user to ban.');
        }
    }

    // Respond to &warn command (Mod only)
    if (message.content.startsWith('&warn')) {
        if (!message.member.permissions.has('MANAGE_MESSAGES')) return message.reply("You don't have permission to warn members.");
        const [_, userMention, ...reasonArray] = message.content.split(' ');
        const reason = reasonArray.join(' ') || 'No reason provided.';
        const userToWarn = message.mentions.members.first();
        if (userToWarn) {
            message.channel.send(`🚨 ${userToWarn.user.tag} has been warned for: ${reason}`);
        } else {
            message.reply('Please mention a valid user to warn.');
        }
    }

    // Respond to &mute command (Mod only)
    if (message.content.startsWith('&mute')) {
        if (!message.member.permissions.has('MANAGE_ROLES')) return message.reply("You don't have permission to mute members.");
        const userToMute = message.mentions.members.first();
        if (userToMute) {
            const muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');
            if (!muteRole) {
                message.reply('Mute role does not exist. Please create a role called "Muted".');
                return;
            }
            userToMute.roles.add(muteRole)
                .then(() => message.channel.send(`🔇 ${userToMute.user.tag} has been muted.`))
                .catch(err => message.channel.send('I cannot mute this member.'));
        } else {
            message.reply('Please mention a valid user to mute.');
        }
    }

    // Respond to &unmute command (Mod only)
    if (message.content.startsWith('&unmute')) {
        if (!message.member.permissions.has('MANAGE_ROLES')) return message.reply("You don't have permission to unmute members.");
        const userToUnmute = message.mentions.members.first();
        if (userToUnmute) {
            const muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');
            userToUnmute.roles.remove(muteRole)
                .then(() => message.channel.send(`🔊 ${userToUnmute.user.tag} has been unmuted.`))
                .catch(err => message.channel.send('I cannot unmute this member.'));
        } else {
            message.reply('Please mention a valid user to unmute.');
        }
    }

    // Owner commands
    if (message.content.startsWith('&owner')) {
        if (message.author.id !== OWNER_ID) return message.reply("You don't have permission to use owner commands.");

        const args = message.content.split(' ').slice(1);
        const command = args[0];

        if (command === 'balance') {
            const userToCheck = message.mentions.users.first();
            if (userToCheck) {
                message.channel.send(`💰 ${userToCheck.tag}'s balance is: 💰 ${economy[userToCheck.id].balance}`);
            } else {
                message.reply('Please mention a valid user to check their balance.');
            }
        } else if (command === 'reset') {
            const userToReset = message.mentions.users.first();
            if (userToReset) {
                economy[userToReset.id].balance = 0;
                message.channel.send(`💰 ${userToReset.tag}'s balance has been reset to 0.`);
            } else {
                message.reply('Please mention a valid user to reset their balance.');
            }
        } else if (command === 'serverstats') {
            const totalMembers = message.guild.memberCount;
            const serverStatsEmbed = new EmbedBuilder()
                .setColor('#8A2BE2')
                .setTitle('Server Statistics')
                .addFields(
                    { name: 'Total Members', value: totalMembers.toString(), inline: true },
                    { name: 'Online Members', value: message.guild.members.cache.filter(m => m.presence?.status === 'online').size.toString(), inline: true },
                    { name: 'Created On', value: message.guild.createdAt.toDateString(), inline: true }
                );

            message.channel.send({ embeds: [serverStatsEmbed] });
        } else if (command === 'shutdown') {
            message.channel.send('Shutting down...').then(() => client.destroy());
        } else if (command === 'update') {
            const userToUpdate = message.mentions.users.first();
            const newBalance = parseInt(args[2]);
            if (userToUpdate && !isNaN(newBalance)) {
                economy[userToUpdate.id].balance = newBalance;
                message.channel.send(`💰 ${userToUpdate.tag}'s balance has been updated to: 💰 ${newBalance}`);
            } else {
                message.reply('Please mention a valid user and provide a new balance.');
            }
        } else {
            message.reply('Unknown owner command. Use &owner help for a list of commands.');
        }
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'help_close') {
        await interaction.reply({ content: 'Help menu closed.', ephemeral: true });
        const message = await interaction.fetchReply();
        message.delete();
    }

    // Add more button interactions as needed...
});

client.login(process.env.DISCORD_TOKEN);
