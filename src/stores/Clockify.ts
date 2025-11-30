import {defineStore} from "pinia";
import {ref} from "vue";
import voca from "voca";
import createClient from "openapi-fetch";
import {components, paths} from "../Clockify"
import {DateTime} from "luxon";

type LoginState = "NONE" | "IN_PROGRESS" | "INVALID_CREDENTIALS" | "OK" | "ERROR";

// Common types
export type TimeEntryWithRatesDtoV1 = components["schemas"]["TimeEntryWithRatesDtoV1"]


export const useClockifyStore = defineStore('clockify', () => {

	/** The API key that was last used to log in (used for checking whether it had changed) */
	let currentApiKey: string | undefined;

	/** A client to make requests to Clockify with (generated automatically via https://openapi-ts.dev/) */
	const client = createClient<paths>({ baseUrl: "https://api.clockify.me/api", headers: {
			"X-Api-Key": currentApiKey
	}})

	/** Authentication for requests */
	function authHeaders() {
		return { "X-Api-Key": currentApiKey }
	}

	/** Where are we in the login process? */
	const loginState = ref<LoginState>("NONE")

	/** Id of the user who is logged in */
	const user = ref<components["schemas"]["UserDtoV1"] | undefined>(undefined)

	/** The default workspace's projects */
	const projects = ref<components["schemas"]["ProjectDtoV1"][]>([]);

	/** (not used / not working) Is there a network request to Clockify API currently in flight? */
	const requestInFlight = ref(false);

	/** Resolves a project by its ID */
	function project(id: string): components["schemas"]["ProjectDtoV1"] {
		return projects.value.find((pr) => pr.id === id)!!;
	}

	/** The default workspace's tags */
	const tags = ref<components["schemas"]["TagDtoV1"][]>([]);

	/** Resolves a tag by its ID */
	function tag(id: string): components["schemas"]["TagDtoV1"] {
		return tags.value.find((tag) => tag.id === id)!!;
	}

	/** Fetches the user profile from the API, mainly to test if the login works */
	async function login(apiKey: string) {
		currentApiKey = apiKey;
		if (voca.isBlank(apiKey)) {
			loginState.value = "NONE"
		} else {
			loginState.value = "IN_PROGRESS"
			const { data, error } = await client.GET("/v1/user", {
				headers: { ...authHeaders() }
			});
			if (error) {
				loginState.value = "ERROR"
			}
			else if (data) {
				loginState.value = "OK";
				user.value = data
				refresh()
			}
		}
	}

	/** Returns true if the provided API key does not match the one currently stored */
	function didApiKeyChange(newKey: String): boolean {
		return currentApiKey != newKey
	}

	/** Refreshes the user's intrinsic data (workspaces, projects, tags). */
	async function refresh() {
		if (loginState.value === "OK") {
			await Promise.all([
				refreshProjects(),
				refreshTags()
			]);
		}
	}

	/** Gets the current projects of the user's default workspace */
	async function refreshProjects() {
		const { data } = await client.GET("/v1/workspaces/{workspaceId}/projects", {
			headers: { ...authHeaders() },
			params: {
				path: { workspaceId: user.value?.defaultWorkspace! },
				query: { archived: false, hydrated: true }
			},
		})
		if (data) {
			// favorite projects first/only
			//projects.value = data.sort((a, b) => ((a as any).favorite ? -1 : 0) + ((b as any).favorite ? 1 : 0));
			projects.value = data.filter(p => (p as any).favorite)
		} else {
			projects.value = []
		}
	}

	async function refreshTags() {
		const { data } = await client.GET("/v1/workspaces/{workspaceId}/tags", {
			headers: { ...authHeaders() },
			params: {
				path: { workspaceId: user.value?.defaultWorkspace! },
				query: { archived: false }
			}
		})
		if (data) {
			tags.value = data
		} else {
			tags.value = []
		}
	}

	return {
		 login, didApiKeyChange, loginState, client, user, authHeaders, projects, tags, tag, project, requestInFlight
	}

})
