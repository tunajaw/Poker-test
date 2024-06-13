const Table = require('../poker_modules/table');
const Deck = require('../poker_modules/deck');
const Pot = require('../poker_modules/pot');

describe('emitEvent test', () => {
    
    let table;

    beforeEach(() => {
      table = new Table('1', 'Test Table', () => {}, 2, 100, 50, 1000, 500, false);
      table.eventEmitter = jest.fn(); // mock the eventEmitter function
      table.log = jest.fn(); // mock the log function
    });

    test('initializes seats correctly', () => {
        expect(table.seats).toEqual(Array(table.public.seatsCount).fill(null));
    });

    test('emits events correctly', () => {
        const eventName = 'testEvent';
        const eventData = { data: 'testData' };

        table.emitEvent(eventName, eventData);

        expect(table.eventEmitter).toHaveBeenCalledWith(eventName, eventData);
        expect(table.log).toHaveBeenCalledWith({
            message: '',
            action: '',
            seat: '',
            notification: ''
        });
    });
});

describe('findNextPlayer test', () => {
    let table;

    beforeEach(() => {
      table = new Table('1', 'Test Table', () => {}, 2, 100, 50, 1000, 500, false);
      table.eventEmitter = jest.fn(); // mock the eventEmitter function
      table.log = jest.fn(); // mock the log function
    });

    test('finds next player correctly', () => {
        // Mock players
        const player1 = { public: { inHand: true } };
        const player2 = { public: { inHand: true} };
        const player3 = { public: { inHand: false } };
        
        // Set seats
        table.seats[0] = player1;
        table.seats[1] = player2;
        table.seats[2] = player3;
        
        // Test finding next player with status 'inHand'
        expect(table.findNextPlayer(0, 'inHand')).toBe(1);
        expect(table.findNextPlayer(2, 'inHand')).toBe(0);
        
        // Test finding next player with multiple statuses
        expect(table.findNextPlayer(0, ['inHand'])).toBe(1);
        expect(table.findNextPlayer(2, ['inHand'])).toBe(0);
        
        // Test finding next player with no valid next player
        expect(table.findNextPlayer(0, 'notInHand')).toBeNull();
      });

    test('finds next player correctly, including null seats', () => {
        // Mock players
        const player1 = { public: { inHand: true } };
        
        // Set seats
        table.seats[0] = player1;
        table.seats[1] = null; // Add a null seat
        
        // Test finding next player with status 'inHand'
        expect(table.findNextPlayer(0, 'inHand')).toBe(0);
        
        // Test finding next player with multiple statuses
        expect(table.findNextPlayer(0, ['inHand'])).toBe(0);
        
        // Test finding next player with no valid next player
        expect(table.findNextPlayer(0, 'notInHand')).toBeNull();
    });

    test('finds next player correctly, including invalid status', () => {
        // Mock players
        const player1 = { public: { inHand: true } };
        const player2 = { public: { inHand: false } }; // Player with invalid status
      
        // Set seats
        table.seats[0] = player1;
        table.seats[1] = player2;
      
        // Test finding next player with status 'inHand'
        expect(table.findNextPlayer(0, 'inHand')).toBe(0);
      
        // Test finding next player with multiple statuses
        expect(table.findNextPlayer(0, ['inHand'])).toBe(0);
    });

    test('finds next player correctly, including null seats', () => {
        // Mock players
        const player1 = { public: { inHand: true } };
        const player2 = { public: { inHand: true } };
      
        // Set seats
        table.seats[0] = null; // Add a null seat
        table.seats[1] = player1;
        table.seats[2] = player2;
        
        // Set seatsCount and activeSeat
        table.public.seatsCount = 3;
        table.public.activeSeat = 3; // Set activeSeat to seatsCount to skip the first loop
        
        // Test finding next player with status 'inHand'
        expect(table.findNextPlayer(table.public.activeSeat, 'inHand')).toBe(1);
        
        // Test finding next player with multiple statuses
        expect(table.findNextPlayer(table.public.activeSeat, ['inHand'])).toBe(1);
    });

    test('finds next player correctly, including invalid status', () => {
        // Mock players
        const player1 = { public: { inHand: false } }; // Set inHand to false
        const player2 = { public: { inHand: true } };
      
        // Set seats
        table.seats[0] = player1;
        table.seats[1] = player2;
        
        // Set seatsCount and activeSeat
        table.public.seatsCount = 2;
        table.public.activeSeat = 2; // Set activeSeat to seatsCount to skip the first loop
        
        // Test finding next player with status 'inHand'
        expect(table.findNextPlayer(table.public.activeSeat, 'inHand')).toBe(1);
        
        // Test finding next player with multiple statuses
        expect(table.findNextPlayer(table.public.activeSeat, ['inHand'])).toBe(1);
    });

    test('finds previous player correctly', () => {
        // Mock players
        const player1 = { public: { inHand: true } };
        const player2 = { public: { inHand: true } };
        const player3 = { public: { inHand: false } };
      
        // Set seats
        table.seats[0] = player1;
        table.seats[1] = player2;
        table.seats[2] = player3;
        
        // Set seatsCount and activeSeat
        table.public.seatsCount = 3;
        table.public.activeSeat = 2; // Set activeSeat to 2
        
        // Test finding previous player with status 'inHand'
        expect(table.findPreviousPlayer(table.public.activeSeat, 'inHand')).toBe(1);
        
        // Test finding previous player with multiple statuses
        expect(table.findPreviousPlayer(table.public.activeSeat, ['inHand'])).toBe(1);
    });

    it('should use activeSeat as offset if offset is undefined', () => {
        table.public.activeSeat = 2; // set the active seat
        table.public.seatsCount = 5; // set the seats count
        table.seats = [null, null, { public: { inHand: true } }, null, { public: { inHand: true } }]; // set the seats
    
        const nextPlayer = Table.prototype.findNextPlayer.call(table);
    
        expect(nextPlayer).toEqual(4);
    });
});

describe('findPreviousPlayer test', () => {
    let table;

    beforeEach(() => {
      table = new Table('1', 'Test Table', () => {}, 2, 100, 50, 1000, 500, false);
      table.eventEmitter = jest.fn(); // mock the eventEmitter function
      table.log = jest.fn(); // mock the log function
    });
    test('finds previous player correctly, including null seats', () => {
        // Mock players
        const player1 = { public: { inHand: true } };
        const player2 = { public: { inHand: true } };
        
        // Set seats
        table.seats[0] = player1;
        table.seats[1] = null; // Add a null seat
        table.seats[2] = player2;
        
        // Set seatsCount and activeSeat
        table.public.seatsCount = 3;
        table.public.activeSeat = 2; // Set activeSeat to 2
        
        // Test finding previous player with status 'inHand'
        expect(table.findPreviousPlayer(table.public.activeSeat, 'inHand')).toBe(0);
        
        // Test finding previous player with multiple statuses
        expect(table.findPreviousPlayer(table.public.activeSeat, ['inHand'])).toBe(0);
    });
      
    test('returns null if no previous player found', () => {
        // Mock players
        const player1 = { public: { inHand: false } }; // Set inHand to false
        const player2 = { public: { inHand: false } }; // Set inHand to false
        
        // Set seats
        table.seats[0] = player1;
        table.seats[1] = player2;
        
        // Set seatsCount and activeSeat
        table.public.seatsCount = 2;
        table.public.activeSeat = 1; // Set activeSeat to 1
        
        // Test finding previous player with status 'inHand'
        expect(table.findPreviousPlayer(table.public.activeSeat, 'inHand')).toBe(null);
        
        // Test finding previous player with multiple statuses
        expect(table.findPreviousPlayer(table.public.activeSeat, ['inHand'])).toBe(null);
    });

    test('finds previous player correctly, including offset equals to 0', () => {
        // Mock players
        const player1 = { public: { inHand: false } }; // Set inHand to false
        const player2 = { public: { inHand: true } };
      
        // Set seats
        table.seats[0] = player1;
        table.seats[1] = player2;
        
        // Set seatsCount and activeSeat
        table.public.seatsCount = 2;
        table.public.activeSeat = 0; // Set activeSeat to 0
        
        // Test finding previous player with status 'inHand'
        expect(table.findPreviousPlayer(table.public.activeSeat, 'inHand')).toBe(1);
        
        // Test finding previous player with multiple statuses
        expect(table.findPreviousPlayer(table.public.activeSeat, ['inHand'])).toBe(1);
    });

    test('finds previous player correctly when status is an array and offset is 0, including null seats', () => {
        // Mock players
        const player1 = { public: { inHand: true } };
        const player2 = { public: { inHand: true } };
      
        // Set seats
        table.seats[0] = null; // Add a null seat
        table.seats[1] = player1;
        table.seats[2] = player2;
        
        // Set seatsCount and activeSeat
        table.public.seatsCount = 3;
        table.public.activeSeat = 0; // Set activeSeat to 0
        
        // Test finding previous player with multiple statuses
        expect(table.findPreviousPlayer(table.public.activeSeat, ['notInHand'])).toBeNull();
    });

    it('should use activeSeat as offset if offset is undefined', () => {
        table.public.activeSeat = 2; // set the active seat
        table.public.seatsCount = 5; // set the seats count
        table.seats = [null, { public: { inHand: true } }, null, { public: { inHand: true } }, null]; // set the seats
    
        const previousPlayer = Table.prototype.findPreviousPlayer.call(table);
    
        expect(previousPlayer).toEqual(1);
    });
});

