import axios from
  "https://cdn.jsdelivr.net/npm/axios@1.7.9/+esm";

import { API_URL } from "./apiConfig.js";

import {
  handleApiError
} from "../../exception/apiException.js";


const request = async (action) => {

  try {
    return (await action()).data;

  } catch (error) {
    handleApiError(error);
  }
};


export const getExpenses = (userId) =>
  request(() =>
    axios.get(API_URL, {
      params: { user: userId }
    })
  );


export const addExpense = (data) =>
  request(() => axios.post(
    API_URL,
    data
  ));


export const updateExpense = (
  id,
  data
) =>
  request(() =>
    axios.put(
      `${API_URL}/${id}`,
      data
    )
  );


export const deleteExpense = (id) =>
  request(() =>
    axios.delete(
      `${API_URL}/${id}`
    )
  );
