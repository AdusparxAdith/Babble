import Axios from "axios";

export default function setAuthToken() {
  const token = localStorage.getItem("token");
  if (token) {
    Axios.defaults.headers.common["Authorization"] = token;
  } else {
    delete Axios.defaults.headers.common["Authorization"];
  }
}
