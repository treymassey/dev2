const path = require('path');
const express = require('express');
const { CloudAdapter, ConfigurationServiceClientCredentialFactory, MemoryStorage, ConversationState } = require('botbuilder');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3978;

// Load credentials from env vars
const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
    MicrosoftAppId: process.env.MicrosoftAppId,
    MicrosoftAppPassword: process.env.MicrosoftAppPassword,
    MicrosoftAppType: process.env.MicrosoftAppType,
    MicrosoftTenantId: process.env.MicrosoftTenantId
});

const adapter = new CloudAdapter(credentialsFactory);

// Catch-all for errors
adapter.onTurnError = async (context, error) => {
    console.error(`\n [onTurnError]: ${ error }`);
    await context.sendActivity('The bot encountered an error or bug.');
    await context.sendActivity('To continue, please fix the bot source code.');
};

// Simple memory storage and conversation state
const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);

// Basic bot logic
class EchoBot {
    async run(context) {
        if (context.activity.type === 'message') {
            const text = context.activity.text;
            if (text.toLowerCase() === 'help') {
                await context.sendActivity('I can respond with echo. Try typing something.');
            } else if (text.toLowerCase() === 'card') {
                await context.sendActivity({
                    attachments: [{
                        contentType: 'application/vnd.microsoft.card.adaptive',
                        content: {
                            type: 'AdaptiveCard',
                            version: '1.4',
                            body: [
                                { type: 'TextBlock', text: 'Hello from Adaptive Card!', weight: 'Bolder', size: 'Medium' }
                            ]
                        }
                    }]
                });
            } else {
                await context.sendActivity(`You said: ${ text }`);
            }
        }
    }
}

const bot = new EchoBot();

// Create /api/messages endpoint
app.post('/api/messages', express.json(), async (req, res) => {
    await adapter.process(req, res, (context) => bot.run(context));
});

// Health check
app.get('/', (req, res) => {
    res.status(200).send('OK');
});

app.listen(port, () => {
    console.log(`Bot is running on port ${port}`);
});