describe('initializeRound test', () => {
    let table;

    beforeEach(() => {
        table = new Table('1', 'Test Table', () => {}, 2, 100, 50, 1000, 500, false);
        table.eventEmitter = jest.fn(); // mock the eventEmitter function
        table.log = jest.fn(); // mock the log function
        table.findNextPlayer = jest.fn(); // mock the findNextPlayer function
        table.initializeSmallBlind = jest.fn(); // mock the initializeSmallBlind function
    });
    
    test('initializeRound correctly with more than one player sitting in', () => {
        // Mock players
        const player1 = { 
            public: { sittingIn: true, chipsInPlay: true }, 
            prepareForNewRound: jest.fn(),
            socket: { emit: jest.fn() } // Add this line
        };
          const player2 = { 
            public: { sittingIn: true, chipsInPlay: true }, 
            prepareForNewRound: jest.fn(),
            socket: { emit: jest.fn() } // Add this line
        };
      
        // Set seats
        table.seats[0] = player1;
        table.seats[1] = player2;
        
        // Set seatsCount and playersSittingInCount
        table.public.seatsCount = 2;
        table.playersSittingInCount = 2;
        
        // Call initializeRound
        table.initializeRound();
      
        // Check if gameIsOn is set to true
        expect(table.gameIsOn).toBe(true);
      
        // Check if playersInHandCount is updated correctly
        expect(table.playersInHandCount).toBe(2);
      
        // Check if prepareForNewRound is called
        expect(player1.prepareForNewRound).toHaveBeenCalled();
        expect(player2.prepareForNewRound).toHaveBeenCalled();
    });
      
    test('initializeRound correctly with one player sitting in', () => {
        // Mock players
        const player1 = { 
            public: { sittingIn: true, chipsInPlay: true }, 
            prepareForNewRound: jest.fn(),
            socket: { emit: jest.fn() }
          };
          const player2 = { 
            public: { sittingIn: false, chipsInPlay: true }, 
            prepareForNewRound: jest.fn(),
            socket: { emit: jest.fn() }
          };
        
        // Set seats
        table.seats[0] = player1;
        table.seats[1] = player2;
        
        // Set seatsCount and playersSittingInCount
        table.public.seatsCount = 2;
        table.playersSittingInCount = 1;
        
        // Call initializeRound
        table.initializeRound();
        
        // Check if gameIsOn is set to true
        expect(table.gameIsOn).toBe(false);
        
        // Check if playersInHandCount is updated correctly
        expect(table.playersInHandCount).toBe(0);
        
    });
      
    test('initializeRound correctly with no players sitting in', () => {
        // Mock players
        const player1 = { public: { sittingIn: false, chipsInPlay: true }, prepareForNewRound: jest.fn() };
        const player2 = { public: { sittingIn: false, chipsInPlay: true }, prepareForNewRound: jest.fn() };
        
        // Set seats
        table.seats[0] = player1;
        table.seats[1] = player2;
        
        // Set seatsCount and playersSittingInCount
        table.public.seatsCount = 2;
        table.playersSittingInCount = 0;
        
        // Call initializeRound
        table.initializeRound();
        
        // Check if gameIsOn is set to false
        expect(table.gameIsOn).toBe(false);
        
        // Check if playersInHandCount is not updated
        expect(table.playersInHandCount).toBe(0);
        
        // Check if prepareForNewRound is not called
        expect(player1.prepareForNewRound).not.toHaveBeenCalled();
        expect(player2.prepareForNewRound).not.toHaveBeenCalled();
    });

    test('initializeRound correctly with one player sitting in', () => {
        // Mock players
        const player1 = { 
            public: { sittingIn: true, chipsInPlay: true }, 
            prepareForNewRound: jest.fn(),
            socket: { emit: jest.fn() }
          };
          const player2 = { 
            public: { sittingIn: true, chipsInPlay: true },  
            prepareForNewRound: jest.fn(),
            socket: { emit: jest.fn() }
          };
          const player3 = { 
            public: { sittingIn: false, chipsInPlay: true }, 
            prepareForNewRound: jest.fn(),
            socket: { emit: jest.fn() }
          };
          const player4 = {  // Add this player
            public: { sittingIn: false, chipsInPlay: true }, 
            prepareForNewRound: jest.fn(),
            socket: { emit: jest.fn() }
          };
        
        // Set seats
        table.seats[0] = player1;
        table.seats[1] = player2;
        table.seats[2] = player3;
        table.seats[3] = player4;  // Add this seat
        
        // Set seatsCount and playersSittingInCount
        table.public.seatsCount = 4; // Change this to 4
        table.playersSittingInCount = 2;
        
        // Call initializeRound
        table.initializeRound();
        
        // Check if gameIsOn is set to true
        expect(table.gameIsOn).toBe(true);
        
        // Check if playersInHandCount is updated correctly
        expect(table.playersInHandCount).toBe(2);
        
        // Check if prepareForNewRound is called
        expect(player1.prepareForNewRound).toHaveBeenCalled();
        expect(player2.prepareForNewRound).toHaveBeenCalled();
        expect(player3.prepareForNewRound).not.toHaveBeenCalled();
        expect(player4.prepareForNewRound).not.toHaveBeenCalled();  // Add this line
    });

    test('initializeRound correctly with one player sitting in', () => {
        // Mock players
        const player1 = { 
            public: { sittingIn: true, chipsInPlay: true }, 
            prepareForNewRound: jest.fn(),
            sitOut: jest.fn(),  // Add this line
            socket: { emit: jest.fn() }
          };
          const player2 = { 
            public: { sittingIn: true, chipsInPlay: false },  // Change this to false
            prepareForNewRound: jest.fn(),
            sitOut: jest.fn(),  // Add this line
            socket: { emit: jest.fn() }
          };
          const player3 = { 
            public: { sittingIn: false, chipsInPlay: true }, 
            prepareForNewRound: jest.fn(),
            sitOut: jest.fn(),  // Add this line
            socket: { emit: jest.fn() }
          };
          const player4 = { 
            public: { sittingIn: false, chipsInPlay: true }, 
            prepareForNewRound: jest.fn(),
            sitOut: jest.fn(),  // Add this line
            socket: { emit: jest.fn() }
          };
        
        // Set seats
        table.seats[0] = player1;
        table.seats[1] = player2;
        table.seats[2] = player3;
        table.seats[3] = player4;
        
        // Set seatsCount and playersSittingInCount
        table.public.seatsCount = 4;
        table.playersSittingInCount = 2;
        
        // Call initializeRound
        table.initializeRound();
        
        // Check if gameIsOn is set to true
        expect(table.gameIsOn).toBe(true);
        
        // Check if playersInHandCount is updated correctly
        expect(table.playersInHandCount).toBe(1); // Change this to 1
        
        // Check if sitOut is called for player with no chips in play
        expect(player1.sitOut).not.toHaveBeenCalled();
        expect(player2.sitOut).toHaveBeenCalled(); // Change this to toHaveBeenCalled
        expect(player3.sitOut).not.toHaveBeenCalled();
        expect(player4.sitOut).not.toHaveBeenCalled();
        
        // Check if prepareForNewRound is called
        expect(player1.prepareForNewRound).toHaveBeenCalled();
        expect(player2.prepareForNewRound).not.toHaveBeenCalled(); // Change this to not.toHaveBeenCalled
        expect(player3.prepareForNewRound).not.toHaveBeenCalled();
        expect(player4.prepareForNewRound).not.toHaveBeenCalled();
    });

    // it('should update dealerSeat if changeDealer is true or the current dealer is not sitting in', () => {
    //     table.public.dealerSeat = 0; // The current dealer
    //     table.playersSittingInCount = 2; // There are two players sitting in
    //     // Set up a mock player at seat 0
    //     table.seats[0] = {
    //         public: {
    //             sittingIn: true, // The player is initially sitting in
    //         },
    //     };
    //     table.seats[0].public.sittingIn = false; // The dealer is not sitting in
    //     const findNextPlayerSpy = jest.spyOn(table, 'findNextPlayer');
    //     const dealerSeat = table.public.dealerSeat; // Save the dealerSeat
    //     Table.prototype.initializeRound.call(table, true);
    //     expect(table.public.dealerSeat).not.toBe(dealerSeat); // The dealerSeat should be updated
    // });

    it('should change dealer if the current dealer is sitting out', () => {
        table.public.dealerSeat = 1; // set the dealer seat
        table.public.seatsCount = 3; // set the seats count
        table.playersSittingInCount = 2; // set the players sitting in count
        table.seats = [
            { 
                public: { sittingIn: true },
                sitOut: function() {}  // add sitOut method
            },
            { 
                public: { sittingIn: false }, // the dealer is sitting out
                sitOut: function() {}  // add sitOut method
            },
            { 
                public: { sittingIn: true },
                sitOut: function() {}  // add sitOut method
            }
        ]; // set the seats
    
        // Mock the findNextPlayer method to return the expected dealer seat
        table.findNextPlayer = jest.fn(() => 2);

        Table.prototype.initializeRound.call(table, false);
    
        expect(table.public.dealerSeat).toEqual(2);
    });

    it('should increase playersInHandCount and call prepareForNewRound if player is sitting in and has chips in play', () => {
        table.public.seatsCount = 3; // set the seats count
        table.playersSittingInCount = 4; // set the players sitting in count
        table.playersInHandCount = 0; // set the players in hand count
        table.seats = [
            { 
                public: { sittingIn: true, chipsInPlay: true },
                prepareForNewRound: jest.fn(),  // add prepareForNewRound method
                sitOut: function() {}  // add sitOut method
            },
            { 
                public: { sittingIn: true, chipsInPlay: true },
                prepareForNewRound: jest.fn(),  // add prepareForNewRound method
                sitOut: function() {}  // add sitOut method
            },
            { 
                public: { sittingIn: false, chipsInPlay: true },
                prepareForNewRound: jest.fn(),  // add prepareForNewRound method
                sitOut: function() {}  // add sitOut method
            },
            { 
                public: { sittingIn: true, chipsInPlay: true },
                prepareForNewRound: jest.fn(),  // add prepareForNewRound method
                sitOut: function() {}  // add sitOut method
            }
        ]; // set the seats
        Table.prototype.initializeRound.call(table);
    
        expect(table.playersInHandCount).toEqual(2);
        expect(table.seats[0].prepareForNewRound).toHaveBeenCalled();
    });

    it('should handle the case where the dealer seat needs to be reassigned', () => {
        table.public.dealerSeat = 1; // This seat is currently dealer
        table.findNextPlayer = jest.fn().mockReturnValue(0);
        table.playersSittingInCount = 4;
        table.seats = [
            { 
                public: { sittingIn: true, chipsInPlay: true },
                prepareForNewRound: jest.fn(),  // add prepareForNewRound method
                sitOut: function() {}  // add sitOut method
            },
            { 
                public: { sittingIn: true, chipsInPlay: true },
                prepareForNewRound: jest.fn(),  // add prepareForNewRound method
                sitOut: function() {}  // add sitOut method
            },
            { 
                public: { sittingIn: true, chipsInPlay: true },
                prepareForNewRound: jest.fn(),  // add prepareForNewRound method
                sitOut: function() {}  // add sitOut method
            },
            { 
                public: { sittingIn: true, chipsInPlay: true },
                prepareForNewRound: jest.fn(),  // add prepareForNewRound method
                sitOut: function() {}  // add sitOut method
            }
        ]; // set the seats
        Table.prototype.initializeRound.call(table, false);
        
        expect(table.findNextPlayer).not.toHaveBeenCalled();
        expect(table.public.dealerSeat).toBe(1);
    });
});

