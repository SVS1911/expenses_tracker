export function validateExpense(data) {

  if (
    !data.title ||
    !data.amount ||
    !data.category ||
    !data.date
  ) {
    throw new Error(
      "Please fill all required fields."
    );
  }
}
