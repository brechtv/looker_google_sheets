// global vars that are taken from userProperties
var BASE_URL;
var CLIENT_ID;
var CLIENT_SECRET;


// add a custom menu to enter API credentials, so they don't need to be saved on the script
function onOpen() {
    // Add API credentials menu to sheet
    SpreadsheetApp.getUi()
        .createMenu("Looker API Credentials")
        .addItem("Set Credentials", "setCred")
        .addItem("Test Credentials", "testCred")
        .addItem("Remove Credentials", "deleteCred")
        .addToUi();
}

// all custom functions


/**
 * Returns the results or the sql of a Look
 *
 * @param {number} id The unique ID of the Look
 * @param {number} opt_format 1 for csv, 2 for raw sql - defaults to csv (optional)
  * @param {number} opt_limit the query limit - defaults to 5000 if empty (optional)
 * @return The Look results data
 * @customfunction
 */
function LOOKER_RUN_LOOK(id, opt_format, opt_limit) {
    try {
        var options = {
            "method": "get",
            "headers": {
                "Authorization": "token " + login()
            }
        };

        // set formatting to either csv or the raw sql query since sheets is limited
        var formatting;
        // convert param
        switch (opt_format) {
            case 1:
                formatting = "csv";
                break;
            case 2:
                formatting = "sql";
                break;
            default:
                formatting = "csv";
        }

        // set a custom limit
        var limit;
        if(opt_limit) {
          limit = opt_limit;
          // else use the 5k default
        } else if (opt_limit == -1) {
            limit = -1;
        } else {
          limit = 5000;
        }

        // get request for the look
        var response = UrlFetchApp.fetch(BASE_URL + "/looks/" + id + "/run/" + formatting + "?limit=" + limit, options);

        // if it's csv, fill it in the cells, if it's the query, use one cell only, if not specified, throw error
        if (opt_format == 1) {
            return Utilities.parseCsv(response.getContentText());
        } else if (opt_format == 2)
          {
            return response.getContentText();
          }
        else {
            return Utilities.parseCsv(response.getContentText());
        }
    } catch (err) {
        return "Uh oh! Something went wrong. Check your API credentials and if you're passing the correct parameters and that your Look exists!";
    }
}
/**
 * Get explores for a certain model
 *
 * @param {string} id The Model Name
 * @return All explores in the given Model
 * @customfunction
 */
function LOOKER_GET_EXPLORES(model_name) {
    try {
        var options = {
            "method": "get",
            "headers": {
                "Authorization": "token " + login()
            }
        };
        // just a list of explore names on the model here
        var response = UrlFetchApp.fetch(BASE_URL + "/lookml_models/" + model_name, options);
        var explores = JSON.parse(response.getContentText()).explores;

        // for all results we create an array and then push results to it
        var result = [];
        for (var i = 0; i < explores.length; i++) {
            result.push(explores[i].name);
        }
        return result
    } catch (err) {
        return "Uh oh! Something went wrong. Check your API credentials and if you're passing the correct parameters and that your model exists!"
    }
}
/**
 * Get all Looks by space
 *
 * @param {number} id The space ID
 * @return All looks in the given space
 * @customfunction
 */
function LOOKER_GET_LOOKS_BY_SPACE(space_id) {
    try {
        var options = {
            "method": "get",
            "headers": {
                "Authorization": "token " + login()
            }
        };
        var response = UrlFetchApp.fetch(BASE_URL + "/looks/search?space_id=" + space_id.toString(),
            options);
        var looks = JSON.parse(response.getContentText());
        var result = [];

        // push a header row first
        result.push(["Look ID", "Look Title", "Owner User ID", "Model Name", "Query ID"]);

        // loop through looks and push them to the array
        for (var i = 0; len = looks.length, i < len; i++) {
            result.push([looks[i].id, looks[i].title, looks[i].user_id, looks[i].model.id,
                looks[i].query_id
            ]);
        }
        return result
    } catch (err) {
        Logger.log(err);
        return "Uh oh! Something went wrong. Check your API credentials and if you're passing the correct parameters and that your space exists!"
    }
}
/**
 * Get all Looks by user
 *
 * @param {number} id The user ID
 * @return All looks created by the user
 * @customfunction
 */
