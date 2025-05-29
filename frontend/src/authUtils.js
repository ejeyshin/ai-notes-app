import { Auth } from 'aws-amplify';

export async function getUserId() {
  try {
    const user = await Auth.currentAuthenticatedUser();
    return user.attributes.sub; 
  } catch (error) {
    console.error("❌ Failed to get user ID:", error);
    return null;
  }
}
