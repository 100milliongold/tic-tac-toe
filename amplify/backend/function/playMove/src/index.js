/* Amplify Params - DO NOT EDIT
	API_TICTACTOE_GRAPHQLAPIENDPOINTOUTPUT
	API_TICTACTOE_GRAPHQLAPIIDOUTPUT
	API_TICTACTOE_GRAPHQLAPIKEYOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const appsync = require("aws-appsync");
const gql = require("graphql-tag");
require("cross-fetch/polyfill");
const isTerminal = require("./isTerminal")


const getGame = gql`
    query getGame($id: ID!){
        getGame(id: $id) {
            id
            turn
            status
            state
            initiator
            owners
            winner
        }
    }
`

const updateGame = gql`
    mutation updateGame(
        $id: ID!
        $turn: String!
        $winner: String
        $status: GameStatus!
        $state: [Symbol]!
        $player: String!
    ) {
        updateGame(
            input: { id: $id, turn: $turn, winner: $winner, status: $status, state: $state }
            condition: { turn: { eq: $player } }
        ) {
            id
            turn
            state
            status
            winner
        }
    }
`;

exports.handler = async (event) => {


    const graphqlClient = new appsync.AWSAppSyncClient({
        url: process.env.API_TICTACTOE_GRAPHQLAPIENDPOINTOUTPUT,
        region: process.env.REGION,
        auth: {
            type: "AWS_IAM",
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                sessionToken: process.env.AWS_SESSION_TOKEN
            }
        },
        disableOffline: true
    });

    const player = event.identity.username;
    const gameID = event.arguments.game;
    const index = event.arguments.index;
    // console.log(player , gameID , index);
    
    // 1. Get Game object from the id and make sure it exists
    // ID에서 Game 개체를 가져 와서 존재하는지 확인하십시오.
    const gameResponse = await graphqlClient.query({
        query: getGame,
        variables:{
            id: gameID
        }
    })
    const game = gameResponse.data.getGame
    // console.log(gameResponse);
    if(!game) {
        console.log("Game not found!");
        throw new Error("Game not found!")
    }
    
    // 2. Make sure the game is active
    // 게임이 활성화되어 있는지 확인
    
    if(game.status !== "REQUESTED" && game.status !== "ACTIVE"){
        console.log("Game is not active!");
        throw new Error("Game is not active!")
    }
    
    // 3. Check that the current use is a participant in the game and that it's his turn
    // 현재 사용중인 게임이 게임에 참여하고 있는지 그리고 그의 차례인지 확인하십시오
    if(!game.owners.includes(player)) {
        console.log("Logged in player is not participating in this game!");
        throw new Error("Logged in player is not participating in this game!")
    }
    if(game.turn !== player){
        console.log("It's not your turn");
        throw new Error("It's not your turn")
    }
    
    // 4. Make sure that the index is valid (not > 8 and not already occupied)
    // 인덱스가 유효한지 확인하십시오 (8보다 크지 않고 이미 사용 중이 아님).
    if(index > 8 || game.state[index]){
        console.log("Invalid index or cell is already occupied!");
        throw new Error("Invalid index or cell is already occupied!")
    }

    // 5. Update the state, check if the move is a terminal one & update the winner, status, turn & update the state
    // 상태 업데이트, 놓아둔 말이 마직막인지 확인하고 승자, 상태 업데이트, 상태 변경 및 업데이트
    const symbol = player === game.initiator ? "x" : "o";
    const nextTurn = game.owners.find(p => p !== game.turn);
    const invitee = game.owners.find(p => p !== game.initiator);
    const newState = [...game.state];
    newState[index] = symbol;
    let newStatus = "ACTIVE";
    let newWinner = null;

    const terminalState = isTerminal(newState);
    if (terminalState) {
        newStatus = "FINISHED";
        if (terminalState.winner === "x") {
            newWinner = game.initiator;
        }
        if (terminalState.winner === "o") {
            newWinner = invitee;
        }
    }

    const updateGameResponse = await graphqlClient.mutate({
        mutation: updateGame,
        variables: {
            id: gameID,
            turn: nextTurn,
            winner: newWinner,
            status: newStatus,
            state: newState,
            player: player
        }
    });

    // 6. return the updated game
    // 업데이트 된 게임 반환
    return updateGameResponse.data.updateGame
};
