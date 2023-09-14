import { Database } from 'sqlite3';

enum States {
    INITIAL,
    QUESTION_ONE,
    QUESTION_TWO,
    QUESTION_THREE,
    QUESTION_FOUR,
    QUESTION_FIVE,
    END,
}

const messages = {
    [States.INITIAL]: 'Olá! Vamos começar? Responda "vamos" para continuar.',
    [States.QUESTION_ONE]: 'Qual é o seu nome?',
    [States.QUESTION_TWO]: 'Qual é a sua idade?',
    [States.QUESTION_THREE]: 'Para realizar sua consulta informe a marca do seu carro.',
    [States.QUESTION_FOUR]: 'Qual é o modelo do seu carro?',
    [States.QUESTION_FIVE]: 'Qual é o ano do seu carro?',
    [States.END]: 'Obrigado pelas informações! Em breve enviaremos sua consulta.',
};

class ConversaManager {
    private db: Database;

    constructor() {
        this.db = new Database('conversas.db', (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('[Conectado ao banco de dados]');
        });
        this.createTable();
    }

    private createTable() {
        this.db.run(
            `CREATE TABLE IF NOT EXISTS conversas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wid TEXT NOT NULL UNIQUE,
        stage INTEGER NOT NULL
      );`,
            (err) => {
                if (err) {
                    console.error(err.message);
                }
                console.log('[Tabela criada com sucesso]');
            }
        );
    }

    private insertConversa(wid: string, stage: States) {
        const sql = `INSERT INTO conversas (wid, stage)
                  VALUES (?, ?)`;
        this.db.run(sql, [wid, stage], (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log(`Conversa com wid ${wid} criada com sucesso`);
        });
    }

    private updateConversa(wid: string, stage: States) {
        const sql = `UPDATE conversas SET stage = ?
                  WHERE wid = ?`;
        this.db.run(sql, [stage, wid], (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log(`Conversa com wid ${wid} atualizada com sucesso`);
        });
    }

    async handleChat(wid: string) {
        const sql = `SELECT * FROM conversas WHERE wid = ?`;
        try {
            const row = await this.getRowFromDatabase(sql, [wid]);
            if (row) {
                console.log(`Conversa com wid ${wid} ENCONTRADA: ${JSON.stringify(row)}`);
                const botResponse = this.stageManager(row.stage, wid);
                return botResponse;
            } else {
                console.log(`Conversa com wid ${wid} NÃO encontrada`);
                this.insertConversa(wid, States.INITIAL);
                const botResponse = this.stageManager(States.INITIAL, wid);
                return botResponse;
            }
        } catch (err: any) {
            console.error(err.message);
            return 'Não entendi, tente novamente!';
        }
    }

    private async getRowFromDatabase(sql: string, params: any[]) {
        return new Promise<any>((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                }
                resolve(row);
            });
        });
    }

    private stageManager(stage: States, wid: string) {
        let response = '';
        console.log('[STAGE]', stage, '[wid]', wid);
        switch (stage) {
            case States.INITIAL:
                response = messages[States.INITIAL];
                this.updateConversa(wid, States.QUESTION_ONE);
                break;
            case States.QUESTION_ONE:
                response = messages[States.QUESTION_ONE];
                this.updateConversa(wid, States.QUESTION_TWO);
                break;
            case States.QUESTION_TWO:
                response = messages[States.QUESTION_TWO];
                this.updateConversa(wid, States.QUESTION_THREE);
                break;
            case States.QUESTION_THREE:
                response = messages[States.QUESTION_THREE];
                this.updateConversa(wid, States.QUESTION_FOUR);
                break;
            case States.QUESTION_FOUR:
                response = messages[States.QUESTION_FOUR];
                this.updateConversa(wid, States.QUESTION_FIVE);
                break;
            case States.QUESTION_FIVE:
                response = messages[States.QUESTION_FIVE];
                this.updateConversa(wid, States.END);
                break;
            case States.END:
                response = messages[States.END];
                this.updateConversa(wid, States.INITIAL);
                break;
            default:
                response = messages[States.INITIAL];
                break;
        }
        return response;
    }
}

export default ConversaManager;
