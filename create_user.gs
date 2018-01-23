// this file is separate from the other script(s) and does not use script-
// properties, just the API creds below. The script can be easily expanded
// to include e.g. a mail merge to send the generated URL to the new user

var BASE_URL = 'XXX';
var CLIENT_ID = 'XXX';
var CLIENT_SECRET = 'XXX';


/**
 * Creates a new user in Looker
 *
 * @param {string} email The user email address
 * @param {string} roles Comma-separated roles (e.g. "1,2,3")
 * @return The user setup link
 * @customfunction
 */
function CREATE_LOOKER_USER(email, roles) {
  if(email.match(/^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/g) == null) {
     return "Not a valid email address.";
  } else {
    var existing_user = checkExistingUser(email);
    if (existing_user.length == 0) {
        Logger.log("User does not yet exist. Creating new user...");
        var user_id = createNewUser();
        addEmail(email, user_id);
        if(roles != null || roles != "") {addRoles(user_id, roles)};
        var reset_token = getPasswordResetToken(user_id);
        var setup_url = BASE_URL.split(/(:19999)/)[0] + '/account/setup/' + reset_token;
        return setup_url;
    }
    else {
        Logger.log("No new user created, user " + email +
            " already exists.");
        return "User " + email + " already exists!";
    }
    }
}

function checkExistingUser(email_address) {
    var options = {
        'method': 'get',
        'headers': {
            'Authorization': 'token ' + login()
        }
    };
    var existing_user = UrlFetchApp.fetch(BASE_URL + "/users/search?email=" +
        encodeURIComponent(email_address), options);
    existing_user = JSON.parse(existing_user.getContentText());
    return existing_user;
}

function createNewUser() {
    var options = {
        'method': 'post',
        'headers': {
            'Authorization': 'token ' + login()
        },
        'payload': JSON.stringify({})
    };
    var new_user = UrlFetchApp.fetch(BASE_URL + "/users", options);
    var user_id = parseInt(JSON.parse(new_user.getContentText()).id);
    return user_id;
}

function addEmail(email, user_id) {
    var options = {
        'method': 'post',
        'headers': {
            'Authorization': 'token ' + login()
        },
        'payload': JSON.stringify({
            'email': email
        })
    };
    var response = UrlFetchApp.fetch(BASE_URL + "/users/" + user_id +
        "/credentials_email", options);
}

function addRoles(user_id, roles) {

  var roles_array = roles.toString().split(",").map(function(role) {return role.trim()});
  Logger.log(roles_array);

  var options = {
        'method': 'put',
        'headers': {
            'Authorization': 'token ' + login()
        }
    };

  options.payload = JSON.stringify(roles_array)

    var response = UrlFetchApp.fetch(BASE_URL + "/users/" + user_id +
        "/roles", options);


}

function getPasswordResetToken(user_id) {
    var options = {
        'method': 'post',
        'headers': {
            'Authorization': 'token ' + login()
        }
    };
    var response = UrlFetchApp.fetch(BASE_URL + "/users/" + user_id +
        "/credentials_email/password_reset", options);
    var reset_url = JSON.parse(response.getContentText()).password_reset_url;
    var reset_token = reset_url.split('/').pop(); // get the reset token only
    return reset_token;
}

function login() {
    var post = {
        'method': 'post'
    };
    var response = UrlFetchApp.fetch(BASE_URL + "/login?client_id=" +
        CLIENT_ID + "&client_secret=" + CLIENT_SECRET, post);
    return JSON.parse(response.getContentText()).access_token;
}
