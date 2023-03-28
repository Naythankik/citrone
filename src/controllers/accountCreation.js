const {User} = require('../models')
const {signUpSchema} = require('../utils/joiSchema')


const createAccount = async (req, res) => {
  //validating the user inputs with joi schema
  const validation = signUpSchema(req.body)
  if (validation.error) {
      res.status(422).send(validation.error.details[0].message);
      return;
  }
}

router.post('/', (req, res) => {
  

    const signUp = async () => {
        try {
            //checking if the values are not already in the database
            const itemExist = await doesUserExist(User, validation.value, 'email', 'userName', 'mobileNumber')
            if (itemExist) {
                return res.status(itemExist.status).json({ message: itemExist.message })
            };

            //storing the validated objects to the database
            const newUser = await User.create(validation.value);
            const newUserCart = await Cart.create({_id: newUser._id})
            const password = await Password.create({
                password: await securePassword(validation.value.password),
                user_id: newUser._id
            })
            res.status(200).json({ userSummary: newUser, password: password, newUserCart: newUserCart });
        }
        catch (err) {
            res.status(400).send(err.message);

        }
    }
    //calling the async function for the signup process
    signUp()
})