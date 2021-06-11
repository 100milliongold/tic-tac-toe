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

    // 2. Make sure the game is active
    // 게임이 활성화되어 있는지 확인

    // 3. Check that the current use is a participant in the game and that it's his turn
    // 현재 사용중인 게임이 게임에 참여하고 있는지 그리고 그의 차례인지 확인하십시오

    // 4. Make sure that the index is valid (not > 8 and not already occupied)
    // 인덱스가 유효한지 확인하십시오 (8보다 크지 않고 이미 사용 중이 아님).

    // 5. Update the state, check if the move is a terminal one & update the winner, status, turn & update the state
    // 상태 업데이트, 놓아둔 말이 마직막인지 확인하고 승자, 상태 업데이트, 상태 변경 및 업데이트


    // 6. return the updated game
    // 업데이트 된 게임 반환
};
