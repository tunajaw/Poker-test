const Player = require('../poker_modules/player');

describe('constructor test', function() {
    let player;

    beforeEach(function() {
        player = new Player({}, 'TestPlayer', 1000);
    });

    it('should initialize a player with given name and chips', function() {
        expect(player.public.name).toBe('TestPlayer');
        expect(player.chips).toBe(1000);
    });
});

describe('leaveTable test', function() {
    let player;

    beforeEach(function() {
        player = new Player({}, 'TestPlayer', 1000);
    });

    it('should update player data when they leave the table', function() {
        player.sitOnTable('table1', 1, 500);
        player.leaveTable();
        expect(player.sittingOnTable).toBe(false);
        expect(player.seat).toBeNull();
        expect(player.public.chipsInPlay).toBe(0);
        expect(player.chips).toBe(1000);
    });

    it('should not update player data if they are not sitting on a table', function() {
        player.leaveTable();
        expect(player.sittingOnTable).toBe(false);
        expect(player.seat).toBeNull();
        expect(player.public.chipsInPlay).toBe(0);
        expect(player.chips).toBe(1000);
    });
});

describe('#sitOnTable', function() {
    let player;

    beforeEach(function() {
        player = new Player({}, 'TestPlayer', 1000);
    });

    it('should sit the player on the table', function() {
        player.sitOnTable('table1', 1, 500);
        expect(player.seat).toBe(1);
        expect(player.sittingOnTable).toBe('table1');
        expect(player.public.chipsInPlay).toBe(500);
        expect(player.chips).toBe(500);
    });
});

describe('#sitOut', function() {
    let player;

    beforeEach(function() {
        player = new Player({}, 'TestPlayer', 1000);
    });

    it('should update the player data when they sit out', function() {
        player.sitOut();
        expect(player.public.sittingIn).toBe(false);
        expect(player.public.inHand).toBe(false);
    });
});

describe('#fold', function() {
    let player;

    beforeEach(function() {
        player = new Player({}, 'TestPlayer', 1000);
    });

    it('should update the player data when they fold', function() {
        player.fold();
        expect(player.cards.length).toBe(0);
        expect(player.public.hasCards).toBe(false);
        expect(player.public.inHand).toBe(false);
    });
});

describe('#bet', function() {
    let player;

    beforeEach(function() {
        player = new Player({}, 'TestPlayer', 1000);
    });

    it('should update the player data when they bet', function() {
        player.public.chipsInPlay = 500;
        player.bet(200);
        expect(player.public.chipsInPlay).toBe(300);
        expect(player.public.bet).toBe(200);
    });

    it('should not bet more than chips in play', function() {
        player.public.chipsInPlay = 300;
        player.bet(400);
        expect(player.public.chipsInPlay).toBe(0);
        expect(player.public.bet).toBe(300);
    });
});

describe('#raise', function() {
    let player;

    beforeEach(function() {
        player = new Player({}, 'TestPlayer', 1000);
    });

    it('should update the player data when they raise', function() {
        player.public.chipsInPlay = 500;
        player.raise(200);
        expect(player.public.chipsInPlay).toBe(300);
        expect(player.public.bet).toBe(200);
    });

    it('should not raise more than chips in play', function() {
        player.public.chipsInPlay = 300;
        player.raise(400);
        expect(player.public.chipsInPlay).toBe(0);
        expect(player.public.bet).toBe(300);
    });
});

describe('#prepareForNewRound', function() {
    let player;

    beforeEach(function() {
        player = new Player({}, 'TestPlayer', 1000);
    });

    it('should reset the player\'s round data', function() {
        player.public.cards = ['Ah', 'Ad'];
        player.public.hasCards = true;
        player.public.bet = 100;
        player.public.inHand = false;
        player.evaluatedHand = { rank: 'pair', name: 'pair of aces' };

        player.prepareForNewRound();

        expect(player.cards.length).toBe(0);
        expect(player.public.cards.length).toBe(0);
        expect(player.public.hasCards).toBe(false);
        expect(player.public.bet).toBe(0);
        expect(player.public.inHand).toBe(true);
        expect(player.evaluatedHand).toEqual({});
    });
});

