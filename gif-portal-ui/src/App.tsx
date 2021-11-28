import React, { useEffect, useState } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import './App.css';
import { Footer } from './Footer';
import rawIdl from './solana-program-idl/gif_storage.json';
import keyPair from './utilities/keypair.json';
import usePhantom from './hooks/usePhantom';

type GifItemType = {
  gifLink: string
}

const App = () => {

  const [inputValue, setInputValue] = useState<string>('');
  const [gifList, setGifList] = useState<GifItemType[] | null>(null);
  const { connectWallet, walletAddress } = usePhantom();
  
  const idl: any = rawIdl;
  
  // SystemProgram is a reference to the Solana runtime!
  const { SystemProgram } = web3;

  // Get our program's id from the IDL file.
  const programID = new PublicKey(idl.metadata.address);

  // Set our network to devnet.
  const network = clusterApiUrl('devnet');

  // Controls how we want to acknowledge when a transaction is "done".
  const opts : web3.ConfirmOptions  = {
    preflightCommitment: "processed"
  }

  const arr = Object.values(keyPair._keypair.secretKey)
  const secret = new Uint8Array(arr)
  const baseAccount = web3.Keypair.fromSecretKey(secret)

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
        try {
          const provider = getProvider();
          const program = new Program(idl, programID, provider);
          await program.rpc.initialize({
            accounts: {
              baseAccount: baseAccount.publicKey,
              user: provider.wallet.publicKey,
              systemProgram: SystemProgram.programId,
            },
            signers: [baseAccount]
          });
          console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
          await getGifList();
      
        } catch(error) {
          console.log("Error creating BaseAccount account:", error)
        }
    }

    const sendGif = async () => {
      if (inputValue.length === 0) {
        console.log("No gif link given!")
        return
      }
      console.log('Gif link:', inputValue);

        try {
          const provider = getProvider();
          const program = new Program(idl, programID, provider);
      
          await program.rpc.addGif(inputValue, {
            accounts: {
              baseAccount: baseAccount.publicKey,
              user: provider.wallet.publicKey,
            },
          });
          console.log("GIF successfully sent to program", inputValue)
      
          await getGifList();
        } catch (error) {
          console.log("Error sending GIF:", error)
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
                  <img src={item.gifLink} alt='' />
                </div>
              ))}
            </div>
          </div>
        )
      }
    }

    const getGifList = async() => {
        try {
          const provider = getProvider();
          const program = new Program(idl, programID, provider);
          const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
          
          console.log("Got the account", account)
          setGifList(account.gifList)
      
        } catch (error) {
          console.log("Error in getGifList: ", error)
          setGifList(null);
        }
    }

    useEffect(() => {
      if (walletAddress) {
        console.log('Fetching GIF list...');
        
        // Call Solana program here.
        getGifList()
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
