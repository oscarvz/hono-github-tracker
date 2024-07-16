import { Octokit } from "@octokit/core";

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
    console.log(typeof userinfo);
    return userinfo.data;
  } catch (error) {
    console.error("Error in getUserInfo:", error);
    throw error;
  }
};

const storeUserInfo = (userinfo: string) => {};
