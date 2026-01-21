import api from "../api/axios";

const personService = {
	getAddresses: async (personId) => {
		const response = await api.get(`hr/person/addresses/?person=${personId}`);
		return response.data;
	},

	addAddress: async (data) => {
		const response = await api.post("/hr/person/addresses/", data);
		return response.data;
	},
};

export default personService;
