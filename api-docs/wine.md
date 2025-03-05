base url : /wine

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



get stock by category
    endpoint: /wine/stock_by_category
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