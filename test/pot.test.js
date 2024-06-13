const Pot = require('../poker_modules/pot');

describe('Pot test', () => {
    let pot = new Pot();

    it('original setting check', () => {
        expect(pot.pots[0].amount).toEqual(0);
        expect(pot.pots[0].contributors).toEqual([]);
    });

    it('reset', () => {
        pot.reset();
        expect(pot.pots[0].amount).toEqual(0);
        expect(pot.pots[0].contributors).toEqual([]);
    });

    it('Empty test', () => {
        expect(pot.isEmpty()).toEqual(true);
        pot.pots[0].amount = 28;
        expect(pot.isEmpty()).toEqual(false);
    });

    it('addTableBets', () => {
        pot.reset();
        const players = [
            { public: { bet: 20, inHand: true }, seat: 0 },
            { public: { bet: 10, inHand: true }, seat: 1 },
        ];
        pot.addTableBets(players);
        expect(pot.pots[0].amount).toEqual(20);
        expect(pot.pots[1].amount).toEqual(10);
        expect(pot.pots[0].contributors).toEqual([0, 1]);
        expect(pot.pots[1].contributors).toEqual([0]);
    });

    it('addTableBets with player bet greater than smallest bet', () => {
        pot.reset();
        const players = [
            { public: { chipsInPlay: 20, name: 'Player1', inHand: true, bet: 10 }, evaluatedHand: { rating: 2300486, name: 'two pair, jacks and fives', cards: ['5s', 'Js'] }, seat: 0 },
            { public: { chipsInPlay: 30, name: 'Player2', inHand: true, bet: 11 }, evaluatedHand: { rating: 2300486, name: 'two pair, jacks and fives', cards: ['5h', 'Jh'] }, seat: 1 },
            { public: { chipsInPlay: 40, name: 'Player3', inHand: true, bet: 12 }, evaluatedHand: { rating: 3100676, name: 'three of a kind, fives', cards: ['5c', '5h'] }, seat: 2 },
        ];
        pot.addTableBets(players);
        expect(pot.pots[0].contributors).toEqual([0, 1, 2]);
        expect(pot.pots[0].amount).toEqual(30);
        expect(pot.pots[1].contributors).toEqual([1, 2]);
        expect(pot.pots[1].amount).toEqual(2);
        expect(pot.pots[2].contributors).toEqual([2]);
        expect(pot.pots[2].amount).toEqual(1);
        expect(players[0].public.bet).toEqual(0);
        expect(players[1].public.bet).toEqual(0);
        expect(players[2].public.bet).toEqual(0);
    });

    it('addTableBets with player already in contributors', () => {
        pot.reset();
        const players = [
            { public: { chipsInPlay: 20, name: 'Player1', inHand: true, bet: 10 }, evaluatedHand: { rating: 2300486, name: 'two pair, jacks and fives', cards: ['5s', 'Js'] }, seat: 0 },
            { public: { chipsInPlay: 30, name: 'Player2', inHand: true, bet: 10 }, evaluatedHand: { rating: 2300486, name: 'two pair, jacks and fives', cards: ['5h', 'Jh'] }, seat: 1 },
            { public: { chipsInPlay: 40, name: 'Player3', inHand: true, bet: 10 }, evaluatedHand: { rating: 3100676, name: 'three of a kind, fives', cards: ['5c', '5h'] }, seat: 2 },
        ];
        // Manually add players to contributors
        pot.pots[0].contributors.push(0, 1, 2);
        pot.addTableBets(players);
        expect(pot.pots[0].contributors).toEqual([0, 1, 2]);
        expect(pot.pots[0].amount).toEqual(30);
        expect(players[0].public.bet).toEqual(0);
        expect(players[1].public.bet).toEqual(0);
        expect(players[2].public.bet).toEqual(0);
    });

    it('addTableBets should not add a player to contributors if they are already present', () => {
        pot.reset();
        const players = [
            { public: { chipsInPlay: 20, name: 'Player1', inHand: true, bet: 11 }, evaluatedHand: { rating: 2300486, name: 'two pair, jacks and fives', cards: ['5s', 'Js'] }, seat: 0 },
            { public: { chipsInPlay: 30, name: 'Player2', inHand: true, bet: 12 }, evaluatedHand: { rating: 2300486, name: 'two pair, jacks and fives', cards: ['5h', 'Jh'] }, seat: 1 },
            { public: { chipsInPlay: 40, name: 'Player3', inHand: true, bet: 13 }, evaluatedHand: { rating: 2300486, name: 'two pair, jacks and fives', cards: ['5c', '5h'] }, seat: 2 },
        ];
        // Manually add players to contributors
        pot.pots[0].contributors.push(0, 1, 2);
        pot.addTableBets(players);
        expect(pot.pots[0].contributors).toEqual([0, 1, 2]);
        expect(pot.pots[0].amount).toEqual(33);
        expect(players[0].public.bet).toEqual(0);
        expect(players[1].public.bet).toEqual(0);
        expect(players[2].public.bet).toEqual(0);
    });

    it('check addPlayersBets', () => {
        pot.reset();
        const players = [
            {  seat: 0, public: { chipsInPlay: 20, name: 'Player1', inHand: true, bet: 10 }, evaluatedHand: { rating: 2300486, name: 'two pair, jacks and fives', cards: ['5s', 'Js'] }},
            { seat: 1, public: { chipsInPlay: 30, name: 'Player2', inHand: true, bet: 10 }, evaluatedHand: { rating: 1068376, name: 'a pair of fours', cards: ['4c', '3s'] }},
            { seat: 2, public: { chipsInPlay: 40, name: 'Player3', inHand: true, bet: 10 }, evaluatedHand: { rating: 3100676, name: 'three of a kind, fives', cards: ['5c', '5h'] }},
        ];
        players.forEach(player => {
            pot.addPlayersBets(player);
        });
        expect(pot.pots[0].amount).toEqual(30);
        expect(pot.pots[0].contributors).toEqual([0,1,2]);
    });

    it('addPlayersBets with player already in contributors', () => {
        pot.reset();
        const player = { public: { chipsInPlay: 20, name: 'Player1', inHand: true, bet: 10 }, evaluatedHand: { rating: 2300486, name: 'two pair, jacks and fives', cards: ['5s', 'Js'] }, seat: 0 };
        // Manually add player to contributors
        pot.pots[0].contributors.push(player.seat);
        pot.addPlayersBets(player);
        expect(pot.pots[0].contributors).toEqual([0]);
        expect(pot.pots[0].amount).toEqual(10);
        expect(player.public.bet).toEqual(0);
    });

    it('destributeToWinners with no tie', () => {
        pot.reset();
        const players = [
            { public: { chipsInPlay: 20, name: 'Player1', inHand: true, bet: 10 }, evaluatedHand: { rating: 2300486, name: 'two pair, jacks and fives', cards: ['5s', 'Js'] }, seat: 0 },
            { public: { chipsInPlay: 30, name: 'Player2', inHand: true, bet: 10 }, evaluatedHand: { rating: 1068376, name: 'a pair of fours', cards: ['4c', '3s'] }, seat: 1 },
            { public: { chipsInPlay: 40, name: 'Player3', inHand: true, bet: 10 }, evaluatedHand: { rating: 3100676, name: 'three of a kind, fives', cards: ['5c', '5h'] }, seat: 2 },
        ];
        players.forEach(player => {
            pot.addPlayersBets(player);
        });
        const firstPlayerToAct = 0;
        const messages = pot.destributeToWinners(players, firstPlayerToAct);
        expect(players[0].public.chipsInPlay).toEqual(20);
        expect(players[1].public.chipsInPlay).toEqual(30);
        expect(players[2].public.chipsInPlay).toEqual(70);
        expect(messages[0]).toContain('Player3 wins the pot (30) with three of a kind, fives [5&#9827;, 5&#9829;]');
    });

    it('destributeToWinners with tie and one winner', () => {
        pot.reset();
        const players = [
            { public: { chipsInPlay: 20, name: 'Player1', inHand: true, bet: 10 }, evaluatedHand: { rating: 2300486, name: 'two pair, jacks and fives', cards: ['5s', 'Js'] }, seat: 0 },
            { public: { chipsInPlay: 30, name: 'Player2', inHand: true, bet: 10 }, evaluatedHand: { rating: 2300486, name: 'two pair, jacks and fives', cards: ['5h', 'Jh'] }, seat: 1 },
            { public: { chipsInPlay: 40, name: 'Player3', inHand: true, bet: 10 }, evaluatedHand: { rating: 3100676, name: 'three of a kind, fives', cards: ['5c', '5h'] }, seat: 2 },
        ];
        players.forEach(player => {
            pot.addPlayersBets(player);
        });
        const firstPlayerToAct = 0;
        const messages = pot.destributeToWinners(players, firstPlayerToAct);
        expect(players[0].public.chipsInPlay).toEqual(20);
        expect(players[1].public.chipsInPlay).toEqual(30);
        expect(players[2].public.chipsInPlay).toEqual(70);
        expect(messages[0]).toContain('Player3 wins the pot (30) with three of a kind, fives [5&#9827;, 5&#9829;]');
    });

    it('destributeToWinners with tie and two winner', () => {
        pot.reset();
        const players = [
            { public: { chipsInPlay: 20, name: 'Player1', inHand: true, bet: 10 }, evaluatedHand: { rating: 2300486, name: 'two pair, jacks and fives', cards: ['5s', 'Js'] }, seat: 0 },
            { public: { chipsInPlay: 30, name: 'Player2', inHand: true, bet: 10 }, evaluatedHand: { rating: 3100676, name: 'three of a kind, fives', cards: ['5h', 'Jh'] }, seat: 1 },
            { public: { chipsInPlay: 40, name: 'Player3', inHand: true, bet: 10 }, evaluatedHand: { rating: 3100676, name: 'three of a kind, fives', cards: ['5c', '5h'] }, seat: 2 },
        ];
        players.forEach(player => {
            pot.addPlayersBets(player);
        });
        const firstPlayerToAct = 0;
        const messages = pot.destributeToWinners(players, firstPlayerToAct);
        expect(players[0].public.chipsInPlay).toEqual(20);
        expect(players[1].public.chipsInPlay).toEqual(45);
        expect(players[2].public.chipsInPlay).toEqual(55);
        expect(messages[0]).toContain('Player2 ties the pot (15) with three of a kind, fives [5&#9829;, J&#9829;]');
        expect(messages[1]).toContain('Player3 ties the pot (15) with three of a kind, fives [5&#9827;, 5&#9829;]');
    });

    it('destributeToWinners with odd chip', () => {
        pot.reset();
        const players = [
            { public: { chipsInPlay: 20, name: 'Player1', inHand: true, bet: 10 }, evaluatedHand: { rating: 2300486, name: 'two pair, jacks and fives', cards: ['5s', 'Js'] }, seat: 0 },
            { public: { chipsInPlay: 30, name: 'Player2', inHand: true, bet: 11 }, evaluatedHand: { rating: 3100676, name: 'three of a kind, fives', cards: ['5h', 'Jh'] }, seat: 1 },
            { public: { chipsInPlay: 40, name: 'Player3', inHand: true, bet: 10 }, evaluatedHand: { rating: 3100676, name: 'three of a kind, fives', cards: ['5c', '5h'] }, seat: 2 },
        ];
        players.forEach(player => {
            pot.addPlayersBets(player);
        });
        const firstPlayerToAct = 1;
        const messages = pot.destributeToWinners(players, firstPlayerToAct);
        expect(players[0].public.chipsInPlay).toEqual(20);
        expect(players[1].public.chipsInPlay).toEqual(46);
        expect(players[2].public.chipsInPlay).toEqual(55);
        expect(messages[0]).toContain('Player2 ties the pot (16) with three of a kind, fives [5&#9829;, J&#9829;]');
    });

    it('destributeToWinners with player not in hand or not a contributor', () => {
        pot.reset();
        const players = [
            { public: { chipsInPlay: 20, name: 'Player1', inHand: false, bet: 10 }, evaluatedHand: { rating: 2300486, name: 'two pair, jacks and fives', cards: ['5s', 'Js'] }, seat: 0 },
            { public: { chipsInPlay: 30, name: 'Player2', inHand: true, bet: 11 }, evaluatedHand: { rating: 2300486, name: 'two pair, jacks and fives', cards: ['5h', 'Jh'] }, seat: 1 },
            { public: { chipsInPlay: 40, name: 'Player3', inHand: true, bet: 10 }, evaluatedHand: { rating: 3100676, name: 'three of a kind, fives', cards: ['5c', '5h'] }, seat: 2 },
        ];
        players.forEach(player => {
            pot.addPlayersBets(player);
        });
        const firstPlayerToAct = 1;
        const messages = pot.destributeToWinners(players, firstPlayerToAct);
        expect(players[0].public.chipsInPlay).toEqual(20);
        expect(players[1].public.chipsInPlay).toEqual(30);
        expect(players[2].public.chipsInPlay).toEqual(71);
        expect(messages[0]).toContain('Player3 wins the pot (31) with three of a kind, fives [5&#9827;, 5&#9829;]');
    });

    it('giveToWinner', () => {
        const winner = { public: { chipsInPlay: 0, name: 'Winner' } };
        const message = pot.giveToWinner(winner);
        expect(winner.public.chipsInPlay).toEqual(0);
        expect(message).toEqual('Winner wins the pot (0)');
    });

    it('removePlayer', () => {
        pot.pots[0].contributors.push(3);
        pot.removePlayer(3);
        expect(pot.pots[0].contributors).toEqual([]);
    });

    it('removePlayer not in contributors', () => {
        pot.pots[0].contributors.push(3);
        pot.removePlayer(4);
        expect(pot.pots[0].contributors).toEqual([3]);
    });
});