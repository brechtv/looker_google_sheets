// set your API credentials first
var BASE_URL = 'https://XXXX.looker.com:19999/api/3.0';
var CLIENT_ID = 'XXXX';
var CLIENT_SECRET = 'XXXX';

// meta for the function to be used in the spreadsheet
/**
 * Returns the results or the sql of a Look
 *
 * @param {123} id The unique ID of the Look
 * @param {1} format 1 for csv, 2 for raw sql
 * @return The Look results data
 * @customfunction
 */
function RUN_LOOK(id, format) {
    try {
        // set headers
        var options = {
            'method': 'get',
            'headers': {
                'Authorization': 'token ' + login() // set token
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
        }
        // get request for the look
        var response = UrlFetchApp.fetch("https://master.dev.looker.com:19999/api/3.0/looks/" + id + "/run/" + formatting, options);
        // if it's csv, fill it in the cells, if it's the query, use one cell only, if not specified, throw error
        if (format == 1) {
            return Utilities.parseCsv(response.getContentText());
        } else if (format == 2)
            return response.getContentText();
        else {
            return "Please specify format: 1 (results) or 2 (sql query)"
        }
    } catch (err) {
        return "Something went wrong. Check your credentials and if you're passing the correct parameters and that your Look exists."
    }
}

// helpers
// log in to the Looker API
function login() {
    var post = {
        'method': 'post'
    };
    var response = UrlFetchApp.fetch(BASE_URL + "/login?client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET, post);
    return JSON.parse(response.getContentText()).access_token;
}

