User login
    endpoint : /auth/login
    method : POST
    description : authenticates a user and returns an access token if the credentials are valid
    request body:
    {
        "username" : "string",
        "password" : "user_password"
    }
    response:
        sucess 200:
        {
            "token" : "sample_token",
            "roles: : ["admin"],
            "is_admin" : boolean
        }
        error 400:
        {
            "message" : "username and password reqiuired"
        }
        error 401:
        {
            "message" : "invalid credentials"
        }

Create user
    endpoint: /auth/create_user
    method: POST
    descr: Creates a new user. Only users with the admin role can create new users
    request header: Authorization: Bearer <JWT_TOKEN>
    request body:
    {
        "username": "new_user",
        "password": "new_password",
        "is_admin": false,
        "roles": ["staff"]
    }
    response:
        success 201:
        {
            "message" : "user created successfully",
            "user_id" : 123 or whatever you get,
            "roles" : "["staff"]
        }
        error 400:
        {
            "message" : " username and password required"
        }
        error 403 : unauthorized
        {
            "message" : "only admins can create a new user"
        }
        error 409 : username already exists
        {
            "message" : "username already exists"
        }
        error 500 : internal server error
        {
            "message" : "an error occured while creating the user"
        }


logout
    endpoint : /auth/logout
    method : POST
    description : logs out the user.
    request headers : Authorization: Bearer <JWT_TOKEN>
    response:
        success 200:
        {
            "message" : "succesfully logged out"
        }


get all users
    endpoint : /auth/users
    methos : GET
    description : gets all users, only for admin roles
    request headers : Authorization: Bearer <JWT_TOKEN>
    response:
        success:
        {
            "users":[
                {
                    "id" : int,
                    "username" : "user_name",
                    "created_at" : "timestamp",
                    "is_admin", : false,
                    "roles" : ["staff"]
                }
            ]
        }
        error 403 : unauthorized
        {
            "message" : "unauthorized - only admins can view user records"
        }


get user by id
    endpoint : /auth/user/<int:user_id>
    method : GET
    description : Retrieves details of a specific user. Only users with the admin role can access this endpoint.
    request headers : Authorization: Bearer <JWT_TOKEN>
    response:
        success 200:
            {
                "user" : [
                    {
                        "id" : int,
                        "username" : "user_name",
                        "created_at" : "timestamp",
                        "is_admin" : false,
                        "roles" : ["staff"]
                    }
                ]
            }
        error 403 : 
        {
            "message" : "Unauthorized - only admins can view user details"
        }
        error 404 :
        {
            "message" : "User not found"
        }

    
##fixed this
update user details
    endpoint: /auth/users/<int:user_id>
    method : PUT
    description : to update user details, the parameters are optional so you can target the one you want to change, others remain the same, it allows updating a user's details, including their username, password, roles, and admin status. Admins can update any user, while non-admins can only update their own username and password.
    authentication : Bearer <your_jwt_token>
    permissions: 
        admin - Can update any user's details, including roles and admin status. 
        non-admins - can only update their own username and password

    request parameters:
        user_id - int - id of the user
    request body
    {
    "username" : "fourth_user",
    "password" : "password",
    "is_admin" : false,
    "roles" : "super_user"
    }  
    reponses:
        success: !!!this is a sample json cedar!!!
        {
            "message" : "user updated succesfully",
            "user":{
                "id" : 1,
                "username" : "new_username",
                "is_admin" : "true",
                "roles" : "staff"
            }
        }
        error 400 : bad request
        {
            "message" : "username already exists"
        }
        error 403: forbidden : Non-admin user attempting to update another user's details.
        {
            "message" : "unauthorized"
        }
        error 404 
        {
            "message" : "user not found"
        }
        error 500: internal server error
        {
            "message" : "error updating user: <erro_details>"
        }



delete user
    endpoint : /auth/user/2
    method : DELETE
    description : Deletes a specific user. Only users with the admin role can access this endpoint. Users cannot delete their own accounts.
    request headera: Authorization: Bearer <JWT_TOKEN>
    response:
        success:
        {
            "message" : "user deleted sucessfully"
        }
        error 400: attemopt to delete own account
        {
            "message" : "cannot delete your own account"
        }
        error 403: unauthorized
        {
            "message" : "unauthorized- only admins can delete users"
        }
        error 404 : user not found
        {
            "message" : "User not found"
        }



check token
    endpoint : /auth/check-token
    method : GET