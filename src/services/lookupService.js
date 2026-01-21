import api from "../api/axios";

const lookupService = {
	getLookupTypes: async () => {
		const response = await api.get("/core/lookups/types/");
		return response.data;
	},

	getLookupValues: async (code, parentId = null) => {
		let url = `/core/lookups/values/?lookup_type=${code}`;
		if (parentId) {
			url += `&parent=${parentId}`;
		}
		const response = await api.get(url);
		return response.data;
	},
};

export default lookupService;
