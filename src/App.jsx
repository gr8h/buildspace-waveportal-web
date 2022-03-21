import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import wavePortal from './utils/WavePortal.json';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [message, setMessage] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = "0x5597351e6684e335266c8D8B36214A7506b15872";

  const emojis = ["😀", "😁", "🙂", "😊", "🤩", "🤑", "😎", "🤓"];

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, wavePortal.abi, signer);

        const waves = await wavePortalContract.getAllWaves();
        console.log(waves);

        const wavesCleaned = waves.map(wave => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          };
        });

        setAllWaves(wavesCleaned);

        wavePortalContract.on("NewWave", (from, timestamp, message) => {
          console.log("NewWave", from, timestamp, message);

          setAllWaves(prevState => [
            ...prevState, {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message
          }]);
        });

      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        setCurrentAccount(account);
        console.log("Found an authorized account:", account);
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      const account = accounts[0];
      setCurrentAccount(account);
      console.log("Connected", account);
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, wavePortal.abi, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        console.log("The message...", message);
        const waveTxn = await wavePortalContract.wave(message, { gasLimit: 500000 });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);
        
        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        setMessage("");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      setMessage("");
      console.log(error)
    }
  }
  
  useEffect(() => {
    checkIfWalletIsConnected();
    getAllWaves();
  }, []);

 return (
   <div className="bg-blue-900">
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
      <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
        <span className="block text-yellow-400">Wanna play a game?</span>
        <span className="block text-blue-300">Say whatever and maybe you win free ETH.</span>
      </h2>
      {!currentAccount && (
        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div className="ml-3 inline-flex rounded-md shadow">
            <button
              onClick={connectWallet}
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-black bg-white hover:bg-indigo-50"
            >
              Connect Wallet
            </button>
          </div>
        </div>
    )}
    {currentAccount && (
      <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div className="ml-3 inline-flex rounded-md shadow">
            <div
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-black bg-white :bg-indigo-50"
            >
              Welcome 😀!
            </div>
          </div>
        </div>
    )}

        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <div className="relative">
                <div className="absolute top-1 left-1"> <i className="fa fa-search text-gray-400 z-20 hover:text-gray-500"></i> </div> <input type="text" className="h-14 w-96 pl-10 pr-20 rounded-lg z-0 focus:shadow focus:outline-none" placeholder="Say something..." value={message} onInput={e => setMessage(e.target.value)} />
                <div className="absolute top-2 right-2"> <button className="h-10 w-20 text-white rounded-lg bg-blue-900 hover:bg-red-600" onClick={wave}>Wave 👋</button> </div>
            </div>
        </div>
    </div>
    <div className="items-center">
        {allWaves.map((wave, index) => {
            return (
            <div className="bg-yellow-300 border-t border-yellow-500 text-blue-900 px-4 py-6" role="alert">
                <p className="font-bold">{emojis[Math.floor((Math.random() * 7) + 1)]} {wave.message}</p>
                <p className="text-sm">{wave.address}</p>
                <p className="text-sm">{wave.timestamp.toString().substring(0, 25)}</p>
            </div>
            )
        })}
    </div>
  </div>
  )
}

export default App