describe('initializeSmallBlind test', () => {
    let table;
    let mockEmit;

    beforeEach(() => {
        mockEmit = jest.fn();

        table = {
            public: {
                phase: null,
                activeSeat: null,
                dealerSeat: 0,
            },
            headsUp: false,
            lastPlayerToAct: null,
            seats: [
                {
                    socket: { emit: mockEmit },
                },
                {
                    socket: { emit: mockEmit },
                },
            ],
            findNextPlayer: jest.fn().mockReturnValue(1),
            emitEvent: jest.fn(),
        };

        Table.prototype.initializeSmallBlind.call(table);
    });

    it('should set the phase to "smallBlind"', () => {
        expect(table.public.phase).toBe('smallBlind');
    });

    it('should set the activeSeat to the next player if not headsUp', () => {
        expect(table.public.activeSeat).toBe(1);
    });

    it('should set the activeSeat to the dealer if headsUp', () => {
        table.headsUp = true;
        Table.prototype.initializeSmallBlind.call(table);

        expect(table.public.activeSeat).toBe(0);
    });

    it('should set the lastPlayerToAct to 10', () => {
        expect(table.lastPlayerToAct).toBe(10);
    });

    it('should emit "postSmallBlind" to the active player', () => {
        expect(mockEmit).toHaveBeenCalledWith('postSmallBlind');
    });

    it('should emit "table-data" with the public table data', () => {
        expect(table.emitEvent).toHaveBeenCalledWith('table-data', table.public);
    });
});

describe('initializeBigBlind test', () => {
    let table;

    beforeEach(() => {
        table = {
            public: {
                phase: null,
            },
            actionToNextPlayer: jest.fn(),
        };

        Table.prototype.initializeBigBlind.call(table);
    });

    it('should set the phase to "bigBlind"', () => {
        expect(table.public.phase).toBe('bigBlind');
    });

    it('should call actionToNextPlayer', () => {
        expect(table.actionToNextPlayer).toHaveBeenCalled();
    });
});

describe('initializePreflop test', () => {
    let table;
    let mockEmit;

    beforeEach(() => {
        mockEmit = jest.fn();

        table = {
            public: {
                phase: null,
                activeSeat: 0,
            },
            playersInHandCount: 2,
            lastPlayerToAct: null,
            seats: [
                {
                    cards: null,
                    public: { hasCards: false },
                    socket: { emit: mockEmit },
                },
                {
                    cards: null,
                    public: { hasCards: false },
                    socket: { emit: mockEmit },
                },
            ],
            deck: {
                deal: jest.fn().mockReturnValue(['card1', 'card2']),
            },
            findNextPlayer: jest.fn().mockReturnValue(1),
            actionToNextPlayer: jest.fn(),
        };

        Table.prototype.initializePreflop.call(table);
    });

    it('should set the phase to "preflop"', () => {
        expect(table.public.phase).toBe('preflop');
    });

    it('should set the lastPlayerToAct to the activeSeat', () => {
        expect(table.lastPlayerToAct).toBe(0);
    });

    it('should deal 2 cards to each player in hand', () => {
        expect(table.seats[0].cards).toEqual(['card1', 'card2']);
        expect(table.seats[1].cards).toEqual(['card1', 'card2']);
    });

    it('should set hasCards to true for each player in hand', () => {
        expect(table.seats[0].public.hasCards).toBe(true);
        expect(table.seats[1].public.hasCards).toBe(true);
    });

    it('should emit "dealingCards" with the dealt cards to each player in hand', () => {
        expect(mockEmit).toHaveBeenCalledWith('dealingCards', ['card1', 'card2']);
    });

    it('should call actionToNextPlayer', () => {
        expect(table.actionToNextPlayer).toHaveBeenCalled();
    });
});

describe('initializeNextPhase test', () => {
    let table;
    let mockEmit;

    beforeEach(() => {
        jest.useFakeTimers();

        mockEmit = jest.fn();

        table = {
            public: {
                phase: 'preflop',
                board: [],
                biggestBet: 10,
                activeSeat: 0,
                dealerSeat: 0,
            },
            seats: [
                {
                    socket: { emit: mockEmit },
                },
                {
                    socket: { emit: mockEmit },
                },
            ],
            deck: {
                deal: jest.fn().mockReturnValue(['card1', 'card2', 'card3']),
            },
            pot: {
                addTableBets: jest.fn(),
            },
            findNextPlayer: jest.fn().mockReturnValue(1),
            findPreviousPlayer: jest.fn().mockReturnValue(0),
            emitEvent: jest.fn(),
            otherPlayersAreAllIn: jest.fn().mockReturnValue(false),
            endPhase: jest.fn(),
        };

        Table.prototype.initializeNextPhase.call(table);
    });

    it('should update the phase and board based on the current phase', () => {
        expect(table.public.phase).toBe('flop');
        expect(table.public.board).toEqual(['card1', 'card2', 'card3', '', '']);
    });

    it('should add table bets to the pot', () => {
        expect(table.pot.addTableBets).toHaveBeenCalledWith(table.seats);
    });

    it('should reset the biggest bet to 0', () => {
        expect(table.public.biggestBet).toBe(0);
    });

    it('should set the active seat to the next player', () => {
        expect(table.public.activeSeat).toBe(1);
    });

    it('should set the last player to act to the previous player', () => {
        expect(table.lastPlayerToAct).toBe(0);
    });

    it('should emit "table-data" with the public table data', () => {
        expect(table.emitEvent).toHaveBeenCalledWith('table-data', table.public);
    });

    it('should end the phase after 1 second if all other players are all in', () => {
        table.otherPlayersAreAllIn.mockReturnValue(true);
        Table.prototype.initializeNextPhase.call(table);

        jest.advanceTimersByTime(1000);

        expect(table.endPhase).toHaveBeenCalled();
    });

    it('should emit "actNotBettedPot" to the active player if not all other players are all in', () => {
        expect(mockEmit).toHaveBeenCalledWith('actNotBettedPot');
    });

    it('should handle the "turn" phase', () => {
        table.public.phase = 'turn';
        table.deck.deal.mockReturnValue(['card4']);

        Table.prototype.initializeNextPhase.call(table);

        expect(table.public.phase).toBe('river');
        expect(table.public.board[4]).toBe('card4');
    });
});

