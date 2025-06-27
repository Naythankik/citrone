# CITRONE

### About citrone
  Citrone makes it easy for educators to create learning experiences that positively engage students.
  
## CITRONE DOCUMENTATION 
  [https://www.postman.com/naythankik/workspace/citrone](https://www.postman.com/naythankik/workspace/citrone)

## PRODUCTION URL
  [https://citrone.vercel.app/](https://citrone.co/)
  
## DEVELOPMENT API HOSTING URL
  [https://citrone.vercel.app/](https://citrone.vercel.app/)


## Routings
- Default routes : GET [/](/),[/api/citrone/](/api/citrone/),[/*](/*)

#### User Routes

- Default user route / Get a user profile : GET : [/api/citrone/user](/api/citrone/user)

- logout a user : GET :  [/api/citrone/auth/logout](/api/citrone/user/logout)
- login a user : POST :  [/api/citrone/auth/login](/api/citrone/user/login)
    - input text : [email,password]

- Create a user : POST :  [/api/citrone/auth](/api/citrone/user)
    - input text : [firstName,lastName,phoneNumber,email,password]
- update a user profile : PUT :  [/api/citrone/user](/api/citrone/user)
    - input text : [firstName,lastName,email,username,phoneNumber,]


- Forget Password : POST : [/api/citrone/auth/forget-password](/forget-password)
    - input text : [email]


### Password Reset
- Reset Password : POST : [/api/citrone/resetPassword/:token](/api/citrone/resetPassword/:token)
    - input text : [password,confirmPassword] 
    
    
    
### Authenticated Routes
- Get a all levels of courses : GET : [/api/citrone/user/courses](/api/citrone/user/courses)
- Post a levels of course : POST : [/api/citrone/user/courses](/api/citrone/user/courses)
    - can only be accessed by the admin alone.
- get all modules under a level or course : GET : [/api/citrone/user/:level/course](/api/citrone/user/:level/course)
- create a module under a level or course : POST : [/api/citrone/user/:level/course](/api/citrone/user/:level/course)
    - can only be accessed by the admin alone.
    - the __:level__ e.g beginner, intermediate, tertiary
