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

export const getUserInfo = async (githubId: number, githubToken: string) => {
  const octokit = getOctokit(githubToken);

  try {
    const userinfo = await octokit.request("GET /user/{githubId}", {
      githubId: githubId,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
 
    console.log(userinfo)
    const user: User = {
        gitHub_id: githubId,
        gitHub_handle: userinfo.data.login,
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
            await db.insert(users).values(
                {
                    githubUserId: user.gitHub_id,
                    name: user.name ?? "undefineds",
                    githubHandle: user.gitHub_handle,
                    emailAddress : user.email,
                    company: user.company,
                    githubAvatar: user.gitHub_avatar,
                    twitterHandle: user.twitter_handle,
                    location: user.location,
                    role: user.bio,

                }
            ).onConflictDoNothing(); 
        
      } catch (error) {
        console.error("Database error:", error);
      }
      return null;


   

    


};
