'use client';
import { sdk } from 'src/lib/medusa';

// ----------------------------------------------------------------------

export type SignInParams = {
  email: string;
  password: string;
};

export const signInWithPassword = async ({ email, password }: SignInParams): Promise<void> => {
    try {
        const token = await sdk.auth.login("user", "emailpass", {
            email,
            password
          })
  
    } catch (error) {
      console.error('Error during sign in:', error);
      throw error;
    }
  };
  