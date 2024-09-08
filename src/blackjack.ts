import { client } from "./client.js";
import { BasePlayer, BaseTable, Card, ranks, suits } from "./poker.js";

export type BlackjackAction = {
    type: 'hit' | 'stand' | 'double' | 'split';
} | {
    type: 'insurance';
    bet: number;
}

export type Hand = {
    id: number;
} & ({
    split: false;
    doubled: boolean;
    busted: boolean;
    cards: [Card, Card];
} | {
    split: true;
    subhands: [Hand, Hand];
});

export type BlackjackPlayer = BasePlayer & {
    wager: number;
    action: BlackjackAction | null;
    insurenceBet: number | null;
    hand: Hand | null;
}

export interface BlackjackTableData extends BaseTable {
    game: 'blackjack';
    players: BlackjackPlayer[];
    state: {
        phase: 'dealing' | 'playing' | 'payout';
        dealerHand: Card[];
        currentTurn: 'dealer' | (string & {});
        currentHand: number;
    } | {
        phase: 'waiting';
    }
    options: {
        numDecks: number;
        maxPlayers: number; // default is 7
        minBet: number;
        maxBet: number; // default is 25x min bet
    }
}

export class BlackjackTable implements BlackjackTableData {
    game: 'blackjack' = 'blackjack';
    id: string;
    turnDuration: number;
    stakes: BaseTable['stakes'];
    cards: Card[];
    players: BlackjackPlayer[];
    state: BlackjackTableData['state'];
    options: BlackjackTableData['options'];
    timeout: NodeJS.Timeout | null = null;

    get activePlayer(): BlackjackPlayer | null {
        const state = this.state;
        if (state.phase == 'waiting' || state.currentTurn == 'dealer') return null;
        return this.players.find(player => player.id === state.currentTurn) ?? null;
    }

    get activeHand(): Hand | null {
        const state = this.state;
        if (state.phase == 'waiting' || state.currentTurn == 'dealer') return null;

        const player = this.activePlayer;
        if (!player || !player.hand) return null;

        const find = (hand: Hand, id: number): Hand | null => {
            if (hand.id === id) return hand;
            if (hand.split) {
                return find(hand.subhands[0], id) ?? find(hand.subhands[1], id);
            }
            return null;
        }

        return find(player.hand, state.currentHand);
    }

    get numHands(): number {
        const player = this.activePlayer;
        if (!player || !player.hand) return 0;

        const count = (hand: Hand): number => hand.split ? count(hand.subhands[0]) + count(hand.subhands[1]) : 1;

        return count(player.hand);
    }

    constructor({ id, turnDuration, stakes, cards, players, state, options }: { id: string, turnDuration: number, stakes: BaseTable['stakes'], cards?: Card[], players?: BlackjackPlayer[], state?: BlackjackTableData['state'], options?: BlackjackTableData['options'] }) {
        console.log('Creating Blackjack table with ID:', id);

        this.id = id;
        this.turnDuration = turnDuration;
        this.stakes = stakes;
        this.players = players ?? [];
        this.state = state ?? { phase: 'waiting' };
        this.options = options ?? { numDecks: 1, maxPlayers: 7, minBet: 1, maxBet: 25 };
        this.cards = cards ?? this.shuffle();

        this.update();

        if (this.state.phase != 'waiting') {
            this.resetTimer();

            if (this.state.currentTurn == 'dealer') this.dealerTurn();
        }
    }

