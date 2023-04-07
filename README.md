# CITRONE

### About citrone
  Citrone makes it easy for educators to create learning experiences that positively engage students.

## Routings
- Default routes : GET [/](/),[/api/citrone/](/api/citrone/),[/*](/*)

## HOSTING URL: [https://citrone-crater-prod.up.railway.app/](https://citrone-crater-prod.up.railway.app/)
#### User Routes

- Default user route / Get a user profile : GET : [/api/citrone/user](/api/citrone/user)

- logout a user : GET :  [/api/citrone/auth/logout](/api/citrone/user/logout)
- login a user : POST :  [/api/citrone/auth/login](/api/citrone/user/login)

- Create a user : POST :  [/api/citrone/auth](/api/citrone/user)
- update a user profile : PUT :  [/api/citrone/user](/api/citrone/user)


- Forget Password : POST : [/api/citrone/auth/forget-password](/forget-password)


### Password Reset
- Reset Password : POST : [/api/citrone/resetPassword/:token](/api/citrone/resetPassword/:token)
            **input text : name="password" and name="confirmPassword" 
