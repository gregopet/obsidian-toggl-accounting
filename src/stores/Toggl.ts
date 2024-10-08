import {defineStore} from "pinia";
import {computed, ref} from "vue";
import voca from "voca";
import obsidian, {RequestUrlParam, RequestUrlResponsePromise} from "obsidian";
import type {Me, Project, Tag} from "../TogglAPI";

type LoginState = "NONE" | "IN_PROGRESS" | "INVALID_CREDENTIALS" | "OK" | "ERROR";
type Path = `${'/'}${string}`
const DEBUG_API= false; // Poor man's debugging - Obsidian isn't displaying anything in the "Network" tab of developer tools :(

/**
 * A store interacting with Toggl's API.
 *
 * @see https://developers.track.toggl.com/docs/
 */
export const useTogglStore = defineStore('toggl', () => {

	/** Value of the authorization header to be sent with requests */
	let authorization: string;

	/** Where are we in the login process? */
	const loginState = ref<LoginState>("NONE")

	/** The currently selected workspace id (currently only the default workspace is supported!) */
	const workspaceId = computed(() => me.value?.default_workspace_id)

	/** Any errors that may have occured while using the API */
	const error = ref<string | null>(null)

	/** My user profile */
	const me = ref<Me>()

	/** My projects */
	const projects = ref<Project[]>([])

	/** My tags */
	const tags = ref<Tag[]>([])

	/** The API key that was last used to log in (used for checking whether it had changed) */
	let currentApiKey: string | undefined;

	/** Resolves a tag by its ID */
	function tag(id: number): Tag {
		return tags.value.find((tag) => tag.id === id)!!;
	}

	/** Resolves a project by its ID */
	function project(id: number): Project {
		return projects.value.find((pr) => pr.id === id)!!;
	}

	/** Will make a request to Toggl. Will replace a {workspace_id} placeholder with the current workspace ID. */
	function togglRequest(path: Path, params: Omit<RequestUrlParam, "url"> = {}): RequestUrlResponsePromise {
		const headers = params.headers || {};
		headers.authorization = authorization;
		const actualPath = path.replace("{workspace_id}", workspaceId.value?.toString() ?? "");
		if (DEBUG_API) console.debug(`Firing a ${params.method ?? "GET"} request to`, actualPath)
		try {
			if (DEBUG_API) {
				console.log((params.method ?? "GET") + " https://api.track.toggl.com" + actualPath);
				console.log("Headers: ", headers)
				console.log("Params: ", params)
			}

			const response = obsidian.requestUrl({
				url: "https://api.track.toggl.com" + actualPath,
				...params,
				headers,
				throw: false
			});
			response.then(r => {
				if (r.status >= 300) {
					console.warn(`"Toggl request failed with status ${r.status}:`, r.text)
				}
				else if (DEBUG_API) {
					console.log(`"Toggl request completed with status ${r.status} and returned`, r.json)
				}
			})
			return response;
		} catch (error) {
			const description =  `Toggl API call failed with error ${error}!`
			error.value = description;
			throw new Error(description)
		}
	}

	/** Checks that the API returned a non-error response code. Otherwise, it sets the error text and bails. */
	function assertOk(req: obsidian.RequestUrlResponse): obsidian.RequestUrlResponse {
		if (req.status < 300) {
			error.value = null;
			return req;
		} else {
			const description =  `Toggl API returned status code ${req.status}!`
			error.value = description;
			throw new Error(description)
		}
	}

	/** Tries to log into Toggl, fetches projects and tags if login was successful */
	async function login(apiKey: string) {
		currentApiKey = apiKey;
		if (voca.isBlank(apiKey)) {
			loginState.value = "NONE"
		} else {
			loginState.value = "IN_PROGRESS"
			authorization = 'Basic ' + Buffer.from(`${apiKey}:api_token`).toString('base64');

			try {
				const req = await togglRequest("/api/v9/me")
				if (req.status === 403) {
					loginState.value = "INVALID_CREDENTIALS";
				}
				else if (req.status >= 300) {
					loginState.value = "ERROR";
				} else {
					me.value = req.json;
					loginState.value = "OK";
					await refresh();
				}
			} catch (er) {
				loginState.value = "ERROR";
				console.error("Error logging user into Toggl", er)
			}
		}
	}

	/** Returns true if the provided API key does not match the one currently stored */
	function didApiKeyChange(apiKey: string) {
		return apiKey != currentApiKey;
	}

	/** Refreshes the user's intrinsic data (workspaces, projects, tags). */
	async function refresh() {
		if (loginState.value === "OK") {
			await Promise.all([
				refreshProjects(),
				refreshTags(),
			]);
		}
	}

	async function refreshProjects() {
		const req = assertOk(await togglRequest("/api/v9/workspaces/{workspace_id}/projects"))
		projects.value = req.json
	}

	async function refreshTags() {
		const req = assertOk(await togglRequest("/api/v9/workspaces/{workspace_id}/tags"))
		tags.value = req.json
	}

	return {
		loginState, me, projects, project, tags, tag, login, refresh, togglRequest, assertOk, didApiKeyChange, workspaceId
	}
})
