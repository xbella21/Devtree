import User from "../models/User";

export const createAccount = async (req, res) => {
  const user = new User(req.body);

  await user.save();
  res.send({message: 'User registered successfully'});
}
 