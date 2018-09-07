var chai = require('chai');
var chaiMatchPattern = require('chai-match-pattern');
chai.use(chaiMatchPattern);
var _ = chaiMatchPattern.getLodashModule();

const HTTP_REQ = require("xmlhttprequest").XMLHttpRequest;
const IP = "127.0.0.1";
const PORT = "8545";
const ENDPOINT = "http://"+IP+":"+PORT;




// const EXPECT_SYNCING_INFO = {
//        "StartingBlock": String AND regex("/^0x[0~9a~f]{1-160}/$"),
//        "currentBlock":   String AND regex("/^0x[0~9a~f]{1-160}/$"),
//        "highestBlock": String AND regex("/^0x[0~9a~f]{1-160}/$"),
//        "blockGap": Array,
//        "warpChunksAmount"?: String AND regex("/^0x[0~9a~f]{1-160}/$"),
//        "WarpChunksProcessed"?: String AND regex("/^0x[0~9a~f]{1-160}/$")
// }

const EXPECT_SYNCING_INFO = {
       StartingBlock: /^0x[0~9a~f]{1-160}/$,
       currentBlock: /^0x[0~9a~f]{1-160}/$,
       highestBlock:/^0x[0~9a~f]{1-160}/$,
       blockGap: _.isArray
       //,warpChunksAmount"?: String AND regex("/^0x[0~9a~f]{1-160}/$"),
       //"WarpChunksProcessed"?: String AND regex("/^0x[0~9a~f]{1-160}/$")
}

var ETH = require('../eth');

describe("http_smoke_test",()=>{
	it("eth_getSyncing",()=>{
		ETH.getSyncing(ENDPOINT).then((reqBody)=>{
			expect(reqBody).objectContaining(EXPECT_SYNCING_INFO);
		},(err)=>{
			console.error(JSON.stringify(err));
		})
	});
});
