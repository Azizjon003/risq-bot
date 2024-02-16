const botStart = (bot: any) => {
  bot.launch().then(() => {
    console.log("Aziz");
  });
  console.log(`Bot ${bot} has been started...`);
};

export default botStart;
