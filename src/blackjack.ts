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
    doubled: false | Card;
    cards: [Card, Card];
} | {
    id: number;
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
        phase: 'dealing' | 'insurance' | 'playing' | 'payout';
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

    set activeHand(hand: Hand) {
        const state = this.state;
        if (state.phase == 'waiting' || state.currentTurn == 'dealer') return;

        const player = this.activePlayer;
        if (!player || !player.hand) return;

        const set = (hand: Hand, id: number, value: Hand): void => {
            if (hand.id === id) {
                hand = value;
                return;
            }
            if (hand.split) {
                set(hand.subhands[0], id, value);
                set(hand.subhands[1], id, value);
            }
        }

        set(player.hand, state.currentHand, hand);
    }

    get numHands(): number {
        const player = this.activePlayer;
        if (!player || !player.hand) return 0;

        const count = (hand: Hand): number => hand.split ? count(hand.subhands[0]) + count(hand.subhands[1]) : 1;

        return count(player.hand);
    }

    constructor({ id, turnDuration, stakes, cards, players, state, options }: { id: string, turnDuration: number, stakes: BaseTable['stakes'], cards?: Card[], players?: BlackjackPlayer[], state?: BlackjackTableData['state'], options?: BlackjackTableData['options'] }) {
        this.id = id;
        this.turnDuration = turnDuration;
        this.stakes = stakes;
        this.players = players ?? [];
        this.state = state ?? { phase: 'waiting' };
        this.options = options ?? { numDecks: 1, maxPlayers: 7, minBet: 1, maxBet: 25 };
        this.cards = cards ?? this.shuffle();
        this.update();

        this.log('Created Blackjack table');

        // if waiting and there are enough players, start the game
        if (this.state.phase == 'waiting' && this.players.length >= 1) {
            this.start();
        }

        // if dealing, continue with the deal
        if (this.state.phase == 'dealing') {
            this.deal();
        }

        // if playing, continue with the current turn
        if (this.state.phase == 'playing') {
            this.turn();
        }

        // if paying out, continue with the payout
        if (this.state.phase == 'payout') {
            this.payout();
        }
    }

    // called when a player joins the table
    async join(id: string, buyIn: number): Promise<'join' | 'rejoin' | 'extant' | 'full' | 'insufficient'> {
        // check if the player is already in the game
        const player = this.players.find(p => p.id === id);
        if (player) {
            if (player.leaving) {
                await this.update(() => {
                    player.leaving = false;
                });

                return 'rejoin';
            }
            return 'extant';
        }

        // check if the table is full
        if (this.players.length >= this.options.maxPlayers) return 'full';

        // check if the player has enough balance
        const account = await client.account(id);
        if (account.balance < buyIn) return 'insufficient';

        // deduct the buy-in from the player's balance
        await client.account(id, account => {
            account.balance -= buyIn;
        });

        // add the player to the table
        await this.update(() => {
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
                seat: Array.from({ length: this.options.maxPlayers }, (_, i) => i).find(seat => !this.players.some(p => p.seat == seat))!
            });
        });

        // start the game if there are enough players
        if (this.state.phase == 'waiting' && this.players.length >= 1) {
            await this.start();
        }

        return 'join';
    }

    // called when a player leaves the table
    async leave(id: string): Promise<'inapplicable' | 'leaving' | 'left'> {
        // check if the player is in the game
        const player = this.players.find(p => p.id === id);
        if (!player) return 'inapplicable';

        // check if the player is already leaving
        if (player.leaving) return 'leaving';

        // check if the game is waiting
        if (this.state.phase == 'waiting') {
            // pay out the player's balance
            await client.account(id, account => {
                account.balance += player.balance;
            });

            // remove the player from the table
            await this.update(() => {
                this.players = this.players.filter(p => p.id !== id);
            });

            return 'left';
        }

        await this.update(() => {
            player.leaving = 'manual';
        });

        return 'leaving';
    }

    // called to start a new round
    async start() {
        this.log('Starting new round');

        // take bets and pay out leaving players
        for (const player of this.players) {
            if (!player.leaving) {
                if (player.balance < player.wager) {
                    player.leaving = 'insufficient';
                }
                else {
                    await this.update(() => {
                        player.playing = true;
                        player.balance -= player.wager;
                    });
                }
            }

            if (player.leaving) {
                // TODO: tell the player they are leaving and why

                await client.account(player.id, account => {
                    account.balance += player.balance;
                });
            }
        }

        // remove leaving players
        await this.update(() => {
            this.players = this.players.filter(p => !p.leaving);
        });

        // start dealing if there are enough players
        if (this.players.length == 0) {
            await this.update(() => {
                this.state.phase = 'waiting';
            });
        }
        else {
            await this.deal();
        }
    }

    // called to deal cards to players and dealer
    async deal() {
        this.log('Dealing out cards');

        await this.update(() => {
            this.state.phase = 'dealing';
        });

        if (this.cards.length < 52) {
            await this.update(() => {
                this.cards = this.shuffle();
            });
        }

        await this.update(() => {
            if (this.state.phase != 'dealing') return;

            // update players
            for (const player of this.players) {
                player.playing = true;

                player.hand = {
                    id: 0,
                    split: false,
                    doubled: false,
                    cards: [this.cards.pop()!, this.cards.pop()!]
                };
            }

            // reset dealer hand
            this.state.dealerHand = [this.cards.pop()!, this.cards.pop()!];

            // set the first player as the active player
            const first = this.players.sort((a, b) => a.seat - b.seat)[0];
            this.state.currentTurn = first.id;
            this.state.currentHand = 0;
        });

        // TODO: send the initial hands to channel

        // if first dealer card is an ace, prompt for insurance, otherwise continue with the first player's turn
        if (this.state.phase != 'waiting' && this.state.dealerHand[0].split('_')[0] === 'ace') {
            await this.insurance();
        }
        else {
            await this.turn();
        }
    }

    // called when the dealer shows an ace
    async insurance() {
        this.log('Processing insurance');

        await this.update(() => {
            this.state.phase = 'insurance';
        });

        // TODO: send the insurance prompt to channel

        // wait 15 seconds for players to take insurance
        await new Promise(resolve => setTimeout(resolve, this.turnDuration * 1_000));

        // calculate the dealer's hand
        if (this.state.phase == 'waiting') return;
        const dealer = this.sum(this.state.dealerHand);

        // pay out insurance bets
        await this.update(() => {
            for (const player of this.players) {
                if (!player.insurenceBet || !player.hand) continue;

                if (dealer == 21 && (!player.hand.split && this.sum(player.hand.cards) == 21)) {
                    player.balance += player.insurenceBet;
                }
                else if (dealer == 21) {
                    player.balance += player.insurenceBet * 2;
                }
                else {
                    player.balance -= player.insurenceBet;
                }

                player.insurenceBet = null;
            }
        });

        // TODO: send the insurance results to channel

        // continue with the first player's turn
        await this.turn();
    }

    // called to process a turn
    async turn() {
        this.stopTimer();

        if (this.state.phase != 'waiting' && this.state.currentTurn == 'dealer') {
            this.dealer();
            return;
        }

        this.log('Waiting for player action');

        // TODO: send the current player's interaction menu to channel

        // start the player's turn
        this.restartTimer();
    }

    // called on the dealer's turn
    async dealer() {
        this.log('Processing dealer turn');

        if (this.state.phase == 'waiting') return;

        // TODO: send the dealer's revealed hand to the channel

        while (this.sum(this.state.dealerHand) < 17) {
            await this.update(() => {
                if (this.state.phase == 'waiting') return;
                this.state.dealerHand.push(this.cards.pop()!);
            });

            // TODO: send the dealer's updated hand to the channel
        }

        await this.payout();
    }

    // called when the round ends
    async payout() {
        this.log('Paying out');

        this.state.phase = 'payout';

        await this.update(() => {
            if (this.state.phase != 'payout') return;

            // calculate the dealer's hand
            const dealer = this.sum(this.state.dealerHand);

            // calculate the payout for each player
            for (const player of this.players) {
                if (!player.hand || !player.playing) continue;

                const calculate = (hand: Hand): number => {
                    if (hand.split) return calculate(hand.subhands[0]) + calculate(hand.subhands[1]);

                    const sum = this.sum(hand.cards);
                    if (sum > 21) return 0;
                    if (dealer > 21 || sum > dealer) return hand.doubled ? player.wager * 2 : player.wager;
                    if (sum < dealer) return -player.wager;
                    return 0;
                }

                player.balance += calculate(player.hand);
            }
        });

        // TODO: send the payout results to the channel

        await this.start();
    }

    // called when a player stands
    async stand(id: string): Promise<'success' | 'error'> {
        this.log('Action: stand');

        const player = this.activePlayer;
        if (!player || !player.playing || player.id !== id) return 'error';

        await this.advance();

        return 'success';
    }

    // called when a player hits
    async hit(id: string): Promise<'success' | 'bust' | 'blackjack' | 'error'> {
        this.log('Action: hit');

        const player = this.activePlayer;
        if (!player || !player.hand || player.id !== id) return 'error';

        const hand = this.activeHand;
        if (!hand || hand.split || hand.doubled) return 'error';

        this.update(() => {
            hand.cards.push(this.cards.pop()!);
        });

        const sum = this.sum(hand.cards);

        if (sum > 21) {
            await this.advance();
            return 'bust';
        }

        if (sum == 21) {
            await this.advance();
            return 'blackjack';
        }

        this.turn();
        return 'success';
    }

    // called when a player doubles down
    async double(id: string): Promise<'success' | 'extant' | 'insufficient' | 'error'> {
        this.log('Action: double');

        const player = this.activePlayer;
        if (!player || !player.hand || player.id !== id) return 'error';

        const hand = this.activeHand;
        if (!hand || hand.split) return 'error';
        if (hand.doubled) return 'extant';

        if (player.balance < player.wager) return 'insufficient';

        await this.update(() => {
            player.balance -= player.wager;
            hand.doubled = this.cards.pop()!;
        });

        await this.advance();

        return 'success';
    }

    // called when a player splits their hand
    async split(id: string): Promise<'success' | 'insufficient' | 'error'> {
        this.log('Action: split');

        const player = this.activePlayer;
        if (!player || !player.hand || player.id !== id) return 'error';

        const hand = this.activeHand;
        if (!hand || hand.split || (!hand.split && hand.doubled)) return 'error';

        if (player.balance < player.wager) return 'insufficient';

        await this.update(() => {
            player.balance -= player.wager;

            this.activeHand = {
                id: hand.id,
                split: true,
                subhands: [{
                    id: hand.id + 1,
                    split: false,
                    doubled: false,
                    cards: [hand.cards[0], this.cards.pop()!]
                }, {
                    id: hand.id + 2,
                    split: false,
                    doubled: false,
                    cards: [hand.cards[1], this.cards.pop()!]
                }]
            };
        });

        await this.advance();

        return 'success';
    }

    // called when a player takes insurance
    async recieve(id: string, bet: number): Promise<'success' | 'extant' | 'insufficient' | 'error'> {
        this.log('Action: insurance');

        const player = this.activePlayer;
        if (!player || !player.hand || player.id !== id) return 'error';

        if (player.insurenceBet) return 'extant';
        if (player.balance < bet) return 'insufficient';

        await this.update(() => {
            player.insurenceBet = bet;
        });

        return 'success';
    }

    // called to advance the turn
    async advance(skipAllHands?: true) {
        this.log('Advancing turn');

        const state = this.state;
        if (state.phase == 'waiting') return;

        const player = this.activePlayer;
        if (!player) return;

        await this.update(() => {
            if (state.currentHand < this.numHands - 1 && !skipAllHands) {
                state.currentHand++;
            }
            else {
                const next = this.players.sort((a, b) => a.seat - b.seat).find(p => p.seat > player.seat);
                state.currentTurn = next ? next.id : 'dealer';
                state.currentHand = 0;
            }
        });

        await this.turn();
    }

    // Timer functions
    startTimer() {
        if (this.state.phase == 'waiting') return;

        this.timeout = setTimeout(async () => {
            const player = this.activePlayer;
            if (!player) return;

            player.inactivity++;
            if (player.inactivity >= 3) {
                player.leaving = 'afk';
            }

            await this.advance(true);
        }, this.turnDuration * 1_000);
    }

    stopTimer() {
        if (this.timeout) clearTimeout(this.timeout);
    }

    restartTimer() {
        this.stopTimer();
        this.startTimer();
    }

    // Interaction functions
    async update(fn?: () => Promise<void> | void) {
        await fn?.();

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

    log(message: string) {
        console.log(`[${this.id.substring(0, 6)}] ${message}`);
    }
}