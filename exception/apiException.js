export function handleApiError(error) {

  const message =
    error.response?.data?.message ||
    error.message ||
    "Server error";

  throw new Error(message);
}