describe('evaluateHand', () => {
    let player;

    beforeEach(() => {
        player = new Player({}, 'TestPlayer', 1000);
    });

    it('should evaluate a high card hand', () => {
        player.cards = ['Ah', 'Kd'];
        player.evaluateHand(['2s', '3h', '4d', '8c', '7h']);
        expect(player.evaluatedHand.rank).toBe('high card');
        expect(player.evaluatedHand.name).toBe('ace high');
    });

    it('should evaluate a pair', () => {
        player.cards = ['Ah', 'Ad'];
        player.evaluateHand(['2s', '3h', '4d', '8c', '7h']);
        expect(player.evaluatedHand.rank).toBe('pair');
        expect(player.evaluatedHand.name).toBe('a pair of aces');
    });

    it('should evaluate two pair', () => {
        player.cards = ['Ah', 'Ad'];
        player.evaluateHand(['2s', '2h', '4d', '5c', '7h']);
        expect(player.evaluatedHand.rank).toBe('two pair');
        expect(player.evaluatedHand.name).toBe('two pair, aces and deuces');
    });

    it('should evaluate three of a kind', () => {
        player.cards = ['Ah', 'Ad'];
        player.evaluateHand(['2s', 'As', '4d', '5c', '7h']);
        expect(player.evaluatedHand.rank).toBe('three of a kind');
        expect(player.evaluatedHand.name).toBe('three of a kind, aces');
    });

    it('should evaluate a straight', () => {
        player.cards = ['3h', '4d'];
        player.evaluateHand(['5s', '6h', '7d', '9c', 'Jh']);
        expect(player.evaluatedHand.rank).toBe('straight');
        expect(player.evaluatedHand.name).toBe('a straight to seven');
    });

    it('should evaluate a flush', () => {
        player.cards = ['Ah', 'Kh'];
        player.evaluateHand(['2h', '3h', '5h', '7h', '9d']);
        expect(player.evaluatedHand.rank).toBe('flush');
        expect(player.evaluatedHand.name).toBe('a flush, ace high');
    });

    it('should evaluate a full house', () => {
        player.cards = ['Ah', 'Ad'];
        player.evaluateHand(['2s', '2h', '2d', '8c', '7h']);
        expect(player.evaluatedHand.rank).toBe('full house');
        expect(player.evaluatedHand.name).toBe('a full house, deuces full of aces');
    });

    it('should evaluate four of a kind', () => {
        player.cards = ['Ah', 'Ad'];
        player.evaluateHand(['As', 'Ac', '5d', '7h', '9c']);
        expect(player.evaluatedHand.rank).toBe('four of a kind');
        expect(player.evaluatedHand.name).toBe('four of a kind, aces');
    });

    it('should evaluate a straight flush', () => {
        player.cards = ['8h', '9h'];
        player.evaluateHand(['6h', '7h', 'Th', 'Jd', 'Kd']);
        expect(player.evaluatedHand.rank).toBe('straight flush');
        expect(player.evaluatedHand.name).toBe('a straight flush, six to ten');
    });

    it('should evaluate a royal flush', () => {
        player.cards = ['Ah', 'Kh'];
        player.evaluateHand(['Qh', 'Jh', 'Th', '9d', '8c']);
        expect(player.evaluatedHand.rank).toBe('royal flush');
        expect(player.evaluatedHand.name).toBe('a royal flush');
    });

    it('should evaluate a straight with ace and deuce properly', () => {
        player.cards = ['Ah', '5s'];
        player.evaluateHand(['2c', '3d', '4h', '6c', '7d']);
        expect(player.evaluatedHand.rank).toBe('straight');
        expect(player.evaluatedHand.cards).toContain('5s');
    });

    it('should evaluate a two pair properly', () => {
        player.cards = ['2h', '2s'];
        player.evaluateHand(['6c', '5d', '4h', '6s', '7d']);
        expect(player.evaluatedHand.rank).toBe('two pair');
        expect(player.evaluatedHand.cards).toContain('6c');
    });

    it('should handle a specific case where no conditions are met', () => {
        player.cards = ['Ah', 'Ks'];
        player.evaluateHand(['3c', '5d', '7h', '9c', 'Js']);
        expect(player.evaluatedHand.rank).not.toBe('straight');
        expect(player.evaluatedHand.cards).toContain('Ah'); // Ace should not be included
        expect(player.evaluatedHand.cards).toContain('Ks'); // 5 should not be included
    });

    it('should reset straightFlush if currentCardValue is not equal to previousCardValue and straightFlush.length is less than 5', () => {
        const player = new Player({}, 'Test', 1000);
        player.cards = ['2c', '3c'];
        player.evaluateHand(['4c', '5c', 'Ac', '7h', '8h']);
        expect(player.evaluatedHand.rank).toEqual('straight flush');
        expect(player.evaluatedHand.cards.length).toEqual(5);
        expect(player.evaluatedHand.name).toEqual('a straight flush, ace to five');
    });

    it('should set evaluatedHand.rank to four of a kind if the biggest pair has four cards', () => {
        player.cards = ['4c', '4d'];
        player.evaluateHand(['4h', '4s', '5c', '6h', '7h']);
    
        expect(player.evaluatedHand.rank).toEqual('four of a kind');
        expect(player.evaluatedHand.cards.length).toEqual(5);
        expect(player.evaluatedHand.name).toEqual('four of a kind, fours');
    });

    // 測試 "full house" 的情況
    it('should set evaluatedHand.rank to full house if there are three pairs and one of them has three cards', () => {
        const player = new Player({}, 'Test', 1000);
        player.cards = ['4c', '4d'];
        player.evaluateHand(['4h', '5s', '5c', '6h', '6s']);

        expect(player.evaluatedHand.rank).toEqual('full house');
        expect(player.evaluatedHand.cards.length).toEqual(5);
        expect(player.evaluatedHand.name).toEqual('a full house, fours full of sixes');
    });

    // 測試 "two pair" 的情況
    it('should set evaluatedHand.rank to two pair if there are three pairs and none of them has three cards', () => {
        const player = new Player({}, 'Test', 1000);
        player.cards = ['4c', '4d'];
        player.evaluateHand(['5h', '5s', '6c', '6h', '7s']);

        expect(player.evaluatedHand.rank).toEqual('two pair');
        expect(player.evaluatedHand.cards.length).toEqual(5);
        expect(player.evaluatedHand.name).toEqual('two pair, sixes and fives');
    });

    it('should set evaluatedHand.cards to the biggest two pairs if there are three pairs and none of them has three cards', () => {
        const player = new Player({}, 'Test', 1000);
        player.cards = ['7c', '6h'];
        player.evaluateHand(['7d', '6s', '9c', '9h', '8s']);
    
        expect(player.evaluatedHand.cards[0][0]).toEqual('9');
        expect(player.evaluatedHand.cards[1][0]).toEqual('9');
        expect(player.evaluatedHand.cards[2][0]).toEqual('7');
        expect(player.evaluatedHand.cards[3][0]).toEqual('7');
    });

    it('should reset the straight array if the current card is not consecutive and not equal to the previous card', () => {
        const player = new Player({}, 'Test', 1000);
        player.cards = ['3c', '2d'];
        player.evaluateHand(['9h', '8s', 'Tc', 'Jh', 'Qs']);
    
        expect(player.evaluatedHand.rank).toEqual('straight');
    });

    it('should reset the straightFlush array if the current card is not consecutive and not equal to the previous card', () => {
        const player = new Player({}, 'Test', 1000);
        player.cards = ['8d', '8c'];
        player.evaluateHand(['4c', '4d', '4h', '4s', '6c']);
    
        expect(player.evaluatedHand.rank).toEqual('four of a kind');
    });

    it('should reset the straightFlush array if the current card is not consecutive and not equal to the previous card', () => {
        const player = new Player({}, 'Test', 1000);
        player.cards = ['3h', '2h'];
        player.evaluateHand(['9h', '8s', 'Tc', 'Jh', 'Qh']);
    
        expect(player.evaluatedHand.rank).toEqual('flush');
    });

    it('check 5 same value cards', () => {
        const player = new Player({}, 'Test', 1000);
        player.cards = ['3h', '2h'];
        const testFunction = () => {
            player.evaluateHand(['9h', '9s', '9c', '9d', '9h']);
        };
        expect(testFunction).toThrow("Five same value card should never happened!");
    });

    it('4 / 3 => four of the kind', () => {
        const player = new Player({}, 'Test', 1000);
        player.cards = ['3h', '2h'];
        player.evaluateHand(['3s', '3d', '3c', '2d', '2c']);
    
        expect(player.evaluatedHand.rank).toEqual('four of a kind');
    });

    it('flush but have same card continuously', () => {
        const player = new Player({}, 'Test', 1000);
        player.cards = ['4s', '5s'];
        const testFunction = () => {
            player.evaluateHand(['6s', '6s', 'Tc', '7s', '8s']);
        };
        expect(testFunction).toThrow("Flush but have same card continuously!");
    });

});