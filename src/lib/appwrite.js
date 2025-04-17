import { Client, Account, Databases, ID } from "appwrite";

const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

export const appwriteClient = client;
export const account = new Account(client);
export const databases = new Databases(client);
export { ID }; 

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
export const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID;
export const TRANSACTIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID;
export const GOALS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_GOALS_COLLECTION_ID;
export const BUDGETS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BUDGETS_COLLECTION_ID;
export const INSIGHTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_INSIGHTS_COLLECTION_ID;


// Debugging: Log values to check if they are loaded correctly 
// console.log("Database ID:", DATABASE_ID);
// console.log("Users Collection ID:", USERS_COLLECTION_ID);
// console.log("Transactions Collection ID:", TRANSACTIONS_COLLECTION_ID);
// console.log("Goals Collection ID:", GOALS_COLLECTION_ID);
// console.log("bugdet Collection ID:", BUDGETS_COLLECTION_ID);
// import { Client, Account } from 'appwrite';

// export const client = new Client();

// client
//     .setEndpoint('https://cloud.appwrite.io/v1')
//     .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID); // Replace with your project ID

// export const account = new Account(client);
// export { ID } from 'appwrite';
