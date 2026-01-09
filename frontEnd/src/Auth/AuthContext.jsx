import { createContext, useContext, useState, useEffect } from "react";
const AuthContext = createContext(null); // Auth context to be provided to each user - Authentication of user
export const AuthProvider = ({ children }) => {
  //this function provided authentication login for each user(passed as children)
  const [user, setUser] = useState(null); //initially set the user as null
  const [loading, setLoading] = useState(true); //set loading true initially
  const checkAuth = async () => {
    //this will Asynchronously check the authentication for each user
    try {
      console.log("Checking authentication!");
      const response = await fetch(
        "http://localhost:5000/me" /*fetch the user from /me*/,
        {
          credentials: "include", //tells browser to send user credentials like cookies
        }
      );
      if (response.ok) {
        //if the user was fetched succesfully
        const data = await response.json(); //load the object containing user data in the data variable
        console.log("User authenticated", data.user);
        setUser(data.user); // set the loaded user as the current user
      } else {
        console.log("Not authenticated!");
        setUser(null); //hence current user is null - no user
      }
    } catch (error) {
      //runs this block if there is some error in fetching the user
      console.error("Authentication check failed", error);
      setUser(null);
    } finally {
      //loading is set to false at last - under all conditions
      console.log("Setting loading to false"); // Add this log
      setLoading(false);
    }
  };
  useEffect(() => {
    checkAuth();
  }, []); //check auth on each re - render

  const login = async (name, password) => {
    //login function to login the user into front end after user authentication
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST", //Send post request - send data to server
        headers: { "Content-Type": "application/json" }, // tells the server that body of the request contains data in JSON
        credentials: "include", //Tells browser to send credentials like cookies
        body: JSON.stringify({ name, password }), //convert name and password into string from JSON format
      });
      if (response.ok) {
        checkAuth(); // Authenticate the user
        const meResponse = await fetch("http://localhost:5000/me", {
          credentials: "include",
        }); // get the updated user from fresh call
        if (meResponse.ok) {
          const data = await meResponse.json(); //store the data sent from the user in data variable
          return { success: true, user: data.user }; // return login flag and user data as a object
        } else {
          const data = await meResponse.json();
          return { success: false, message: "Failed to fetch user" }; //return login flag as false and the failed message as an object - this message will be displayed on the front end as the error message
        }
      }
    } catch (error) {
      console.error("Login error", error); //show the error message on the console
      return { success: false, message: "Network error. Please try again." };
    }
  };
  const logout = async () => {
    // Asynchronous logout function for users
    try {
      await fetch(
        "http://localhost:5000/logout" /* fetch logout api from the server */,
        {
          method: "POST", //send logout command to the server
          credentials: "include", //include the users credentials (cookies) to logout
        }
      );
      setUser(null); //set current user = null;
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
    }
    console.log("AuthContext state - user:", user, "loading:", loading); // Add this log
  };
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}{" "}
      {/*provides the current user + loading status + login function + logout function + checkAuth function - to each children(user component)*/}
    </AuthContext.Provider>
  );
};
export const useAuth=()=>{
  const context = useContext(AuthContext);
  if(!context){
    throw new Error("Use auth must be used with in authprovider");
  }
  return context;
}