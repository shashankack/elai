import qs from "qs";
import { createRecursiveProxy } from "./create-proxy";
import { ActionType, ClientOptions } from "./types";
export type { InferClient } from "./types";
import { kebabCase } from "./utils";

type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

export type InferClientInput<T> = T extends (input: infer I) => any
    ? DistributiveOmit<I, 'fetchOptions'>
    : T extends (input?: infer I) => any
    ? DistributiveOmit<NonNullable<I>, 'fetchOptions'>
    : never;

export type InferClientOutput<T> = T extends (...args: any[]) => Promise<infer O>
    ? O
    : never;

export class ClientError extends Error {
    status: number | undefined;
    statusText: string | undefined;

    constructor(message: string, statusText?: string, status?: number) {
        super(message);
        this.statusText = statusText;
        this.status = status;
    }
}

export function createClient(options: ClientOptions) {
    const { baseUrl, fetchOptions: defaultFetchOptions } = options;

    return createRecursiveProxy((path, args) => {
        const action = path.pop() as ActionType;
        const input: Record<string, any> = args[0] ?? {};

        const method =
            action === "query" ? "GET" : action === "mutate" ? "POST" : action === "delete" ? "DELETE" : null;

        if (!method) {
            throw new Error(`Action '${action}' is not a valid action.`);
        }

        const { fetchOptions: inputFetchOptions, ...rest } = input;

        const urlParts = path.map((segment) => {
            if (segment.startsWith("$")) {
                const value = rest[segment];
                delete rest[segment];
                return String(value);
            }
            return kebabCase(segment);
        });

        const urlPath = "/" + urlParts.join("/");

        const base = new URL(baseUrl);
        const fullPath = `${base.pathname.replace(/\/$/, "")}/${urlPath.replace(/^\//, "")}`;
        const url = new URL(fullPath, base.origin);

        const isFormData = inputFetchOptions?.body instanceof FormData;

        let body: string | FormData | undefined;

        if (isFormData) {
            body = inputFetchOptions!.body as FormData;
        } else if (method === "GET" && Object.keys(rest).length > 0) {
            url.search = qs.stringify(rest, { skipNulls: true });
        } else if (method !== "GET" && Object.keys(rest).length > 0) {
            body = JSON.stringify(rest);
        }

        const defaultHeaders: Record<string, string> = {
            Accept: "application/json",
        };

        if (!isFormData) {
            defaultHeaders["Content-Type"] = "application/json";
        }

        const headers = new Headers({
            ...defaultHeaders,
            ...defaultFetchOptions?.headers,
            ...inputFetchOptions?.headers,
        });

        return fetch(url, {
            ...defaultFetchOptions,
            ...inputFetchOptions,
            method,
            body,
            headers,
        }).then(async (response) => {
            if (response.status >= 300) {
                const errorBody = await response.text().catch(() => "");
                let message = response.statusText;
                try {
                    const parsed = JSON.parse(errorBody) as { message?: string };
                    if (parsed.message) message = parsed.message;
                } catch {
                    if (errorBody) message = errorBody;
                }
                throw new ClientError(message, response.statusText, response.status);
            }

            // Medusa auth endpoints (e.g. reset-password) return 201 with plain
            // text "Created"   never assume every success body is JSON.
            if (response.status === 204) {
                return null;
            }

            const text = await response.text();
            if (!text) {
                return null;
            }

            const contentType = response.headers.get("content-type") ?? "";
            if (contentType.includes("application/json")) {
                try {
                    return JSON.parse(text);
                } catch {
                    return text;
                }
            }

            try {
                return JSON.parse(text);
            } catch {
                return text;
            }
        });
    })
}
