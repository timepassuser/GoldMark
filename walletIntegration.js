chainName = "aptos";

errorElementId = "errorElement"
connectButtonId = "connectButton"
detectButtonId = "detectButton"
balanceElementId = "balanceElement"
yourAddressId = "yourAddress";
yourPubKeyId = "yourPubKey";
productNameId = "productName"
productIdId = "productId"
registerButtonId = "registerButton"
errorElement = document.getElementById(errorElementId)
connectButton = document.getElementById(connectButtonId)
detectButton = document.getElementById(detectButtonId)
balanceElement = document.getElementById(balanceElementId)
yourAddress = document.getElementById(yourAddressId)
yourPubKey = document.getElementById(yourPubKeyId)
productNameElement = document.getElementById(productNameId)
productIdElement = document.getElementById(productIdId)
registerButton = document.getElementById(registerButtonId)
provider = false;

function detectWelldoneWallet() {
    if (!window.dapp) {
        errorElement.innerText = "Please install and configure the WELLDONE wallet extension";
        return false;
    } else {
        errorElement.innerText = "Detected wallet";
        provider = true;
        return true;
    }
}

accountAddress = ""
accountPubKey = ""
sequenceNumber = null;
async function connectWelldoneWallet() {
    const accounts = await window.dapp.request(chainName, {
        method: 'dapp:accounts'
    })
    if (Object.keys(accounts).length !== 0) {
        accountAddress = accounts.aptos.address;
        accountPubKey = accounts.aptos.pubKey;
        yourAddress.innerText = "Address: " + accountAddress;
        yourPubKey.innerText = "Pubkey: " + accountPubKey;
        balance = await window.dapp.request(chainName, {
            method: "dapp:getBalance",
            params: [accountAddress]
        })
        balanceElement.innerText = "Balance: " + balance
    } else {
        errorElement.innerText = "No linked aptos account found";
    }
}

function detectAndConnect() {
    if (detectWelldoneWallet) {
        connectWelldoneWallet();
    }
}

apiGetUrl = "https://api.devnet.aptoslabs.com/v1/accounts/"
apiTransactionUrl = "https://api.devnet.aptoslabs.com/v1/transactions/"

async function register_item() {
    response = await fetch(apiGetUrl + accountAddress);
    sequenceNumber = response.sequence_number + 1;
    max_gas_amount = 2000;
    gas_unit_price = 1;
    expiration_timestamp_secs = Math.floor(Date.now() / 1000) + 30;
    payload = {
        "type": "entry_function_payload",
        "function": accountAddress + "::LuxuryGoodsOwnership::register_item",
        "arguments": [productNameElement.value + productIdElement.value]
    };
    params = {
        "sender": accountAddress,
        "sequenceNumber": sequenceNumber,
        "max_gas_amount": max_gas_amount,
        "gas_unit_price": gas_unit_price,
        "expiration_timestamp_secs": expiration_timestamp_secs,
        "payload": payload
    }
    response = await window.dapp.request(chainName, {
        method: "dapp:signTransaction",
        params: [params]
    })

    signature = {
        "type": "ed25519_signature",
        "public_key": accountPubKey,
        "signature": response[0]
    }
    dataToSend = {
        "sender": accountAddress,
        "sequenceNumber": sequenceNumber,
        "max_gas_amount": max_gas_amount,
        "gas_unit_price": gas_unit_price,
        "expiration_timestamp_secs": expiration_timestamp_secs,
        "payload": payload,
        "signature": signature
    }
    response = await fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify(dataToSend)
    })
    console.log(response.status);
}

// detectButton.addEventListener('click', detectWelldoneWallet)
connectButton.addEventListener('click', detectAndConnect);
registerButton.addEventListener('click', register_item)