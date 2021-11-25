import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { GifStorage } from '../target/types/gif_storage';

describe('gif-storage', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.GifStorage as Program<GifStorage>;

  it('Is initialized!', async () => {
    // Add your test here.
    const tx = await program.rpc.initialize({});
    console.log("Your transaction signature", tx);
  });
});
