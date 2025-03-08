base Url : /carts

get cart items
    endpoint: /carts
    method : GET
    description : retrieves all cart items for the logged in user
    request headers : Authorization: Bearer <JWT_TOKEN>
    response:
        success 200:
        {
            "cart":[
                {
                    "id": 1,
                    "wine_id" : 23,
                    "quantity" : 2,
                    "added_at" : "time stamp"
                }
            ]
        }
        error 500 : internal server error
        {
            "message" : "an error occured while retrieveing the cart"
        }


add item to cart
    endpoint : /carts/add
    method : POST
    description :  Adds a new item to the user's cart or updates the quantity if the item already exists
    request headers :  Authorization: Bearer <JWT_TOKEN>
    request body : 
    {
        "wine_id" : 123,
        "quantity" : 2
    }
    response:
        success 200
        {
            "message" :  "item added to cart successfully"
        }
        error 400 : missing wine_id
        {
            "message" : "wine_id is missing"
        }
        error 500 : internal server error
        {
            "message" : "an error occured while adding item to cart"
        }


update cart item
    endpoint: /carts/update
    method : PUT
    description:  updates the quantity of a specific cart item
    request headers : Authorization: Bearer <JWT_TOKEN>
    request body
    {
        "wine_id" : 123,
        "quantity" : 23
    }
    response:
        success: 
        {
            "message" : "cart updated succesfully"
        }
        error 400 : missing wine_id or quantity
        {
            "message" : "wine_id and quantity are required"
        }
        error 404: cart item not found
        {
            "message" : "cart item not found"
        }
        error 500 : internal server error
        {
            "message" : "an error occured while updating the cart"
        }


remove item from cart
    endpoint: /carts/remove
    method : DELETE
    description: removes a specific item from the user's cart
    request headers: Authorization: Bearer <JWT_TOKEN>
    request body :
    {
        "wine_id" : 123
    }
    response:
        success :
        {
            "message" : "item removed from the cart sucessfully"
        }
        error 404 : missing wine id
        {
            "message" : " wine_id is required"
        }
        error 500 : internal server error
        {
            "message" : "an error occurred while removing item from cart"
        }


clear cart
    enpoint : /carts/clear
    method : DELETE
    description :clears all items from user's cart
    request headers : Authorization Bearer<JWT_TOKEN>
    response:
        success:
        {
            "message" : "cart cleared successfully"
        }
        error 500: internal server error
        {
            "message" : "an error occurred while clearing the cart"
        }

    
        
    

