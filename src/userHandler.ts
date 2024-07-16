import { Octokit } from "@octokit/core";
import * as dotenv from 'dotenv';


const octokit = new Octokit({
	auth: process.env.GITHUB_TOKEN
});

export const getUserInfo = async (userName: string) => {
	try {
		const userinfo = await octokit.request('GET /users/{username}', {
			username: userName,
			headers: {
				'X-GitHub-Api-Version': '2022-11-28'
			}
		});
		console.log(typeof(userinfo))
        return userinfo.data; 
	} catch (error) {
		console.error("Error in getUserInfo:", error);
		throw error;
	}
};


const storeUserInfo = (userinfo: string) =>{

}