function LOOKER_GET_LOOKS_BY_DASHBOARD(dashboard_id) {
    try {
        var options = {
            "method": "get",
            "headers": {
                "Authorization": "token " + login()
            }
        };
        var response = UrlFetchApp.fetch(BASE_URL + "/dashboards/" + dashboard_id.toString(), options);
        var elements = JSON.parse(response.getContentText()).dashboard_elements;
        var result = [];

        // push header row first
        result.push(["Look ID", "Look Title"]);

        // loop through looks and push to array
        for (var i = 0; len = elements.length, i < len; i++) {
            if (elements[i].look_id != null) {
                result.push([elements[i].look_id, elements[i].title]);
            }
        }
        return result
    } catch (err) {
        Logger.log(err);
        return "Uh oh! Something went wrong. Check your API credentials and if you're passing the correct parameters and that your dashboard exists!"
    }
}
/**
 * Get all Looks by user
 *
 * @param {number} id The user ID
 * @return All looks created by the user
 * @customfunction
 */
function LOOKER_GET_LOOKS_BY_USER(user_id) {
    try {
        var options = {
            "method": "get",
            "headers": {
                "Authorization": "token " + login()
            }
        };
        var response = UrlFetchApp.fetch(BASE_URL + "/looks/search?user_id=" + user_id.toString(),
            options);
        var looks = JSON.parse(response.getContentText());
        var result = [];
        result.push(["Look ID", "Look Title", "Owner User ID", "Model Name", "Query ID"]);
        for (var i = 0; len = looks.length, i < len; i++) {
            result.push([looks[i].id, looks[i].title, looks[i].user_id, looks[i].model.id,
                looks[i].query_id
            ]);
        }
        return result
    } catch (err) {
        Logger.log(err);
        return "Uh oh! Something went wrong. Check your API credentials and if you're passing the correct parameters and that the user exists!"
    }
}
/**
 * Get all fields that are used within explores with the given model
 *
 * @param {string} id The model name
 * @return All dimensions and measures in the given model
 * @customfunction
 */
function LOOKER_GET_DATA_DICTIONARY(model_name) {
    try {
        var options = {
            "method": "get",
            "headers": {
                "Authorization": "token " + login()
            }
        };
        var response = UrlFetchApp.fetch(BASE_URL + "/lookml_models/" + model_name, options);
        var explores = JSON.parse(response.getContentText()).explores;
        var result = [];

        // push header row first
        result.push(["Connection", "Explore Name", "View Name", "Field Type", "Name", "Label", "Type",
            "Description", "Hidden", "SQL", "Source"
        ]);

        // for explore in explores
        for (var i = 0; len = explores.length, i < len; i++) {
            var explore = explores[i].name;
            // get the explore
            var explore_results = UrlFetchApp.fetch(BASE_URL + "/lookml_models/" + model_name + "/explores/" +
                explore, options);

            // get connection, dimensions, measures on the explore
            var connection = JSON.parse(explore_results.getContentText()).connection_name;
            var dimensions = JSON.parse(explore_results.getContentText()).fields.dimensions;
            var measures = JSON.parse(explore_results.getContentText()).fields.measures;

            // for dimension in explore, add dimension to results
            for (var j = 0; j < dimensions.length; j++) {
                result.push([connection, explore, dimensions[j].view, "Dimension",
                    dimensions[j].name, dimensions[j].label, dimensions[j].type,
                    dimensions[j].description, "hidden: " + dimensions[j].hidden, (dimensions[j].sql != null ?
                        dimensions[j].sql : ""), dimensions[j].source_file
                ]);
            }

            // for measure in explore, add measure to results
            for (var k = 0; k < measures.length; k++) {
                result.push([connection, explore, measures[k].view, "Measure", measures[k].name,
                    measures[k].label, measures[k].type, measures[k].description, "hidden: " + measures[k].hidden,
                    (measures[k].sql != null ? measures[k].sql : ""),
                    measures[k].source_file
                ]);
            }
        }
        return result
    } catch (err) {
        return "Uh oh! Something went wrong. Check your API credentials and if you're passing the correct parameters and that your model exists!"
    }
}

