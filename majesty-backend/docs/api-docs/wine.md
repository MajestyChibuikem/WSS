base url : /wine

#this works : green
get total wine stock
endpoint : /wine/total_stock
method : GET
description : Retrieves the total stock quantity of all wines in the database.
request header : Authorization: Bearer <JWT_TOKEN>
response:
success:
{
"total_stock" : 300
}
error 500 : internal serve error
{
"message" : "error fetching total stock"
}

#works now : green
get stock by category
endpoint: /wine/stock-by-category
method : GET
description : Retrieves the stock quantity of wines grouped by their category.
request headers : Authorization: Bearer <JWT_TOKEN>
response :
success
{
"stock_by_category" :{
"red" : 300,
"white" : 150,
"sparkling" : 50
}
}
error 500 : internal server error
{
"message" : "error fetching stock by category"
}

#works now

for the request it should look like this:
//
import axios from 'axios';

const startDate = '2025-03-01';
const endDate = '2025-03-11';

axios.get('http://localhost:5000/wine/revenue', {
params: {
start_date: startDate,
end_date: endDate
},
headers: {
'Authorization': `Bearer ${your_jwt_token_here}`, // Add JWT token if required
'Content-Type': 'application/json'
}
})
.then(response => {
console.log(response.data); // Handle the response data
})
.catch(error => {
console.error('Error:', error); // Handle errors
});

//

get revenue for a specified time period
endpoint : /wine/revenue
methods : GET
description: Calculates revenue within a specified time period.
request body
{
"start_date" : "YYYY-MM-DD",
"end_date" : "YYYY-MM-DD"
}
response
success:
{
"revenue" : "<float>"
}
error 400 : bad request
{
"message" : "Invalid date time format. use YYYY-MM-DD"
}
error 500 : internal server error
{
"message" : "error calculating revenue"
}

#works now
to use this structure your request like this
//

import axios from 'axios';

const period1Start = '2025-03-01';
const period1End = '2025-03-11';
const period2Start = '2025-03-12';
const period2End = '2025-03-20';

axios.get('http://localhost:5000/wine/compare-sales', {
params: {
period1_start: period1Start,
period1_end: period1End,
period2_start: period2Start,
period2_end: period2End
},
headers: {
'Authorization': `Bearer ${your_jwt_token_here}`, // Add JWT token if required
'Content-Type': 'application/json'
}
})
.then(response => {
console.log(response.data); // Handle the response data
})
.catch(error => {
console.error('Error:', error); // Handle errors
});

//
compare sales
endpoint : /wine/compare-sales
method : GET
description : Compares revenue between two time periods and calculates percentage change.
request body{
"message" :
}

#this is the url: http://127.0.0.1:5000/wine/1
delete wine
endpoint:
method :DELETE
description : Deletes a specific wine from the inventory by its ID.
Authentication: JWT required.
Permissions: Only administrators or super users can delete wines.

    repsonse
    {
        "message" : "wine deleted succesfully"
    }
    error 403 : forbidden
    {
        "message" : "user lacks permission"
    }
    error 404 :
    {
        "message" : "wine_id does not exist"
    }
    error 500:internal server error
    {
        "message" : "an error occured when deleting the wine"
    }

#this works
Update Wine
Endpoint: /wine/<int:wine_id>
Method: PUT
Description: Updates details of a specific wine (e.g., name, price, stock).
Authentication: JWT required.
Permissions: Only administrators or super users can update wines.

Request Body (Partial fields allowed):

json
Copy
{
"name": "Updated Cabernet Sauvignon", // Optional
"abv": 14.5, // Optional
"price": 35.99, // Optional
"category": "Red", // Optional
"bottle_size": 750, // Optional
"in_stock": 50 // Optional
}
Example Request:

http
Copy
PUT /wine/1 HTTP/1.1
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
"price": 35.99,
"in_stock": 50
}
Example Response (Success):

json
Copy
{
"message": "Wine updated successfully",
"wine": {
"id": 1,
"name": "Updated Cabernet Sauvignon",
"abv": 14.5,
"price": 35.99,
"category": "Red",
"bottle_size": 750,
"in_stock": 50
}
}
Possible Errors:

400 Bad Request: Invalid or missing data.

403 Forbidden: User lacks permission.

404 Not Found: Wine ID does not exist.

500 Internal Server Error: Database error.

#this works
Add Wine
Endpoint: /wine/add
Method: POST
Description: Adds a new wine to the inventory.
Authentication: JWT required.
Permissions: Only administrators or super users can add wines.

Request Body:

json
Copy
{
"name": "Cabernet Sauvignon", // Required
"abv": 14.5, // Required
"price": 29.99, // Required
"category": "Red", // Required
"bottle_size": 750, // Required
"in_stock": 50 // Optional (default: 0)
}
Example Request:

http
Copy
POST /wine HTTP/1.1
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
"name": "Chardonnay",
"abv": 13.0,
"price": 19.99,
"category": "White",
"bottle_size": 750
}
Example Response (Success):

json
Copy
{
"message": "Wine added successfully",
"wine": {
"id": 2,
"name": "Chardonnay",
"abv": 13.0,
"price": 19.99,
"category": "White",
"bottle_size": 750,
"in_stock": 0,
"added_by": 1,
"added_at": "2023-10-01T12:34:56"
}
}
Possible Errors:

400 Bad Request: Missing required fields.

403 Forbidden: User lacks permission.

500 Internal Server Error: Database error.

Notes:
Replace <your_jwt_token> with a valid JWT.

All timestamps (e.g., added_at) are in ISO 8601 format.

Numeric fields (price, abv) must be valid numbers.

#this works
get inventory value
endpoint : /wine/inventory-value
method : GET
description : Retrieves the total value of the current inventory, grouped by category.
responses:
success
{
{<category> : <value>}
}
error 500: internal server error
{
"message" : "error while fetching inventory value "
}
#this works
get user sales
endpoint : /wine/user-sales/{user_id}
description : Tracks the total sales (invoices) for a specific user.
response:
success
{
{ "user_id": <int>, "total_sales": <float> }
}
error 404:
{
"message" : "user not found"
}
error 500 : internal server error
{
"message" : "error fetching the user sales"
}

########################### new documentation #########################
get top three sales
endpoint : /wine/top_wines
description : retrieve the top three most sold wines in last month, along with their total revenue and the percentage change in sales compared to the previous month
response format:
Field Type Description
1 name string The name of the wine.
2 total_sold integer The total number of bottles sold for this wine in the last month.
3 total_revenue float The total revenue generated by this wine in the last month (in Naira).
4 percentage_change float The percentage increase or decrease in sales compared to the previous month.
response:
[
{
"name": "Chardonnay",
"total_sold": 150,
"total_revenue": 3000.0,
"percentage_change": 25.0
},
{
"name": "Merlot",
"total_sold": 120,
"total_revenue": 2400.0,
"percentage_change": -10.0
},
{
"name": "Cabernet Sauvignon",
"total_sold": 100,
"total_revenue": 2000.0,
"percentage_change": 5.0
}
]
