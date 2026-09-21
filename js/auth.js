import axios from
  "https://cdn.jsdelivr.net/npm/axios@1.7.9/+esm";

import { USER_URL }
  from "./service/apiConfig.js";


const $ = (id) =>
  document.getElementById(id);

const error = $("error");


$("registerForm")?.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    try {

      const user = {
        name: $("name").value,
        email: $("email").value,
        password: $("password").value
      };

      const response =
        await axios.get(USER_URL, {
          params: {
            email: user.email
          }
        });

      if (response.data.length) {
        throw new Error(
          "Email already registered."
        );
      }

      await axios.post(
        USER_URL,
        user
      );

      location = "login.html";

    } catch (err) {

      error.textContent =
        err.message;
    }
  }
);


$("loginForm")?.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    try {

      const response =
        await axios.get(USER_URL, {
          params: {
            email: $("email").value,
            password: $("password").value
          }
        });

      if (!response.data.length) {
        throw new Error(
          "Invalid email or password."
        );
      }

      localStorage.user =
        JSON.stringify(response.data[0]);

      location = "landing.html";

    } catch (err) {

      error.textContent =
        err.message;
    }
  }
);
