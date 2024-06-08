// app.test.js
let { io, tables, players, server, eventEmitter, htmlEntities, app} = require('../app');
const socketClient = require('socket.io-client');
const request = require('supertest');
const Table = require('../poker_modules/table');
const Player = require('../poker_modules/player');

var tableId = '0';

// Table.prototype.playerSatOnTheTable(players[0], 2, 1000)
// process.on('unhandledRejection', (reason) => {});

const Promises = {
  Register: (socket, name='NewPlayer') => {
    return new Promise((resolve) => {
      socket.emit('register', 'NewPlayer', (res) => {
        console.log('Register:', res.success);
        resolve();
      });
    })
  },

  InitialRound: (table) => {
    return new Promise((resolve) => {
      table.initializeRound();
      resolve();
    })
  },

  Check: (socket) => {
    return new Promise((resolve, reject) => {
      const callback = (res) => {
        console.log('Check:', res.success);
        try {
          expect(res.success).toBe(true);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      socket.emit('check', callback);
    })
  },

  SitOnTheTable: (socket) => {
    return new Promise((resolve) => {
      socket.emit('sitOnTheTable', {'seat': 2, 'tableId': tableId, 'chips': 100}, (res) => {
        if(!res.success){
          console.log("sitOnError:" + res.error);
        }
        resolve();
      });
    })
  },

  EnterRoom: (socket) => {
    return new Promise((resolve) => {
      socket.emit('enterRoom', tableId);
      resolve();
    })
  },

  LeaveTable: () => {
    return new Promise((resolve) => {
      socket.emit('leaveTable', (res) => {
        if(!res.success){
          reject("leaveTableError:" + res.error);
        }
        console.log("leave room successfully");
        resolve();
      });
    })
  },

  ReallocateSocket: () => {
    return new Promise((resolve) => {
      socketId = getNthPlayer(3).socket.id;
      for(let i=1; i<=2; i++){
        getNthPlayer(i).socket.id = socketId;
      }
      resolve();
    })
  },

  PostSmallBlind: () => {
    return new Promise((resolve) => {
      const callback = (res) => {
        try {
          expect(res.success).toBe(true);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      socket.emit('postBlind', true, callback);
    });
  },

  PostBlinds: () => {
    return new Promise((resolve) => {
      try {
        tables[tableId].initializeSmallBlind();
        tables[tableId].initializeBigBlind();
        tables[tableId].initializePreflop();
        resolve();
      } catch (error) {
        throw new Error(error);
      }
    });
  },

  TurnPhase: () => {
    return new Promise((resolve) => {
      if(tables[tableId].public.phase == '')
      tables[tableId].initialePreflop();
      resolve();
    })
  }

};

var sameName = false;

function initializeTestTable(socket) {
	var table;
    
    table = new Table( 0, 'Sample 10-handed Table', eventEmitter(0), 10, 2, 1, 200, 40, false );
    if(!sameName){
      for( var i=0 ; i<2 ; i++ ) {
        players[i] = new Player( socket, 'Player_'+i, 1000 );
        players[i].room = tableId;
        players[i].socket = socket;
      }
    }
    else{
      for( var i=0 ; i<2 ; i++ ) {
        players[i] = new Player( socket, 'NewPlayer', 1000 );
        players[i].room = tableId;
        players[i].socket = socket;
      }
    }
    
    // console.log("sockid:" + socket.id)
    // players[socket.id].socket = socket;

    table.playerSatOnTheTable( players[0], 0, 100 );
    table.playerSatOnTheTable( players[1], 1, 100 );
    // table.playerSatOnTheTable( players[2], 4, 1000 );
    // table.playerSatOnTheTable( players[3], 8, 1000 );

    return table;
}

function getNthPlayer(n) {
  let cnt = 1;
  for(player in players){
    if(cnt == n){
      return players[player];
    }
    cnt++;
  }
  console.error("Out of bound.");
}

beforeEach((done) => {
  
  socket = socketClient.connect("http://localhost:3000", {
    forceNew: true, // 强制创建新的连接
    reconnection: false // 禁止自动重连
  });

  socket.on('connect', () => {
    //console.log("socket connected");
    tables[tableId] = initializeTestTable(socket, tableId);
    //console.log("table initialized");
    // done();
  });

  socket.on('getId', (callback) => {
    console.log(socket.id);
    callback(socket.id);
  });

  done();
});

afterEach((done) => {
    if (socket.connected) {
      socket.disconnect();
      // console.log("socket disconnected");
    }
    done();
});

describe('htmlEntities', () => {
  it('Nothing to convert', () => {
    str = 'Hello world';
    expect(htmlEntities(str)).toEqual(str);
  })
});

describe('enterRoom', () => {
  it('Cannot enter room twice', async () => {
    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    const EnterRoomPromise = new Promise((resolve, reject) => {

      socket.emit('enterRoom', tableId);

      setTimeout(()=>{
        resolve();
      }, 100);
    });

    await EnterRoomPromise;
  
  });
});

describe('Register function', () =>{
    it('Player can be registered', (done) => {
        const newScreenName = 'NewPlayer';
    
        const callback = jest.fn((res) => {
            try {
              expect(callback).toHaveBeenCalled();
              expect(callback).toHaveBeenCalledWith({ success: true, screenName: newScreenName, totalChips: 1000 });
              done();
            } catch (error) {
              done(error);
            }
        });
        
        socket.emit('register', newScreenName, callback);
        
    });

    it('Player cannot be registered twice', async () => {
      sameName = true;

      const SecondRegisterPromise = new Promise((resolve, reject) => {
        const callback = (res) => {
          resolve(res);
        };

        socket.emit('register', 'NewPlayer', callback);
      });

      await SecondRegisterPromise;
      
      // 确保在测试逻辑内断言
      expect(SecondRegisterPromise).resolves.toEqual({'success': false, 'message': 'This name is taken'});
    });

    it('Player cannot be registered with empty screen name', (done) => {
      sameName = false;
      const newScreenName = '';

      const callback = jest.fn((res) => {
          try {
            expect(callback).toHaveBeenCalled();
            expect(callback).toHaveBeenCalledWith({ 'success': false, 'message': 'Please enter a screen name' });
            done();
          } catch (error) {
            done(error);
          }
        });

      socket.emit('register', newScreenName, callback);
    });
});

describe('SitOnTable function', () => {
  it('Normal SitOnTable', async () => {
    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    const data = { seat: 2, tableId: tableId, chips: 100 };

    const sitOnTablePromise = new Promise((resolve, reject) => {
      const callback = (res) => {
        console.log('SitOnTable:', res.success);
        resolve(res);
      };

      socket.emit('sitOnTheTable', data, callback);
    });

    await sitOnTablePromise;
    
    // 确保在测试逻辑内断言
    expect(sitOnTablePromise).resolves.toEqual({ success: true });
  });

  it('Over Maximum BuyIn', async () => {
    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    const data = { seat: 2, tableId: tableId, chips: 500 };

    const sitOnTablePromise = new Promise((resolve, reject) => {
      const callback = (res) => {
        console.log('SitOnTable:', res.success);
        resolve(res);
      };

      socket.emit('sitOnTheTable', data, callback);
    });

    await sitOnTablePromise;
    
    expect(sitOnTablePromise).resolves.toEqual({ success: false, 'error': 'The amount of chips should be between the maximum and the minimum amount of allowed buy in'});
  });

  // Covered before mutant test
  it('Less than Maximum BuyIn', async () => {
    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    const data = { seat: 2, tableId: tableId, chips: 5 };

    const sitOnTablePromise = new Promise((resolve, reject) => {
      const callback = (res) => {
        console.log('SitOnTable:', res.success);
        resolve(res);
      };

      socket.emit('sitOnTheTable', data, callback);
    });

    await sitOnTablePromise;
    
    expect(sitOnTablePromise).resolves.toEqual({ success: false, 'error': 'The amount of chips should be between the maximum and the minimum amount of allowed buy in'});
  });

  it('Buy in more than chiips the player has', async () => {
    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    const data = { seat: 2, tableId: tableId, chips: 5000 };

    const sitOnTablePromise = new Promise((resolve, reject) => {
      const callback = (res) => {
        console.log('SitOnTable:', res.success);
        resolve(res);
      };

      socket.emit('sitOnTheTable', data, callback);
    });

    await sitOnTablePromise;
    
    expect(sitOnTablePromise).resolves.toEqual({ success: false, 'error': 'You don\'t have that many chips'});
  });

  it('Invalid buy in', async () => {
    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    const data = { seat: 2, tableId: tableId, chips: 55.55 };

    const sitOnTablePromise = new Promise((resolve, reject) => {
      const callback = (res) => {
        console.log('SitOnTable:', res.success);
        resolve(res);
      };

      socket.emit('sitOnTheTable', data, callback);
    });

    await sitOnTablePromise;
    
    expect(sitOnTablePromise).resolves.toEqual({ success: false});
  });

});

describe('leaveTable function', () => {
  it('leave table successfully', async () => {
    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    await Promises.SitOnTheTable(socket); 

    const LeaveTablePromise = new Promise((resolve, reject) => {
      const callback = (res) => {
        resolve(res);
      };

      socket.emit('leaveTable', callback);
    });

    await LeaveTablePromise;
    
    expect(LeaveTablePromise).resolves.toEqual({ success: true, totalChips: 1000 });
  });

  it('leave table unsuccessfully', async () => {
    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    // await Promises.SitOnTheTable(socket); 

    const callback = jest.fn();

    const LeaveTablePromise = new Promise((resolve, reject) => {

      socket.emit('leaveTable', callback);

      setTimeout(()=>{
        resolve();
      }, 100);
    });

    await LeaveTablePromise;
    
    expect(callback).toHaveBeenCalledTimes(0);
  });
});

describe('leaveRoom function', () => {
  it('leave room successfully', async () => {
    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    await Promises.SitOnTheTable(socket); 

    await Promises.LeaveTable();

    // REALLY BAD CODE but I don't have any better solution :(
    const LeaveRoomPromise = new Promise((resolve, reject) => {
      socket.emit('leaveRoom');
      setTimeout(()=>{
        resolve();
      }, 100);
      
    });

    await LeaveRoomPromise;
  });

  it('Player cannot leave room if sitting in the table', async () => {
    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    await Promises.SitOnTheTable(socket); 

    const callback = jest.fn();

    const LeaveRoomPromise = new Promise((resolve, reject) => {

      socket.emit('leaveRoom', callback);

      setTimeout(()=>{
        resolve();
      }, 100);

    });

    await LeaveRoomPromise;

    expect(callback).toHaveBeenCalledTimes(0);


  });
});

describe('SitIn function', () => {
  it('Sit in table succesfully', async () => {
    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    await Promises.SitOnTheTable(socket); 

    // await Promises.LeaveTable();

    const SitInPromise = new Promise((resolve, reject) => {
      const callback = (res) => {
        resolve(res);
      };
      // modify the status of the player's sittingOnTable
      getNthPlayer(3).public.sittingIn = false;
      socket.emit('sitIn', callback);
    });

    await SitInPromise;
    
    // 确保在测试逻辑内断言
    expect(SitInPromise).resolves.toEqual({success: true});
  });

  it('Already sat in the table', async () => {
    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    await Promises.SitOnTheTable(socket); 

    // await Promises.LeaveTable();

    const SitInPromise = new Promise((resolve, reject) => {
      socket.emit('sitIn', ()=>{});
      setTimeout(()=>{
        resolve();
      }, 100);
    });

    await SitInPromise;
  });
});

// Need to be further track the messages
describe('Send Meassage function', ()=> {
  it('The message can be sent', async () => {
    var msg = 'Hello world';

    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    await Promises.SitOnTheTable(socket); 

    const SendMsgPromise = new Promise((resolve, reject) => {
      socket.emit('sendMessage', msg);
      setTimeout(()=>{
        resolve();
      }, 100);
      
    });

    await SendMsgPromise;
  });

  it('Empty message', async () => {
    var msg = '';

    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    await Promises.SitOnTheTable(socket); 

    const SendMsgPromise = new Promise((resolve, reject) => {
      socket.emit('sendMessage', msg);
      setTimeout(()=>{
        resolve();
      }, 100);
      
    });

    await SendMsgPromise;
  });
});

describe('Post Blind function', () => {
  it('The small blind can be posted', async () => {
    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    await Promises.SitOnTheTable(socket);

    await Promises.InitialRound(tables[tableId]);

    await Promises.ReallocateSocket();

    const PostBlindPromise = new Promise((resolve, reject) => {
      const callback = jest.fn((res) => {
        resolve(res);
      })

      socket.emit('postBlind', true, callback);
    });

    await PostBlindPromise;

    expect(PostBlindPromise).resolves.toEqual({success: true});
  });

  it('The big blind can be posted', async () => {
    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    await Promises.SitOnTheTable(socket);

    await Promises.InitialRound(tables[tableId]);

    await Promises.ReallocateSocket();

    await Promises.PostSmallBlind();

    const PostBlindPromise = new Promise((resolve, reject) => {
      const callback = (res) => {
        resolve(res);
      };

      socket.emit('postBlind', true, callback);
    });

    await PostBlindPromise;

    expect(PostBlindPromise).resolves.toEqual({success: true});
  });

  it('Set blind to false', async () => {
    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    await Promises.SitOnTheTable(socket);

    await Promises.InitialRound(tables[tableId]);

    await Promises.ReallocateSocket();

    await Promises.PostSmallBlind();

    const PostBlindPromise = new Promise((resolve, reject) => {
      const callback = (res) => {
        resolve(res);
      };

      socket.emit('postBlind', false, callback);
    });

    await PostBlindPromise;

    expect(PostBlindPromise).resolves.toEqual({success: true});
  });

  it('Player is not sitting at the table', async () => {
    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    await Promises.InitialRound(tables[tableId]);

    const PostBlindPromise = new Promise((resolve, reject) => {

      const callback = () => {};

      socket.emit('postBlind', true, callback);
      setTimeout(()=>{
        resolve();
      }, 100);
      
    });

    await PostBlindPromise;
  });

  it('Invalid post blind', async () => {
    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    await Promises.SitOnTheTable(socket);

    await Promises.InitialRound(tables[tableId]);

    await Promises.PostBlinds();

    const callback = jest.fn();

    const PostBlindPromise = new Promise((resolve, reject) => {
      
      socket.emit('postBlind', true, callback);
      setTimeout(()=>{
        resolve();
      }, 100);
      
    });

    await PostBlindPromise;

    expect(callback).toHaveBeenCalledTimes(0);    
  });


});

// Need to be do CACC tests
describe('Check function', () => {
  it('Player can check', async () => {
    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    await Promises.SitOnTheTable(socket);

    await Promises.InitialRound(tables[tableId]);

    await Promises.PostBlinds();

    const CheckPromise = new Promise((resolve, reject) => {
      const callback = (res) => {
        resolve(res);
      };

      socket.emit('check', callback);
    });

    await CheckPromise;

    expect(CheckPromise).resolves.toEqual({success: true});
  });

  it('Player cannot check if not sitting on table', async () => {
    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    await Promises.SitOnTheTable(socket);

    await Promises.InitialRound(tables[tableId]);

    const callback = jest.fn();

    const CheckPromise = new Promise((resolve, reject) => {

      getNthPlayer(3).sittingOnTable = 'undefined';
      socket.emit('check', callback);

      setTimeout(()=>{
        resolve();
      }, 100);
    });

    await CheckPromise;
    
    expect(callback).toHaveBeenCalledTimes(0);
  });
});

describe('Fold function', () => {
  it('Player can fold', async () => {
    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    await Promises.SitOnTheTable(socket);

    await Promises.ReallocateSocket();

    await Promises.InitialRound(tables[tableId]);

    await Promises.PostBlinds();

    const FoldPromise = new Promise((resolve, reject) => {
      const callback = (res) => {
        resolve(res);
      };

      socket.emit('fold', callback);
    });

    await FoldPromise;

    expect(FoldPromise).resolves.toEqual({success: true});
  });

  it('Player cannot fold if not sitting on table', async () => {
    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    await Promises.ReallocateSocket();

    const callback = jest.fn();

    const FoldPromise = new Promise((resolve, reject) => {

      socket.emit('fold', callback);

      setTimeout(()=>{
        resolve();
      }, 100);
    });

    await FoldPromise;
    
    expect(callback).toHaveBeenCalledTimes(0);
  });

  it('Player cannot fold in posting blind phase', async () => {
    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    await Promises.SitOnTheTable(socket);

    await Promises.ReallocateSocket();

    await Promises.InitialRound(tables[tableId]);

    const callback = jest.fn();

    const FoldPromise = new Promise((resolve, reject) => {

      socket.emit('fold', callback);

      setTimeout(()=>{
        resolve();
      }, 100);
    });

    await FoldPromise;
    
    expect(callback).toHaveBeenCalledTimes(0);
  });


});

describe('Raise function', () => {
  it('Player can raise', async () => {
    var bet = 10;

    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    await Promises.SitOnTheTable(socket);

    await Promises.InitialRound(tables[tableId]);

    await Promises.ReallocateSocket(); 

    await Promises.PostBlinds();

    const RaisePromise = new Promise((resolve, reject) => {
      const callback = (res) => {
        resolve(res);
      };

      tables[tableId].public.biggestBet = 10;
      socket.emit('raise', bet, callback);
    });

    await RaisePromise;

    expect(RaisePromise).resolves.toEqual({success: true});
  });

  it('Player cannot raise if not sitting on table', async () => {
    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    await Promises.SitOnTheTable(socket);

    await Promises.InitialRound(tables[tableId]);

    const callback = jest.fn();

    const RaisePromise = new Promise((resolve, reject) => {

      getNthPlayer(3).sittingOnTable = 'undefined';
      socket.emit('raise', 10, callback);

      setTimeout(()=>{
        resolve();
      }, 100);
    });

    await RaisePromise;
    
    expect(callback).toHaveBeenCalledTimes(0);
  });

  it('Player cannot raise in posting blind phase', async () => {
    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    await Promises.SitOnTheTable(socket);

    await Promises.ReallocateSocket();

    await Promises.InitialRound(tables[tableId]);

    const callback = jest.fn();

    const RaisePromise = new Promise((resolve, reject) => {

      socket.emit('raise', 10, callback);

      setTimeout(()=>{
        resolve();
      }, 100);
    });

    await RaisePromise;
    
    expect(callback).toHaveBeenCalledTimes(0);
  });

  it('Player cannot raise 0 dollar', async () => {
    var bet = 0;

    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    await Promises.SitOnTheTable(socket);

    await Promises.InitialRound(tables[tableId]);

    await Promises.ReallocateSocket(); 

    await Promises.PostBlinds();

    const callback = jest.fn();

    const RaisePromise = new Promise((resolve, reject) => {

      tables[tableId].public.biggestBet = 10;
      socket.emit('raise', bet, callback);

      setTimeout(()=>{
        resolve();
      }, 100);
    });

    await RaisePromise;
    
    expect(callback).toHaveBeenCalledTimes(0);
  });

  it('Player cannot raise more than chips he/she have', async () => {
    var bet = 10000;

    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    await Promises.SitOnTheTable(socket);

    await Promises.InitialRound(tables[tableId]);

    await Promises.ReallocateSocket(); 

    await Promises.PostBlinds();

    const callback = jest.fn();

    const RaisePromise = new Promise((resolve, reject) => {

      tables[tableId].public.biggestBet = 10;
      socket.emit('raise', bet, callback);

      setTimeout(()=>{
        resolve();
      }, 100);
    });

    await RaisePromise;
    
    expect(callback).toHaveBeenCalledTimes(0);
  });

});

describe('Bet function', () => {
  it('Player can bet', async () => {
    var bet = 10;

    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    await Promises.SitOnTheTable(socket);

    await Promises.InitialRound(tables[tableId]);

    await Promises.ReallocateSocket(); 

    await Promises.PostBlinds();

    const BetPromise = new Promise((resolve, reject) => {
      const callback = (res) => {
        resolve(res);
      };

      socket.emit('bet', bet, callback);
    });

    await BetPromise;

    expect(BetPromise).resolves.toEqual({success: true});
  });

  it('Player cannot bet 0 dollar', async () => {
    var bet = 0;

    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    await Promises.SitOnTheTable(socket);

    await Promises.InitialRound(tables[tableId]);

    await Promises.ReallocateSocket(); 

    await Promises.PostBlinds();

    const callback = jest.fn();

    const BetPromise = new Promise((resolve, reject) => {

      socket.emit('bet', bet, callback);

      setTimeout(()=>{
        resolve();
      }, 100);
    });

    await BetPromise;
    
    expect(callback).toHaveBeenCalledTimes(0);
  });

  it('Player cannot bet if not sitting on table', async () => {
    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    await Promises.SitOnTheTable(socket);

    await Promises.InitialRound(tables[tableId]);

    const callback = jest.fn();

    const BetPromise = new Promise((resolve, reject) => {

      getNthPlayer(3).sittingOnTable = 'undefined';
      socket.emit('bet', 10, callback);

      setTimeout(()=>{
        resolve();
      }, 100);
    });

    await BetPromise;
    
    expect(callback).toHaveBeenCalledTimes(0);
  });

  it('Player cannot bet in posting blind phase', async () => {
    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    await Promises.SitOnTheTable(socket);

    await Promises.ReallocateSocket();

    await Promises.InitialRound(tables[tableId]);

    const callback = jest.fn();

    const BetPromise = new Promise((resolve, reject) => {

      socket.emit('bet', 10, callback);

      setTimeout(()=>{
        resolve();
      }, 100);
    });

    await BetPromise;
    
    expect(callback).toHaveBeenCalledTimes(0);
  });

});

describe('Call function', () => {
  it('Player can call', async () => {
    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    await Promises.SitOnTheTable(socket);

    await Promises.InitialRound(tables[tableId]);

    await Promises.ReallocateSocket(); 

    await Promises.PostBlinds();

    const CallPromise = new Promise((resolve, reject) => {
      const callback = (res) => {
        resolve(res);
      };
      tables[tableId].public.biggestBet = 10;
      socket.emit('call', callback);
    });

    await CallPromise;

    expect(CallPromise).resolves.toEqual({success: true});
  });

  it('Player cannot call if not sitting on table', async () => {
    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    await Promises.SitOnTheTable(socket);

    await Promises.InitialRound(tables[tableId]);

    const callback = jest.fn();

    const CallPromise = new Promise((resolve, reject) => {

      getNthPlayer(3).sittingOnTable = 'undefined';
      socket.emit('call', callback);

      setTimeout(()=>{
        resolve();
      }, 100);
    });

    await CallPromise;
    
    expect(callback).toHaveBeenCalledTimes(0);
  });

  it('Player cannot call in posting blind phase', async () => {
    await Promises.Register(socket);

    await Promises.EnterRoom(socket);

    await Promises.SitOnTheTable(socket);

    await Promises.ReallocateSocket();

    await Promises.InitialRound(tables[tableId]);

    const callback = jest.fn();

    const CallPromise = new Promise((resolve, reject) => {

      socket.emit('call', callback);

      setTimeout(()=>{
        resolve();
      }, 100);
    });

    await CallPromise;
    
    expect(callback).toHaveBeenCalledTimes(0);
  });

});

describe('Express Routes', () => {
  it('should get the lobby', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
  });

  it('should get the lobby data', async () => {
    const response = await request(app).get('/lobby-data');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  it('should redirect to lobby for /table-10/:tableId', async () => {
    const response = await request(app).get('/table-10/1');
    expect(response.status).toBe(302);
    expect(response.header.location).toBe('/');
  });

  it('should redirect to lobby for /table-6/:tableId', async () => {
    const response = await request(app).get('/table-6/1');
    expect(response.status).toBe(302);
    expect(response.header.location).toBe('/');
  });

  it('should redirect to lobby for /table-2/:tableId', async () => {
    const response = await request(app).get('/table-2/1');
    expect(response.status).toBe(302);
    expect(response.header.location).toBe('/');
  });

  it('should get the table data', async () => {
    const response = await request(app).get('/table-data/0');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('table');
  });

  it('should get the table data', async () => {
    const response = await request(app).get('/table-data/0');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('table');
  });

  it('should use error handler middleware in development mode', async () => {
    app.get('/error', (req, res) => {
      throw new Error('Test error');
    });

    const response = await request(app).get('/error');
    expect(response.status).toBe(500); // 检查是否返回 500 状态码
    expect(response.text).toContain('Error: Test error'); // 检查响应中是否包含错误信息
  });

});


// describe('Check function', () => {
//   it('Normal check', async (done) => {
    

//     await Promises.Register(socket);

//     await Promises.EnterRoom(socket);

//     await Promises.SitInOnTheTable(socket); 

//     await Promises.InitialRound(tables[tableId]);

//     console.log(tables[tableId].public);

//     const checkPromise = new Promise((resolve, reject) => {
//       const callback = (res) => {
//         console.log('Check:', res.success);
//         try {
//           expect(res.success).toBe(true);
//           resolve();
//         } catch (error) {
//           reject(error);
//         }
//       };
//       socket.emit('check', callback);
//     });

//     try {
//       await checkPromise;
//       done();
//     } catch (error) {
//       done(error);
//     }
//   })
// });



// test('Clause Coverage for tables[tableId] is true', (done) => {
//     const callback = jest.fn();
//     console.log("before emit");
//     socket.emit('check', callback);
//     console.log("after emit");

//     setTimeout(() => {
//         expect(callback).toHaveBeenCalledWith({ success: true });
//         expect(tables.playerChecked).toHaveBeenCalled();
//         done();
//     }, 50);
// });

// test('Clause Coverage for tables[tableId] is false', (done) => {
//   const callback = jest.fn();

//   // 修改 tables 使得 tables[tableId] 為 false
//   delete tables['table1'];

//   socket.emit('check', callback);

//   setTimeout(() => {
//     expect(callback).not.toHaveBeenCalled();
//     done();
//   }, 50);
// });

// test('Clause Coverage for tables[tableId].seats[activeSeat].socket.id === socket.id is true', (done) => {
//   const callback = jest.fn();

//   socket.emit('check', callback);

//   setTimeout(() => {
//     expect(callback).toHaveBeenCalledWith({ success: true });
//     expect(tables['table1'].playerChecked).toHaveBeenCalled();
//     done();
//   }, 50);
// });

// test('Clause Coverage for tables[tableId].seats[activeSeat].socket.id === socket.id is false', (done) => {
//   const callback = jest.fn();

//   // 修改 socket id 使得對應子句為 false
//   tables['table1'].seats[0].socket.id = 'differentSocket';

//   socket.emit('check', callback);

//   setTimeout(() => {
//     expect(callback).not.toHaveBeenCalled();
//     expect(tables['table1'].playerChecked).not.toHaveBeenCalled();
//     done();
//   }, 50);
// });
