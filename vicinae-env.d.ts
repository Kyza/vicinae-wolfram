/// <reference types="@vicinae/api">

/*
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 */

type ExtensionPreferences = {
  /** Wolfram App ID - Your Full Results API App ID from https://developer.wolframalpha.com/. */
	"appid"?: string;

	/** Default View - Which view the command opens with. You can always switch with the toggle action. */
	"defaultView": "list" | "grid";

	/** Grid Columns - Number of columns in the image grid view. */
	"gridColumns": "2" | "3" | "4" | "5" | "6";
}

declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Command: Query Wolfram Alpha */
	export type WolframQuery = ExtensionPreferences & {
		
	}

	/** Command: Wolfram Alpha History */
	export type WolframHistory = ExtensionPreferences & {
		
	}
}

declare namespace Arguments {
  /** Command: Query Wolfram Alpha */
	export type WolframQuery = {
		
	}

	/** Command: Wolfram Alpha History */
	export type WolframHistory = {
		
	}
}