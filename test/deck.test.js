const Deck = require('../poker_modules/deck');

describe('testing Deck', () => {
    let deck = new Deck();
    let original_sorting = deck.cards.slice();

    it('deal cards should be perfectly done', () => {
        expect(deck.deal(1)).toEqual(['As']);
        deck.deal(10);
        expect(deck.deal(2)).toEqual(['Qc', 'Js']);
    });

    it('Card order should be different from the original after shuffle', () => {
        expect(deck.shuffle()).not.toEqual(original_sorting);
    });

});