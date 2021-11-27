import React, { useEffect, useState } from 'react';
import './App.css';
import { Footer } from './Footer';
import { PhantomResponse } from './types';
import rawIdl from './solana-program-idl/gif_storage.json';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Idl, Program, Provider, web3 } from '@project-serum/anchor';

type GifItemType = {
  gifLink: string
}



const App = () => {

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [gifList, setGifList] = useState<GifItemType[] | null>(null);
  
  const idl: any = rawIdl;
  
  // SystemProgram is a reference to the Solana runtime!
  const { SystemProgram, Keypair } = web3;
  const [baseAccountKeyPair, setBaseAccountKeyPair] = useState<web3.Keypair | null>(null);

  // Get our program's id from the IDL file.
  const programID = new PublicKey(idl.metadata.address);

  // Set our network to devnet.
  const network = clusterApiUrl('devnet');

  // Controls how we want to acknowledge when a transaction is "done".
  const opts : web3.ConfirmOptions  = {
    preflightCommitment: "processed"
  }

  
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

        setBaseAccountKeyPair(web3.Keypair.generate());
      }
    };

    const onInputChange = (event: any) => {
      const { value } = event.target;
      setInputValue(value);
    };

    const getProvider = () => {
      const connection = new Connection(network, opts.preflightCommitment);
      const provider = new Provider(
        connection, window.solana, opts,
      );
      return provider;
    }

    const createGifAccount = async () => {
      if (baseAccountKeyPair != null) {
        try {
          const provider = getProvider();
          const program = new Program(idl, programID, provider);
          await program.rpc.initialize({
            accounts: {
              baseAccount: baseAccountKeyPair.publicKey,
              user: provider.wallet.publicKey,
              systemProgram: SystemProgram.programId,
            },
            signers: [baseAccountKeyPair]
          });
          console.log("Created a new BaseAccount w/ address:", baseAccountKeyPair.publicKey.toString())
          await getGifList();
      
        } catch(error) {
          console.log("Error creating BaseAccount account:", error)
        }
      }
    }

    const sendGif = async () => {
      if (inputValue.length === 0) {
        console.log("No gif link given!")
        return
      }
      console.log('Gif link:', inputValue);

      if (baseAccountKeyPair != null) {
        try {
          const provider = getProvider();
          const program = new Program(idl, programID, provider);
      
          await program.rpc.addGif(inputValue, {
            accounts: {
              baseAccount: baseAccountKeyPair.publicKey,
              user: provider.wallet.publicKey,
            },
          });
          console.log("GIF successfully sent to program", inputValue)
      
          await getGifList();
        } catch (error) {
          console.log("Error sending GIF:", error)
        }
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

    const renderConnectedContainer = () => {
      // If we hit this, it means the program account hasn't be initialized.
      if (gifList === null) {
        return (
          <div className="connected-container">
            <button className="cta-button submit-gif-button" onClick={createGifAccount}>
              Do One-Time Initialization For GIF Program Account
            </button>
          </div>
        )
      } 
      // Otherwise, we're good! Account exists. User can submit GIFs.
      else {
        return(
          <div className="connected-container">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendGif();
              }}
            >
              <input
                type="text"
                placeholder="Enter gif link!"
                value={inputValue}
                onChange={onInputChange}
              />
              <button type="submit" className="cta-button submit-gif-button">
                Submit
              </button>
            </form>
            <div className="gif-grid">
              {gifList.map((item, index) => (
                <div className="gif-item" key={index}>
                  <img src={item.gifLink} />
                </div>
              ))}
            </div>
          </div>
        )
      }
    }

    useEffect(() => {
      const onLoad = async () => {
        await checkIfWalletIsConnected();
      };
      window.addEventListener('load', onLoad);
      return () => window.removeEventListener('load', onLoad);
    }, []);

    const getGifList = async() => {
      if (baseAccountKeyPair != null) {
        try {
          const provider = getProvider();
          const program = new Program(idl, programID, provider);
          const account = await program.account.baseAccount.fetch(baseAccountKeyPair.publicKey);
          
          console.log("Got the account", account)
          setGifList(account.gifList)
      
        } catch (error) {
          console.log("Error in getGifList: ", error)
          setGifList(null);
        }
      }
    }

    useEffect(() => {
      if (walletAddress) {
        console.log('Fetching GIF list...');
        
        // Call Solana program here.
        getGifList()
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