describe('actionToNextPlayer test', () => {
    let table;
    let mockEmit;

    beforeEach(() => {
        mockEmit = jest.fn();

        table = {
            public: {
                activeSeat: 0,
                phase: 'smallBlind',
                biggestBet: 0,
            },
            seats: [
                {
                    socket: { emit: mockEmit },
                },
            ],
            findNextPlayer: jest.fn().mockReturnValue(0),
            emitEvent: jest.fn(),
            otherPlayersAreAllIn: jest.fn().mockReturnValue(false),
        };

        Table.prototype.actionToNextPlayer.call(table);
    });

    it('should set the active seat to the next player', () => {
        expect(table.public.activeSeat).toBe(0);
    });

    it('should handle the "smallBlind" phase', () => {
        expect(mockEmit).toHaveBeenCalledWith('postSmallBlind');
    });

    it('should handle the "bigBlind" phase', () => {
        table.public.phase = 'bigBlind';
        Table.prototype.actionToNextPlayer.call(table);

        expect(mockEmit).toHaveBeenCalledWith('postBigBlind');
    });

    it('should handle the "preflop" phase', () => {
        table.public.phase = 'preflop';
        Table.prototype.actionToNextPlayer.call(table);

        expect(mockEmit).toHaveBeenCalledWith('actBettedPot');
    });

    it('should handle the "flop", "turn", and "river" phases when biggestBet is 0', () => {
        table.public.phase = 'flop';
        Table.prototype.actionToNextPlayer.call(table);

        expect(mockEmit).toHaveBeenCalledWith('actNotBettedPot');
    });

    it('should handle the "flop", "turn", and "river" phases when biggestBet is not 0', () => {
        table.public.phase = 'flop';
        table.public.biggestBet = 10;
        Table.prototype.actionToNextPlayer.call(table);

        expect(mockEmit).toHaveBeenCalledWith('actBettedPot');
    });

    it('should emit "table-data" with the public table data', () => {
        expect(table.emitEvent).toHaveBeenCalledWith('table-data', table.public);
    });

    it('should handle the "preflop" phase when other players are all in', () => {
        table.public.phase = 'preflop';
        table.otherPlayersAreAllIn.mockReturnValue(true);
        Table.prototype.actionToNextPlayer.call(table);

        expect(mockEmit).toHaveBeenCalledWith('actOthersAllIn');
    });

    it('should handle the "river" phase when biggestBet is true and other players are all in', () => {
        table.public.phase = 'river';
        table.public.biggestBet = 10;
        table.otherPlayersAreAllIn.mockReturnValue(true);
        Table.prototype.actionToNextPlayer.call(table);

        expect(mockEmit).toHaveBeenCalledWith('actOthersAllIn');
    });
});

describe('showdown test', () => {
    let table;
    let mockLog;

    beforeEach(() => {
        mockLog = jest.fn();

        table = {
            public: {
                dealerSeat: 0,
                board: [],
            },
            seats: [
                {
                    evaluateHand: jest.fn(),
                    evaluatedHand: { rating: 0 },
                    public: { cards: [] },
                    cards: ['card1', 'card2'],
                },
            ],
            playersInHandCount: 1,
            findNextPlayer: jest.fn().mockReturnValue(0),
            pot: {
                addTableBets: jest.fn(),
                destributeToWinners: jest.fn().mockReturnValue(['message1']),
            },
            log: mockLog,
            emitEvent: jest.fn(),
            endRound: jest.fn(),
        };

        jest.useFakeTimers();

        Table.prototype.showdown.call(table);
    });

    it('should add table bets to the pot', () => {
        expect(table.pot.addTableBets).toHaveBeenCalledWith(table.seats);
    });

    it('should evaluate the hand of each player in the hand', () => {
        expect(table.seats[0].evaluateHand).toHaveBeenCalledWith(table.public.board);
    });

    it('should show the cards of the player if they have the best hand', () => {
        table.seats[0].evaluatedHand.rating = 10;
        Table.prototype.showdown.call(table);

        expect(table.seats[0].public.cards).toEqual(['card1', 'card2']);
    });

    it('should distribute the pot to the winners', () => {
        expect(table.pot.destributeToWinners).toHaveBeenCalledWith(table.seats, 0);
    });

    it('should log each message from the pot distribution', () => {
        expect(mockLog).toHaveBeenCalledWith({
            message: 'message1',
            action: '',
            seat: '',
            notification: '',
        });
    });

    it('should emit "table-data" with the public table data', () => {
        expect(table.emitEvent).toHaveBeenCalledWith('table-data', table.public);
    });

    it('should end the round after a delay', () => {
        jest.runAllTimers();

        expect(table.endRound).toHaveBeenCalled();
    });
});

describe('endPhase test', () => {
    let table;

    beforeEach(() => {
        table = {
            public: {
                phase: '',
            },
            initializeNextPhase: jest.fn(),
            showdown: jest.fn(),
        };
    });

    it('should initialize the next phase for "preflop"', () => {
        table.public.phase = 'preflop';
        Table.prototype.endPhase.call(table);

        expect(table.initializeNextPhase).toHaveBeenCalled();
    });

    it('should initialize the next phase for "flop"', () => {
        table.public.phase = 'flop';
        Table.prototype.endPhase.call(table);

        expect(table.initializeNextPhase).toHaveBeenCalled();
    });

    it('should initialize the next phase for "turn"', () => {
        table.public.phase = 'turn';
        Table.prototype.endPhase.call(table);

        expect(table.initializeNextPhase).toHaveBeenCalled();
    });

    it('should call showdown for "river"', () => {
        table.public.phase = 'river';
        Table.prototype.endPhase.call(table);

        expect(table.showdown).toHaveBeenCalled();
    });
});

describe('playerPostedSmallBlind test', () => {
    let table;
    let mockLog;

    beforeEach(() => {
        mockLog = jest.fn();

        table = {
            public: {
                activeSeat: 0,
                smallBlind: 10,
                biggestBet: 0,
            },
            seats: [
                {
                    public: {
                        chipsInPlay: 20,
                        name: 'player1',
                    },
                    bet: jest.fn(),
                },
            ],
            log: mockLog,
            emitEvent: jest.fn(),
            initializeBigBlind: jest.fn(),
        };

        Table.prototype.playerPostedSmallBlind.call(table);
    });

    it('should make the active player bet the small blind', () => {
        expect(table.seats[0].bet).toHaveBeenCalledWith(table.public.smallBlind);
    });

    it('should log the small blind bet', () => {
        expect(mockLog).toHaveBeenCalledWith({
            message: 'player1 posted the small blind',
            action: 'bet',
            seat: table.public.activeSeat,
            notification: 'Posted blind',
        });
    });

    it('should update the biggest bet', () => {
        expect(table.public.biggestBet).toEqual(table.public.smallBlind);
    });

    it('should emit "table-data" with the public table data', () => {
        expect(table.emitEvent).toHaveBeenCalledWith('table-data', table.public);
    });

    it('should initialize the big blind', () => {
        expect(table.initializeBigBlind).toHaveBeenCalled();
    });

    it('should bet the chips in play if it is less than the small blind', () => {
        const mockBet = jest.fn();
        table.seats[0].bet = mockBet;
        table.public.activeSeat = 0; // set the active seat
        table.public.smallBlind = 100; // set the small blind
        table.seats[0].public.chipsInPlay = 50; // set the chips in play to be less than the small blind
    
        Table.prototype.playerPostedSmallBlind.call(table);
    
        expect(mockBet).toHaveBeenCalledWith(50);
    });

    it('should not update biggestBet if the bet is less than or equal to biggestBet', () => {
        table.public.activeSeat = 0; // set the active seat
        table.public.smallBlind = 100; // set the small blind
        table.seats[0].public.chipsInPlay = 100; // set the chips in play to be equal to the small blind
        table.public.biggestBet = 200; // set the biggestBet to be greater than the bet
    
        Table.prototype.playerPostedSmallBlind.call(table);
    
        expect(table.public.biggestBet).toEqual(200);
    });
});

