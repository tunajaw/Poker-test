const Pot = require('../poker_modules/pot');

describe('Pot test', () => {
    let pot = new Pot();

    it('original setting check', () => {
        expect(pot.pots[0].amount).toEqual(0);
        expect(pot.pots[0].contributors).toEqual([]);
    });

    it('Empty test', () => {
        expect(pot.isEmpty()).toEqual(true);
        pot.pots[0].amount = 28;
        expect(pot.isEmpty()).toEqual(false);
    });

    it('reset', () => {
        pot.reset();
        expect(pot.pots[0].amount).toEqual(0);
        expect(pot.pots[0].contributors).toEqual([]);
    })


})