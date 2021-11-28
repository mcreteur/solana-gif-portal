import { useCallback, useEffect, useState } from "react";
import { PhantomResponse } from "../types";

 /*
   * This function holds the logic for deciding if a Phantom Wallet is
   * connected or not
   */
 const checkIfWalletIsConnected = async (setWalletAddress : React.Dispatch<React.SetStateAction<string | null>>) => {
    try {
      const solanaProvider = window.solana;

      if (solanaProvider && solanaProvider.isPhantom) {
          console.log('Phantom wallet found!');
          const response: PhantomResponse = await solanaProvider.connect({ onlyIfTrusted: true });
          console.log('Connected with Public Key:', response.publicKey.toString());
          setWalletAddress(response.publicKey.toString());
      } else {
          alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const usePhantom = () => {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);

    const connectWallet = useCallback(async () => {
        const { solana } = window;
    
        if (solana) {
          const response = await solana.connect();
          console.log('Connected with Public Key:', response.publicKey.toString());
          setWalletAddress(response.publicKey.toString());
        }
    }, [setWalletAddress]);

    useEffect(() => {
        const onLoad = async () => {
          await checkIfWalletIsConnected(setWalletAddress);
        };
        window.addEventListener('load', onLoad);
        return () => window.removeEventListener('load', onLoad);
      }, [setWalletAddress]);
    
    return {
        connectWallet,
        walletAddress
    }
  }

  export default usePhantom;