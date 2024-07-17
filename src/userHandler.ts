import { Octokit } from "@octokit/core";
import { User } from "./user";
import { getDb, users } from "../db";
import { eq } from "drizzle-orm";



let octokit: Octokit;
function getOctokit(githubToken: string) {
  if (!octokit) {
    octokit = new Octokit({ auth: githubToken });
  }

  return octokit;
}

export const getUserInfo = async (userName: string, githubToken: string) => {
  const octokit = getOctokit(githubToken);

  try {
    const userinfo = await octokit.request("GET /users/{username}", {
      username: userName,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
 
    const user: User = {
        gitHub_handle: userName,
        gitHub_avatar: userinfo.data.avatar_url,
        name: userinfo.data.name,
        company: userinfo.data.company,
        location: userinfo.data.location,
        email: userinfo.data.email,
        bio: userinfo.data.bio,
        twitter_handle: userinfo.data.twitter_username
      };
    return {user}

    //return userinfo.data;
  } catch (error) {
    console.error("Error in getUserInfo:", error);
    throw error;
  }
};

export const storeUserInfo = async (user: User, databaseUrl: string) => {
    const db = getDb(databaseUrl);

    try {
        const dataBaseEntry = await db.select().from(users).where(eq(users.githubHandle, user.gitHub_handle));
        if (dataBaseEntry.length > 0) {
            // user exist already do nothing?
         
          } else{
            await db.insert(users).values(
                {
                    name: user.name ?? "undefined",
                    githubHandle: user.gitHub_handle,
                    company: user.company,
                    githubAvatar: user.gitHub_avatar,
                    twitterHandle: user.twitter_handle,
                    location: user.location,
                    role: user.bio,

                }
            )
          }
    
         ;
        
      } catch (error) {
        console.error("Database error:", error);
      }
      return null;


   

    


};
