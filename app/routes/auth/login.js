// const Models = require('../../database/models');

const User = require('../../models/users');

const axios = require('axios');
var jwt = require('jsonwebtoken');
const { modelName } = require('../../models/users');

module.exports = async (req, res) => {
  const { cnic } = req.body;

  try {
    // /// Check User in Database
    // const userDetail = await Models.User.findOne({ cnic: cnic });
    // if (!userDetail) throw new Error("User not Found!");
    // MeraId Auth Request
    let requestId;
    try {
      const { data } = await axios.post(
        'https://5etx658ey2.execute-api.us-east-1.amazonaws.com/fbr-auth',
        { userId: cnic }
      );
      requestId = data.requestId;
    } catch (e) {
      throw new Error('User Not Found!');
    }

    // /// MeraId Collect Request
    const collectResponse = await Collect(requestId);
    const isUserExist = await User.findOne({
      userId: cnic,
    });
    if (!isUserExist) {
      const user = await User.create({
        userId: collectResponse.user.userId,
        name: collectResponse.user.name,
      });
      await user.save();
    }
    var token = await jwt.sign({ userId: cnic }, process.env.JWT_KEY);
    return res.send({
      status: 'success',
      msg: 'User Signed in',
      data: { token: token },
    });
  } catch (e) {
    return res.send({ status: 'error', msg: e.message });
  }
};

const Collect = async (requestId, time = Date.now()) => {
  if (Date.now() - time > 90000) throw new Error('Login Timeout!');
  const {
    data: { response },
  } = await axios.post(
    'https://5etx658ey2.execute-api.us-east-1.amazonaws.com/fbr-collect',
    {
      requestId,
    }
  );
  if (response.status == 'pending') return Collect(requestId, time);
  else if (response.status == 'rejected') throw new Error('Login Cancel');
  return response.completionData;
};
