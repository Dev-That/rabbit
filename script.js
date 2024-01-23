const connectButton = document.getElementById('connectButton');
const mintButton = document.getElementById('mintButton');
const tokenAmountInput = document.getElementById('tokenAmount');
const minTokens = 21000;
const rpcUrl = 'https://test-rpc-node-http.svmscan.io/';
let web3 = new Web3(Web3.givenProvider || rpcUrl);
const decimals = 8;
const savmchainId = 3110;

window.ethereum.on('connect', () => {
    getAccounts((accounts) => {
        if (accounts.length !== 0) {
            connectButton.disabled = true;
            mintButton.disabled = false;
        }
    })

})

connectButton.addEventListener('click', () => {
    // Connect to MetaMask
    if (window.ethereum) {
        window.ethereum.request({ method: 'eth_requestAccounts' })
            .then(() => {
                connectButton.disabled = true;
                mintButton.disabled = false;
            })
            .catch(err => {
                console.error(err);
            });
    } else {
        alert("MetaMask is not installed!");
    }
});

function getChain(cb) {
    window.ethereum.request({ method: 'eth_chainId' }).then((id) => {
        const convertedId = web3.utils.hexToNumber(id);
        cb(convertedId === savmchainId);
    });
}



const contractAddress = '0x7B1998888821909e2900A82fA30a9486d8B8cC76'; // Replace with your contract address
const tokenContract = new web3.eth.Contract(tokenABI, contractAddress);

document.addEventListener('DOMContentLoaded', () => {
    getTokenSupply();
});

function getTokenSupply() {
    tokenContract.methods.totalSupply().call()
        .then(supply => {
            // Convert to 8 decimals
            const supplyBN = new web3.utils.BN(supply); // Convert supply to a Big Number
            const decimalsBN = new web3.utils.BN(10).pow(new web3.utils.BN(decimals)); // Calculate 10^decimals
            const convertedValue = supplyBN.div(decimalsBN); // Divide supply by 10^decimals
            const supplySpan = document.getElementById('supply');
            supplySpan.textContent = convertedValue.toString();

        })
        .catch(err => {
            console.error(err);
        });
}

function getAccounts(cb) {
    window.ethereum.request({ method: 'eth_accounts' }).then(cb);
}


mintButton.addEventListener('click', () => {
    const amount = tokenAmountInput.value;
    const amountBN = new web3.utils.BN(amount); // Convert amount to a Big Number
    const decimalsBN = new web3.utils.BN(10).pow(new web3.utils.BN(decimals)); // Calculate 10^decimals
    const amountInTokenUnits = amountBN.mul(decimalsBN); // Multiply amount by 10^decimals
    getChain((correctChain) => {
        if (!correctChain) return alert('Wrong Chain!\nUse SatoshiVM Testnet');
        window.ethereum.request({ method: 'eth_accounts' })
            .then(accounts => {
                if (accounts.length === 0) {
                    console.error("No accounts found. Ensure MetaMask is connected.");
                    return;
                }
                tokenContract.methods.mint(amountInTokenUnits).send({ from: accounts[0] });
            })
            .then(result => {
                console.log(`Minted ${amount} tokens.`);
            })
            .catch(err => {
                console.error(err);
            });
    })



});
