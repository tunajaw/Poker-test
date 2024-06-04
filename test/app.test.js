// app.test.js
let { io, tables, players, server} = require('../app');
const socketClient = require('socket.io-client');
const Table = require('../poker_modules/table');
const Player = require('../poker_modules/player');

// Table.prototype.playerSatOnTheTable(players[0], 2, 1000)
// process.on('unhandledRejection', (reason) => {});


var eventEmitter = function( tableId ) {
	return function ( eventName, eventData ) {
	}
}

// var socket = {
// 	emit: function() {
// 		return;
// 	}
// };

function initializeTestTable(socket) {
	var table;
    
    table = new Table( 0, 'Sample 10-handed Table', eventEmitter(0), 10, 2, 1, 200, 40, false );

    for( var i=0 ; i<4 ; i++ ) {
        players[i] = new Player( socket, 'Player_'+i, 1000 );
        players[i].socket = socket;
    }
    // console.log("sockid:" + socket.id)
    // players[socket.id].socket = socket;

    table.playerSatOnTheTable( players[0], 2, 1000 );
    table.playerSatOnTheTable( players[1], 6, 1000 );
    table.playerSatOnTheTable( players[2], 4, 1000 );
    table.playerSatOnTheTable( players[3], 8, 1000 );

    return table;
}

beforeEach((done) => {
  // 初始化 Socket.IO 客戶端連接
  socket = socketClient.connect("http://localhost:3000")
  tables = initializeTestTable(socket);
  console.log(tables.public.phase);
  done();
});

// afterEach((done) => {
//     if (socket.connected) {
//       socket.disconnect();
//       console.log("socket disconnected");
//     }
//     done();
//   });

describe('Register function', () =>{
    it('Player can be registered', (done) => {
        const newScreenName = 'NewPlayer';
    
        const callback = jest.fn((res) => {
            console.log(res.success);
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

    it('Player cannot be registered with empty screen name', (done) => {
        const newScreenName = '';
    
        const callback = jest.fn((res) => {
            console.log(res.success);
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

    // it('Player cannot be registered with undefined screen name', (done) => {

    //     const newScreenName = undefined;
    
    //     const callback = jest.fn((res) => {
    //         console.log(res.success);
    //         try {
    //           expect(callback).toHaveBeenCalled();
    //           expect(callback).toHaveBeenCalledWith({ 'success': false, 'message': 'Please enter a screen name' });
    //           done();
    //         } catch (error) {
    //           done(error);
    //         }
    //       });
        
    //       socket.emit('register', undefined, callback);
    // });


})



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