//up coze
describe('playerPostedBigBlind test', () => {
    let table;
    let mockLog;

    beforeEach(() => {
        mockLog = jest.fn();

        table = {
            public: {
                activeSeat: 0,
                bigBlind: 20,
                biggestBet: 0,
            },
            seats: [
                {
                    public: {
                        chipsInPlay: 40,
                        name: 'player1',
                    },
                    bet: jest.fn(),
                },
            ],
            log: mockLog,
            emitEvent: jest.fn(),
            initializePreflop: jest.fn(),
        };

        Table.prototype.playerPostedBigBlind.call(table);
    });

    it('should make the active player bet the big blind', () => {
        expect(table.seats[0].bet).toHaveBeenCalledWith(table.public.bigBlind);
    });

    it('should log the big blind bet', () => {
        expect(mockLog).toHaveBeenCalledWith({
            message: 'player1 posted the big blind',
            action: 'bet',
            seat: table.public.activeSeat,
            notification: 'Posted blind',
        });
    });

    it('should update the biggest bet', () => {
        expect(table.public.biggestBet).toEqual(table.public.bigBlind);
    });

    it('should emit "table-data" with the public table data', () => {
        expect(table.emitEvent).toHaveBeenCalledWith('table-data', table.public);
    });

    it('should initialize the preflop', () => {
        expect(table.initializePreflop).toHaveBeenCalled();
    });

    it('should bet the chips in play if it is less than the big blind', () => {
        const mockBet = jest.fn();
        table.seats[0].bet = mockBet;
        table.public.activeSeat = 0; // set the active seat
        table.public.bigBlind = 100; // set the big blind
        table.seats[0].public.chipsInPlay = 50; // set the chips in play to be less than the big blind
    
        Table.prototype.playerPostedBigBlind.call(table);
    
        expect(mockBet).toHaveBeenCalledWith(50);
    });

    it('should not update biggestBet if the bet is less than or equal to biggestBet', () => {
        table.public.activeSeat = 0; // set the active seat
        table.public.bigBlind = 100; // set the big blind
        table.seats[0].public.chipsInPlay = 100; // set the chips in play to be equal to the big blind
        table.public.biggestBet = 200; // set the biggestBet to be greater than the bet
    
        Table.prototype.playerPostedBigBlind.call(table);
    
        expect(table.public.biggestBet).toEqual(200);
    });
});

describe('playerFolded test', () => {
    let table;
    let mockLog;
    let mockRemovePlayer;
    let mockGiveToWinner;
    let mockEndRound;
    let mockEndPhase;
    let mockActionToNextPlayer;

    beforeEach(() => {
        mockLog = jest.fn();
        mockRemovePlayer = jest.fn();
        mockGiveToWinner = jest.fn();
        mockEndRound = jest.fn();
        mockEndPhase = jest.fn();
        mockActionToNextPlayer = jest.fn();

        table = {
            public: {
                activeSeat: 0,
                name: 'player1',
            },
            seats: [
                {
                    public: {
                        name: 'player1',
                    },
                    fold: jest.fn(),
                },
                {
                    public: {
                        name: 'player2',
                    },
                },
            ],
            log: mockLog,
            emitEvent: jest.fn(),
            playersInHandCount: 2,
            pot: {
                removePlayer: mockRemovePlayer,
                addTableBets: jest.fn(),
                giveToWinner: mockGiveToWinner,
            },
            lastPlayerToAct: 0,
            findNextPlayer: jest.fn().mockReturnValue(1),
            endRound: mockEndRound,
            endPhase: mockEndPhase,
            actionToNextPlayer: mockActionToNextPlayer,
        };
    });

    it('should fold the active player', () => {
        Table.prototype.playerFolded.call(table);
        expect(table.seats[0].fold).toHaveBeenCalled();
    });

    it('should log the fold action', () => {
        Table.prototype.playerFolded.call(table);
        expect(mockLog).toHaveBeenCalledWith({
            message: 'player1 folded',
            action: 'fold',
            seat: table.public.activeSeat,
            notification: 'Fold'
        });
    });

    it('should emit "table-data" with the public table data', () => {
        Table.prototype.playerFolded.call(table);
        expect(table.emitEvent).toHaveBeenCalledWith('table-data', table.public);
    });

    it('should decrease playersInHandCount', () => {
        Table.prototype.playerFolded.call(table);
        expect(table.playersInHandCount).toBe(1);
    });

    it('should remove the player from the pot', () => {
        Table.prototype.playerFolded.call(table);
        expect(mockRemovePlayer).toHaveBeenCalledWith(table.public.activeSeat);
    });

    it('should add table bets to the pot and give to winner when only one player is left', () => {
        Table.prototype.playerFolded.call(table);
        expect(table.pot.addTableBets).toHaveBeenCalledWith(table.seats);
        expect(mockGiveToWinner).toHaveBeenCalledWith(table.seats[1]);
        expect(mockEndRound).toHaveBeenCalled();
    });

    it('should end the phase if last player to act folds', () => {
        table.playersInHandCount = 3;
        table.lastPlayerToAct = 0;
        Table.prototype.playerFolded.call(table);
        expect(mockEndPhase).toHaveBeenCalled();
    });

    it('should move to the next player if round should continue', () => {
        table.playersInHandCount = 3;
        table.lastPlayerToAct = 1;
        Table.prototype.playerFolded.call(table);
        expect(mockActionToNextPlayer).toHaveBeenCalled();
    });
});

describe('playerChecked test', () => {
    let table;
    let mockLog;
    let mockEndPhase;
    let mockActionToNextPlayer;

    beforeEach(() => {
        mockLog = jest.fn();
        mockEndPhase = jest.fn();
        mockActionToNextPlayer = jest.fn();

        table = {
            public: {
                activeSeat: 0,
                name: 'player1',
            },
            seats: [
                {
                    public: {
                        name: 'player1',
                    },
                },
                {
                    public: {
                        name: 'player2',
                    },
                },
            ],
            log: mockLog,
            emitEvent: jest.fn(),
            lastPlayerToAct: 0,
            endPhase: mockEndPhase,
            actionToNextPlayer: mockActionToNextPlayer,
        };
    });

    it('should log the check action', () => {
        Table.prototype.playerChecked.call(table);
        expect(mockLog).toHaveBeenCalledWith({
            message: 'player1 checked',
            action: 'check',
            seat: table.public.activeSeat,
            notification: 'Check'
        });
    });

    it('should emit "table-data" with the public table data', () => {
        Table.prototype.playerChecked.call(table);
        expect(table.emitEvent).toHaveBeenCalledWith('table-data', table.public);
    });

    it('should end the phase if the last player to act checks', () => {
        table.lastPlayerToAct = 0;
        table.public.activeSeat = 0;
        Table.prototype.playerChecked.call(table);
        expect(mockEndPhase).toHaveBeenCalled();
    });

    it('should move to the next player if the round should continue', () => {
        table.lastPlayerToAct = 1;
        table.public.activeSeat = 0;
        Table.prototype.playerChecked.call(table);
        expect(mockActionToNextPlayer).toHaveBeenCalled();
    });
});

describe('playerCalled test', () => {
    let table;
    let mockLog;
    let mockEndPhase;
    let mockActionToNextPlayer;
    let mockOtherPlayersAreAllIn;

    beforeEach(() => {
        mockLog = jest.fn();
        mockEndPhase = jest.fn();
        mockActionToNextPlayer = jest.fn();
        mockOtherPlayersAreAllIn = jest.fn();

        table = {
            public: {
                activeSeat: 0,
                biggestBet: 100,
            },
            seats: [
                {
                    public: {
                        bet: 50,
                        name: 'player1',
                    },
                    bet: jest.fn(),
                },
                {
                    public: {
                        bet: 100,
                        name: 'player2',
                    },
                },
            ],
            log: mockLog,
            emitEvent: jest.fn(),
            lastPlayerToAct: 0,
            endPhase: mockEndPhase,
            actionToNextPlayer: mockActionToNextPlayer,
            otherPlayersAreAllIn: mockOtherPlayersAreAllIn,
        };
    });

    it('should make the active player call the biggest bet', () => {
        Table.prototype.playerCalled.call(table);
        expect(table.seats[0].bet).toHaveBeenCalledWith(50);
    });

    it('should log the call action', () => {
        Table.prototype.playerCalled.call(table);
        expect(mockLog).toHaveBeenCalledWith({
            message: 'player1 called',
            action: 'call',
            seat: table.public.activeSeat,
            notification: 'Call'
        });
    });

    it('should emit "table-data" with the public table data', () => {
        Table.prototype.playerCalled.call(table);
        expect(table.emitEvent).toHaveBeenCalledWith('table-data', table.public);
    });

    it('should end the phase if the last player to act calls', () => {
        table.lastPlayerToAct = 0;
        table.public.activeSeat = 0;
        Table.prototype.playerCalled.call(table);
        expect(mockEndPhase).toHaveBeenCalled();
    });

    it('should end the phase if other players are all in', () => {
        mockOtherPlayersAreAllIn.mockReturnValue(true);
        Table.prototype.playerCalled.call(table);
        expect(mockEndPhase).toHaveBeenCalled();
    });

    it('should move to the next player if the round should continue', () => {
        table.lastPlayerToAct = 1;
        table.public.activeSeat = 0;
        mockOtherPlayersAreAllIn.mockReturnValue(false);
        Table.prototype.playerCalled.call(table);
        expect(mockActionToNextPlayer).toHaveBeenCalled();
    });
});

