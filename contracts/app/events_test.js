
const event_interfaces = require('../api/eventAPI');
let buyer_address = '0x655Ba967921B9A72285b9ead248356043cc53061';
let owner_address = '0x5c80D980EE0E7a229a322F44fAd5bd3202Aa100d';
let bidder_address_2 = '0x1B6E29062Ff956ced3Df3Fc9F72f13Fd9092335f';
let bidder_address_3 = '0xCDcAfC7c73bdd3298cfFf8253F2994f87e2Ad469';
const administrator = '0x03D691918073063d91ffa40dAf4Bf7DD456a9aC4';
let password = "Test@2018";
let target_artwork_id = 1542588765739268;
let exchangeContractAddress = '0x174e41f0e67f1d792D8bEDd0a10eED5BEAA7D415';
const adminAddress = '0x25990028dD240bff4D5b2f88E8ce7834044Ca653';
const acg20AdminAddress = '0x95f420903525e225D26688812Bb4414d836Cb536';
// get all the past events and simply print them out on console
const getPastEventsTest = async () => {
    const pastEventsArray = await event_interfaces.getPastEvents();
    const displayNumberOfEvent = 2;
    for (var i = pastEventsArray.length -displayNumberOfEvent-1; i < pastEventsArray.length - 1; i++) {
        console.log(`the event number ${i} is: `);
        console.log(pastEventsArray[i]);
    }
    
};

const getAcg20EventsByAddress = async (_address) => {
    const eventFromAddress = await event_interfaces.getAcg20TransactionsFromAddress(_address);
    eventFromAddress.forEach((transaction) =>{
        console.log(`transaction is: ${transaction}`);
    })

    // const eventToAddress = await event_interfaces.getAcg20TransactionsToAddress(_address);
    // eventToAddress.forEach((transaction) =>{
    //     console.log(`transaction is: ${transaction}`);
    // })
}


const getAcg721EventsByAddress = async (_address) => {
    const eventFromAddress = await event_interfaces.getAcg721TransactionsFromAddress(_address);
    eventFromAddress.forEach((transaction) =>{
        console.log(`transaction is: ${transaction}`);
    })

    // const eventToAddress = await event_interfaces.getAcg721TransactionsToAddress(_address);
    // eventToAddress.forEach((transaction) =>{
    //     console.log(`transaction is: ${transaction}`);
    // })
}

getAcg20EventsByAddress(buyer_address);
getAcg721EventsByAddress(buyer_address);

// getPastEventsTest();
