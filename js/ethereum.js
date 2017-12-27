var contractAddress = '0x3f85D0b6119B38b7E6B119F7550290fec4BE0e3c';
var updateInterval = 1000;
var fadeDuration = 2500;
var precision = 3;

var bigPrize = null;

function changeWarning(text) {
    $('#warning').fadeOut(500, function() {
        $(this).text(text).fadeIn(500);
    });
}

function takePrize() {
    contract.takePrize.sendTransaction({value: 0});
}

function updateContractData() {
    contract.getWinnerCandidate(function (err, value) {
        if (err) {
            toastr.error('Error retrieving winner candidate');
            console.log(err);
        } else {
            $('#candidateAddress').text(value);
            $('#candidateAddress').css('opacity', 0).animate({opacity: 1}, fadeDuration);
        }
    });
    contract.getBlocksLeft(function (err, value) {
        if (err) {
            toastr.error('Error retrieving blocks left');
            console.log(err);
        } else {
            $('#blocksLeft').text('Blocks left: ' + value);
            $('#blocksLeft').css('opacity', 0).animate({opacity: 1}, fadeDuration);
        }
    });
    contract.prize(function (err, value) {
        if (err) {
            toastr.error('Error retrieving current prize');
            console.log(err);
        } else {
            bigPrize = new BigNumber(web3.fromWei(value, 'ether'));
            var pressPrice = bigPrize.mul(2).div(100).toPrecision(precision);
            $('#prize').text('Current prize: ' + new BigNumber(web3.fromWei(value, 'ether')).toPrecision(precision) + ' ETH');
            $('#prize').css('opacity', 0).animate({opacity: 1}, fadeDuration);

            $('#pressPrice').text(pressPrice + ' ETH');
            $('#pressPrice').css('opacity', 0).animate({opacity: 1}, fadeDuration);
        }
    });
}

function startApp() {
    web3.eth.defaultAccount = web3.eth.accounts[0];
    window.contract = web3.eth.contract(abi).at(contractAddress);
    setInterval(updateContractData, updateInterval);
    updateContractData();
    $('#pressButton').prop('disabled', false);
    $('#pressButton').click(function () {
        if (bigPrize !== null) {
            var amount = bigPrize.mul(2).div(100);
            contract.press.sendTransaction({value: web3.toWei(amount, 'ether')}, function(err, result) {
                if (err) {
                    toastr.error('Error sending transaction');
                } else {
                    toastr.info('Success');
                }
            });
            toastr.info('Check your client for new transaction');
        } else {
            toastr.error('Value should be greater than 2% of the prize');
        }
        return false;
    });
}


$(document).ready(function () {
    BigNumber.config({ ROUNDING_MODE: 0 });
    if (typeof web3 !== 'undefined') {
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.log('Trying rpc');
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }
    if (web3.isConnected()) {
        startApp()
    } else {
        toastr.error('No connection to Ethereum network', {timeOut: 15000});
    }
});