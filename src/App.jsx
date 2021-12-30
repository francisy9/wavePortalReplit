import React, {useEffect, useState, useRef} from "react";
import {ethers} from "ethers";
import './App.css';
import abi from './utils/WavePortal.json/';

const App = () => {
  const inputRef = useRef();

  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = "";
  const contractABI = abi.abi;
  var count = -1;

  const walletConnected = async () => {
    try{
      const {ethereum} = window;

      if (ethereum) {
        console.log("We have the ethereum object.", ethereum);
        getAllWaves();
      } else {
        console.log("Connect your wallet.");
        return;
      }

      const accounts = await ethereum.request({method: 'eth_accounts'});
      
      if (accounts.length != 0) {
        const account = accounts[0];
        console.log("Authorized account found.");
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found.");
      }
    } catch(error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try{
      const {ethereum} = window;

      if (!ethereum) {
        console.log("Get metamask");
        return;
      }

      const accounts = await ethereum.request({method: "eth_requestAccounts"});

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      getAllWaves();
    } catch (error) {
      console.log(error);
    }
  }

  const wave = async() => {
    try {
      const {ethereum} = window;
      
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);


        count = await wavePortalContract.getTotalWaves();
        console.log("Total waves: ", count);

        const waveTxn = await wavePortalContract.wave(inputRef.current.value, {gasLimit: 300000});
        console.log("Mining-- ",  waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined-- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Total number of waves: ", count);

        console.log("seed: ", waveTxn);
      } else {
        console.log("Ethereum object doesn't exist.");
      }
      } catch (error) {
        console.log(error);
      }
    }

    const getAllWaves = async () => {
      try {
        const {ethereum} = window;
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

          const waves = await wavePortalContract.getAllWaves();

          let wavesCleaned = [];
          waves.forEach(wave => {
            wavesCleaned.push({
              address: wave.waver,
              timestamp: new Date(wave.timestamp * 1000),
              message: wave.message
            });
          });

          setAllWaves(wavesCleaned);
        } else {
          console.log("Ethereum object doesn't exist");
        }
      } catch (error) {
        console.log(error);
      }
    }
  

  useEffect(() => {

    let wavePortalContract;
    
    const onNewWave = (from, newTimeStamp, newMsg) => {
      console.log("NewWave", from, newTimeStamp, newMsg);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(newTimeStamp * 1000),
          message: newMsg,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
    if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, [])
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hello!
        </div>

        {!currentAccount && (
          <div className="bio">
            I am Scarlett. Connect your Ethereum wallet and wave at me!
          </div>
        )}
        {currentAccount && (
          <div className="bio">
            I am Scarlett. Wave at me for a chance to win some ethereum!
          </div>
        )}

        

        {currentAccount && (
          <div className="bio">
            <input ref={inputRef} size="75"/>
          </div>
        )}

        {currentAccount && (
          <button className="waveButton" onClick={wave}>
            Wave at Me
          </button>
        )}
        

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} className="msgContainer">
              <div className="msgText">Address: {wave.address}</div>
              <div className="msgText">Time: {wave.timestamp.toString()}</div>
              <div className="msgText">Message: {wave.message}</div>
            </div>)
        })}
        
      </div>
    </div>
  );
}

export default App