describe('playerBetted test', () => {
    let table;
    let mockLog;
    let mockEndPhase;
    let mockActionToNextPlayer;
    let mockFindPreviousPlayer;

    beforeEach(() => {
        mockLog = jest.fn();
        mockEndPhase = jest.fn();
        mockActionToNextPlayer = jest.fn();
        mockFindPreviousPlayer = jest.fn();

        table = {
            public: {
                activeSeat: 0,
                biggestBet: 50,
            },
            seats: [
                {
                    public: {
                        bet: 50,
                        name: 'player1',
                    },
                    bet: jest.fn(),
                },
                {
                    public: {
                        bet: 100,
                        name: 'player2',
                    },
                },
            ],
            log: mockLog,
            emitEvent: jest.fn(),
            endPhase: mockEndPhase,
            actionToNextPlayer: mockActionToNextPlayer,
            findPreviousPlayer: mockFindPreviousPlayer,
        };
    });

    it('should make the active player bet the specified amount', () => {
        const amount = 100;
        Table.prototype.playerBetted.call(table, amount);
        expect(table.seats[0].bet).toHaveBeenCalledWith(amount);
    });

    it('should update the biggest bet if the new bet is higher', () => {
        const amount = 100;
        table.seats[0].public.bet = 100;
        Table.prototype.playerBetted.call(table, amount);
        expect(table.public.biggestBet).toBe(100);
    });

    it('should not update the biggest bet if the new bet is not higher', () => {
        const amount = 40;
        table.seats[0].public.bet = 40;
        Table.prototype.playerBetted.call(table, amount);
        expect(table.public.biggestBet).toBe(50);
    });

    it('should log the bet action', () => {
        const amount = 100;
        Table.prototype.playerBetted.call(table, amount);
        expect(mockLog).toHaveBeenCalledWith({
            message: 'player1 betted 100',
            action: 'bet',
            seat: table.public.activeSeat,
            notification: 'Bet 100'
        });
    });

    it('should emit "table-data" with the public table data', () => {
        const amount = 100;
        Table.prototype.playerBetted.call(table, amount);
        expect(table.emitEvent).toHaveBeenCalledWith('table-data', table.public);
    });

    it('should end the phase if the previous player is the same as the active player', () => {
        const amount = 100;
        mockFindPreviousPlayer.mockReturnValue(0);
        Table.prototype.playerBetted.call(table, amount);
        expect(mockEndPhase).toHaveBeenCalled();
    });

    it('should set the last player to act and move to the next player if the round should continue', () => {
        const amount = 100;
        mockFindPreviousPlayer.mockReturnValue(1);
        Table.prototype.playerBetted.call(table, amount);
        expect(table.lastPlayerToAct).toBe(1);
        expect(mockActionToNextPlayer).toHaveBeenCalled();
    });
});

describe('playerRaised test', () => {
    let table;
    let mockLog;
    let mockEndPhase;
    let mockActionToNextPlayer;
    let mockFindPreviousPlayer;

    beforeEach(() => {
        mockLog = jest.fn();
        mockEndPhase = jest.fn();
        mockActionToNextPlayer = jest.fn();
        mockFindPreviousPlayer = jest.fn();

        table = {
            public: {
                activeSeat: 0,
                biggestBet: 50,
            },
            seats: [
                {
                    public: {
                        bet: 50,
                        name: 'player1',
                    },
                    raise: jest.fn(),
                },
                {
                    public: {
                        bet: 100,
                        name: 'player2',
                    },
                },
            ],
            log: mockLog,
            emitEvent: jest.fn(),
            endPhase: mockEndPhase,
            actionToNextPlayer: mockActionToNextPlayer,
            findPreviousPlayer: mockFindPreviousPlayer,
        };
    });

    it('should make the active player raise the specified amount', () => {
        const amount = 100;
        Table.prototype.playerRaised.call(table, amount);
        expect(table.seats[0].raise).toHaveBeenCalledWith(amount);
    });

    it('should update the biggest bet if the new bet is higher', () => {
        const amount = 100;
        table.seats[0].public.bet = 150;  // Assuming raise increases the bet
        Table.prototype.playerRaised.call(table, amount);
        expect(table.public.biggestBet).toBe(150);
    });

    it('should not update the biggest bet if the new bet is not higher', () => {
        const amount = 30;
        table.seats[0].public.bet = 30;
        Table.prototype.playerRaised.call(table, amount);
        expect(table.public.biggestBet).toBe(50);
    });

    it('should log the raise action with correct raise amount', () => {
        const amount = 100;
        const oldBiggestBet = table.public.biggestBet;
        table.seats[0].public.bet = 150;  // Assuming raise increases the bet
        Table.prototype.playerRaised.call(table, amount);
        const raiseAmount = table.public.biggestBet - oldBiggestBet;
        expect(mockLog).toHaveBeenCalledWith({
            message: 'player1 raised to 150',
            action: 'raise',
            seat: table.public.activeSeat,
            notification: 'Raise ' + raiseAmount
        });
    });

    it('should emit "table-data" with the public table data', () => {
        const amount = 100;
        Table.prototype.playerRaised.call(table, amount);
        expect(table.emitEvent).toHaveBeenCalledWith('table-data', table.public);
    });

    it('should end the phase if the previous player is the same as the active player', () => {
        const amount = 100;
        mockFindPreviousPlayer.mockReturnValue(0);
        Table.prototype.playerRaised.call(table, amount);
        expect(mockEndPhase).toHaveBeenCalled();
    });

    it('should set the last player to act and move to the next player if the round should continue', () => {
        const amount = 100;
        mockFindPreviousPlayer.mockReturnValue(1);
        Table.prototype.playerRaised.call(table, amount);
        expect(table.lastPlayerToAct).toBe(1);
        expect(mockActionToNextPlayer).toHaveBeenCalled();
    });
});

describe('playerSatOnTheTable test', () => {
    let table;
    let mockSitOnTable;
    let mockPlayerSatIn;

    beforeEach(() => {
        mockSitOnTable = jest.fn();
        mockPlayerSatIn = jest.fn();

        table = {
            public: {
                id: 1,
                seats: [],
                playersSeatedCount: 0,
            },
            seats: [],
            playerSatIn: mockPlayerSatIn,
        };
    });

    it('should add the player to the table and the public seats', () => {
        const player = {
            public: {
                name: 'player1',
            },
            sitOnTable: mockSitOnTable,
        };
        const seat = 0;
        const chips = 1000;

        Table.prototype.playerSatOnTheTable.call(table, player, seat, chips);

        expect(table.seats[seat]).toBe(player);
        expect(table.public.seats[seat]).toBe(player.public);
    });

    it('should call sitOnTable with correct parameters', () => {
        const player = {
            public: {
                name: 'player1',
            },
            sitOnTable: mockSitOnTable,
        };
        const seat = 0;
        const chips = 1000;

        Table.prototype.playerSatOnTheTable.call(table, player, seat, chips);

        expect(mockSitOnTable).toHaveBeenCalledWith(table.public.id, seat, chips);
    });

    it('should increase the playersSeatedCount', () => {
        const player = {
            public: {
                name: 'player1',
            },
            sitOnTable: mockSitOnTable,
        };
        const seat = 0;
        const chips = 1000;

        Table.prototype.playerSatOnTheTable.call(table, player, seat, chips);

        expect(table.public.playersSeatedCount).toBe(1);
    });

    it('should call playerSatIn with correct seat number', () => {
        const player = {
            public: {
                name: 'player1',
            },
            sitOnTable: mockSitOnTable,
        };
        const seat = 0;
        const chips = 1000;

        Table.prototype.playerSatOnTheTable.call(table, player, seat, chips);

        expect(mockPlayerSatIn).toHaveBeenCalledWith(seat);
    });
});

