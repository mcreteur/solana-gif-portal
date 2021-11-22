import React, { useEffect, useState } from 'react';
import './App.css';
import { Footer } from './Footer';
import { PhantomResponse } from './types';

const TEST_GIFS = [
	'https://i.giphy.com/media/eIG0HfouRQJQr1wBzz/giphy.webp',
	'https://media3.giphy.com/media/L71a8LW2UrKwPaWNYM/giphy.gif?cid=ecf05e47rr9qizx2msjucl1xyvuu47d7kf25tqt2lvo024uo&rid=giphy.gif&ct=g',
	'https://media4.giphy.com/media/AeFmQjHMtEySooOc8K/giphy.gif?cid=ecf05e47qdzhdma2y3ugn32lkgi972z9mpfzocjj6z1ro4ec&rid=giphy.gif&ct=g',
	'https://i.giphy.com/media/PAqjdPkJLDsmBRSYUp/giphy.webp'
]

const App = () => {

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [gifList, setGifList] = useState<string[]>([]);
  
    /*
   * This function holds the logic for deciding if a Phantom Wallet is
   * connected or not
   */
    const checkIfWalletIsConnected = async () => {
      try {
        const solanaProvider = window.solana;
  
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
      const solanaProvider = window.solana;
  
      if (solanaProvider) {
        const response: PhantomResponse = await solanaProvider.connect({ onlyIfTrusted: true });
        console.log('Connected with Public Key:', response.publicKey.toString());
        setWalletAddress(response.publicKey.toString());
      }
    };

    const onInputChange = (event: any) => {
      const { value } = event.target;
      setInputValue(value);
    };

    const sendGif = async () => {
      if (inputValue.length > 0) {
        console.log('Gif link:', inputValue);
      } else {
        console.log('Empty input. Try again.');
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

    const renderConnectedContainer = () => (
      <div className="connected-container">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendGif();
          }}
        >
          <input type="text" placeholder="Enter gif link!" value={inputValue} onChange={onInputChange}/>
          <button type="submit" className="cta-button submit-gif-button">Submit</button>
        </form>
        <div className="gif-grid">
          {gifList.map((gif) => (
            <div className="gif-item" key={gif}>
              <img src={gif} alt={gif} />
            </div>
          ))}
        </div>
      </div>
    );

    useEffect(() => {
      const onLoad = async () => {
        await checkIfWalletIsConnected();
      };
      window.addEventListener('load', onLoad);
      return () => window.removeEventListener('load', onLoad);
    }, []);

    useEffect(() => {
      if (walletAddress) {
        console.log('Fetching GIF list...');
        
        // Call Solana program here.
    
        // Set state
        setGifList(TEST_GIFS);
      }
    }, [walletAddress]);

  return (
    <div className="App">
			<div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default App;
