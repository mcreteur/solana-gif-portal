import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { GifStorage } from '../target/types/gif_storage';
import { assert } from 'chai';

describe('gif-storage', () => {
  const { SystemProgram } = anchor.web3;

  console.log("🚀 Starting tests...");
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.GifStorage as Program<GifStorage>;
  const baseAccount = anchor.web3.Keypair.generate();

  it('Creates a gif storage', async () => {
    console.log("Creating a gif storage...")
    let tx = await program.rpc.initialize({
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [baseAccount],
    });
    console.log("Created !");
    console.log("📝 Your transaction signature is", tx);
    assert(tx != null);

    let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    let totalGifs = account.totalGifs;
    console.log('👀 GIF Count', totalGifs.toString());
    assert(totalGifs.toNumber() == 0);
  });

  it('Updates gif storage counter', async () => {
    console.log('Updating total Gifs...');
   // Call add_gif!
    await program.rpc.addGif({
    accounts: {
      baseAccount: baseAccount.publicKey,
      },
    });
  
    let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    let totalGifs = account.totalGifs;
    console.log('👀 GIF Count', totalGifs.toString());
    assert(totalGifs.toNumber() == 1);
  });

});