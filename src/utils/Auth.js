export default class Auth {
  /**
   * Authenticate a user. Save a token string in Local Storage
   *
   * @param {string} token
   */
  static authenticateUser(token, user) {
    localStorage.setItem("token", token.id_token);
    localStorage.setItem("username", user.name);
    localStorage.setItem("useremail", user.email);
    localStorage.setItem("userimg", user.imageUrl);
  }

  /**
   * Check if a user is authenticated - check if a token is saved in Local Storage
   *
   * @returns {boolean}
   */
  static isUserAuthenticated() {
    return localStorage.getItem("token") !== null;
  }

  /**
   * Deauthenticate a user. Remove a token from Local Storage.
   *
   */
  static deauthenticateUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("useremail");
    localStorage.removeItem("userimg");
  }

  /**
   * Get a token value.
   *
   * @returns {string}
   */

  static getToken() {
    return localStorage.getItem("token");
  }

  /**
   * Get a user object.
   *
   * @returns {Object}
   */

  static getUserName() {
    return localStorage.getItem("username");
  }

  static getUserEmail() {
    return localStorage.getItem("useremail");
  }

  static getUserImg() {
    return localStorage.getItem("userimg");
  }
}
