// Replace this with your base domain e.g. https://mycompany.looker.com:19999/api/3.0
var BASE_URL = 'https://master.dev.looker.com:19999/api/3.0';
// Replace this with your API credentials
var CLIENT_ID = 'N7ktBQVXrtMTmnfhZFc5';
var CLIENT_SECRET = 'CsP8V8CZ6w3Wdq66vmTswBDR';

/**
 * Returns the results or the sql of a Look
 *
 * @param {123} id The unique ID of the Look
 * @param {1} format 1 for csv, 2 for raw sql
 * @return The Look results data
 * @customfunction
 */
function LOOKER_RUN_LOOK(id, format) {
    try {
        // set headers
        var options = {
            'method': 'get',
            'headers': {
                'Authorization': 'token ' + login()
            }
        };
        // set formatting to either csv or the raw sql query since sheets is limited
        var formatting;
        // convert param
        switch (format) {
            case 1:
                formatting = "csv";
                break;
            case 2:
                formatting = "sql";
                break;
            default:
                formatting = "csv";
                break;
        }
        // get request for the look
        var response = UrlFetchApp.fetch(BASE_URL + "/looks/" + id + "/run/" + formatting, options);
        // if it's csv, fill it in the cells, if it's the query, use one cell only, if not specified, throw error
        if (format == 1) {
            return Utilities.parseCsv(response.getContentText());
        } else if (format == 2)
            return response.getContentText();
        else {
            return "Please specify format: 1 (results) or 2 (sql query)"
        }
    } catch (err) {
        return "Oops! Something went wrong. Check if you're passing the correct parameters and that your Look exists!"
    }
}

/**
 * Get explores for a certain model
 *
 * @param {model_name} id The Model Name
 * @return All explores in the given Model
 * @customfunction
 */
function LOOKER_GET_EXPLORES(model_name) {
  try {
    var options = {
        'method': 'get',
        'headers': {
            'Authorization': 'token ' + login()
        }
    };

    var response = UrlFetchApp.fetch(BASE_URL + "/lookml_models/" + model_name, options);
    var explores = JSON.parse(response.getContentText()).explores;
    var result = [];

    Logger.log(response.getContentText());

    for (var i = 0; i < explores.length; i++) {
        result.push(explores[i].name);
    }
    return result
  } catch(err) {
    return "Something went wrong. " + err
  }
}

/**
 * Get all Looks by space
 *
 * @param {"space_id"} id The space ID
 * @return All looks in the given space
 * @customfunction
 */
function LOOKER_GET_LOOKS_BY_SPACE(space_id) {

  try {
   var options = {
     'method': 'get',
     'headers': {'Authorization':  'token '+ login()},
   };

    var response = UrlFetchApp.fetch(BASE_URL + "/looks/search?space_id=" + space_id.toString(), options);
    var looks = JSON.parse(response.getContentText());
    var result = [];

    result.push(["Look ID", "Look Title", "Owner User ID", "Model Name", "Query ID"]);

    for (var i = 0; len = looks.length, i < len; i++) {
      result.push([looks[i].id, looks[i].title, looks[i].user_id, looks[i].model.id, looks[i].query_id]);
    }

    return result
  } catch(err) {
    Logger.log(err);
    return "Something went wrong. " + err
  }
}

/**
 * Get all Looks by user
 *
 * @param {"user_id"} id The user ID
 * @return All looks created by the user
 * @customfunction
 */
function LOOKER_GET_LOOKS_BY_USER(user_id) {

  try {
   var options = {
     'method': 'get',
     'headers': {'Authorization':  'token '+ login()},
   };

    var response = UrlFetchApp.fetch(BASE_URL + "/looks/search?user_id=" + user_id.toString(), options);
    var looks = JSON.parse(response.getContentText());
    var result = [];

    result.push(["Look ID", "Look Title", "Owner User ID", "Model Name", "Query ID"]);

    for (var i = 0; len = looks.length, i < len; i++) {
      result.push([looks[i].id, looks[i].title, looks[i].user_id, looks[i].model.id, looks[i].query_id]);
    }

    return result
  } catch(err) {
    Logger.log(err);
    return "Something went wrong. " + err
  }
}

/**
 * Get all fields that are used within explores with the given model
 *
 * @param {"model_name"} id The model name
 * @return All dimensions and measures in the given model
 * @customfunction
 */
function LOOKER_GET_DATA_DICTIONARY(model_name) {
  try {

  var options = {
        'method': 'get',
        'headers': {
            'Authorization': 'token ' + login()
        }
    };

    var response = UrlFetchApp.fetch(BASE_URL + "/lookml_models/" + model_name, options);
    var explores = JSON.parse(response.getContentText()).explores;
    var result = [];

    result.push(["Connection", "Explore Name", "View Name", "Field Type", "Name", "Label", "Type", "Description", "Hidden", "SQL", "Source"]);

    for (var i = 0; len = explores.length, i < len; i++) {
        var explore = explores[i].name;

        var explore_results = UrlFetchApp.fetch(BASE_URL + "/lookml_models/" + model_name + "/explores/" + explore, options);

        var connection = JSON.parse(explore_results.getContentText()).connection_name;
        var dimensions = JSON.parse(explore_results.getContentText()).fields.dimensions;
        var measures = JSON.parse(explore_results.getContentText()).fields.measures;

        for (var j = 0; j < dimensions.length; j++) {
            result.push([connection, explore, dimensions[j].view, "Dimension", dimensions[j].name, dimensions[j].label, dimensions[j].type, dimensions[j].description,  "hidden: " + dimensions[j].hidden, (dimensions[j].sql != null ? dimensions[j].sql : ""), dimensions[j].source_file]);
        }

        for (var k = 0; k < measures.length; k++) {
            result.push([connection, explore, measures[k].view, "Measure", measures[k].name, measures[k].label, measures[k].type, measures[k].description, "hidden: " + measures[k].hidden, (measures[k].sql != null ? measures[k].sql : ""), measures[k].source_file]);
        }
    }
    return result
  } catch(err) {
    return "Something went wrong. " + err
}
}

function login() {
  try{
    var post = {
        'method': 'post'
    };
    var response = UrlFetchApp.fetch(BASE_URL + "/login?client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET, post);
    return JSON.parse(response.getContentText()).access_token;
  } catch(err) {
    Logger.log(err);
    return "Could not login to Looker. Check your credentials.";
  }
}
