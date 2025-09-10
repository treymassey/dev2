import 'dotenv/config';
import restify from 'restify';
import {
  ActivityHandler,
  CloudAdapter,
  ConfigurationServiceClientCredentialFactory,
  createBotFrameworkAuthenticationFromConfiguration,
} from 'botbuilder';

// Basic Echo bot with health endpoint
class EchoBot extends ActivityHandler {
  constructor() {
    super();
    this.onMessage(async (ctx) => {
      const text = ctx.activity.text ?? '(no text)';
      await ctx.sendActivity(`You said: ${text}`);
    });
    this.onMembersAdded(async (ctx) => {
      for (const m of ctx.activity.membersAdded ?? []) {
        if (m.id !== ctx.activity.recipient.id) {
          await ctx.sendActivity('Hello from Azure Web App 👋');
        }
      }
    });
  }
}

const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
  MicrosoftAppId: process.env.MicrosoftAppId,
  MicrosoftAppPassword: process.env.MicrosoftAppPassword,
  MicrosoftAppType: process.env.MicrosoftAppType || 'MultiTenant'
});

const bfa = createBotFrameworkAuthenticationFromConfiguration(null, credentialsFactory);
const adapter = new CloudAdapter(bfa);
const bot = new EchoBot();

const server = restify.createServer();
server.use(restify.plugins.bodyParser());

// Health probe for App Service
server.get('/', (req, res) => res.send(200, 'OK'));

// Bot Framework messages endpoint
server.post('/api/messages', (req, res) => adapter.process(req, res, (ctx) => bot.run(ctx)));

const port = process.env.PORT || 3978;
server.listen(port, () => console.log(`Bot listening on port ${port}`));