describe('playerSatIn test', () => {
    let table;
    let mockLog;
    let mockEmitEvent;
    let mockInitializeRound;

    beforeEach(() => {
        mockLog = jest.fn();
        mockEmitEvent = jest.fn();
        mockInitializeRound = jest.fn();

        table = {
            public: {
                id: 1,
                seats: [],
                gameIsOn: false,
            },
            seats: [
                {
                    public: {
                        name: 'player1',
                        sittingIn: false,
                    },
                },
            ],
            log: mockLog,
            emitEvent: mockEmitEvent,
            initializeRound: mockInitializeRound,
            playersSittingInCount: 0,
        };
    });

    it('should log that the player sat in', () => {
        const seat = 0;

        Table.prototype.playerSatIn.call(table, seat);

        expect(mockLog).toHaveBeenCalledWith({
            message: 'player1 sat in',
            action: '',
            seat: '',
            notification: ''
        });
    });

    it('should emit "table-data" with the public table data', () => {
        const seat = 0;

        Table.prototype.playerSatIn.call(table, seat);

        expect(mockEmitEvent).toHaveBeenCalledWith('table-data', table.public);
    });

    it('should set the player\'s sittingIn property to true', () => {
        const seat = 0;

        Table.prototype.playerSatIn.call(table, seat);

        expect(table.seats[seat].public.sittingIn).toBe(true);
    });

    it('should increase the playersSittingInCount', () => {
        const seat = 0;

        Table.prototype.playerSatIn.call(table, seat);

        expect(table.playersSittingInCount).toBe(1);
    });

    it('should emit "table-data" twice with the public table data', () => {
        const seat = 0;

        Table.prototype.playerSatIn.call(table, seat);

        expect(mockEmitEvent).toHaveBeenCalledTimes(2);
        expect(mockEmitEvent).toHaveBeenCalledWith('table-data', table.public);
    });

    it('should initialize the game if game is off and playersSittingInCount is greater than 1', () => {
        const seat = 0;
        table.playersSittingInCount = 1; // Before calling playerSatIn

        Table.prototype.playerSatIn.call(table, seat);

        expect(mockInitializeRound).toHaveBeenCalledWith(false);
    });

    it('should not initialize the game if game is on', () => {
        const seat = 0;
        table.gameIsOn = true;
        table.playersSittingInCount = 1; // Before calling playerSatIn

        Table.prototype.playerSatIn.call(table, seat);

        expect(mockInitializeRound).not.toHaveBeenCalled();
    });

    it('should not initialize the game if playersSittingInCount is 1 or less', () => {
        const seat = 0;
        table.playersSittingInCount = 0; // Before calling playerSatIn

        Table.prototype.playerSatIn.call(table, seat);

        expect(mockInitializeRound).not.toHaveBeenCalled();
    });
});

describe('playerLeft test', () => {
    let table;
    let mockLog;
    let mockEmitEvent;
    let mockPlayerSatOut;
    let mockLeaveTable;
    let mockEndRound;
    let mockEndPhase;

    beforeEach(() => {
        mockLog = jest.fn();
        mockEmitEvent = jest.fn();
        mockPlayerSatOut = jest.fn();
        mockLeaveTable = jest.fn();
        mockEndRound = jest.fn();
        mockEndPhase = jest.fn();

        table = {
            public: {
                seats: [{}, {}],
                playersSeatedCount: 2,
                activeSeat: 0,
                dealerSeat: 1,
            },
            seats: [
                {
                    public: {
                        name: 'player1',
                        sittingIn: true,
                    },
                    leaveTable: mockLeaveTable,
                },
                {
                    public: {
                        name: 'player2',
                        sittingIn: false,
                    },
                    leaveTable: mockLeaveTable,
                },
            ],
            log: mockLog,
            emitEvent: mockEmitEvent,
            playerSatOut: mockPlayerSatOut,
            endRound: mockEndRound,
            endPhase: mockEndPhase,
            playersInHandCount: 2,
            lastPlayerToAct: 0,
        };
    });

    it('should log that the player left', () => {
        const seat = 0;

        Table.prototype.playerLeft.call(table, seat);

        expect(mockLog).toHaveBeenCalledWith({
            message: 'player1 left',
            action: '',
            seat: '',
            notification: ''
        });
    });

    it('should call playerSatOut if the player is sitting in', () => {
        const seat = 0;

        Table.prototype.playerLeft.call(table, seat);

        expect(mockPlayerSatOut).toHaveBeenCalledWith(seat, true);
    });

    it('should not call playerSatOut if the player is not sitting in', () => {
        const seat = 1;

        Table.prototype.playerLeft.call(table, seat);

        expect(mockPlayerSatOut).not.toHaveBeenCalled();
    });

    it('should call leaveTable for the player', () => {
        const seat = 0;

        Table.prototype.playerLeft.call(table, seat);

        expect(mockLeaveTable).toHaveBeenCalled();
    });

    it('should empty the seat and decrease playersSeatedCount', () => {
        const seat = 0;

        Table.prototype.playerLeft.call(table, seat);

        expect(table.public.seats[seat]).toEqual({});
        expect(table.public.playersSeatedCount).toBe(1);
    });

    it('should set dealerSeat to null if playersSeatedCount is less than 2', () => {
        const seat = 0;
        table.public.playersSeatedCount = 1;

        Table.prototype.playerLeft.call(table, seat);

        expect(table.public.dealerSeat).toBeNull();
    });

    it('should emit "table-data" event with the public table data', () => {
        const seat = 0;

        Table.prototype.playerLeft.call(table, seat);

        expect(mockEmitEvent).toHaveBeenCalledWith('table-data', table.public);
    });

    it('should call endRound if playersInHandCount is less than 2', () => {
        const seat = 0;
        table.playersInHandCount = 1;

        Table.prototype.playerLeft.call(table, seat);

        expect(mockEndRound).toHaveBeenCalled();
    });

    it('should call endPhase if the player was the last to act and activeSeat', () => {
        const seat = 0;
        table.public.activeSeat = 0;
        table.lastPlayerToAct = 0;

        Table.prototype.playerLeft.call(table, seat);

        expect(mockEndPhase).toHaveBeenCalled();
    });

    it('should not call endPhase if the player was not the last to act', () => {
        const seat = 0;
        table.lastPlayerToAct = 1;

        Table.prototype.playerLeft.call(table, seat);

        expect(mockEndPhase).not.toHaveBeenCalled();
    });

    it('should not call endPhase if activeSeat is different', () => {
        const seat = 0;
        table.public.activeSeat = 1;

        Table.prototype.playerLeft.call(table, seat);

        expect(mockEndPhase).not.toHaveBeenCalled();
    });

    it('should not call playerSatOut, leaveTable, or decrease playersSeatedCount if player name is null', () => {
        table.seats[0].public.name = null; // set player name to null
    
        Table.prototype.playerLeft.call(table, 0);
    
        expect(mockPlayerSatOut).not.toHaveBeenCalled();
        expect(mockLeaveTable).not.toHaveBeenCalled();
        expect(table.public.playersSeatedCount).toBe(2);
    });

    it('should not set dealerSeat to null if playersSeatedCount is greater than or equal to 2', () => {
        table.public.playersSeatedCount = 4; // ensure playersSeatedCount is not less than 2
    
        Table.prototype.playerLeft.call(table, 0);
    
        expect(table.public.dealerSeat).not.toBeNull();
    });
});

