## API ENDPOINTS (POSTMAN)

POSTS ROUTE
GET /api/posts -------------------(gets all published posts)
POST /api/posts -----------------(create a new post)
    {
    "title": "Let US ALL go",
    "description": "It must work forcefully",
    "tags": ["Motivation"],
    "body": "A REST API"
    } ----------Body format for creating new post
PUT /api/posts/:postId ----------(update a post)
DELETE /api/posts/:postId -------(delete a post)
GET /api/posts/:postId ----------(get a single post)

AUTHENTICATION ROUTE
POST /api/auth/signup ----------(sign up a user)
POST /api/auth/login -----------(login a user)

AUTHOR ROUTE
GET /api/author ----------------(get all posts-drafts and published- written by the author)

## API ENDPOINTS (BROWSER/VIEWS)

http://localhost:3000/	--------View all published posts
http://localhost:3000/posts/:id	---------View a single post (replace :id with a valid post _id)
http://localhost:3000/posts/create	---------Create post form (requires login)
http://localhost:3000/users/dashboard	---------Author dashboard (requires login)