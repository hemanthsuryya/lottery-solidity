const assert    = require('assert');
const ganache   = require('ganache-cli');
const Web3      = require('web3');
const { execPath } = require('process');
const web3      = new Web3(ganache.provider());
const { interface, bytecode } = require('../compile');


let lottery;
let accounts;

beforeEach( async () => {
    accounts = await web3.eth.getAccounts();
    console.log(accounts[0]);
    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({data: bytecode})
        .send({from: accounts[0], gas: '1000000'})
});

describe('Lottery Contract', () =>{
    it('deploys a contract', () => {
        assert.ok(lottery.options.address)
    });

    it('allows one account to enter', async() => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.01', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length);

    });
    it('allows multiple accounts to enter', async() => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.01', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.01', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.01', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);
        assert.equal(3, players.length);

    });

    it('Requires minimum amount of ether to enter', async() => {
        try{
            await lottery.methods.enter().send( {
                from : accounts [0],
                value: 0
            });
            assert(false);
        } catch (e){
            // console.log(e);
            assert(e);
        }

    });

    it('Check is Manager', async() =>{
    try{
        await lottery.methods.pickWinner().send({
            from: accounts[1],
            value: 1000000
        });
    } catch(e) {
        assert(e);
    }});

    it('Whole contest test', async() => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.1', 'ether')
        });
        const initialBalance = await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({
            from: accounts[0],
        });
        const finalBalance = await web3.eth.getBalance(accounts[0]);
        const difference = finalBalance - initialBalance;
        
        assert(difference< web3.utils.toWei('0.8', 'ether'));
    })
});