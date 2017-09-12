# Looker API for Google Sheets

This Google Apps Script allows you to load the results for any saved Look in looker.

You can query the results in the following way:

* Save the script in the script editor (Tools > Script Editor)
* Replace your Looker base domain and your client id & secret
* In your sheet, you can use the custom formula `RUN_LOOK(look_id, format)`
  1. The first parameter is the Look ID, e.g. 1234, in number format
  2. The second parameter is the formatting. Looker API has a lot more than csv or sql, but here we're only using those two. 1 will give you the results of the Look, 2 will give you the underlying query.

### Example use

`=RUN_LOOK(1789, 1)`
