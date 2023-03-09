# Discord.js v14 學習記錄

###### tags: `Node.js` `Discord.js`

## 資源

官方文件：https://discord.js.org/#/docs/discord.js/main/general/welcome

## 專案建立

### 初始化專案

> node 版本必須高於 16.9.0


```bash
pnpm init
```

安裝 discord.js & nodemon & dotenv

```bash
pnpm add discord.js dotenv

pnpm add nodemon -D
```

`pakage.json` 檔案設定


```json=
{
  "name": "djs-v14-learning",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "type": "module", // 使用 ESM
  "scripts": {
    "dev": "nodemon ./src/index.js",
    "start": "node ./src/index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "discord.js": "^14.7.1",
    "dotenv": "^16.0.3"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}
```

在 src 目錄下新增一個 `index.js`，貼上此段程式碼就可以讓 bot 跑起來了

```javascript=
import { config } from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';

config();
const TOKEN = process.env.DISCORD_BOT_TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ],
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.login(TOKEN);
```

## Slash Commands

引入 REST 和 Routes 模組用來註冊指令和發送請求

```javascript
import { REST, Routes } from 'discord.js';
```

建立一個 REST 的實體並指定 Discord API 版本然後把 Bot 的 Token 餵給它：

```javascript
const rest = new REST({ version: '10' }).setToken(TOKEN);
```

使用 `rest.put` 方法來註冊 Slash Command：

```javascript
async function main() {
  const commands = [
    {
      name: 'ping',
      description: '得知機器人的延遲資訊',
    },
  ];

  try {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    client.login(TOKEN);
  } catch (error) {
    console.error(error);
  }
}

main();
```
> applicationGuildCommands 的參數需要傳入 CLIENT_ID (機器人的APPLICATION ID)，如果是全域指令就不需要傳第二個參數 GUILD_ID (server id)

註冊完指令後可以去監聽 `interactionCreate` 事件的發生：

```javascript
client.on('interactionCreate', async (interaction) => {
  // 檢查是否為 slash command
  if (interaction.isChatInputCommand()) {
    // 當指令名為 ping 的時候
    if (interaction.commandName === 'ping') {
      const msg = await interaction.reply({
        content: '正在計算延遲...',
        fetchReply: true,
      });
      const ping = msg.createdTimestamp - interaction.createdTimestamp;
      // 修改回應
      interaction.editReply(`機器人延遲：${ping} ms`);
    }
  }
});
```

### Slash Command Arguments

可以新增一個 options 去告訴使用者可以傳什麼參數給指令：

```javascript
const commands = [
  {
    name: 'ping',
    description: '得知機器人的延遲資訊',
  },
  // 新增一個 order 指令
  {
    name: 'order',
    description: 'Order something...',
    // 參數設定
    options: [
      {
        name: 'food',
        description: 'the type of food',
        type: 3,
        require: true,
      },
    ],
  },
];
```

透過 `interaction.options` 取得內容：

```javascript
if (interaction.commandName === 'order') {
  interaction.reply({ content: `You ordered ${interaction.options.get('food').value}!` });
}
```

### Slash Command Choices

也可以把參數變成選項讓使用者去選取：

```javascript
options: [
  {
    name: 'food',
    description: 'the type of food',
    type: 3,
    require: true,
    choices: [
      {
        name: 'Cake',
        value: 'cake',
      },
      {
        name: 'Hamburger',
        value: 'hamburger',
      },
    ],
  },
],
```

### Slash Command Builders

- [官方文件 - SlashCommandBuilder](https://discord.js.org/#/docs/builders/main/class/SlashCommandBuilder)
- [官方範例](https://github.com/discordjs/discord.js/blob/main/packages/builders/docs/examples/Slash%20Command%20Builders.md)

```javascript
import { SlashCommandBuilder } from 'discord.js';

const orderCommand = new SlashCommandBuilder()
  .setName('order')
  .setDescription('Order your favorite meal')
  .addStringOption((option) =>
    option
      .setName('food')
      .setDescription('Select your favorite food')
      .setRequired(true)
      .setChoices(
        { name: 'Cake', value: 'cake' },
        { name: 'Hamburger', value: 'hamburger' },
        { name: 'Pizza', value: 'pizza' }
      )
  )
  .addStringOption((option) =>
    option
      .setName('drink')
      .setDescription('Select your favorite drink')
      .setRequired(true)
      .setChoices(
        { name: 'Water', value: 'water' },
        { name: 'Coca-Cola', value: 'coca_cola' },
        { name: 'Sprite', value: 'sprite' }
      )
  );

const commands = [orderCommand.toJSON()];
```

