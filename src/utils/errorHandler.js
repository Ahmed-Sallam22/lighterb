/**
 * Error handler utility for parsing and formatting API error responses
 *
 * API Error Format: { status: "error", message: "field: Error message", data: null }
 *
 * This utility extracts the field and error message, then returns a localized
 * version using the translation function provided.
 */

/**
 * Parse API error response and return localized error message
 *
 * @param {Object|string} error - The error from API or Redux rejected action
 * @param {Function} t - The translation function from useTranslation hook
 * @param {string} fallbackKey - Fallback translation key if error parsing fails
 * @returns {string} - Localized error message
 */
export const parseApiError = (error, t, fallbackKey = "errors.generic") => {
	// If error is a string, try to parse it
	if (typeof error === "string") {
		try {
			error = JSON.parse(error);
		} catch {
			// If parsing fails, return the string as is
			return error || t(fallbackKey);
		}
	}

	// Handle null/undefined
	if (!error) {
		return t(fallbackKey);
	}

	// Extract message from error object
	let message = error.message || error.detail || error.error;

	// If error has nested structure like { status: "error", message: "...", data: null }
	if (typeof message === "string") {
		// Check if message has field:error format (e.g., "code: Invalid code format...")
		const fieldMatch = message.match(/^(\w+):\s*(.+)$/);

		if (fieldMatch) {
			const [, field, errorMessage] = fieldMatch;
			const fieldKey = field.toLowerCase();

			// Try to find a localized error message
			// First check for specific field error
			const fieldErrorKey = `errors.fields.${fieldKey}`;
			const localizedField = t(fieldErrorKey, { defaultValue: "" });

			// Check for common error patterns and translate them
			const translatedMessage = translateErrorMessage(errorMessage, t);

			if (localizedField) {
				return `${localizedField}: ${translatedMessage}`;
			}

			// Return field with translated message
			return `${capitalizeFirst(field)}: ${translatedMessage}`;
		}

		// No field:error format, try to translate the whole message
		return translateErrorMessage(message, t);
	}

	// Handle object with multiple field errors
	if (typeof error === "object" && !Array.isArray(error)) {
		const errorMessages = [];

		for (const [field, fieldErrors] of Object.entries(error)) {
			// Skip non-error fields
			if (field === "status" || field === "data") continue;

			const fieldKey = `errors.fields.${field.toLowerCase()}`;
			const localizedField = t(fieldKey, { defaultValue: capitalizeFirst(field) });

			if (Array.isArray(fieldErrors)) {
				const translatedErrors = fieldErrors.map(e => translateErrorMessage(e, t));
				errorMessages.push(`${localizedField}: ${translatedErrors.join(", ")}`);
			} else if (typeof fieldErrors === "string") {
				errorMessages.push(`${localizedField}: ${translateErrorMessage(fieldErrors, t)}`);
			}
		}

		if (errorMessages.length > 0) {
			return errorMessages.join("\n");
		}
	}

	// Fallback
	return t(fallbackKey);
};

/**
 * Translate common error messages to localized versions
 *
 * @param {string} message - The error message to translate
 * @param {Function} t - The translation function
 * @returns {string} - Translated message or original if no translation found
 */
const translateErrorMessage = (message, t) => {
	if (!message) return t("errors.generic");

	const lowerMessage = message.toLowerCase();

	// Common error patterns
	const errorPatterns = [
		{
			patterns: ["required", "this field is required", "this field may not be blank", "is required"],
			key: "errors.required",
		},
		{
			patterns: ["already exists", "must be unique", "duplicate", "unique constraint"],
			key: "errors.alreadyExists",
		},
		{
			patterns: ["invalid code format", "use uppercase letters", "alphanumeric"],
			key: "errors.invalidCodeFormat",
		},
		{
			patterns: ["invalid format", "invalid value"],
			key: "errors.invalidFormat",
		},
		{
			patterns: ["not found", "does not exist"],
			key: "errors.notFound",
		},
		{
			patterns: ["permission denied", "not authorized", "forbidden"],
			key: "errors.permissionDenied",
		},
		{
			patterns: ["invalid date", "date format"],
			key: "errors.invalidDate",
		},
		{
			patterns: ["must be a positive", "greater than zero", "must be greater"],
			key: "errors.mustBePositive",
		},
		{
			patterns: ["max length", "too long", "maximum length"],
			key: "errors.tooLong",
		},
		{
			patterns: ["min length", "too short", "minimum length"],
			key: "errors.tooShort",
		},
		{
			patterns: ["invalid email", "valid email"],
			key: "errors.invalidEmail",
		},
		{
			patterns: ["cannot be deleted", "has related", "in use"],
			key: "errors.cannotDelete",
		},
		{
			patterns: ["start date must be before", "end date must be after"],
			key: "errors.invalidDateRange",
		},
	];

	for (const { patterns, key } of errorPatterns) {
		if (patterns.some(pattern => lowerMessage.includes(pattern))) {
			const translated = t(key, { defaultValue: "" });
			if (translated) return translated;
		}
	}

	// Return original message if no pattern matched
	return message;
};

/**
 * Capitalize the first letter of a string
 *
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
const capitalizeFirst = str => {
	if (!str) return "";
	return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Format error for display (handles both API errors and network errors)
 *
 * @param {Object|string} error - The error object
 * @param {Function} t - Translation function
 * @param {string} fallbackKey - Fallback translation key
 * @returns {string} - Formatted error message
 */
export const formatApiError = (error, t, fallbackKey = "errors.generic") => {
	// Network errors
	if (error?.code === "ERR_NETWORK" || error?.message === "Network Error") {
		return t("errors.network");
	}

	// Server errors (5xx)
	if (error?.response?.status >= 500) {
		return t("errors.server");
	}

	// Parse the error response
	return parseApiError(error?.response?.data || error, t, fallbackKey);
};

export default {
	parseApiError,
	formatApiError,
};