    // Game functions
    async join(id: string, buyIn: number): Promise<'join' | 'rejoin' | 'extant' | 'full'> {
        const player = this.players.find(p => p.id === id);
        if (player) {
            if (player.leaving) {
                player.leaving = false;
                await this.update();
                return 'rejoin';
            }
            return 'extant';
        }

        if (this.players.length >= this.options.maxPlayers) return 'full';

        const seatNumber = Array.from({ length: this.options.maxPlayers }, (_, i) => i).find(seat => !this.players.some(p => p.seatNumber == seat))!;
        this.players.push({
            id,
            balance: buyIn,
            inactivity: 0,
            playing: false,
            leaving: false,
            wager: this.options.minBet,
            action: null,
            insurenceBet: 0,
            hand: null,
            seatNumber
        });

        await this.update();

        if (this.players.length == 1) {
            await this.advance('new');
        }

        return 'join';
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

    async stand() {
        console.log('Action: stand');

        const player = this.activePlayer;
        if (!player || !player.hand) return;

        await this.advance('next');
    }

    async hit() {
        console.log('Action: hit');

        const player = this.activePlayer;
        if (!player || !player.hand) return;

        const hand = this.activeHand;
        if (!hand || hand.split) return;

        hand.cards.push(this.cards.pop()!);
        if (this.sum(hand.cards) > 21) {
            hand.busted = true;
            await this.advance('next');
        }

        await this.update();
    }

    async deal() {
        console.log('Dealing cards');

        this.state.phase = 'dealing';
        if (this.state.phase != 'dealing') return;

        if (this.cards.length < 52) {
            console.log('Shuffling cards');
            this.cards = this.shuffle();
        }

        for (const player of this.players) {
            player.playing = true;

            player.hand = {
                id: 0,
                split: false,
                doubled: false,
                busted: false,
                cards: [this.cards.pop()!, this.cards.pop()!]
            };
        }

        this.state.dealerHand = [this.cards.pop()!, this.cards.pop()!];

        // set the first player as the active player
        const first = this.players.sort((a, b) => a.seatNumber - b.seatNumber)[0];
        this.state.currentTurn = first.id;
        this.state.currentHand = 0;

        await this.update();
        this.resetTimer();
    }

    async payout() {
        console.log('Paying out');
        
        this.state.phase = 'payout';
        if (this.state.phase != 'payout') return;

        const dealerSum = this.sum(this.state.dealerHand);
        for (const player of this.players) {
            if (!player.hand || !player.playing) continue;

            const calculate = (hand: Hand): number => {
                if (hand.split) return calculate(hand.subhands[0]) + calculate(hand.subhands[1]);

                const sum = this.sum(hand.cards);
                if (sum > 21) return 0;
                if (dealerSum > 21 || sum > dealerSum) return player.wager;
                if (sum < dealerSum) return -player.wager;
                return 0;
            }

            player.balance += calculate(player.hand);
        }

        await this.update();

        await this.advance('new');
    }

    async advance(to: 'same' | 'next' | 'skip' | 'new') {
        console.log('Advancing turn to:', to);

        if (to == 'new') {
            // pay out leaving players
            for (const player of this.players) {
                if (player.leaving) {
                    const account = await client.account(player.id);
                    account.balance += player.balance;
                    await client.setAccount(player.id, account);
                }
            }

            // remove leaving players
            this.players = this.players.filter(p => !p.leaving);

            // check if there are any players left
            if (this.players.length == 0) {
                this.state.phase = 'waiting';
                await this.update();
                return;
            }

            await this.update();

            await this.deal();
            return;
        }

        const state = this.state;
        if (state.phase == 'waiting') return;

        const player = this.activePlayer;
        if (!player) return;

        if (to == 'same') {
            await this.update();
            this.resetTimer();
            return;
        }
        
        if (state.currentHand < this.numHands - 1 && to != 'skip') {
            state.currentHand++;
        }
        else {
            const next = this.players.sort((a, b) => a.seatNumber - b.seatNumber).find(p => p.seatNumber > player.seatNumber);
            if (!next) {
                state.currentTurn = 'dealer';
                this.dealerTurn();
            }
            else {
                state.currentTurn = next.id;
            }

            state.currentHand = 0;
        }

        await this.update();
        this.resetTimer();
    }

    async dealerTurn() {
        console.log('Processing dealer turn');

        const state = this.state;
        if (state.phase == 'waiting') return;

        while (this.sum(state.dealerHand) < 17) {
            state.dealerHand.push(this.cards.pop()!);
        }
        
        await this.update();
        
        await this.payout();
    }

    // Timer functions
    resetTimer() {
        if (this.timeout) clearTimeout(this.timeout);
        if (this.state.phase != 'waiting') this.timeout = setTimeout(() => this.handleTimerEnd(), this.turnDuration * 1_000);
    }

    async handleTimerEnd() {
        console.log('Handling timer end');

        const player = this.activePlayer;
        if (player) {
            player.inactivity++;
            if (player.inactivity >= 3) {
                player.leaving = true;
            }
        }

        await this.advance('skip');
    }

    // Interaction functions
    async update() {
        await client.db.table('tables').set<BlackjackTableData>(this.id, {
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

        for (let i = 0; i < this.options.numDecks; i++) {
            for (const rank of ranks) {
                for (const suit of suits) {
                    deck.push(`${rank}_of_${suit}`);
                }
            }
        }

        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        return deck;
    }

    sum(cards: Card[]) {
        if (cards.length == 0) return 0;

        return cards.reduce((acc, card) => {
            const rank = card.split('_')[0];
            if (['jack', 'queen', 'king'].includes(rank)) return acc + 10;
            if (rank === 'ace') return acc + 11 > 21 ? acc + 1 : acc + 11;
            return acc + parseInt(rank);
        }, 0);
    }
}