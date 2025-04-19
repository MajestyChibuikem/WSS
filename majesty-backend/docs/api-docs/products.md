base url : /products

get all products count
    headers: Authorization: Beare <JWT_TOKEN>
    endpoint: /total_stock
    methid: GET
    description: gets total stock product count

get stock by category
    headers: Authorization: Beare <JWT_TOKEN>
    endpoint: /stock-by-category
    method: GET
    description: this gets products using their category as filter

get inventory value
    headers: Authorization: Beare <JWT_TOKEN>
    endpoint: /inventory-value
    method : GET
    description: gets the total inventoryt value

get all products
    headers: Authorization: Beare <JWT_TOKEN>
    endpoint : /all
    description: gets all products
    method: GET

add a  product
    headers: Authorization: Beare <JWT_TOKEN>
    endpoint: /add
    description: add a new product
    method: POST
    sample json:
        {
        "name": "Product Name",
        "price": 29.99,
        "category_id": 1,
        "bottle_size": 750,
        "in_stock": 50
        }
update a product
    headers: Authorization: Beare <JWT_TOKEN>
    endpoint: /<int:product_id>
    description: update an existing product
    method: PUT
delete a product
    headers: Authorization: Beare <JWT_TOKEN>
    endpoint: /<int:product_id>
    description: delete an existing product
    method: DELETE

get the all products for a  category
    headers: authorization: bearer <JWT_TOKEN>
    endpoint: /by-category/<int:category_id>
    description: gets all the products in a specified category
    method: GET