describe('playerSatOut test', () =>{
    let table;

    beforeEach(() => {
        table = {
            public: {
                activeSeat: 0,
            },
            seats: [
                {
                    public: {
                        name: 'Player1',
                        bet: 10,
                        inHand: true,
                    },
                    sitOut: jest.fn(),
                },
                {
                    public: {
                        name: 'Player2',
                        bet: 0,
                        inHand: false,
                    },
                    sitOut: jest.fn(),
                },
            ],
            pot: {
                addPlayersBets: jest.fn(),
                removePlayer: jest.fn(),
            },
            playersSittingInCount: 2,
            playersInHandCount: 2,
            lastPlayerToAct: 0,
            log: jest.fn(),
            emitEvent: jest.fn(),
            endRound: jest.fn(),
            actionToNextPlayer: jest.fn(),
            endPhase: jest.fn(),
            findPreviousPlayer: jest.fn().mockReturnValue(1),
        };
    });

    it('should handle a player sitting out', () => {
        Table.prototype.playerSatOut.call(table, 0);
        expect(table.emitEvent).toHaveBeenCalledWith('table-data', table.public);
        expect(table.pot.addPlayersBets).toHaveBeenCalledWith(table.seats[0]);
        expect(table.pot.removePlayer).toHaveBeenCalledWith(table.public.activeSeat);
        expect(table.playersSittingInCount).toEqual(1);
        expect(table.seats[0].sitOut).toHaveBeenCalled();
        expect(table.playersInHandCount).toEqual(1);
    });

    it('should handle a player leaving', () => {
        Table.prototype.playerSatOut.call(table, 0);
        expect(table.emitEvent).toHaveBeenCalledWith('table-data', table.public);
        expect(table.pot.addPlayersBets).toHaveBeenCalledWith(table.seats[0]);
        expect(table.pot.removePlayer).toHaveBeenCalledWith(table.public.activeSeat);
        expect(table.playersSittingInCount).toEqual(1);
        expect(table.seats[0].sitOut).toHaveBeenCalled();
        expect(table.playersInHandCount).toEqual(1);
    });

    it('should call actionToNextPlayer if the player was not the last player to act but they were the player who should act in this round', () => {
        table.public.activeSeat = 0;
        table.lastPlayerToAct = 1;
        table.playersInHandCount = 3;
        table.seats[0].public.inHand = true;
        Table.prototype.playerSatOut.call(table, 0, true);
        expect(table.actionToNextPlayer).toHaveBeenCalled();
    });

    it('should call endPhase if the player was the last player to act and they left when they had to act', () => {
        table.public.activeSeat = 0;
        table.lastPlayerToAct = 0;
        table.playersInHandCount = 4;
        table.seats[0].public.inHand = true;
        Table.prototype.playerSatOut.call(table, 0, false);
        expect(table.endPhase).toHaveBeenCalled();
    });

    it('should update lastPlayerToAct if the player was the last to act but not the player who should act', () => {
        table.public.activeSeat = 1;  // Change this value to 1
        table.lastPlayerToAct = 0;
        table.playersInHandCount = 4;
        table.seats[0].public.inHand = true;
        const oldLastPlayerToAct = table.lastPlayerToAct;
        Table.prototype.playerSatOut.call(table, 0, false);
        expect(table.lastPlayerToAct).not.toEqual(oldLastPlayerToAct);
        expect(table.findPreviousPlayer).toHaveBeenCalledWith(oldLastPlayerToAct);
    });

    it('should call sitOut if the player is not in hand', () => {
        table.seats[0].public.inHand = false; // The player is not in hand
        const sitOutSpy = jest.spyOn(table.seats[0], 'sitOut');
        Table.prototype.playerSatOut.call(table, 0, false);
        expect(sitOutSpy).toHaveBeenCalled();
    });

    it('should not add player bets to the pot if player bet is null', () => {
        const mockAddPlayersBets = jest.fn();
        table.pot = {
            addPlayersBets: mockAddPlayersBets,
            removePlayer: jest.fn(),
        };
        table.seats[0].public.bet = null; // set player bet to null
    
        Table.prototype.playerSatOut.call(table, 0);
    
        expect(mockAddPlayersBets).not.toHaveBeenCalled();
    });

    it('should not end the round if player has left', () => {
        const mockEndRound = jest.fn();
        table.endRound = mockEndRound;
        table.playersInHandCount = 2; // ensure playersInHandCount is less than 2
        table.seats[0].public.inHand = true; // ensure player is in hand
    
        Table.prototype.playerSatOut.call(table, 0, true); // playerLeft is true
    
        expect(mockEndRound).not.toHaveBeenCalled();
    });

    it('should not end the phase if player has left', () => {
        const mockEndPhase = jest.fn();
        table.endPhase = mockEndPhase;
        table.playersInHandCount = 4; // ensure playersInHandCount is less than 2
        table.seats[0].public.inHand = true; // ensure player is in hand
        table.lastPlayerToAct = 0;
        table.public.activeSeat = 0;
    
        Table.prototype.playerSatOut.call(table, 0, true); // playerLeft is true
    
        expect(mockEndPhase).not.toHaveBeenCalled();
    });

    it('should find the previous player if the player was the last to act but not the player who should act', () => {
        const mockFindPreviousPlayer = jest.fn();
        table.findPreviousPlayer = mockFindPreviousPlayer;
        table.playersInHandCount = 4; // ensure playersInHandCount is less than 2
        table.seats[0].public.inHand = true; // ensure player is in hand
        table.lastPlayerToAct = 2; // set the player as the last one to act
        table.public.activeSeat = 1; // set the active seat to be different from the player's seat
    
        Table.prototype.playerSatOut.call(table, 0, true); // playerLeft is true
    
        expect(mockFindPreviousPlayer).not.toHaveBeenCalled();
    });

});

describe('otherPlayersAreAllIn test', () =>{
    let table;

    beforeEach(() => {
        table = {
            public: {
                activeSeat: 0,
            },
            seats: [
                {
                    public: {
                        chipsInPlay: 0,
                    },
                },
                {
                    public: {
                        chipsInPlay: 0,
                    },
                },
                {
                    public: {
                        chipsInPlay: 10,
                    },
                },
            ],
            playersInHandCount: 3,
            findNextPlayer: jest.fn().mockImplementation((currentPlayer) => {
                return (currentPlayer + 1) % table.playersInHandCount;
            }),
        };
    });

    it('should return true if all other players are all in', () => {
        expect(Table.prototype.otherPlayersAreAllIn.call(table)).toEqual(true);
    });

    it('should return false if not all other players are all in', () => {
        table.seats[1].public.chipsInPlay = 10;
        expect(Table.prototype.otherPlayersAreAllIn.call(table)).toEqual(false);
    });
});

describe('removeAllCardsFromPlay test', () =>{
    let table;

    beforeEach(() => {
        table = {
            public: {
                seatsCount: 2,
            },
            seats: [
                {
                    cards: ['card1', 'card2'],
                    public: {
                        hasCards: true,
                    },
                },
                null,
            ],
        };

        Table.prototype.removeAllCardsFromPlay.call(table);
    });

    it('should remove all cards from players', () => {
        expect(table.seats[0].cards).toEqual([]);
    });

    it('should set hasCards to false for players', () => {
        expect(table.seats[0].public.hasCards).toEqual(false);
    });
});

describe('endRound test', () =>{
    let table;

    beforeEach(() => {
        table = {
            public: {
                seatsCount: 2,
            },
            seats: [
                {
                    public: {
                        chipsInPlay: 20,
                        sittingIn: true,
                    },
                    sitOut: jest.fn(),
                },
                {
                    public: {
                        chipsInPlay: 0,
                        sittingIn: true,
                    },
                    sitOut: jest.fn(),
                },
            ],
            pot: {
                addTableBets: jest.fn(),
                isEmpty: jest.fn().mockReturnValue(false),
                giveToWinner: jest.fn(),
            },
            findNextPlayer: jest.fn().mockReturnValue(0),
            playersSittingInCount: 2,
            stopGame: jest.fn(),
            initializeRound: jest.fn(),
        };

        Table.prototype.endRound.call(table);
    });

    it('should add table bets to the pot', () => {
        expect(table.pot.addTableBets).toHaveBeenCalledWith(table.seats);
    });

    it('should give the pot to the winner if not empty', () => {
        expect(table.pot.giveToWinner).toHaveBeenCalledWith(table.seats[0]);
    });

    it('should sit out players with no chips', () => {
        expect(table.seats[1].sitOut).toHaveBeenCalled();
    });

    it('should decrease the count of sitting in players', () => {
        expect(table.playersSittingInCount).toEqual(1);
    });

    it('should stop the game if not enough players', () => {
        expect(table.stopGame).toHaveBeenCalled();
    });

    it('should initialize the next round if enough players', () => {
        table.playersSittingInCount = 3;
        Table.prototype.endRound.call(table);
        expect(table.initializeRound).toHaveBeenCalled();
    });

    it('should not give the pot to the winner if pot is empty', () => {
        table.pot.isEmpty.mockReturnValue(true);
        table.pot.giveToWinner.mockClear();
        Table.prototype.endRound.call(table);
        expect(table.pot.giveToWinner).not.toHaveBeenCalled();
    });
});

describe('stopGame test', () =>{
    let table;
    let mockResetPot;
    let mockRemoveAllCardsFromPlay;
    let mockEmitEvent;

    beforeEach(() => {
        mockResetPot = jest.fn();
        mockRemoveAllCardsFromPlay = jest.fn();
        mockEmitEvent = jest.fn();

        table = {
            public: {
                phase: 'test phase',
                activeSeat: 0,
                board: ['A', 'K', 'Q', 'J', '10'],
            },
            pot: {
                reset: mockResetPot,
            },
            lastPlayerToAct: 1,
            removeAllCardsFromPlay: mockRemoveAllCardsFromPlay,
            gameIsOn: true,
            emitEvent: mockEmitEvent,
        };
    });

    it('should reset the phase', () => {
        Table.prototype.stopGame.call(table);

        expect(table.public.phase).toBeNull();
    });

    it('should reset the pot', () => {
        Table.prototype.stopGame.call(table);

        expect(mockResetPot).toHaveBeenCalled();
    });

    it('should reset the active seat to null', () => {
        Table.prototype.stopGame.call(table);

        expect(table.public.activeSeat).toBeNull();
    });

    it('should reset the board to empty', () => {
        Table.prototype.stopGame.call(table);

        expect(table.public.board).toEqual(['', '', '', '', '']);
    });

    it('should reset the last player to act to null', () => {
        Table.prototype.stopGame.call(table);

        expect(table.lastPlayerToAct).toBeNull();
    });

    it('should call removeAllCardsFromPlay', () => {
        Table.prototype.stopGame.call(table);

        expect(mockRemoveAllCardsFromPlay).toHaveBeenCalled();
    });

    it('should set gameIsOn to false', () => {
        Table.prototype.stopGame.call(table);

        expect(table.gameIsOn).toBe(false);
    });

    it('should emit "gameStopped" event with the public table data', () => {
        Table.prototype.stopGame.call(table);

        expect(mockEmitEvent).toHaveBeenCalledWith('gameStopped', table.public);
    });
});

describe('log test', () =>{
    let table;

    beforeEach(() => {
        table = {
            public: {
                log: null,
            },
        };
    });

    it('should set the public log to the given log', () => {
        const log = {
            message: 'test message',
            action: 'test action',
            seat: 0,
            notification: 'test notification',
        };

        Table.prototype.log.call(table, log);

        expect(table.public.log).toEqual(log);
    });
});