const { Telegraf, Markup } = require('telegraf');
const express = require('express');
const path = require('path');

// 🔐 ያንተ የቦት ቶክን እና የጨዋታ ሊንክ እዚህ ገብቷል
const BOT_TOKEN = '8535620578:AAGi0ATgfGz-L4ylntTa6fhizuvfDL8wi0s'; 
const WEB_APP_URL = 'https://mathiasbingo-on-telegram.netlify.app'; 

const bot = new Telegraf(BOT_TOKEN);
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const usersDatabase = {};

function getUser(userId, username, firstName) {
    if (!usersDatabase[userId]) {
        usersDatabase[userId] = {
            id: userId,
            username: username || 'የሌለው',
            name: firstName || 'ተጫዋች',
            wallet: 100.00, 
            gameHistory: [],
            transactions: []
        };
    }
    return usersDatabase[userId];
}

// 1. ቦቱ ሲጀመር (/start)
bot.start((ctx) => {
    const user = getUser(ctx.from.id, ctx.from.username, ctx.from.first_name);
    ctx.reply(
        `እንኳን ወደ ሁሌ ቢንጎ (Hule Bingo) በደህና መጡ ${user.name}! 🎮\nChoose an option below.`,
        Markup.inlineKeyboard([
            [Markup.button.webApp('Play 🎮', WEB_APP_URL), Markup.button.callback('Register 📝', 'register_action')],
            [Markup.button.callback('Check Balance 💰', 'balance_action'), Markup.button.callback('Deposit 💵', 'deposit_action')],
            [Markup.button.callback('Contact support 📞', 'support_action'), Markup.button.callback('Instruction 📖', 'instruction_action')],
            [Markup.button.callback('Invite ✉️', 'invite_action')]
        ])
    );
});

// 2. የቴሌግራም ታችኛው የኮማንድ ሜኑ መዘርዘሪያ
bot.telegram.setMyCommands([
    { command: 'start', description: 'Start the bot' },
    { command: 'playbingo', description: 'Start playing Bingo' },
    { command: 'register', description: 'Register for an account' },
    { command: 'balance', description: 'Check account balance' },
    { command: 'deposit', description: 'Deposit funds into your account' },
    { command: 'withdraw', description: 'Withdraw funds' },
    { command: 'game_history', description: 'Check your game history' },
    { command: 'instruction', description: 'View game instructions' },
    { command: 'support', description: 'Contact support' }
]);

// 3. የአዝራሮች ተግባር (Actions)
const showBalance = (ctx) => {
    const user = getUser(ctx.from.id, ctx.from.username, ctx.from.first_name);
    ctx.reply(`💰 የእርስዎ የአሁኑ ቀሪ ሂሳብ (Balance)፦ ${user.wallet.toFixed(2)} ETB ነው`);
};
bot.action('balance_action', showBalance);
bot.command('balance', showBalance);

const showDeposit = (ctx) => {
    ctx.reply(
        `💳 የአካውንት መሙያ ዝርዝር (Payment Details):\n\n` +
        `• የሂሳብ አይነት፦ ቴሌብር (Telebirr) ወይም CBE\n` +
        `• የሂሳብ ቁጥር፦ 0923082717\n` +
        `• የባለቤቱ ስም፦ Mathias Tesema\n` +
        `• ዝቅተኛ መጠን፦ 100 ETB\n\n` +
        `⚠️ መመሪያ፦ ብሩን ካስተላለፉ በኋላ ከባንክ ወይም ከቴሌብር የመጣሎትን አጭር የጽሑፍ መልዕክት (SMS) ሙሉ በሙሉ ኮፒ (Copy) አድርገው እዚህ ቦት ላይ ይላኩት።`
    );
};
bot.action('deposit_action', showDeposit);
bot.command('deposit', showDeposit);

bot.action('register_action', (ctx) => {
    ctx.reply(`✅ አካውንትዎ በቴሌግራም መታወቂያዎ (ID: ${ctx.from.id}) በተሳካ ሁኔታ ተመዝግቧል!`);
});
bot.command('register', (ctx) => ctx.reply(`✅ አካውንትዎ በተሳካ ሁኔታ ተመዝግቧል!`));

bot.command('playbingo', (ctx) => {
    ctx.reply('ጨዋታውን ለመክፈት ከታች ያለውን አዝራር ይጫኑ፦', Markup.inlineKeyboard([[Markup.button.webApp('Play Bingo 🎮', WEB_APP_URL)]]));
});

