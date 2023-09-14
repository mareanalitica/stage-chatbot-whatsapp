import { create } from '@wppconnect-team/wppconnect';
import ConversaManager from './conversa-manager';

const main = async () => {
  try {
    const conversaManager = new ConversaManager();

    function start(client: any) {
      client.onMessage(async (message: any) => {
        try {
          if (!message.isGroupMsg) {
            const botResult = await conversaManager.handleChat(message.from);
            await client.sendText(message.from, botResult);
          }
        } catch (error) {
          console.log('[ONMESSAGE]', error);
        }
      });
    }

    const client = await create({
      session: 'chatbot',
      catchQR: (base64Qrimg: string, asciiQR: string) => {
        console.log('Terminal qrcode: ', asciiQR);
      },
      statusFind: (statusSession: string) => {
        console.log('Status Session: ', statusSession);
      },
      onLoadingScreen: (percent: number, message: string) => {
        console.log('LOADING_SCREEN', percent, message);
      },
      autoClose: 0,
      tokenStore: 'file',
      folderNameToken: './tokens',
    });

    start(client);
  } catch (error) {
    console.log(error);
  }
};

main();