/**
 * Get all Looker users
 *
 * @return All Looker users
 * @customfunction
 */
function LOOKER_GET_USERS() {
    try {
        var options = {
            "method": "get",
            "headers": {
                "Authorization": "token " + login()
            }
        };
        var response = UrlFetchApp.fetch(BASE_URL + "/users", options);
        var users = JSON.parse(response.getContentText());
        var results = [];

        results.push(["ID", "First name", "Last name", "Email", "Status"]);

        for (var i = 0; i < users.length; i++) {
            results.push([users[i].id, users[i].first_name, users[i].last_name, users[i].email, (users[i].is_disabled == "TRUE" ? "disabled" : "enabled")]);
        }
        return results

    } catch (err) {
        Logger.log(err);
        return err
    }
}




// all API credential stuff
// We're using scriptProperties to store api creds script wide.
// Change this to userProperties to make it userSpecific.

// set credentials via prompt
function setCred() {
    var ui = SpreadsheetApp.getUi();
    var base_url_input = ui.prompt("Set your Looker API credentials", "Base URL (e.g. https://yourdomain.looker.com:19999/api/3.0):", ui.ButtonSet.OK_CANCEL);
    var client_id_input = ui.prompt("Set your Looker API credentials", "Client ID:", ui.ButtonSet.OK_CANCEL);
    var client_id_secret = ui.prompt("Set your Looker API credentials", "Client Secret:", ui.ButtonSet
        .OK_CANCEL);
    var scriptProperties = PropertiesService.getScriptProperties();
    // assign them to scriptProperties so the user doesn't have to enter them over and over again
    scriptProperties.setProperty("BASE_URL", base_url_input.getResponseText());
    scriptProperties.setProperty("CLIENT_ID", client_id_input.getResponseText());
    scriptProperties.setProperty("CLIENT_SECRET", client_id_secret.getResponseText());
    // test the credentials with a /user call
    testCred();
}

// testing the existing creds
function testCred() {
    var ui = SpreadsheetApp.getUi();
        var options = {
            "method": "get",
            "headers": {
                "Authorization": "token " + login()
            }
        };
    try {
        var response = UrlFetchApp.fetch(BASE_URL + "/user", options);
        var success_header = "Successfully set API credentials!";
        var success_content = "Authenticated as " + JSON.parse(response.getContentText()).first_name +
            " " + JSON.parse(response.getContentText()).last_name + " (user " + JSON.parse(response.getContentText()).id +").Keep in mind that API credentials are script/spreadsheet bound. This is needed for the custom formulas to keep on working for other users. Hit 'Test' to test your credentials or 'Delete' to remove the currently set credentials.";
        var result = ui.alert(success_header, success_content, ui.ButtonSet.OK);
    } catch (err) {
        var result = ui.alert("Invalid credentials / Credentials not set!",
            "Doublecheck your base URL and your client ID & secret.", ui.ButtonSet.OK);
    }
}

// delete credentials from scriptProperties
function deleteCred() {
    var scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.deleteAllProperties();
}

// login now checks for scriptProperties to ge t
function login() {
    var scriptProperties = PropertiesService.getScriptProperties();

    // load credentials from scriptProperties
    BASE_URL = scriptProperties.getProperty("BASE_URL");
    CLIENT_ID = scriptProperties.getProperty("CLIENT_ID");
    CLIENT_SECRET = scriptProperties.getProperty("CLIENT_SECRET");

    try {
        var post = {
            "method": "post"
        };
        var response = UrlFetchApp.fetch(BASE_URL + "/login?client_id=" + CLIENT_ID + "&client_secret=" +
            CLIENT_SECRET, post);
        return JSON.parse(response.getContentText()).access_token;
    } catch (err) {
        Logger.log(err);
        return false;
    }
}