const showInstruction = (ctx) => {
    ctx.reply(`📖 የጨዋታ መመሪያ፦\n1. ጨዋታ ለመጀመር 'Play' የሚለውን ይጫኑ።\n2. የውርርድ መጠን (Stake) ይምረጡ።\n3. 'Start Game' ሲጫኑ ሲስተሙ 10 እድለኛ ቁጥሮችን በዘፈቀደ ያወጣል። ቁጥሮቹ ከተገጣጠሙ ያሸንፋሉ!`);
};
bot.action('instruction_action', showInstruction);
bot.command('instruction', showInstruction);

const showSupport = (ctx) => {
    ctx.reply(`📞 ማንኛውም ችግር ወይም ጥያቄ ካለዎት በ @HuleBingoSupport ማነጋገር ይችላሉ።`);
};
bot.action('support_action', showSupport);
bot.command('support', showSupport);

bot.action('invite_action', (ctx) => {
    ctx.reply(`✉️ የእርስዎ መጋበዣ ሊንክ፦ https://t.me/${ctx.botInfo.username}?start=ref_${ctx.from.id}\n\nይህንን ሊንክ ለጓደኞችዎ በማጋራት ቦнус ያግኙ!`);
});

// 4. ከጨዋታው ገጽታ የሚመጣ መረጃ መቀበያ
bot.on('web_app_data', (ctx) => {
    try {
        const user = getUser(ctx.from.id, ctx.from.username, ctx.from.first_name);
        const data = JSON.parse(ctx.webAppData.data());
        
        if (data.status === 'win') {
            user.wallet += Number(data.amount);
            ctx.reply(`🎉 ድንቅ ነው ${user.name}! በቢንጎ ጨዋታው ${data.amount} ETB አሸንፈዋል። የአሁኑ ቀሪ ሂሳብዎ፡ ${user.wallet.toFixed(2)} ETB ነው።`);
        } else {
            user.wallet -= Number(data.amount);
            ctx.reply(`😢 በዚህ ዙር አልተሳካም ${user.name}። ቀሪ ሂሳብዎ፡ ${user.wallet.toFixed(2)} ETB ነው። ድጋሚ ይሞክሩ!`);
        }
    } catch (e) {
        ctx.reply('የጨዋታ መረጃን ማስተናገድ አልተቻለም።');
    }
});

// 5. የቴሌብር/CBE SMS መፈልፈያ
bot.on('text', (ctx) => {
    const text = ctx.message.text;
    const user = getUser(ctx.from.id, ctx.from.username, ctx.from.first_name);

    if ((text.includes('ብር') && text.includes('transferred')) || text.includes('የተቀበሉት የገንዘብ መጠን') || text.includes('የባንክ ማረጋገጫ')) {
        const refMatch = text.match(/[A-Z0-9]{10,}/);
        const amountMatch = text.match(/(\d+(?:\.\d{1,2})?)\s*(?:ብር|ETB)/i);

        if (refMatch && amountMatch) {
            const addedAmount = parseFloat(amountMatch[1]);
            user.wallet += addedAmount; 
            ctx.reply(`✅ ክፍያዎ በተሳካ ሁኔታ ተረጋግጧል!\n• መጠን፦ ${addedAmount} ETB\n• ማጣቀሻ ቁጥር፦ ${refMatch[0]}\n\n💰 የአሁኑ ባላንስዎ፡ ${user.wallet.toFixed(2)} ETB ሆኗል። አሁን መጫወት ይችላሉ!`);
        } else {
            ctx.reply(`❌ የላኩት የክፍያ መልዕክት አልተረጋገጠም። እባክዎ ሙሉውን SMS በትክክል ይላኩ።`);
        }
    } else {
        ctx.reply(`የላኩትን መልዕክት አልተረዳሁትም። እባክዎ ከታች ያለውን ሜኑ ይጠቀሙ ወይም /start ይበሉ።`);
    }
});

// 🌐 Render በሰላም እንዲያነበው የፖርት (Port) ማስተካከያ እዚህ ተጨምሯል
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`ሰርቨሩ በፖርት ${PORT} ላይ እየሰራ ነው...`);
});

bot.launch();
console.log("የሁሌ ቢንጎ ቦት በተሳካ ሁኔታ ስራ ጀምሯል...");
