import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {

  const [walletAddress, setWalletAddress] = useState(null);
  
    /*
   * This function holds the logic for deciding if a Phantom Wallet is
   * connected or not
   */
    const checkIfWalletIsConnected = async () => {
      try {
        const solanaProvider = (window as any).solana;
  
        if (solanaProvider && solanaProvider.isPhantom) {
            console.log('Phantom wallet found!');
        } else {
          alert('Solana object not found! Get a Phantom Wallet 👻');
        }
      } catch (error) {
        console.error(error);
      }
    };

    const connectWallet = async () => {
      const solana = (window as any).solana;
  
      if (solana) {
        const response = await solana.connect({ onlyIfTrusted: true });
        console.log('Connected with Public Key:', response.publicKey.toString());
        setWalletAddress(response.publicKey.toString());
      }
    };
  
    const renderNotConnectedContainer = () => (
      <button
        className="cta-button connect-wallet-button"
        onClick={connectWallet}
      >
        Connect to Phantom Wallet
      </button>
    );

    useEffect(() => {
      const onLoad = async () => {
        await checkIfWalletIsConnected();
      };
      window.addEventListener('load', onLoad);
      return () => window.removeEventListener('load', onLoad);
    }, []);

  return (
    <div className="App">
			<div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          {!walletAddress && renderNotConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
