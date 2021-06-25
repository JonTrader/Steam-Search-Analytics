require(`dotenv`).config();

var {Sequelize, DataTypes} = require('sequelize');
var gt = require(`./gameTable`);
var st = require(`./searchTable`);

const DB_PASS = process.env.DB_PASS;
const DB_PORT= process.env.DB_PORT;
const DB_USER= process.env.DB_USER;
const DB_NAME= process.env.DB_NAME;

var sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASS}@localhost:${DB_PORT}/${DB_NAME}`)

// const games = {};
// const searches = {};

// // gt.seshBegin;
//  g1= () => {
//     let games = gt.games;
//     games.sync();
//     return games;
// }
// g1()
// // g1.then(function(retG) {
// //     games = retG;
//     console.log(games)
// // })

// const s1= () => {
//     let searches = st.searches;
//     searches.sync();
//     return searches;
// }
// s1()
// // s1.then(function(retS) {
// //     searches = retS;
//     console.log(searches)
// // })


let gameSearches = sequelize.define(`gameSearches`, {
    searchId: {
        type:Sequelize.INTEGER,
        references: {
            model: st.searches,
            key: 'id'
          }

    },
    gameId: {
        type:Sequelize.INTEGER,
        references: {
            model: gt.games,
            key: 'id'
          }
    },
    searchGamesTimesClicked: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    searchGamesSteamStoreLinkClicked: {
        type: Sequelize.INTEGER,
        defaultValue:0
    }
    
})



gt.games.belongsToMany(st.searches, {through: gameSearches});
st.searches.belongsToMany(gt.games, {through: gameSearches});

var getTopSearchesForGameName= async (gameName, displayNum) => {
    let count = (displayNum === null) ? 10 : displayNum;
    gameSearches.sync();
    let game = await gt.getGameName(gameName);
    let searchReturns = await gameSearches.findAll({
        where: {
            gamesId: game.id
        }
    },{ limit: count}
    )

    return searchReturns;
}

var newGameSearch = async (game, search) => {
    // searches.sync();
    // let test = await gt.getGameAppID(appID);
    // // console.log(`game: ${test}`)
    // let search = await st.getSearch(type, term);
    // // console.log(`search: ${search}`)
    await gameSearches.create({
        gameId: game.id,
        searchId: search.id
    });

}

var gameSearchLinkClickedInsertOrUpdate = async(type, term, appID) => {
    // gameSearches.sync();
    let test = await gt.getGameAppID(70);
    console.log(`game: ${test}`)
    let search = await st.getSearch(type, term);
    console.log(`search: ${search}`)
    let gSIncrement = await gameSearches.findAll({
        where: {
            gameId: test.id,
            searchId: search.id
        }
    }, {limit: 1})
    test.increment('totalTimesClicked');
    console.log("game search: " + gSIncrement)
    if(gSIncrement.length===0){
        let instance = await newGameSearch(test, search);
        instance.increment(`searchGamesTimesClicked`);
    }
    else {
        gSIncrement[0].increment(`searchGamesTimesClicked`);
    
    }
    return gSIncrement;
}

var gameSearchStoreLinkClickedInsertOrUpdate = async(type, term, appID) => {
    // gameSearches.sync();
    let game = await gt.getGameAppID(appID);
    let search = await st.getSearch(type, term);
    let gSIncrement = await gameSearches.findAll({
        where: {
            gameId: game.id,
            searchId: search.id
        }
    },{limit:1})
    game.increment('totalSteamStoreLinkClicked');
    if(gSIncrement.length===0){
        let instance = await newGameSearch(test, search);
        instance.increment(`searchGamesSteamStoreLinkClicked`);
    }
    else{
        gSIncrement[0].increment(`searchGamesSteamStoreLinkClicked`);
    }
    return gSIncrement;
}

gameSearchLinkClickedInsertOrUpdate("name", "half", 70);
// let joe = async () => {
//     let test = await gt.getGameAppID(70)
//     console.log(test)
// }

// joe();

module.exports = {
    gameSearches: gameSearches,
    getTopSearchesForGameName: getTopSearchesForGameName,
    gameSearchLinkClickedInsertOrUpdate,
    gameSearchStoreLinkClickedInsertOrUpdate
}



