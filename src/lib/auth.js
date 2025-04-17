import { account } from "./appwrite";
import { ID } from "appwrite";
import { createUserDocument } from "./data";

// Register a new user
export async function register(name, email, password) {
  try {

    const newAccount = await account.create(ID.unique(), email, password, name);


    const user = await account.get();
    console.log("User created:", user); // Debugging


    await createUserDocument(user.$id, {
      name,
      email,
      preferences: JSON.stringify({
        emailNotifications: false,
        budgetAlerts: true,
        savingsReminders: true,
      }), // ✅ Store preferences as a string
    });

    return newAccount;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

// Login user
export async function login(email, password) {
  try {
    const session = await account.createSession("email", email, password);
    return session
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

// Logout user
export async function logout() {
  try {
    await account.deleteSession("current");
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    return await account.get();
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

// Check if user is logged in
export async function isLoggedIn() {
  try {
    const user = await getCurrentUser();
    return !!user;
  } catch (error) {
    return false;
  }
}
