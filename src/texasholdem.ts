import { client } from "./client.js";
import { BasePlayer, BaseTable, Card, ranks, suits } from "./poker.js";

export type TexasHoldemAction = {
    action: 'check' | 'call' | 'fold';
} | {
    action: 'raise';
    amount?: number;
}

export type TexasHoldemPlayer = BasePlayer & {
    action: TexasHoldemAction | null;
    position: 'smallBlind' | 'bigBlind' | 'dealer' | null;
    first: boolean;
    hand: [Card, Card] | null;
}

export interface TexasHoldemTableData extends BaseTable {
    game: 'texasholdem';
    players: TexasHoldemPlayer[];
    state: {
        phase: 'playing';
        communityCards: Card[];
        pots: {
            amount: number;
            players: string[];
        }[];
        currentTurn: string;
    } | {
        phase: 'waiting';
    }
    options: {
        maxPlayers: number; // default is 9
        smallBlind: number;
        bigBlind: number; // default is 2x small blind
        buyIn: number; // default is 50x big blind
    }
}

export class TexasHoldemTable implements TexasHoldemTableData {
    game: 'texasholdem' = 'texasholdem';
    id: string;
    turnDuration: number;
    stakes: BaseTable['stakes'];
    cards: Card[];
    players: TexasHoldemPlayer[];
    state: TexasHoldemTableData['state'];
    options: TexasHoldemTableData['options'];
    timeout: NodeJS.Timeout | null = null;

    get activePlayer(): TexasHoldemPlayer | null {
        const state = this.state;
        if (state.phase == 'waiting') return null;
        return this.players.find(player => player.id == state.currentTurn) ?? null;
    }

    get activeHand(): TexasHoldemPlayer['hand'] {
        const player = this.activePlayer;
        return player?.hand ?? null;
    }
    
    constructor({ id, turnDuration, stakes, cards, players, state, options }: { id: string, turnDuration: number, stakes: BaseTable['stakes'], cards?: Card[], players?: TexasHoldemPlayer[], state?: TexasHoldemTableData['state'], options?: TexasHoldemTableData['options'] }) {
        console.log('Creating Texas Hold\'em table with ID:', id);
        
        this.id = id;
        this.turnDuration = turnDuration;
        this.stakes = stakes;
        this.cards = cards ?? this.shuffle();
        this.players = players ?? [];
        this.state = state ?? { phase: 'waiting' };
        this.options = options ?? { maxPlayers: 9, smallBlind: 1, bigBlind: 2, buyIn: 100 };
    
        if (this.state.phase != 'waiting') {
            this.resetTimer();
        }
    }

    // Game functions
    async join(id: string) {
    }

    async leave(id: string): Promise<'invalid' | 'leaving' | 'left'> {
        const player = this.players.find(p => p.id === id);
        if (!player) return 'invalid';

        if (player.leaving) return 'leaving';

        if (this.state.phase == 'waiting') {
            this.players = this.players.filter(p => p.id !== id);
            await this.update();
            return 'left';
        }

        player.leaving = true;
        await this.update();
        return 'leaving';
    }
    
    async advanceTurn(afk?: true) {
        const state = this.state;
        if (state.phase == 'waiting') return;

        const player = this.activePlayer;
        if (!player) return;

        // fold if player is afk

        await this.update();
    }

    // Timer functions
    resetTimer() {
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => this.handleTimerEnd(), this.turnDuration * 1_000);
    }

    async handleTimerEnd() {
        const player = this.activePlayer;
        if (!player) return;

        player.inactivity++;
        if (player.inactivity >= 3) {
            player.leaving = true;
        }

        await this.advanceTurn();
    }

    // Interaction functions
    async update() {
        await client.db.table('tables').set<TexasHoldemTableData>(this.id, {
            game: this.game,
            id: this.id,
            turnDuration: this.turnDuration,
            stakes: this.stakes,
            cards: this.cards,
            players: this.players,
            state: this.state,
            options: this.options
        });
    }

    // Helper functions
    shuffle(): Card[] {
        const deck: Card[] = [];

        for (const rank of ranks) {
            for (const suit of suits) {
                deck.push(`${rank}_of_${suit}`);
            }
        }

        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [ deck[i], deck[j] ] = [ deck[j], deck[i] ];
        }

        return deck;
    }
}