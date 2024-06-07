// app.test.js
let { io, tables, players, server, eventEmitter, htmlEntities} = require('../app');
const socketClient = require('socket.io-client');
const Table = require('../poker_modules/table');
const Player = require('../poker_modules/player');

var tableId = 0;

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
  }

};

var sameName = false;

function initializeTestTable(socket) {
	var table;
    
    table = new Table( 0, 'Sample 10-handed Table', eventEmitter(0), 10, 2, 1, 200, 40, false );
    if(!sameName){
      for( var i=0 ; i<2 ; i++ ) {
        players[i] = new Player( socket, 'Player_'+i, 1000 );
        players[i].socket = socket;
      }
    }
    else{
      for( var i=0 ; i<2 ; i++ ) {
        players[i] = new Player( socket, 'NewPlayer', 1000 );
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
    
    // 确保在测试逻辑内断言
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
    
    // 确保在测试逻辑内断言
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
    
    // 确保在测试逻辑内断言
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
    
    // 确保在测试逻辑内断言
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
    
    // 确保在测试逻辑内断言
    expect(LeaveTablePromise).resolves.toEqual({ success: true, totalChips: 1000 });
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
})

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
